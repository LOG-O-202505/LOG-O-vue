// API 호출 관련 함수들
import config from '@/config.js';
import regionMapping from '@/data/regionMapping.js';
import EXIF from 'exif-js';

/**
 * 파일을 Base64로 변환하는 유틸리티 함수
 * @param {File} file - 변환할 파일
 * @returns {Promise<string>} - Base64 인코딩된 문자열
 */
/* 기존 함수 주석 처리
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};
*/

/**
 * 파일을 조정된 크기의 Base64로 변환하는 유틸리티 함수
 * 이미지의 비율을 유지하면서 짧은 쪽이 640px이 되도록 조정
 * @param {File} file - 변환할 파일
 * @returns {Promise<string>} - 크기가 조정된 Base64 인코딩된 문자열
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 원본 이미지 크기
        const originWidth = img.width;
        const originHeight = img.height;
        console.log(`원본 이미지 크기: ${originWidth}x${originHeight}`);
        
        // 짧은 쪽을 기준으로 비율 계산
        const targetSize = 640;
        let ratio;
        let newWidth, newHeight;
        
        if (originWidth < originHeight) {
          // 가로가 더 짧은 경우
          ratio = targetSize / originWidth;
          newWidth = targetSize;
          newHeight = Math.round(originHeight * ratio);
        } else {
          // 세로가 더 짧은 경우
          ratio = targetSize / originHeight;
          newHeight = targetSize;
          newWidth = Math.round(originWidth * ratio);
        }
        
        // 만약 원본이 이미 targetSize보다 작다면 그대로 사용
        if (originWidth <= targetSize && originHeight <= targetSize) {
          newWidth = originWidth;
          newHeight = originHeight;
        }
        
        console.log(`조정된 이미지 크기: ${newWidth}x${newHeight} (비율: ${ratio})`);
        
        // Canvas를 사용하여 이미지 크기 조정
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // 품질 조정 (0.9 = 90% 품질)
        const resizedBase64 = canvas.toDataURL('image/jpeg', 0.9);
        
        // 원본과 조정된 이미지 크기 비교 로깅
        console.log(`원본 Base64 길이: ${event.target.result.length} 바이트`);
        console.log(`조정된 Base64 길이: ${resizedBase64.length} 바이트`);
        console.log(`크기 감소: ${((1 - resizedBase64.length / event.target.result.length) * 100).toFixed(2)}%`);
        
        resolve(resizedBase64);
      };
      
      img.onerror = () => {
        reject(new Error('이미지 로드 실패'));
      };
      
      img.src = event.target.result;
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
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
    
    // 이미지 파일 타입 확인
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('유효한 이미지 파일이 아닙니다.');
    }
    
    console.log('이미지 파일 타입:', imageFile.type);
    console.log('이미지 파일 크기:', (imageFile.size / 1024).toFixed(2), 'KB');
    
    // 이미지에서 위치 정보 추출
    // const geoLocationData = await extractGeoLocationData(imageFile);
    
    // 이미지를 Base64로 변환 (크기 조정됨)
    const base64Image = await fileToBase64(imageFile);
    console.log('이미지 변환 완료: Base64');
    
    // config에서 모델 이름 사용
    const MODEL_NAME = config.MODEL_NAME;
    console.log('사용 모델:', MODEL_NAME);
    
    // config에서 Ollama API URL 사용
    console.log('API 주소:', `${config.OLLAMA_API}/api/generate`);
    
    // Ollama API 요청
    const response = await fetch(`${config.OLLAMA_API}/api/generate`, {
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
    
    console.log('API 응답 상태:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 응답 에러 내용:', errorText);
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API 응답 수신:', data ? '성공' : '실패');
    
    // 응답 파싱
    const analysisResult = parseAnalysisResponse(data.response);
    
    // 위치 정보와 분석 결과 통합
    return {
      ...analysisResult,
      // geoLocation: geoLocationData, // 위치 정보 포함
      // suggestedName: geoLocationData?.suggestedName || '', // 제안된 이미지 이름
      // googleMapsUrl: geoLocationData?.googleMapsUrl || '' // 구글 지도 URL
    };
    
  } catch (error) {
    console.error('API 호출 오류 타입:', error.name);
    console.error('API 호출 오류 메시지:', error.message);
    console.error('API 호출 오류 스택:', error.stack);
    throw error;
  }
};

/**
 * 2단계 이미지 분석 API 호출 함수
 * @param {File} imageFile - 분석할 이미지 파일
 * @param {AbortSignal} signal - 요청 취소를 위한 AbortSignal
 * @returns {Promise<Object>} - 분석 결과
 */
