// API 호출 관련 함수들

/**
 * 파일을 Base64로 변환하는 유틸리티 함수
 * @param {File} file - 변환할 파일
 * @returns {Promise<string>} - Base64 인코딩된 문자열
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * 이미지 분석 API 호출 함수
 * @param {File} imageFile - 분석할 이미지 파일
 * @param {AbortSignal} signal - 요청 취소를 위한 AbortSignal
 * @returns {Promise<Object>} - 분석 결과
 */
export const analyzeImage = async (imageFile, signal) => {
  try {
    console.log('분석 시작:', imageFile ? imageFile.name : 'No file');
    
    // 이미지를 Base64로 변환
    const base64Image = await fileToBase64(imageFile);
    
    // 모델 이름 고정 - basic으로 시도 (basic_2 대신)
    const MODEL_NAME = "basic_2";
    console.log('사용 모델:', MODEL_NAME);
    
    // Ollama API 요청
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: "Analyze this travel image and provide ratings for all dimensions.",
        images: [base64Image.split(',')[1]], // Remove data:image/jpeg;base64, part
        stream: false
      }),
      signal: signal
    });
    
    if (!response.ok) {
      throw new Error('API 요청 실패: ' + response.status);
    }
    
    const data = await response.json();
    console.log('API 응답 수신:', data ? '성공' : '실패');
    
    // 응답 파싱
    return parseAnalysisResponse(data.response);
    
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
};

/**
 * 응답 문자열에서 JSON 부분을 파싱하는 함수 (수정됨)
 * @param {string} responseText - 분석 응답 텍스트
 * @returns {Object} - 파싱된 결과 객체
 */
