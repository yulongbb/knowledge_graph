# 用Nginx构建Web服务器
FROM nginx:1.21-alpine

# 将Nginx配置文件复制到容器中
COPY default.conf /etc/nginx/conf.d/default.conf

# 从之前的构建阶段复制应用程序构建结果到Nginx目录中
COPY dist/ui /usr/share/nginx/html

# 将端口暴露给容器外部
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