export const analyzeImage2 = async (imageFile, signal) => {
  try {
    console.log('2단계 이미지 분석 시작:', imageFile ? imageFile.name : 'No file');
    
    // 이미지 파일 타입 확인
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('유효한 이미지 파일이 아닙니다.');
    }
    
    console.log('이미지 파일 타입:', imageFile.type);
    console.log('이미지 파일 크기:', (imageFile.size / 1024).toFixed(2), 'KB');
    
    // 이미지를 Base64로 변환 (크기 조정됨)
    const base64Image = await fileToBase64(imageFile);
    console.log('이미지 변환 완료: Base64');
    
    // 1단계: 영문 설명 생성
    console.log("이미지 설명 생성 API 호출 시작...");
    
    // Ollama API 형식으로 요청 구성
    const descriptionRequestBody = {
      model: 'light_2', // config.MODEL_NAME에서 가져오거나 적절한 모델 사용
      prompt: 'Describe this travel destination in detail according to your instructions.',
      images: [base64Image.split(',')[1]], // Base64 이미지 데이터만 추출
      stream: false // 스트리밍 비활성화
    };
    
    const descriptionResponse = await fetch(`http://localhost:11434/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(descriptionRequestBody),
      signal: signal
    });
    
    if (!descriptionResponse.ok) {
      console.error("API 응답 상태:", descriptionResponse.status, descriptionResponse.statusText);
      throw new Error(`이미지 설명 API 응답 오류: ${descriptionResponse.status}`);
    }
    
    const descriptionData = await descriptionResponse.json();
    console.log("이미지 설명 API 응답:", descriptionData);
    
    // 이미지 설명 추출
    const imageDescription = descriptionData.response || "이미지 설명을 얻을 수 없습니다.";
    console.log("이미지 설명 생성 완료:", imageDescription);
    
    // 2단계: 10차원 분석
    console.log("10차원 분석 API 호출 시작...");
    
    const analysisRequestBody = {
      model: 'ko_2', // config.MODEL_NAME에서 가져오거나 적절한 모델 사용
      prompt: imageDescription, // 이전 단계에서 얻은 설명을 프롬프트로 사용
      stream: false
    };
    
    const analysisResponse = await fetch(`http://localhost:11434/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analysisRequestBody),
      signal: signal
    });
    
    if (!analysisResponse.ok) {
      console.error("API 응답 상태:", analysisResponse.status, analysisResponse.statusText);
      throw new Error(`10차원 분석 API 응답 오류: ${analysisResponse.status}`);
    }
    
    const analysisData = await analysisResponse.json();
    console.log("10차원 분석 API 응답:", analysisData);
    
    // 10차원 분석 결과 파싱
    let result = {};
    
    if (analysisData && analysisData.response) {
      try {
        // 1. JSON 형식의 문자열인 경우 파싱 시도
        if (analysisData.response.trim().startsWith('{')) {
          result = JSON.parse(analysisData.response);
          console.log("10차원 분석 파싱 결과 (JSON):", result);
        } else {
          // 2. 각 줄이 "키": 값 형태로 되어 있는 경우 정규식으로 파싱
          const dimensions = {};
          const lines = analysisData.response.split('\n');
          
          for (const line of lines) {
            // "Natural Elements": 0.9 형태의 라인 파싱
            const match = line.match(/"([^"]+)":\s*([0-9.]+)/);
            if (match) {
              const key = match[1];
              const value = parseFloat(match[2]);
              dimensions[key] = value;
            }
          }
          
          // 추출된 차원이 있는지 확인
          if (Object.keys(dimensions).length > 0) {
            console.log("10차원 분석 파싱 결과 (라인 파싱):", dimensions);
            result = dimensions;
          } else {
            // 3. 파싱 실패 시 테스트 데이터 제공
            console.warn("응답 파싱 실패, 테스트 데이터 사용");
            result = {
              "Natural Elements": 0.7,
              "Urban Character": 0.3,
              "Water Features": 0.5,
              "Seasonal Appeal": 0.8,
              "Relaxation Potential": 0.7,
              "Romantic Atmosphere": 0.6,
              "Activity Opportunities": 0.4,
              "Historical/Cultural Value": 0.5,
              "Food Experience": 0.3,
              "Shopping Potential": 0.2
            };
          }
        }
      } catch (jsonError) {
        console.error("10차원 분석 파싱 오류:", jsonError, "원본 내용:", analysisData.response);
        // 파싱 실패 시 테스트 데이터 사용
        result = {
          "Natural Elements": 0.7,
          "Urban Character": 0.3,
          "Water Features": 0.5,
          "Seasonal Appeal": 0.8,
          "Relaxation Potential": 0.7,
          "Romantic Atmosphere": 0.6,
          "Activity Opportunities": 0.4,
          "Historical/Cultural Value": 0.5,
          "Food Experience": 0.3,
          "Shopping Potential": 0.2
        };
      }
    } else {
      console.warn("API에서 유효한 응답을 받지 못했습니다. 테스트 데이터 사용");
      result = {
        "Natural Elements": 0.7,
        "Urban Character": 0.3,
        "Water Features": 0.5,
        "Seasonal Appeal": 0.8,
        "Relaxation Potential": 0.7,
        "Romantic Atmosphere": 0.6,
        "Activity Opportunities": 0.4,
        "Historical/Cultural Value": 0.5,
        "Food Experience": 0.3,
        "Shopping Potential": 0.2
      };
    }
    
    // 추가 메타데이터 설정
    result.imageDescription = imageDescription;
    
    // 이미지에서 위치 정보 추출
    const geoLocationData = await extractGeoLocationData(imageFile);
    
    // 위치 정보와 분석 결과 통합
    if (geoLocationData) {
      result.geoLocation = geoLocationData;
      result.suggestedName = geoLocationData.suggestedName || '';
      result.googleMapsUrl = geoLocationData.googleMapsUrl || '';
    }
    
    console.log("최종 분석 결과:", result);
    return result;
    
  } catch (error) {
    console.error('API 호출 오류 타입:', error.name);
    console.error('API 호출 오류 메시지:', error.message);
    console.error('API 호출 오류 스택:', error.stack);
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
    
    // 차원 데이터만 추출하여 정규화된 결과 생성
    const normalizedDimensions = {};
    
    // 필요한 차원이 있는지 확인
    let missingDimensions = false;
    for (const dim of expectedDimensions) {
      if (!(dim in jsonData)) {
        console.warn(`누락된 차원: ${dim}`);
        normalizedDimensions[dim] = 0.5; // 기본값
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
        normalizedDimensions[dim] = Math.round(value * 10) / 10;
      }
    }
    
    // 차원이 누락된 경우 경고
    if (missingDimensions) {
      console.warn("일부 차원이 누락되어 기본값을 사용했습니다");
    }
    
    // 파싱된 차원 데이터만 사용하여 정규화된 결과 반환
    // 다른 메타데이터(geoLocation 등)는 호출 함수에서 추가
    
    console.log("최종 파싱 결과:", normalizedDimensions);
    return normalizedDimensions;
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
  // 결과 객체에서 차원 데이터만 추출
  const dimensions = [
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
  
  // 각 차원의 값을 안전하게 추출하여 벡터 생성
  return dimensions.map(dim => {
    const value = analysisResult[dim];
    // 값이 숫자가 아니면 기본값 0.5 사용
    return typeof value === 'number' ? value : 0.5;
  });
};

/**
 * 위치 문자열에서 지역 정보 찾기
 * @param {string} locationString - 위치 문자열 (예: '서울특별시 강남구')
 * @returns {Object} - 찾은 지역 정보 (province, city)
 */
export const findRegionInfoFromLocation = (locationString) => {
  if (!locationString) return null;
  
  console.log('=== 위치 문자열에서 지역 정보 찾기 시작 ===');
  console.log('입력된 위치 문자열:', locationString);
  
  const result = {
    full_text: locationString,
    province_code: null,
    province_name: null,
    city_code: null,
    city_name: null
  };
  
  // 광역시/도 검색
  console.log('광역시/도 검색 시작...');
  for (const provinceCode in regionMapping) {
    const province = regionMapping[provinceCode];
    
    // 광역시/도 이름이 위치 문자열에 포함되어 있는지 확인
    if (locationString.includes(province.name)) {
      console.log(`광역시/도 매칭 성공: ${province.name} (코드: ${province.code})`);
      result.province_code = province.code;
      result.province_name = province.name;
      
      // 하위 시군구 검색
      console.log(`${province.name}의 하위 시군구 검색 시작...`);
      let cityMatched = false;
      for (const city of province.children) {
        if (locationString.includes(city.name)) {
          console.log(`시군구 매칭 성공: ${city.name} (코드: ${city.code})`);
          result.city_code = city.code;
          result.city_name = city.name;
          cityMatched = true;
          break;
        }
      }
      
      if (!cityMatched) {
        console.log(`${province.name}에서 매칭되는 시군구를 찾지 못했습니다.`);
      }
      
      break;
    }
  }
  
  if (!result.province_code) {
    console.log('위치 문자열에서 매칭되는 광역시/도를 찾지 못했습니다.');
  }
  
  console.log('최종 지역 정보 결과:', result);
  console.log('=== 위치 문자열에서 지역 정보 찾기 끝 ===');
  return result;
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
 * @param {Object} locationData - 지역 정보 데이터 (optional)
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
  featuresVector,
  locationData = null
) => {
  try {
    console.log('=== Elasticsearch 저장 데이터 로깅 시작 ===');
    console.log('이미지 ID:', imageId);
    console.log('이미지 이름:', name);
    console.log('위치 정보 (텍스트):', location);
    console.log('태그:', tags);
    console.log('설명:', description);
    
    // 이미지 압축 확인 및 필요 시 압축 처리
    let compressedImageBase64 = imageBase64;
    
    // 만약 이미지가 아직 압축되지 않은 상태라면 압축 처리
    if (imageBase64.length > 0 && !imageBase64.includes('data:image/')) {
      // 이미 Base64 데이터만 있는 경우 (data:image/... 접두사가 없는 경우)
      console.log('이미지가 이미 Base64 데이터만 있는 형식입니다.');
    } else {
      // 압축 처리가 필요한 경우 (원본 이미지인 경우)
      console.log('이미지 압축 시작...');
      
      // File 객체로 변환 후 압축 (임시 방법)
      const blob = await fetch(imageBase64).then(res => res.blob());
      const file = new File([blob], 'temp.jpg', { type: 'image/jpeg' });
      
      // fileToBase64 함수로 압축
      compressedImageBase64 = await fileToBase64(file);
      console.log('이미지 압축 완료');
    }
    
    // Base64 데이터 추출 (접두사 제거)
    const base64Data = compressedImageBase64.split(',')[1] || compressedImageBase64;
    
    // Base64 이미지 크기 계산 및 로깅
    const base64Length = base64Data ? base64Data.length : 0;
    console.log('이미지 Base64 길이:', base64Length, '자');
    console.log('이미지 Base64 크기:', (base64Length * 0.75 / 1024).toFixed(2), 'KB (디코딩 후 예상)');
    
    console.log('분석 결과:', analysisResult);
    console.log('특성 벡터:', featuresVector);
    console.log('구조화된 위치 데이터:', locationData);
    
    console.log('Elasticsearch 저장 시작:', imageId);
    console.log('Elasticsearch API 주소:', `${config.ES_API}/travel_images/_doc/${imageId}`);
    
    // 위치 정보에서 지역 정보 추출 (locationData가 없을 경우)
    const finalLocationData = locationData || findRegionInfoFromLocation(location);
    console.log('최종 위치 데이터:', finalLocationData);
    
    // 문서 구조 생성
    const document = {
      image_id: imageId,
      image_name: name,
      image_location: location, // 기존 필드 유지 (하위 호환성)
      location: finalLocationData, // 새로운 구조화된 위치 정보
      image_tags: tags,
      image_description: description,
      image_data: base64Data, // 압축된 Base64 데이터 저장
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
    
    console.log('최종 문서 구조 (이미지 데이터 제외):');
    const documentCopy = {...document};
    delete documentCopy.image_data;
    console.log(JSON.stringify(documentCopy, null, 2));
    console.log('=== Elasticsearch 저장 데이터 로깅 끝 ===');
    
    // config에서 Elasticsearch API URL 사용
    const response = await fetch(`${config.ES_API}/travel_images/_doc/${imageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(document)
    });
    
    console.log('ES 응답 상태:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('ES 응답 에러 내용:', errorData);
      throw new Error('Elasticsearch 오류: ' + JSON.stringify(errorData));
    }
    
    const result = await response.json();
    console.log('Elasticsearch 저장 완료:', result);
    return result;
  } catch (error) {
    console.error('Elasticsearch 저장 오류 타입:', error.name);
    console.error('Elasticsearch 저장 오류 메시지:', error.message);
    console.error('Elasticsearch 저장 오류 스택:', error.stack);
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
    console.log('검색 API 주소:', `${config.ES_API}/travel_images/_search`);
    
    // KNN 검색 쿼리 구성
    const query = {
      knn: {
        field: "features_vector",
        query_vector: featuresVector,
        k: limit,
        num_candidates: 100
      }
    };
    
    // config에서 Elasticsearch API URL 사용
    const response = await fetch(`${config.ES_API}/travel_images/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        size: limit,
        query: query,
        _source: ["image_id", "image_name", "image_location", "image_tags","image_description", "image_data", "dimensions"]
      })
    });
    
    console.log('검색 응답 상태:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('검색 응답 에러 내용:', errorData);
      throw new Error('검색 오류: ' + JSON.stringify(errorData));
    }
    
    const result = await response.json();
    console.log('검색 결과 수:', result.hits.hits.length);
    return result.hits.hits;
  } catch (error) {
    console.error('검색 오류 타입:', error.name);
    console.error('검색 오류 메시지:', error.message);
    console.error('검색 오류 스택:', error.stack);
    throw error;
  }
};

