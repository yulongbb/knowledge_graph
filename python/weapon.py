import requests
import json
import os
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from minio import Minio  # 或者使用 `import boto3`
from io import BytesIO
from datetime import datetime

MINIO_ENDPOINT= 'localhost:9000'
MINIO_ACCESS_KEY= 'hvUvKv8zj2LXPmqzWbVn'
MINIO_SECRET_KEY= '6c3EJJ92e40t1bZqwqAvw0U3cQDtWMH1UirbNlno'
MINIO_BUCKET_NAME = "kgms"

# 目标URL
list_url = 'https://junshi.china.com/wuqi/so/130002592_0_0_1.html'

# 设置请求头
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://example.com',  # 根据实际情况填写
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
}

# 初始化MinIO客户端 (如果使用boto3，请参考其文档)
client = Minio(
    MINIO_ENDPOINT,
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=False  # 如果MinIO使用HTTPS则设置为True
)

# 确保桶存在
if not client.bucket_exists(MINIO_BUCKET_NAME):
    client.make_bucket(MINIO_BUCKET_NAME)

def download_image(image_url, local_path=None):
    """从给定URL下载图片并保存到本地"""
    try:
        response = requests.get(image_url, headers=headers, stream=True, timeout=(5, 15))
        print(response)
        response.raise_for_status()  # 检查HTTP响应状态码
        
        # 验证Content-Type是否为图像类型
        content_type = response.headers.get('Content-Type')
        if not content_type.startswith('image/'):
            print(f"The URL does not point to an image: {image_url}")
            return None

        # 确保文件名包含正确的扩展名
        ext = os.path.splitext(urljoin(image_url, ''))[1] or '.jpg'
        image_name = os.path.basename(image_url).rsplit('.', 1)[0] + ext if not local_path else local_path

        # 尝试一次性将所有内容写入文件
        with open(image_name, 'wb') as file:
            file.write(response.content)

        print(f"Image downloaded and saved to {image_name}")
        return image_name
    except Exception as e:
        print(f"Error downloading image from {image_url}: {e}")
        return None

def upload_to_minio(file_path, object_name=None):
    """将文件上传到MinIO，并返回上传成功的文件名称"""
    try:
        if not object_name:
            # 使用当前时间戳和文件名创建唯一的对象名称
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            base_name = os.path.basename(file_path)
            object_name = f"{timestamp}_{base_name}"

        # 使用BytesIO读取文件内容
        with open(file_path, 'rb') as file_data:
            file_stat = os.stat(file_path)
            # 将文件上传到MinIO
            client.put_object(
                MINIO_BUCKET_NAME,
                object_name,
                BytesIO(file_data.read()),
                file_stat.st_size,
                content_type='application/octet-stream'
            )
        print(f"File uploaded to MinIO as {object_name}")
        return object_name  # 返回上传成功的文件名称
    except Exception as e:
        print(f"Error uploading file to MinIO: {e}")
        return None


def fetch_list_page():
    response = requests.get(list_url, headers=headers)
    if response.status_code == 200:
        return response.content
    else:
        print(f"Failed to retrieve the list page. Status code: {response.status_code}")
        return None
    
def parse_list_page(content):
    soup = BeautifulSoup(content, 'html.parser')
    carrier_items = soup.find('ul', class_='mod_pic_3').find_all('li')
    
    detail_urls = []
    for item in carrier_items:
        detail_link = item.find('a', class_='item_img')['href']
        full_detail_url = detail_link  # 如果需要转换为绝对路径，请根据实际情况调整
        img_tag = item.find('img')  # 查找img标签以获取图片链接
        img_url = img_tag['src'] if img_tag and 'src' in img_tag.attrs else 'N/A'
        country_tag = item.find('i')
        country = country_tag.text.strip() if country_tag else 'N/A'        # 将 img_url 的协议从 http 改为 https（仅当以 http:// 开头时）
        secure_img_url = img_url.replace("http://", "https://", 1) if img_url.startswith("http://") else img_url
        # 下载图片到本地
        local_image_path = download_image(secure_img_url)
        image = ''
        # if local_image_path:
        #     # 上传图片到MinIO
        #    image = upload_to_minio(local_image_path)

        # 添加详情链接和图片链接到 detail_urls 列表中
        detail_urls.append({
            'url': full_detail_url,
            'image': image,  # 使用安全的图片链接
            'country': country  # 使用安全的图片链接
        })
    return detail_urls

