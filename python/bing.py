from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time

# 指定 ChromeDriver 的路径
driver_path = r"C:\chromedriver\chromedriver.exe"

# 设置请求头
chrome_options = Options()
chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

# 使用 Service 类初始化 WebDriver
service = Service(driver_path)
driver = webdriver.Chrome(service=service, options=chrome_options)

# 打开目标页面
driver.get("https://www.msn.com/zh-cn/channel/topic")

# 等待页面加载
time.sleep(5)

# 滚动页面到底部以加载更多内容
driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
time.sleep(2)

# 使用显式等待查找动态内容
try:
    wait = WebDriverWait(driver, 20)
    card_element = wait.until(EC.presence_of_element_located((By.TAG_NAME, 'clf-ca-card')))

    # 使用 JavaScript 提取动态内容
    card_items = driver.execute_script("""
        return Array.from(document.querySelectorAll('clf-ca-card'));
    """)

    for item in card_items:
        try:
            title = item.find_element(By.CLASS_NAME, 'title').text
            link = item.find_element(By.TAG_NAME, 'a').get_attribute('href')
            time = item.find_element(By.CLASS_NAME, 'time').text
            print(f"Title: {title}\nLink: {link}\nTime: {time}\n")
        except Exception as e:
            print(f"Error extracting data: {e}")
except Exception as e:
    print(f"Error finding card items: {e}")

# 关闭浏览器
driver.quit()