/**
 * 키워드로 이미지 검색
 * @param {string} keyword - 검색할 키워드
 * @param {number} size - 검색 결과 제한 (한 번에 가져올 결과 수)
 * @param {number} from - 결과 시작 위치 (페이지네이션용)
 * @returns {Promise<Object>} - 검색 결과와 총 결과 수
 */
export const searchImagesByKeyword = async (keyword, size = 10, from = 0) => {
  try {
    console.log('키워드 검색 시작:', keyword);
    console.log('검색 API 주소:', `${config.ES_API}/travel_images/_search`);
    
    // 검색 쿼리 구성
    const query = {
      multi_match: {
        query: keyword,
        fields: [
          "image_name", 
          "image_tags", 
          "image_description", 
          "image_location",
          // 새로운 구조화된 위치 필드 추가
          "location.full_text",
          "location.province_name",
          "location.city_name"
        ],
        type: "best_fields",
        operator: "or"
      }
    };
    
    // config에서 Elasticsearch API URL 사용
    const response = await fetch(`${config.ES_API}/travel_images/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        size: size,
        from: from,
        query: query,
        _source: [
          "image_id", 
          "image_name", 
          "image_location", 
          "location", 
          "image_tags", 
          "image_data", 
          "dimensions"
        ]
      })
    });
    
    console.log('검색 응답 상태:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('검색 응답 에러 내용:', errorData);
      throw new Error('검색 오류: ' + JSON.stringify(errorData));
    }
    
    const result = await response.json();
    console.log('검색 결과 수:', result.hits.hits.length, '총 결과 수:', result.hits.total?.value || 0);
    
    // 결과와 함께 총 결과 수 반환
    return {
      hits: result.hits.hits,
      total: result.hits.total?.value || result.hits.hits.length
    };
  } catch (error) {
    console.error('키워드 검색 오류 타입:', error.name);
    console.error('키워드 검색 오류 메시지:', error.message);
    console.error('키워드 검색 오류 스택:', error.stack);
    throw error;
  }
};

/**
 * 위도/경도를 주소로 변환 (역지오코딩)
 * @param {number} latitude - 위도
 * @param {number} longitude - 경도
 * @returns {Promise<Object>} - 주소 정보
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    console.log(`위도(${latitude}), 경도(${longitude})에 대한 역지오코딩 시작`);
    
    // Nominatim API를 사용하여 역지오코딩 요청
    // 참고: 실제 서비스에서는 요청 제한이 있으므로 주의 필요
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=ko`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LOGO Travel App' // Nominatim API는 User-Agent 헤더를 요구함
      }
    });
    
    if (!response.ok) {
      throw new Error('역지오코딩 API 호출 실패');
    }
    
    const data = await response.json();
    console.log('역지오코딩 결과:', data);
    
    // 한국 주소 형식으로 결과 구성
    let address = {
      country: data.address.country || '',
      province: data.address.province || data.address.state || '',
      city: data.address.city || data.address.town || data.address.village || '',
      district: data.address.suburb || data.address.neighbourhood || '',
      road: data.address.road || '',
      display_name: data.display_name || '',
    };
    
    console.log('추출된 주소 정보:', address);
    
    // 지역 코드 매핑 시도
    const regionInfo = mapAddressToRegionCode(address);
    
    return {
      ...address,
      regionInfo
    };
  } catch (error) {
    console.error('역지오코딩 오류:', error);
    return null;
  }
};

