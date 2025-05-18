# 빌드 스테이지
FROM node:16 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# .env 파일 사용
RUN if [ -f .env ]; then echo ".env 파일이 성공적으로 복사됨"; fi
RUN npm run build

# 프로덕션 스테이지
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Nginx 설정 추가
COPY --from=build-stage /app/vue.config.js /vue.config.js
# 기본 nginx 설정 추가
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 