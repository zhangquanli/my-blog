FROM nginx:latest
#COPY nginx.conf /etc/nginx/nginx.conf
COPY ./public /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "deamon off;"]