/**
 * 주소 정보를 지역 코드로 매핑
 * @param {Object} address - 주소 정보
 * @returns {Object} - 지역 코드 정보
 */
const mapAddressToRegionCode = (address) => {
  try {
    console.log('주소를 지역 코드로 매핑 시작');
    
    // 기본 결과 객체
    const result = {
      province_code: null,
      province_name: null,
      city_code: null,
      city_name: null
    };
    
    // 광역시/도 찾기
    for (const provinceCode in regionMapping) {
      const province = regionMapping[provinceCode];
      // 정확한 이름 일치 또는 부분 매칭
      if (address.province && (
          address.province === province.name || 
          address.province.includes(province.name) || 
          province.name.includes(address.province))
      ) {
        console.log(`광역시/도 매칭 성공: ${province.name} (코드: ${provinceCode})`);
        result.province_code = provinceCode;
        result.province_name = province.name;
        
        // 시/군/구 찾기
        const city = address.city || address.district;
        if (city && province.children) {
          for (const cityInfo of province.children) {
            if (city === cityInfo.name || 
                city.includes(cityInfo.name) || 
                cityInfo.name.includes(city)) {
              console.log(`시/군/구 매칭 성공: ${cityInfo.name} (코드: ${cityInfo.code})`);
              result.city_code = cityInfo.code;
              result.city_name = cityInfo.name;
              break;
            }
          }
        }
        
        break;
      }
    }
    
    return result;
  } catch (error) {
    console.error('지역 코드 매핑 오류:', error);
    return {
      province_code: null,
      province_name: null,
      city_code: null,
      city_name: null
    };
  }
};