def fetch_detail_page(url):
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.content
    else:
        print(f"Failed to retrieve the detail page {url}. Status code: {response.status_code}")
        return None

def parse_detail_page(content, img_url,country):
    soup = BeautifulSoup(content, 'html.parser')
    
    # 提取标题
    title = soup.find('h1', class_='article-title').get_text(strip=True)
    
    # 提取别名
    alias_tag = soup.find('div', class_='article-alias')
        # 查找并移除所有的 <em> 标签
    em_tags = alias_tag.find_all('em')
    for em in em_tags:
        em.decompose()  # 移除 <em> 标签及其内容
    alias = alias_tag.get_text(strip=True).split('：')[-1] if alias_tag else 'N/A'
    
    # 提取描述
    description_tag = soup.find('div', class_='article-content').find('p')
    description = description_tag.get_text(strip=True) if description_tag else 'N/A'
    
    # 找到包含面包屑导航的div元素
    crumbs_div = soup.find('div', class_='header_crumbs')

    # 查找所有'a'标签，并获取倒数第二个'a'标签的文本（即"攻击机"）
    a_tags = crumbs_div.find_all('a')
    if len(a_tags) >= 1:
        attack_aircraft_category = a_tags[-1].get_text(strip=True)
    else:
        attack_aircraft_category = '未找到'

    # 提取参数列表
    params = {}
    param_list = soup.find('ul', class_='article-parameter').find_all('li')
    for param in param_list:
        key = param.find('em').get_text(strip=True)
        value = param.find('p').get_text(strip=True)
        params[key] = value
    
    # 提取相关部分的内容
    related_sections = {}
    article_relateds = soup.find_all('div', class_='article-related')
    for section in article_relateds:
        title_tag = section.find('h2')
        content_tag = section.find('div', class_='article-related-txt')
        if title_tag and content_tag:
            section_title = title_tag.get_text(strip=True)
            section_content = content_tag.get_text(strip=True)
            related_sections[section_title] = section_content
    
    # 包含来自列表页的图片链接
    return {**{
        '标签': title,
        '别名': alias,
        '描述': description,
        '图片': img_url,  # 添加图片链接到返回的结果中
        '国家': country,  # 添加图片链接到返回的结果中
        '大类': '飞行器',  # 添加图片链接到返回的结果中
        '小类': attack_aircraft_category  # 添加图片链接到返回的结果中
    }, **params, **related_sections}

def export_to_json(data, file_name='all_details'):
    """将字典数据导出为JSON文件"""
    try:
        # 确保目录存在
        output_dir = 'output'
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # 创建文件路径
        file_path = os.path.join(output_dir, f"{file_name}.json")

        with open(file_path, 'w', encoding='utf-8') as json_file:
            json.dump(data, json_file, ensure_ascii=False, indent=4)
        
        print(f"Data successfully written to {file_path}")
    except Exception as e:
        print(f"An error occurred while writing to file: {e}")

def export_to_jsonl(data_list, file_name='all_details'):
    """将字典数据列表导出为JSON Lines (JSONL) 文件"""
    try:
        # 确保目录存在
        output_dir = 'output'
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # 创建文件路径
        file_path = os.path.join(output_dir, f"{file_name}.jsonl")

        with open(file_path, 'w', encoding='utf-8') as jsonl_file:
            for data in data_list:
                json_line = json.dumps(data, ensure_ascii=False)
                jsonl_file.write(json_line + '\n')
        
        print(f"Data successfully written to {file_path}")
    except Exception as e:
        print(f"An error occurred while writing to file: {e}")


# 主程序逻辑
if __name__ == "__main__":
    all_details = []  # 用于存储所有详情信息的列表
    list_content = fetch_list_page()
    if list_content:
        detail_urls = parse_list_page(list_content)
        for entry in detail_urls:
            url = entry['url']
            img_url = entry['image']
            country = entry['country']
            print(f"Fetching details from: {url}")
            # detail_content = fetch_detail_page(url)
            # if detail_content:
            #     detail_info = parse_detail_page(detail_content, img_url, country)
            #     # 将字典转换为JSON字符串，并打印出来
            #     json_output = json.dumps(detail_info, ensure_ascii=False, indent=4)
                # print(json_output)
                
                # # 将详情信息添加到集合中
                # all_details.append(detail_info)

                # if all_details:
                #     # 导出所有详情信息到一个 JSON 文件
                #     export_to_jsonl(all_details, file_name='all_details')