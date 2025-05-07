<template>
  <div class="logo-search">
    <Header />
    
    <div class="container">
      <div class="form-group">
        <label for="image">여행 이미지를 선택해주세요</label>
        <ImageUpload @image-selected="onImageSelected" />
      </div>
      
      <ImageInfo 
        v-if="imageFile"
        @info-updated="onInfoUpdated"
      />
      
      <div class="button-group">
        <button 
          @click="analyzeCurrentImage" 
          class="primary-btn"
          :disabled="!imageFile || isLoading"
        >
          이미지 분석하기
        </button>
        <button 
          @click="reset" 
          class="secondary-btn"
          :disabled="isLoading"
        >
          초기화
        </button>
        <button 
          v-if="isLoading" 
          @click="cancelAnalysis" 
          class="cancel-btn"
        >
          취소
        </button>
      </div>
      
      <LoadingSpinner v-if="isLoading" />
    </div>
    
    <AnalysisResults 
      v-if="analysisResult && !isLoading" 
      :result="analysisResult"
      :status="actionStatus"
      @save-to-elasticsearch="saveToElasticsearchHandler"
      @search-similar="searchSimilarHandler"
    />
    
    <SearchResults 
      v-if="searchResults.length > 0" 
      :results="searchResults" 
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import Header from "@/components/Header.vue";
import ImageUpload from "@/components/ImageUpload.vue";
import ImageInfo from "@/components/ImageInfo.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import AnalysisResults from "@/components/AnalysisResults.vue";
import SearchResults from "@/components/SearchResults.vue";
// 수정 후
import { 
  analyzeImage as callAnalyzeImage, 
  saveToElasticsearch as callSaveToElasticsearch,
  searchSimilarImages,
  createFeaturesVector
} from "@/services/api";