const parseAnalysisResponse = (responseText) => {
  try {
    // 디버깅을 위한 로그
    console.log("응답 파싱 시작...");
    console.log("응답 문자열 일부:", responseText.substring(0, 100) + "...");
    
    // 이스케이프된 문자열 처리
    const unescapedResponseText = responseText.replace(/\\/g, '');
    
    // 기본 테스트 데이터 (파싱 실패시 사용)
    const defaultData = {
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
    
    // JSON 추출 시도 - 간소화된 방식
    let jsonData = {};
    
    try {
      // 중괄호로 감싸진 부분 추출 시도
      const match = unescapedResponseText.match(/\{[\s\S]*\}/);
      if (match) {
        jsonData = JSON.parse(match[0]);
        console.log("JSON 파싱 성공");
      } else {
        console.warn("JSON 형식 감지 실패, 기본값 사용");
        return defaultData;
      }
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);
      return defaultData;
    }
    
    // 차원 검증 및 정규화
    const expectedDimensions = [
      "Natural Elements",
      "Urban Character",
      "Water Features",
      "Seasonal Appeal",
      "Relaxation Potential",
      "Romantic Atmosphere",
      "Activity Opportunities",
      "Historical/Cultural Value",
      "Food Experience",
      "Shopping Potential"
    ];
    
    // 필요한 차원이 있는지 확인
    let missingDimensions = false;
    for (const dim of expectedDimensions) {
      if (!(dim in jsonData)) {
        console.warn(`누락된 차원: ${dim}`);
        jsonData[dim] = 0.5; // 기본값
        missingDimensions = true;
      } else {
        // 값 정규화 (0-1 범위, 0.1 단위)
        let value = parseFloat(jsonData[dim]);
        
        // NaN이면 기본값 사용
        if (isNaN(value)) {
          value = 0.5;
        }
        
        // 1.0 이상은 1.0으로 제한
        if (value > 1.0) {
          value = 1.0;
        }
        
        // 음수는 0으로 제한
        if (value < 0) {
          value = 0.0;
        }
        
        // 0.1 단위로 반올림
        jsonData[dim] = Math.round(value * 10) / 10;
      }
    }
    
    // 차원이 누락된 경우 경고
    if (missingDimensions) {
      console.warn("일부 차원이 누락되어 기본값을 사용했습니다");
    }
    
    console.log("최종 파싱 결과:", jsonData);
    return jsonData;
  } catch (error) {
    console.error("응답 파싱 오류:", error);
    // 오류 발생 시 기본값 반환
    return {
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
  }
};

/**
 * 분석 결과에서 10차원 특성 벡터 생성
 * @param {Object} analysisResult - 분석 결과
 * @returns {Array<number>} - 특성 벡터
 */
export const createFeaturesVector = (analysisResult) => {
  return [
    analysisResult["Natural Elements"],
    analysisResult["Urban Character"],
    analysisResult["Water Features"],
    analysisResult["Seasonal Appeal"],
    analysisResult["Relaxation Potential"],
    analysisResult["Romantic Atmosphere"],
    analysisResult["Activity Opportunities"],
    analysisResult["Historical/Cultural Value"],
    analysisResult["Food Experience"],
    analysisResult["Shopping Potential"]
  ];
};

/**
 * Elasticsearch에 이미지 저장
 * @param {string} imageId - 이미지 ID
 * @param {string} name - 이미지 이름
 * @param {string} location - 위치 정보
 * @param {Array<string>} tags - 태그 배열
 * @param {string} description - 이미지 설명
 * @param {string} imageBase64 - Base64 인코딩된 이미지
 * @param {Object} analysisResult - 분석 결과
 * @param {Array<number>} featuresVector - 특성 벡터
 * @returns {Promise<Object>} - Elasticsearch 응답
 */
export const saveToElasticsearch = async (
  imageId,
  name,
  location,
  tags,
  description,
  imageBase64,
  analysisResult,
  featuresVector
) => {
  try {
    console.log('Elasticsearch 저장 시작:', imageId);
    
    // 문서 구조 생성
    const document = {
      image_id: imageId,
      image_name: name,
      image_location: location,
      image_tags: tags,
      image_description: description,
      image_data: imageBase64.split(',')[1], // base64 데이터만 저장
      upload_date: new Date().toISOString(),
      features_vector: featuresVector,
      dimensions: {
        natural_elements: analysisResult["Natural Elements"],
        urban_character: analysisResult["Urban Character"],
        water_features: analysisResult["Water Features"],
        seasonal_appeal: analysisResult["Seasonal Appeal"],
        relaxation_potential: analysisResult["Relaxation Potential"],
        romantic_atmosphere: analysisResult["Romantic Atmosphere"],
        activity_opportunities: analysisResult["Activity Opportunities"],
        historical_cultural_value: analysisResult["Historical/Cultural Value"],
        food_experience: analysisResult["Food Experience"],
        shopping_potential: analysisResult["Shopping Potential"]
      }
    };
    
    // Elasticsearch API 호출
    const response = await fetch('http://localhost:9200/travel_images/_doc/' + imageId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(document)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error('Elasticsearch 오류: ' + JSON.stringify(errorData));
    }
    
    const result = await response.json();
    console.log('Elasticsearch 저장 완료:', result);
    return result;
  } catch (error) {
    console.error('Elasticsearch 저장 오류:', error);
    throw error;
  }
};

/**
 * 유사한 이미지 검색
 * @param {Array<number>} featuresVector - 특성 벡터
 * @param {number} limit - 검색 결과 제한
 * @returns {Promise<Array<Object>>} - 검색 결과
 */
export const searchSimilarImages = async (featuresVector, limit = 10) => {
  try {
    console.log('유사 이미지 검색 시작');
    
    // KNN 검색 쿼리 구성
    const query = {
      knn: {
        field: "features_vector",
        query_vector: featuresVector,
        k: limit,
        num_candidates: 100
      }
    };
    
    // Elasticsearch API 호출
    const response = await fetch('http://localhost:9200/travel_images/_search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        size: limit,
        query: query,
        _source: ["image_id", "image_name", "image_location", "image_tags", "image_data", "dimensions"]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error('검색 오류: ' + JSON.stringify(errorData));
    }
    
    const result = await response.json();
    console.log('검색 결과 수:', result.hits.hits.length);
    return result.hits.hits;
  } catch (error) {
    console.error('검색 오류:', error);
    throw error;
  }
};