/**
 * 위치 정보를 기반으로 제안된 이미지 이름 생성
 * @param {Object} locationInfo - 위치 정보
 * @returns {string} - 제안된 이미지 이름
 */
export const generateImageNameFromLocation = (locationInfo) => {
  if (!locationInfo) return '';
  
  let parts = [];
  
  // 행정구역명 추가
  if (locationInfo.regionInfo && locationInfo.regionInfo.province_name) {
    parts.push(locationInfo.regionInfo.province_name);
    
    if (locationInfo.regionInfo.city_name) {
      parts.push(locationInfo.regionInfo.city_name);
    }
  } else if (locationInfo.province) {
    parts.push(locationInfo.province);
    
    if (locationInfo.city) {
      parts.push(locationInfo.city);
    }
    
    if (locationInfo.district) {
      parts.push(locationInfo.district);
    }
  }
  
  // 도로명 또는 상세 정보 추가
  if (locationInfo.road) {
    parts.push(locationInfo.road);
  }
  
  // 이름 생성
  if (parts.length > 0) {
    return `${parts.join(' ')}에서 찍은 사진`;
  }
  
  // 대비책: 특정 정보가 없는 경우
  if (locationInfo.display_name) {
    return `${locationInfo.display_name}에서 찍은 사진`;
  }
  
  return '';
};