export default {
  name: "LogoSearch",
  components: {
    Header,
    ImageUpload,
    ImageInfo,
    LoadingSpinner,
    AnalysisResults,
    SearchResults
  },
  setup() {
    const store = useStore();
    
    // 상태 관리
    const imageFile = computed(() => store.state.image.file);
    const imagePreview = computed(() => store.state.image.preview);
    const imageInfo = computed(() => store.state.image.info);
    const isLoading = ref(false);
    const analysisResult = ref(null);
    const searchResults = ref([]);
    const abortController = ref(null);
    const actionStatus = ref({ message: "", type: "" });
    
    // 컴포넌트 마운트 시 실행
    onMounted(() => {
      console.log("LogoSearch 컴포넌트 마운트");
    });
    
    // 이미지 선택 처리
    const onImageSelected = (file) => {
      store.commit("image/setFile", file);
    };
    
    // 이미지 정보 업데이트 처리
    const onInfoUpdated = (info) => {
      store.commit("image/setInfo", info);
    };
    
    // 이미지 분석 처리 (수정됨)
    const analyzeCurrentImage = async () => {
      if (!imageFile.value) {
        alert("먼저 이미지를 선택해주세요.");
        return;
      }
      
      try {
        isLoading.value = true;
        
        // AbortController 설정
        abortController.value = new AbortController();
        
        console.log("이미지 분석 시작:", imageFile.value.name);
        
        // 직접 API 호출
        try {
          // 이미지 분석 API 호출
          const result = await callAnalyzeImage(
            imageFile.value, 
            abortController.value.signal
          );
          
          // 결과 저장
          analysisResult.value = result;
          console.log("분석 결과:", result);
        } catch (apiError) {
          console.error("API 호출 오류:", apiError);
          
          // 오류 발생 시 테스트 데이터 사용
          if (!abortController.value.signal.aborted) {
            console.log("테스트 데이터 사용");
            analysisResult.value = {
              "Natural Elements": 0.7,
              "Urban Character": 0.3,
              "Water Features": 0.5,
              "Seasonal Appeal": 0.8,
              "Relaxation Potential": 0.9,
              "Romantic Atmosphere": 0.6,
              "Activity Opportunities": 0.4,
              "Historical/Cultural Value": 0.7,
              "Food Experience": 0.2,
              "Shopping Potential": 0.1
            };
            
            alert("API 연결 오류로 테스트 데이터를 사용합니다. 실제 서버 상태를 확인하세요.");
          }
        }
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("사용자가 요청을 취소했습니다.");
        } else {
          console.error("오류:", error);
          alert("오류: " + error.message);
        }
      } finally {
        isLoading.value = false;
        abortController.value = null;
      }
    };
    
    // 취소 처리
    const cancelAnalysis = () => {
      if (abortController.value) {
        console.log("분석 취소");
        abortController.value.abort();
        abortController.value = null;
        isLoading.value = false;
      }
    };
    
    // 초기화 처리
    const reset = () => {
      console.log("초기화");
      store.commit("image/reset");
      analysisResult.value = null;
      searchResults.value = [];
      actionStatus.value = { message: "", type: "" };
    };
    
    // Elasticsearch에 저장 핸들러
    const saveToElasticsearchHandler = async () => {
      if (!analysisResult.value) {
        showActionStatus("이미지를 먼저 분석해주세요.", "error");
        return;
      }
      
      try {
        showActionStatus("Elasticsearch에 저장 중...", "pending");
        
        // 특성 벡터 생성
        const featuresVector = createFeaturesVector(analysisResult.value);
        
        // 이미지를 Base64로 변환
        const imageBase64 = imagePreview.value;
        
        // 고유 ID 생성
        const imageId = generateUniqueId();
        
        // Elasticsearch에 저장
        await callSaveToElasticsearch(
          imageId,
          imageInfo.value.name || "무제",
          imageInfo.value.location || "미지정",
          imageInfo.value.tags
            ? imageInfo.value.tags.split(",").map((tag) => tag.trim())
            : [],
          imageInfo.value.description || "",
          imageBase64,
          analysisResult.value,
          featuresVector
        );
        
        showActionStatus("이미지가 성공적으로 저장되었습니다!", "success");
      } catch (error) {
        showActionStatus(
          "저장 중 오류가 발생했습니다: " + error.message,
          "error"
        );
        console.error("저장 오류:", error);
      }
    };
    
    // 유사 이미지 검색 핸들러
    const searchSimilarHandler = async () => {
      if (!analysisResult.value) {
        showActionStatus("이미지를 먼저 분석해주세요.", "error");
        return;
      }
      
      try {
        showActionStatus("유사한 이미지 검색 중...", "pending");
        
        // 특성 벡터 생성
        const featuresVector = createFeaturesVector(analysisResult.value);
        
        // Elasticsearch에서 유사 이미지 검색
        const results = await searchSimilarImages(featuresVector, 10);
        searchResults.value = results;
        
        showActionStatus("검색이 완료되었습니다!", "success");
      } catch (error) {
        showActionStatus(
          "검색 중 오류가 발생했습니다: " + error.message,
          "error"
        );
        console.error("검색 오류:", error);
      }
    };
    
    // 상태 메시지 표시 함수
    const showActionStatus = (message, type) => {
      actionStatus.value = { message, type };
      
      // 자동 숨김 (성공 메시지인 경우)
      if (type === "success") {
        setTimeout(() => {
          actionStatus.value = { message: "", type: "" };
        }, 5000);
      }
    };
    
    // 고유 ID 생성 함수
    const generateUniqueId = () => {
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };
    
    return {
      imageFile,
      isLoading,
      analysisResult,
      searchResults,
      actionStatus,
      onImageSelected,
      onInfoUpdated,
      analyzeCurrentImage,
      cancelAnalysis,
      reset,
      saveToElasticsearchHandler,
      searchSimilarHandler
    };
  }
};
</script>

<style lang="scss">
// 해당 컴포넌트에만 적용되는 스타일
.logo-search {
  font-family: "Nunito", "Noto Sans KR", sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>