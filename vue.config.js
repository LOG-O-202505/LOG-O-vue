const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
});

module.exports = {
  // 기본 경로 설정 (예: '/llamasearch/')
  publicPath: process.env.VUE_APP_BASE_URL || '/',
  
  // 빌드 설정
  outputDir: 'dist',
  
  // 애셋 경로
  assetsDir: 'assets',
  
  // 소스맵 생성 여부
  productionSourceMap: false,
  
  // 개발 서버 설정
  devServer: {
    port: 8090,
    open: true,
    proxy: {
      // Ollama API 프록시 설정
      '^/api/ollama': {
        target: 'http://localhost:11434',
        changeOrigin: true,
        pathRewrite: {
          '^/api/ollama': '/api'
        }
      },
      // Elasticsearch API 프록시 설정
      '^/api/es': {
        target: 'http://localhost:9200',
        changeOrigin: true,
        pathRewrite: {
          '^/api/es': ''
        }
      }
    }
  },
  
  // CSS 관련 설정
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/styles/main.scss";
        `
      }
    }
  }
}