/**
 * 위도/경도를 기반으로 구글 지도 URL 생성
 * @param {number} latitude - 위도
 * @param {number} longitude - 경도
 * @returns {string} - 구글 지도 URL
 */
export const getGoogleMapsUrl = (latitude, longitude) => {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

/**
 * 이미지 파일에서 위치 정보 추출 및 처리
 * @param {File} imageFile - 이미지 파일
 * @returns {Promise<Object|null>} - 위치 정보 객체 또는 null
 */
export const extractGeoLocationData = async (imageFile) => {
  try {
    if (!imageFile || !imageFile.type.startsWith('image/')) {
      console.log('위치 정보 추출: 이미지 파일이 아닙니다');
      return null;
    }
    
    // EXIF 데이터 추출을 Promise로 감싸기
    const exifData = await new Promise((resolve) => {
      EXIF.getData(imageFile, function() {
        const tags = EXIF.getAllTags(this);
        resolve(tags);
      });
    });
    
    console.log('==== 이미지 EXIF 정보 ====');
    console.log('촬영 날짜:', exifData.DateTime || exifData.DateTimeOriginal || '정보 없음');
    console.log('카메라 모델:', exifData.Model || '정보 없음');
    console.log('렌즈 정보:', exifData.LensModel || '정보 없음');
    console.log('노출 시간:', exifData.ExposureTime ? `1/${Math.round(1/exifData.ExposureTime)}초` : '정보 없음');
    console.log('ISO:', exifData.ISOSpeedRatings || '정보 없음');
    
    // GPS 정보가 없는 경우
    if (!exifData.GPSLatitude || !exifData.GPSLongitude) {
      console.log('위치 정보: 없음');
      return null;
    }
    
    // GPS 좌표 변환 함수
    const convertCoordinate = (coordinate, ref) => {
      if (!coordinate || coordinate.length !== 3) return null;
      
      // 도, 분, 초 형식의 GPS 데이터를 십진수 각도로 변환
      let value = coordinate[0] + 
                 coordinate[1]/60 + 
                 coordinate[2]/3600;
      
      // 남반구 또는 서반구인 경우 음수로 변환
      if (ref === 'S' || ref === 'W') {
        value = -value;
      }
      
      return value;
    };
    
    // 위도 및 경도 추출 및 변환
    const latitude = convertCoordinate(exifData.GPSLatitude, exifData.GPSLatitudeRef);
    const longitude = convertCoordinate(exifData.GPSLongitude, exifData.GPSLongitudeRef);
    
    if (latitude === null || longitude === null) {
      console.log('위치 정보 추출: 좌표 변환 실패');
      return null;
    }
    
    console.log('위치 정보:');
    console.log(' - 위도:', latitude);
    console.log(' - 경도:', longitude);
    
    // 구글 지도 URL 생성
    const googleMapsUrl = getGoogleMapsUrl(latitude, longitude);
    console.log(' - 구글맵 링크:', googleMapsUrl);
    
    // 역지오코딩으로 주소 정보 가져오기
    const addressInfo = await reverseGeocode(latitude, longitude);
    
    // 이미지 이름 제안
    const suggestedName = addressInfo ? generateImageNameFromLocation(addressInfo) : '';
    if (suggestedName) {
      console.log('제안된 이미지 이름:', suggestedName);
    }
    
    const result = {
      coordinates: {
        latitude,
        longitude
      },
      dateTime: exifData.DateTimeOriginal || exifData.DateTime,
      googleMapsUrl,
      address: addressInfo,
      suggestedName,
      regionInfo: addressInfo?.regionInfo
    };
    
    console.log('위치 정보 추출 결과:', result);
    console.log('=========================');
    
    return result;
  } catch (error) {
    console.error('위치 정보 추출 중 오류:', error);
    return null;
  }
};

/*
 * 이미지 위치 정보 추출 및 구글 지도 연동 사용 방법:
 *
 * 1. 이미지를 선택하면 extractGeoLocationData 함수로 위치 정보를 추출합니다.
 *    const geoInfo = await api.extractGeoLocationData(imageFile);
 *
 * 2. 추출된 위치 정보를 사용하여 다음을 수행할 수 있습니다:
 *    - 구글 지도 링크 표시: geoInfo.googleMapsUrl
 *    - 제안된 이미지 이름 사용: geoInfo.suggestedName
 *    - 지역 코드 가져오기: geoInfo.regionInfo.province_code, geoInfo.regionInfo.city_code
 *
 * 3. 이미지 분석 시 위치 정보가 자동으로 포함됩니다:
 *    const analysisResult = await api.analyzeImage(imageFile);
 *    console.log(analysisResult.suggestedName);
 *    console.log(analysisResult.googleMapsUrl);
 */