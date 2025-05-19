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
 * 이미지를 영어 설명으로 변환하는 함수 (light_2 모델 사용)
 * @param {File} imageFile - 처리할 이미지 파일
 * @param {AbortSignal} signal - 요청 취소를 위한 AbortSignal
 * @param {string} englishLocationName - 영어 지역 이름 (선택적)
 * @returns {Promise<string>} - 영어 설명 텍스트
 */
export const imageToEngDescription = async (imageFile, signal, englishLocationName = '') => {
  try {
    console.log('영어 설명 추출 시작:', imageFile ? imageFile.name : 'No file');
    
    // 이미지 파일 타입 확인
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('유효한 이미지 파일이 아닙니다.');
    }
    
    console.log('이미지 파일 타입:', imageFile.type);
    console.log('이미지 파일 크기:', (imageFile.size / 1024).toFixed(2), 'KB');
    
    // 이미지를 Base64로 변환 (크기 조정됨)
    const base64Image = await fileToBase64(imageFile);
    console.log('이미지 변환 완료: Base64');
    
    // 영문 설명 생성
    console.log("이미지 설명 생성 API 호출 시작...");
    
    // 지역 이름이 있으면 프롬프트에 포함
    let prompt = 'Describe this travel destination in detail according to your instructions.';
    if (englishLocationName) {
      prompt = `Describe this travel destination in ${englishLocationName} in detail according to your instructions.`;
      console.log('영어 지역 이름이 포함된 프롬프트 사용:', prompt);
    }
    
    // Ollama API 형식으로 요청 구성
    const descriptionRequestBody = {
      model: 'light_2', // 영어 설명 생성 모델
      prompt: prompt,
      images: [base64Image.split(',')[1]], // Base64 이미지 데이터만 추출
      stream: false // 스트리밍 비활성화
    };
    
    // 기본 fetch 옵션
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(descriptionRequestBody)
    };
    
    // signal이 유효한 AbortSignal인 경우에만 추가
    if (signal instanceof AbortSignal) {
      fetchOptions.signal = signal;
    }
    
    const descriptionResponse = await fetch(`http://localhost:11434/api/generate`, fetchOptions);
    
    if (!descriptionResponse.ok) {
      console.error("API 응답 상태:", descriptionResponse.status, descriptionResponse.statusText);
      throw new Error(`이미지 설명 API 응답 오류: ${descriptionResponse.status}`);
    }
    
    const descriptionData = await descriptionResponse.json();
    console.log("이미지 설명 API 응답:", descriptionData);
    
    // 이미지 설명 추출
    const imageDescription = descriptionData.response || "이미지 설명을 얻을 수 없습니다.";
    console.log("이미지 설명 생성 완료:", imageDescription);
    
    return imageDescription;
    
  } catch (error) {
    console.error('영어 설명 추출 오류 타입:', error.name);
    console.error('영어 설명 추출 오류 메시지:', error.message);
    console.error('영어 설명 추출 오류 스택:', error.stack);
    throw error;
  }
};

/**
 * 영어 설명을 10차원 벡터로 변환하는 함수 (ko_2 모델 사용)
 * @param {string} engDescription - 영어 설명 텍스트
 * @param {AbortSignal} signal - 요청 취소를 위한 AbortSignal
 * @returns {Promise<Object>} - 10차원 벡터 및 메타데이터
 */
export const EngDescriptionToVector = async (engDescription, signal) => {
  try {
    console.log("10차원 분석 API 호출 시작...");
    
    const analysisRequestBody = {
      model: 'ko_2', // 10차원 분석 모델
      prompt: engDescription, // 이전 단계에서 얻은 설명을 프롬프트로 사용
      stream: false
    };
    
    // 기본 fetch 옵션
    const analysisFetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analysisRequestBody)
    };
    
    // signal이 유효한 AbortSignal인 경우에만 추가
    if (signal instanceof AbortSignal) {
      analysisFetchOptions.signal = signal;
    }
    
    const analysisResponse = await fetch(`http://localhost:11434/api/generate`, analysisFetchOptions);
    
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
    result.imageDescription = engDescription;
    
    console.log("최종 분석 결과:", result);
    return result;
    
  } catch (error) {
    console.error('10차원 분석 오류 타입:', error.name);
    console.error('10차원 분석 오류 메시지:', error.message);
    console.error('10차원 분석 오류 스택:', error.stack);
    throw error;
  }
};

/**
 * 2단계 이미지 분석 API 호출 함수 - 기존 함수를 새 함수들로 구현
 * @param {File} imageFile - 분석할 이미지 파일
 * @param {AbortSignal} signal - 요청 취소를 위한 AbortSignal
 * @returns {Promise<Object>} - 분석 결과
 */
export const analyzeImage2 = async (imageFile, signal) => {
  try {
    console.log('2단계 이미지 분석 시작:', imageFile ? imageFile.name : 'No file');
    
    // 1단계: 이미지를 영어 설명으로 변환
    const engDescription = await imageToEngDescription(imageFile, signal);
    
    // 2단계: 영어 설명을 10차원 벡터로 변환
    const result = await EngDescriptionToVector(engDescription, signal);
    
    // 이미지에서 위치 정보 추출
    const geoLocationData = await extractGeoLocationData(imageFile);
    
    // 위치 정보와 분석 결과 통합
    if (geoLocationData) {
      result.geoLocation = geoLocationData;
      result.suggestedName = geoLocationData.suggestedName || '';
      result.googleMapsUrl = geoLocationData.googleMapsUrl || '';
    }
    
    console.log("최종 통합 분석 결과:", result);
    return result;
    
  } catch (error) {
    console.error('API 호출 오류 타입:', error.name);
    console.error('API 호출 오류 메시지:', error.message);
    console.error('API 호출 오류 스택:', error.stack);
    throw error;
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
 * @param {number} p_id - 장소 ID
 * @param {number} u_id - 사용자 ID
 * @param {number} u_age - 사용자 나이
 * @param {string} u_gender - 사용자 성별
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
  locationData = null,
  p_id = 1,
  u_id = 1,
  u_age = 20,
  u_gender = 'M'
) => {
  try {
    console.log('=== Elasticsearch 저장 데이터 로깅 시작 ===');
    console.log('이미지 ID:', imageId);
    console.log('이미지 이름:', name);
    console.log('위치 정보 (텍스트):', location);
    console.log('태그:', tags);
    console.log('설명:', description);
    
    // 추가 파라미터 로깅
    console.log('장소 ID (p_id):', p_id);
    console.log('사용자 ID (u_id):', u_id);
    console.log('사용자 나이 (u_age):', u_age);
    console.log('사용자 성별 (u_gender):', u_gender);

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

    // 지역 및 시군구 코드 변수 초기화
    let regionCode = "00"; // 기본값
    let sigCode = "00000"; // 기본값
    let p_address = location || ''; // 기본 주소는 location 텍스트
    
    // 처리 방식에 따라 다른 로직 적용
    if (locationData) {
      console.log('LocationData 정보:', locationData);
      
      // 1. TripPlan에서 전달한 구조화된 locationInfo가 있는 경우 (이미 regionInfo 포함)
      if (locationData.province_code) {
        console.log('구조화된 위치 정보 사용 (TripPlan에서 전달)');
        // 이미 구조화된 데이터가 있는 경우
        regionCode = locationData.province_code || "00";
        sigCode = locationData.city_code || "00000";
        p_address = locationData.full_text || location;
      }
      // 2. locationData에 위도/경도 정보가 있는 경우 - 역지오코딩 실행
      else if (locationData.latitude && locationData.longitude) {
        console.log('좌표 정보로 역지오코딩 실행');
        const geoResult = await reverseGeocode(locationData.latitude, locationData.longitude);
        
        if (geoResult) {
          if (geoResult.regionInfo) {
            regionCode = geoResult.regionInfo.province_code || "00";
            sigCode = geoResult.regionInfo.city_code || "00000";
          }
          
          // Nominatim에서 반환한 주소 정보 우선 사용
          if (geoResult.display_name) {
            p_address = geoResult.display_name;
          } else {
            // 주소 컴포넌트 개별적으로 조합
            p_address = [
              geoResult.city, 
              geoResult.borough, 
              geoResult.quarter || geoResult.suburb, 
              geoResult.road
            ].filter(Boolean).join(' ');
          }
          
          console.log('역지오코딩 성공:', regionCode, sigCode, p_address);
        }
      }
      // 3. 위치 정보에 카카오 API에서 온 좌표가 있는 경우
      else if (locationData.y && locationData.x) {
        console.log('카카오 좌표 정보로 역지오코딩 실행');
        const geoResult = await reverseGeocode(locationData.y, locationData.x);
        
        if (geoResult) {
          if (geoResult.regionInfo) {
            regionCode = geoResult.regionInfo.province_code || "00";
            sigCode = geoResult.regionInfo.city_code || "00000";
          }
          
          p_address = geoResult.display_name || locationData.address_name || location;
          console.log('역지오코딩 성공:', regionCode, sigCode, p_address);
        }
      }
      // 4. locationData의 regionInfo 필드 사용
      else if (locationData.regionInfo) {
        console.log('RegionInfo 필드 사용');
        regionCode = locationData.regionInfo.province_code || "00";
        sigCode = locationData.regionInfo.city_code || "00000";
        p_address = locationData.full_text || location;
      }
      // 5. locationData.address 객체가 있는 경우 (Nominatim 응답 구조와 유사)
      else if (locationData.address) {
        console.log('주소 객체로 역지오코딩 정보 추출');
        
        // 주소 객체에서 정보 추출
        const address = {
          province: locationData.address.city || locationData.address.province || '',
          city: locationData.address.borough || '',
          quarter: locationData.address.quarter || locationData.address.suburb || '',
          road: locationData.address.road || ''
        };
        
        // 지역 코드 매핑
        const mappedRegion = mapAddressToRegionCode(address);
        regionCode = mappedRegion.province_code || "00";
        sigCode = mappedRegion.city_code || "00000";
        
        // 주소 생성
        p_address = locationData.display_name || 
                    [address.province, address.city, address.quarter, address.road]
                      .filter(Boolean).join(' ');
      }
    } else {
      // 6. 텍스트 기반 위치 정보로부터 지역 정보 추출 시도
      console.log('텍스트 기반 위치 정보에서 지역 정보 추출 시도');
      const extractedInfo = findRegionInfoFromLocation(location);
      if (extractedInfo && extractedInfo.regionInfo) {
        regionCode = extractedInfo.regionInfo.province_code || "00";
        sigCode = extractedInfo.regionInfo.city_code || "00000";
        p_address = location;
      }
    }
    
    // 숫자형으로 변환 (문자열로 저장되어 있을 경우 대비)
    // parseInt를 사용하되, fallback으로 0 사용
    // parseInt(null)은 NaN을 반환하므로 || 연산자로 0으로 대체
    regionCode = parseInt(regionCode, 10) || 0;
    sigCode = parseInt(sigCode, 10) || 0;
    
    // 로깅
    console.log('최종 지역 코드:', regionCode);
    console.log('최종 시군구 코드:', sigCode);
    console.log('최종 주소:', p_address);

    // 영어 설명 추출 (light_2 모델을 통해 생성된 description)
    let englishDescription = '';
    if (analysisResult && analysisResult.imageDescription) {
      englishDescription = analysisResult.imageDescription;
      console.log('영어 설명(p_description_en):', englishDescription);
    }

    // 새로운 형식으로 문서 구조 생성
    const document = {
      p_id: p_id, // 사용자 입력 p_id 사용
      p_name: name, // 카카오 지도에서의 여행지 이름
      p_address: p_address, // 카카오에서 가져오는 여행지의 실제 Full 주소
      p_region: regionCode, // 여행 지역 코드 (숫자 2자리)
      p_sig: sigCode, // 여행 시군구 코드 (숫자 5자리)
      p_tags: tags, // 이미지 키워드 분석 결과에서 추출
      p_description: description, // 이미지 내용 분석 결과에서 추출
      p_description_en: englishDescription, // 영어 설명 (light_2 모델의 결과)
      p_image: base64Data, // 압축된 이미지 데이터
      p_vector: featuresVector, // 이미지 특성을 나타내는 10차원 벡터
      u_id: u_id, // 사용자 ID - 매개변수에서 가져옴
      u_age: u_age, // 사용자 나이 - 매개변수에서 가져옴
      u_gender: u_gender, // 사용자 성별 - 매개변수에서 가져옴
      upload_date: new Date().toISOString()
    };
    
    console.log('최종 문서 구조 (이미지 데이터 제외):');
    const documentCopy = {...document};
    delete documentCopy.p_image;
    console.log(JSON.stringify(documentCopy, null, 2));
    console.log('=== Elasticsearch 저장 데이터 로깅 끝 ===');
    
    // config에서 Elasticsearch API URL 사용 - travel_places 인덱스로 저장
    const response = await fetch(`${config.ES_API}/travel_places/_doc/${imageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(document)
    });
    
    if (!response.ok) {
      throw new Error(`Elasticsearch 저장 실패: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
    
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
    console.log('검색 API 주소:', `${config.ES_API}/travel_places/_search`);
    
    // KNN 검색 쿼리 구성
    const query = {
      knn: {
        field: "p_vector",
        query_vector: featuresVector,
        k: limit,
        num_candidates: 100
      }
    };
    
    // config에서 Elasticsearch API URL 사용
    const response = await fetch(`${config.ES_API}/travel_places/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        size: limit,
        query: query,
        _source: ["p_id", "p_name", "p_address", "p_region", "p_sig", "p_tags", "p_description", "p_description_en", "p_image", "u_age", "u_gender"]
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
    console.log('검색 API 주소:', `${config.ES_API}/travel_places/_search`);
    
    // 검색 쿼리 구성 - 가중치 적용
    const query = {
      multi_match: {
        query: keyword,
        fields: [
          "p_name^2",  // 가중치 2 적용
          "p_tags", 
          "p_description", 
          "p_description_en",
          "p_address"
        ],
        type: "best_fields",
        operator: "or"
      }
    };
    
    // 중복 필터링을 위해 더 많은 결과 가져오기
    // from 파라미터를 고려하여 fetchSize 조정 (페이지네이션된 데이터셋 전체를 가져와야 함)
    // 예를 들어, from = 10, size = 10 이면, 최소 20개의 고유 결과를 확보해야 함
    // 안전하게 요청된 size의 5배 또는 최소 50개를 가져오도록 설정
    // const fetchSize = Math.max(size * 5, 50 + from); 
    
    // config에서 Elasticsearch API URL 사용
    const response = await fetch(`${config.ES_API}/travel_places/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // size: fetchSize, // 여기서는 전체 결과를 가져와서 처리하므로 from은 0으로 고정
        // from: 0, 
        size: 10000, // 충분히 큰 값을 설정하여 모든 잠재적 결과 가져오기 (Elasticsearch 기본 한도는 10000)
        query: query,
        _source: [
          "p_id", 
          "p_name", 
          "p_address", 
          "p_region", 
          "p_sig", 
          "p_tags", 
          "p_description", 
          "p_description_en",
          "p_image", 
          "p_vector",
          "u_age", 
          "u_gender",
          "location_data" // 지도 표시에 필요할 수 있는 위치 데이터 포함
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
    let hits = result.hits.hits;
    
    // 1. 중복 p_id 제거 (가장 높은 스코어만 유지)
    const uniqueResultsById = new Map();
    
    for (const hit of hits) {
      const p_id = hit._source.p_id;
      // p_id가 없거나 유효하지 않은 경우 건너뛰기
      if (p_id === undefined || p_id === null) {
        console.warn('유효하지 않은 p_id를 가진 결과 건너뜀:', hit);
        continue;
      }
      
      if (!uniqueResultsById.has(p_id) || hit._score > uniqueResultsById.get(p_id)._score) {
        uniqueResultsById.set(p_id, hit);
      }
    }
    
    // Map에서 값들만 추출하여 배열로 변환
    const uniqueResults = Array.from(uniqueResultsById.values());
    
    // 점수 기준 내림차순 정렬
    uniqueResults.sort((a, b) => b._score - a._score);

    // 각 unique p_id에 대한 총 방문 횟수 가져오기
    const pIdsToFetchCountsFor = uniqueResults.map(hit => hit._source.p_id).filter(id => id !== undefined && id !== null);

    if (pIdsToFetchCountsFor.length > 0) {
      const countQuery = {
        size: 0, // 집계만 필요
        query: {
          terms: {
            p_id: pIdsToFetchCountsFor
          }
        },
        aggs: {
          visits_per_pid: {
            terms: {
              field: "p_id",
              size: pIdsToFetchCountsFor.length // 모든 p_id 커버
            }
          }
        }
      };

      try {
        const countResponse = await fetch(`${config.ES_API}/travel_places/_search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(countQuery)
        });

        if (countResponse.ok) {
          const countData = await countResponse.json();
          const visitCountsMap = new Map();
          if (countData.aggregations && countData.aggregations.visits_per_pid && countData.aggregations.visits_per_pid.buckets) {
            countData.aggregations.visits_per_pid.buckets.forEach(bucket => {
              visitCountsMap.set(bucket.key, bucket.doc_count);
            });
          }
          // uniqueResults에 visitCount 추가
          uniqueResults.forEach(hit => {
            const p_id = hit._source.p_id;
            hit._source.visitCount = visitCountsMap.get(p_id) || 0;
          });
        } else {
          console.error('p_id별 방문 횟수 조회 실패:', await countResponse.text());
          uniqueResults.forEach(hit => { hit._source.visitCount = 0; }); // 실패 시 0으로 초기화
        }
      } catch (aggError) {
        console.error('p_id별 방문 횟수 집계 중 오류:', aggError);
        uniqueResults.forEach(hit => { hit._source.visitCount = 0; }); // 오류 시 0으로 초기화
      }
    } else {
      // p_id가 없는 경우 (이론적으로 uniqueResults가 비어있을 때)
      uniqueResults.forEach(hit => {
        hit._source.visitCount = 0;
      });
    }
    
    // 2. 점수 정규화 (0-1 범위로)
    if (uniqueResults.length > 0) {
      const maxScore = uniqueResults[0]._score; // 이미 정렬되어 있으므로 첫 항목이 최대값
      if (maxScore > 0) { // 0으로 나누는 것 방지
        uniqueResults.forEach(hit => {
          hit._score = hit._score / maxScore; // 정규화
        });
      } else {
        // 모든 점수가 0이거나 음수인 경우 (실제로는 드묾)
        uniqueResults.forEach(hit => {
          hit._score = 0; // 안전하게 0으로 설정
        });
      }
    }
    
    const totalUniqueResults = uniqueResults.length;
    
    // 페이지네이션 적용 (from과 size를 이용하여 해당 페이지의 결과만 반환)
    const paginatedResults = uniqueResults.slice(from, from + size);
    
    console.log('중복 제거 및 정규화 후 반환될 결과 수 (페이지네이션 적용):', paginatedResults.length);
    console.log('총 고유 결과 수 (페이지네이션 전):', totalUniqueResults);
    
    // 결과와 함께 총 결과 수 반환
    return {
      hits: paginatedResults,
      total: totalUniqueResults // 고유 p_id 기준 총 개수
    };
  } catch (error) {
    console.error('키워드 검색 오류 타입:', error.name);
    console.error('키워드 검색 오류 메시지:', error.message);
    console.error('키워드 검색 오류 스택:', error.stack);
    throw error;
  }
};

/**
 * 위도/경도를 주소로 변환 (역지오코딩) - Google Geocoding API 사용
 * @param {number} latitude - 위도
 * @param {number} longitude - 경도
 * @returns {Promise<Object>} - 주소 정보
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    console.log(`위도(${latitude}), 경도(${longitude})에 대한 역지오코딩 시작 (Google API)`);
    
    // Google Geocoding API 요청
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=ko&key=${config.GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Google 역지오코딩 API 호출 실패');
    }
    
    const data = await response.json();
    console.log('Google 역지오코딩 결과:', data);
    
    // 결과가 없거나 상태가 OK가 아닌 경우
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error(`Google 역지오코딩 API 응답 오류: ${data.status}`);
    }
    
    // 가장 관련성 높은 결과(첫 번째 결과) 사용
    const result = data.results[0];
    const addressComponents = result.address_components;
    
    // Google 응답에서 주소 컴포넌트 추출
    const address = {
      country: '',
      province: '',  // 광역시/도 정보
      city: '',      // 특별시/광역시/시 정보
      borough: '',   // 구 정보
      quarter: '',   // 동/읍/면 정보
      suburb: '',    // 동네 정보
      road: '',      // 도로명
      display_name: result.formatted_address || ''
    };
    
    // 주소 컴포넌트 매핑
    for (const component of addressComponents) {
      const types = component.types;
      
      if (types.includes('country')) {
        address.country = component.long_name;
      }
      else if (types.includes('administrative_area_level_1')) {
        address.province = component.long_name; // 도/특별시/광역시
      }
      else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        // 시/군/구 판별 (행정구역 레벨에 따라)
        if (types.includes('locality')) {
          address.city = component.long_name; // 시
        } else {
          // Seoul의 경우 administrative_area_level_1이면서 locality임
          // 다른 경우 행정구역 레벨 2가 city 또는 borough일 수 있음
          if (!address.city) {
            address.city = component.long_name;
          } else {
            address.borough = component.long_name;
          }
        }
      }
      else if (types.includes('sublocality_level_1') || types.includes('administrative_area_level_3')) {
        // 구/동 정보
        if (!address.borough) {
          address.borough = component.long_name;
        } else {
          address.quarter = component.long_name;
        }
      }
      else if (types.includes('sublocality_level_2') || types.includes('administrative_area_level_4')) {
        // 동/읍/면
        address.quarter = component.long_name;
      }
      else if (types.includes('sublocality_level_3') || types.includes('administrative_area_level_5')) {
        // 동네
        address.suburb = component.long_name;
      }
      else if (types.includes('route')) {
        // 도로명
        address.road = component.long_name;
      }
    }
    
    console.log('추출된 주소 정보:', address);
    
    // 특수 케이스 처리: 서울특별시, 부산광역시 등 특별/광역시는 province와 city가 동일할 수 있음
    if (address.province && address.province.includes('특별시') || address.province.includes('광역시')) {
      if (!address.city) {
        address.city = address.province;
      }
    }
    
    // 광역시/도 매핑을 위한 정보 설정
    const provinceForMapping = address.province || address.city; // 광역시/도
    const cityForMapping = address.borough || address.quarter || address.suburb; // 구/동
    
    console.log('매핑용 광역시/도:', provinceForMapping);
    console.log('매핑용 구/동:', cityForMapping);
    
    // 지역 코드 매핑
    const regionInfo = mapAddressToRegionCode({
      province: provinceForMapping,
      city: cityForMapping
    });
    
    // 위치 데이터 추가
    const locationData = {
      latitude,
      longitude,
      googleMapsUrl: `https://www.google.com/maps?q=${latitude},${longitude}`
    };
    
    return {
      ...address,
      regionInfo,
      location_data: locationData
    };
  } catch (error) {
    console.error('Google 역지오코딩 오류:', error);
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
    console.log('입력 주소 정보:', address);
    
    // 기본 결과 객체
    const result = {
      province_code: null,
      province_name: null,
      city_code: null,
      city_name: null
    };
    
    // 특수한 경우 처리: 서울특별시 등의 특별시는 province와 city가 동일할 수 있음
    if (address.province && !address.city && 
        (address.province.includes('서울') || 
         address.province.includes('부산') || 
         address.province.includes('대구') || 
         address.province.includes('인천') || 
         address.province.includes('광주') || 
         address.province.includes('대전') || 
         address.province.includes('울산') || 
         address.province.includes('세종'))) {
      address.city = address.province;
    }
    
    // 광역시/도 찾기 (province나 city에서 찾기)
    for (const provinceCode in regionMapping) {
      const province = regionMapping[provinceCode];
      // 정확한 이름 일치 또는 부분 매칭
      // province에 광역시/도 이름이 포함되어 있거나 광역시/도 이름에 province가 포함되어 있는지 확인
      if (address.province && (
          address.province === province.name || 
          address.province.includes(province.name) || 
          province.name.includes(address.province))
      ) {
        console.log(`광역시/도 매칭 성공(province로 매칭): ${province.name} (코드: ${provinceCode})`);
        result.province_code = provinceCode;
        result.province_name = province.name;
        
        // 시/군/구 찾기 - address.city에서 찾기
        matchCityCode(province, address.city, result);
        
        // 성공적으로 찾았으면 여기서 종료
        if (result.city_code) break;
      }
      // province에서 찾지 못한 경우 city에서 찾기 (서울, 부산 등의 광역시인 경우)
      else if (address.city && (
          address.city === province.name || 
          address.city.includes(province.name) || 
          province.name.includes(address.city))
      ) {
        console.log(`광역시/도 매칭 성공(city로 매칭): ${province.name} (코드: ${provinceCode})`);
        result.province_code = provinceCode;
        result.province_name = province.name;
        
        // 시/군/구 찾기 - address.borough나 address.suburb에서 찾기
        if (address.borough) {
          matchCityCode(province, address.borough, result);
        } else if (address.quarter) {
          matchCityCode(province, address.quarter, result);
        } else if (address.suburb) {
          matchCityCode(province, address.suburb, result);
        }
        
        break;
      }
    }
    
    console.log('최종 지역 코드 매핑 결과:', result);
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
 * 시/군/구 코드 매칭 도우미 함수
 * @param {Object} province - 광역시/도 정보
 * @param {string} cityName - 시/군/구 이름
 * @param {Object} result - 결과를 저장할 객체
 */
const matchCityCode = (province, cityName, result) => {
  if (!cityName || !province.children) return;
  
  console.log(`매칭 시도: "${cityName}" in ${province.name}`);
  
  for (const cityInfo of province.children) {
    // 정규화 - 문자열 정규화 로직 개선
    // 기존 정규식이 '서귀포시'와 같은 패턴을 제대로 인식하지 못하는 문제 수정
    const normalizedCityName = cityName.trim();
    const normalizedInfoName = cityInfo.name.trim();
    
    // 정확히 일치하거나 포함 관계인 경우 (양방향 확인)
    if (normalizedCityName === normalizedInfoName || 
        normalizedCityName.includes(normalizedInfoName) || 
        normalizedInfoName.includes(normalizedCityName)) {
      console.log(`시/군/구 매칭 성공: ${cityInfo.name} (코드: ${cityInfo.code})`);
      result.city_code = cityInfo.code;
      result.city_name = cityInfo.name;
      break;
    }
    
    // '시', '구', '군' 등의 접미사 제거 후 비교
    const cleanCityName = normalizedCityName.replace(/(시|구|군|동)$/g, '').trim();
    const cleanInfoName = normalizedInfoName.replace(/(시|구|군|동)$/g, '').trim();
    
    if (cleanCityName === cleanInfoName) {
      console.log(`시/군/구 매칭 성공 (접미사 제거 후): ${cityInfo.name} (코드: ${cityInfo.code})`);
      result.city_code = cityInfo.code;
      result.city_name = cityInfo.name;
      break;
    }
  }
  
  // 디버깅용: 매칭 실패 시 상세 정보 출력
  if (!result.city_code) {
    console.log(`매칭 실패: "${cityName}"에 대한 시/군/구 코드를 찾을 수 없습니다.`);
    console.log('사용 가능한 시/군/구 목록:', province.children.map(c => c.name).join(', '));
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

/**
 * 특정 사용자의 평균 여행 성향 벡터 가져오기
 * @param {number} userId - 사용자 ID (기본값: 1)
 * @returns {Promise<Object>} - 평균 여행 성향 벡터 및 사용자 정보
 */
export const getUserAverageTravelPreferences = async (userId = 1) => {
  try {
    console.log(`사용자 ID ${userId}의 평균 여행 성향 조회 시작`);

    // Elasticsearch 쿼리 구성
    const query = {
      size: 0,
      aggs: {
        users: {
          terms: {
            field: "u_id",
            size: 100
          },
          aggs: {
            vector_avg: {
              scripted_metric: {
                init_script: "state.sum = new double[10]; state.count = 0;",
                map_script: `
                  if (params._source.containsKey('p_vector')) {
                    state.count++;
                    def vector = params._source.p_vector;
                    for (int i = 0; i < vector.length; i++) {
                      state.sum[i] += vector[i];
                    }
                  }
                `,
                combine_script: "return state;",
                reduce_script: `
                  double[] totalSum = new double[10];
                  long totalCount = 0;
                  
                  for (state in states) {
                    if (state.count > 0) {
                      totalCount += state.count;
                      for (int i = 0; i < 10; i++) {
                        totalSum[i] += state.sum[i];
                      }
                    }
                  }
                  
                  Map result = new HashMap();
                  double[] avgVector = new double[10];
                  
                  if (totalCount > 0) {
                    for (int i = 0; i < 10; i++) {
                      avgVector[i] = totalSum[i] / totalCount;
                    }
                  }
                  
                  result.put('avg_vector', avgVector);
                  result.put('count', totalCount);
                  return result;
                `
              }
            },
            user_info: {
              top_hits: {
                size: 1,
                _source: ["u_id", "u_age", "u_gender"],
                sort: [{ "upload_date": { "order": "desc" } }]
              }
            }
          }
        }
      }
    };

    // config에서 Elasticsearch API URL 사용
    const response = await fetch(`${config.ES_API}/travel_places/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('사용자 평균 조회 API 응답 오류:', errorData);
      throw new Error('사용자 평균 조회 실패: ' + JSON.stringify(errorData));
    }

    const result = await response.json();
    
    // 특정 사용자의 버킷 찾기
    const userBucket = result.aggregations.users.buckets.find(bucket => bucket.key === userId);
    
    if (!userBucket) {
      console.warn(`사용자 ID ${userId}의 데이터를 찾을 수 없습니다.`);
      // 기본 더미 데이터 반환
      return {
        avgVector: [0.7, 0.4, 0.6, 0.8, 0.9, 0.6, 0.5, 0.5, 0.7, 0.2],
        userInfo: {
          u_id: userId,
          u_age: 20,
          u_gender: "M"
        },
        count: 0
      };
    }

    // 결과 구성
    const userPreferences = {
      avgVector: userBucket.vector_avg.value.avg_vector,
      userInfo: userBucket.user_info.hits.hits[0]._source,
      count: userBucket.vector_avg.value.count
    };
    
    console.log('사용자 평균 여행 성향 조회 완료:', userPreferences);
    return userPreferences;
  } catch (error) {
    console.error('사용자 평균 조회 오류:', error);
    // 에러 발생 시 기본 더미 데이터 반환
    return {
      avgVector: [0.7, 0.4, 0.6, 0.8, 0.9, 0.6, 0.5, 0.5, 0.7, 0.2],
      userInfo: {
        u_id: userId,
        u_age: 20,
        u_gender: "M"
      },
      count: 0
    };
  }
};

/**
 * 사용자의 지역별/시군구별 여행 통계 조회
 * @param {number} userId - 사용자 ID (기본값: 1)
 * @returns {Promise<Object>} - 지역별/시군구별 방문 통계 및 최근 방문 정보
 */
export const getUserTravelStatistics = async (userId = 1) => {
  try {
    console.log(`사용자 ID ${userId}의 지역별/시군구별 여행 통계 조회 시작`);

    // Elasticsearch 쿼리 구성 - 지역별, 시군구별 방문 집계
    const query = {
      size: 0,
      query: {
        term: {
          u_id: userId
        }
      },
      aggs: {
        by_region: {
          terms: {
            field: "p_region",
            size: 100
          },
          aggs: {
            by_sig: {
              terms: {
                field: "p_sig",
                size: 1000
              },
              aggs: {
                verification_count: {
                  value_count: {
                    field: "p_id"
                  }
                },
                last_verification: {
                  top_hits: {
                    size: 1,
                    _source: [
                      "p_name", 
                      "p_address", 
                      "p_description", 
                      "upload_date"
                    ],
                    sort: [
                      {
                        "upload_date": {
                          "order": "desc"
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    };

    // config에서 Elasticsearch API URL 사용
    const response = await fetch(`${config.ES_API}/travel_places/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('사용자 여행 통계 조회 API 응답 오류:', errorData);
      throw new Error('사용자 여행 통계 조회 실패: ' + JSON.stringify(errorData));
    }

    const result = await response.json();
    console.log('사용자 여행 통계 조회 결과:', result);
    
    // 집계 결과 처리 및 반환
    const regions = result.aggregations?.by_region?.buckets || [];
    const processedData = {};
    let totalVisitedRegions = 0;
    let totalVisitedSigs = 0;
    let totalVisits = 0;
    
    regions.forEach(region => {
      const regionCode = region.key;
      const sigs = region.by_sig.buckets;
      
      if (sigs.length > 0) {
        totalVisitedRegions++;
        
        // 지역별 총 방문 횟수
        const regionTotal = sigs.reduce((sum, sig) => sum + sig.verification_count.value, 0);
        totalVisits += regionTotal;
        
        // 지역 데이터 구성
        processedData[regionCode] = {
          total: regionTotal,
          visitedSigs: sigs.length,
          sigs: {}
        };
        
        // 시군구별 데이터 처리
        sigs.forEach(sig => {
          const sigCode = sig.key;
          const count = sig.verification_count.value;
          const lastVisit = sig.last_verification.hits.hits[0]?._source || null;
          
          totalVisitedSigs++;
          
          processedData[regionCode].sigs[sigCode] = {
            count,
            lastVisit
          };
        });
      }
    });
    
    // 최종 결과
    const travelStats = {
      regions: processedData,
      totalVisitedRegions,
      totalVisitedSigs,
      totalVisits
    };
    
    console.log('사용자 여행 통계 처리 완료:', travelStats);
    return travelStats;
  } catch (error) {
    console.error('사용자 여행 통계 조회 오류:', error);
    // 에러 발생 시 기본 빈 데이터 반환
    return {
      regions: {},
      totalVisitedRegions: 0,
      totalVisitedSigs: 0,
      totalVisits: 0
    };
  }
};

/**
 * 위치 데이터에서 영어 지역 이름을 직접 추출하는 함수
 * @param {Object} locationData - 위치 데이터 (reverseGeocode 결과)
 * @returns {string} - 영어 지역 이름
 */
export const getEnglishLocationName = (locationData) => {
  if (!locationData) return '';
  
  console.log('영어 지역 이름 추출 시작:', locationData);
  
  // 결과 변수
  let englishName = '';
  
  // 1. 직접 매핑 테이블 - 구분하여 관리
  const provinceEngMapping = {
    // 광역시/도
    '서울특별시': 'Seoul',
    '서울': 'Seoul',
    '부산광역시': 'Busan',
    '부산': 'Busan',
    '대구광역시': 'Daegu',
    '대구': 'Daegu', 
    '인천광역시': 'Incheon',
    '인천': 'Incheon',
    '광주광역시': 'Gwangju',
    '광주': 'Gwangju',
    '대전광역시': 'Daejeon',
    '대전': 'Daejeon',
    '울산광역시': 'Ulsan',
    '울산': 'Ulsan',
    '세종특별자치시': 'Sejong',
    '세종': 'Sejong',
    '경기도': 'Gyeonggi-do',
    '경기': 'Gyeonggi-do',
    '강원특별자치도': 'Gangwon-do',
    '강원도': 'Gangwon-do',
    '강원': 'Gangwon-do',
    '충청북도': 'Chungcheongbuk-do',
    '충북': 'Chungcheongbuk-do',
    '충청남도': 'Chungcheongnam-do', 
    '충남': 'Chungcheongnam-do',
    '전라북도': 'Jeollabuk-do',
    '전북': 'Jeollabuk-do',
    '전라남도': 'Jeollanam-do',
    '전남': 'Jeollanam-do',
    '경상북도': 'Gyeongsangbuk-do',
    '경북': 'Gyeongsangbuk-do',
    '경상남도': 'Gyeongsangnam-do',
    '경남': 'Gyeongsangnam-do',
    '제주특별자치도': 'Jeju-do',
    '제주도': 'Jeju-do',
    '제주': 'Jeju-do'
  };
  
  const seoulDistrictEngMapping = {
    '종로구': 'Jongno-gu',
    '중구': 'Jung-gu',
    '용산구': 'Yongsan-gu',
    '성동구': 'Seongdong-gu',
    '광진구': 'Gwangjin-gu',
    '동대문구': 'Dongdaemun-gu',
    '중랑구': 'Jungnang-gu',
    '성북구': 'Seongbuk-gu',
    '강북구': 'Gangbuk-gu',
    '도봉구': 'Dobong-gu',
    '노원구': 'Nowon-gu',
    '은평구': 'Eunpyeong-gu',
    '서대문구': 'Seodaemun-gu',
    '마포구': 'Mapo-gu',
    '양천구': 'Yangcheon-gu',
    '강서구': 'Gangseo-gu',
    '구로구': 'Guro-gu',
    '금천구': 'Geumcheon-gu',
    '영등포구': 'Yeongdeungpo-gu',
    '동작구': 'Dongjak-gu',
    '관악구': 'Gwanak-gu',
    '서초구': 'Seocho-gu',
    '강남구': 'Gangnam-gu',
    '송파구': 'Songpa-gu',
    '강동구': 'Gangdong-gu'
  };
  
  const cityEngMapping = {
    // 제주
    '제주시': 'Jeju-si',
    '서귀포시': 'Seogwipo-si',
    
    // 경기도 주요 도시
    '수원시': 'Suwon-si',
    '성남시': 'Seongnam-si',
    '고양시': 'Goyang-si',
    '용인시': 'Yongin-si',
    '부천시': 'Bucheon-si',
    '안산시': 'Ansan-si',
    '안양시': 'Anyang-si',
    '남양주시': 'Namyangju-si',
    '화성시': 'Hwaseong-si',
    '시흥시': 'Siheung-si',
    '파주시': 'Paju-si',
    '의정부시': 'Uijeongbu-si',
    '김포시': 'Gimpo-si',
    '광주시': 'Gwangju-si',
    '광명시': 'Gwangmyeong-si',
    
    // 다른 주요 도시
    '춘천시': 'Chuncheon-si',
    '원주시': 'Wonju-si',
    '강릉시': 'Gangneung-si',
    '청주시': 'Cheongju-si',
    '천안시': 'Cheonan-si',
    '아산시': 'Asan-si',
    '전주시': 'Jeonju-si',
    '군산시': 'Gunsan-si',
    '목포시': 'Mokpo-si',
    '여수시': 'Yeosu-si',
    '순천시': 'Suncheon-si',
    '포항시': 'Pohang-si',
    '경주시': 'Gyeongju-si',
    '구미시': 'Gumi-si',
    '안동시': 'Andong-si',
    '창원시': 'Changwon-si',
    '김해시': 'Gimhae-si',
    '양산시': 'Yangsan-si',
    '진주시': 'Jinju-si'
  };
  
  // 특수지역 영어 이름
  const specialLocationMapping = {
    '안덕면': 'Andeok-myeon',
    '사계리': 'Sagye-ri',
    '상도동': 'Sangdo-dong',
    '상도로': 'Sangdo-ro'
  };
  
  // 2. 지역 구조 확인
  const province = locationData.province;
  const city = locationData.city;
  const borough = locationData.borough || '';
  const quarter = locationData.quarter || locationData.suburb || '';
  const road = locationData.road || '';
  
  console.log('위치 구성 요소:', { province, city, borough, quarter, road });
  
  // 2.1 광역시/도 영어 이름 찾기
  let provinceEng = '';
  if (province && provinceEngMapping[province]) {
    provinceEng = provinceEngMapping[province];
    console.log(`광역시/도 영어 매핑: ${province} -> ${provinceEng}`);
  } else if (locationData.regionInfo && locationData.regionInfo.province_code) {
    const provinceCode = locationData.regionInfo.province_code;
    if (regionMapping[provinceCode]) {
      provinceEng = regionMapping[provinceCode].engName;
      console.log(`광역시/도 코드 기반 영어 매핑: ${province} (${provinceCode}) -> ${provinceEng}`);
    }
  }
  
  // 2.2 시/군/구 영어 이름 찾기
  let cityOrDistrictEng = '';
  
  // 서울의 구 처리
  if (province && (province.includes('서울') || (locationData.regionInfo && locationData.regionInfo.province_code === '11'))) {
    // 구(borough) 확인
    if (borough && seoulDistrictEngMapping[borough]) {
      cityOrDistrictEng = seoulDistrictEngMapping[borough];
      console.log(`서울 구 영어 매핑: ${borough} -> ${cityOrDistrictEng}`);
    }
    // city에서 확인
    else if (city && city !== province && seoulDistrictEngMapping[city]) {
      cityOrDistrictEng = seoulDistrictEngMapping[city];
      console.log(`서울 구(city) 영어 매핑: ${city} -> ${cityOrDistrictEng}`);
    }
    // 이름 유추 (동작구, 관악구 등)
    else if ((borough && borough.includes('구')) || (city && city !== province && city.includes('구'))) {
      const districtName = borough.includes('구') ? borough : city;
      for (const [korName, engName] of Object.entries(seoulDistrictEngMapping)) {
        if (districtName.includes(korName) || korName.includes(districtName)) {
          cityOrDistrictEng = engName;
          console.log(`서울 구 유사 매핑: ${districtName} -> ${engName}`);
          break;
        }
      }
    }
  }
  // 다른 도시 처리
  else if (!cityOrDistrictEng) {
    // 직접 매핑
    if (city && cityEngMapping[city]) {
      cityOrDistrictEng = cityEngMapping[city];
      console.log(`도시 영어 매핑: ${city} -> ${cityOrDistrictEng}`);
    }
    // regionInfo 사용
    else if (locationData.regionInfo && locationData.regionInfo.city_code && locationData.regionInfo.city_name) {
      const provinceCode = locationData.regionInfo.province_code;
      const cityCode = locationData.regionInfo.city_code;
      
      if (regionMapping[provinceCode] && regionMapping[provinceCode].children) {
        const cityInfo = regionMapping[provinceCode].children.find(c => c.code === cityCode);
        if (cityInfo && cityInfo.engName) {
          cityOrDistrictEng = cityInfo.engName;
          console.log(`도시 코드 기반 영어 매핑: ${locationData.regionInfo.city_name} (${cityCode}) -> ${cityOrDistrictEng}`);
        }
      }
    }
    // 이름 유추 (비슷한 이름)
    else if (city) {
      for (const [korName, engName] of Object.entries(cityEngMapping)) {
        if (city.includes(korName) || korName.includes(city)) {
          cityOrDistrictEng = engName;
          console.log(`도시 유사 매핑: ${city} -> ${engName}`);
          break;
        }
      }
    }
    
    // 여전히 못 찾은 경우 borough 시도
    if (!cityOrDistrictEng && borough) {
      for (const [korName, engName] of Object.entries(cityEngMapping)) {
        if (borough.includes(korName) || korName.includes(borough)) {
          cityOrDistrictEng = engName;
          console.log(`도시(borough) 유사 매핑: ${borough} -> ${engName}`);
          break;
        }
      }
    }
  }
  
  // 읍/면/동 등 상세 지역 영어 이름
  let detailLocationEng = '';
  if (quarter && specialLocationMapping[quarter]) {
    detailLocationEng = specialLocationMapping[quarter];
    console.log(`상세 지역 매핑: ${quarter} -> ${detailLocationEng}`);
  } else if (road && specialLocationMapping[road]) {
    detailLocationEng = specialLocationMapping[road];
    console.log(`도로명 매핑: ${road} -> ${detailLocationEng}`);
  }
  
  // 3. 최종 영어 지역 이름 생성
  // 3.1 서울은 특별 처리 (서울 + 구 이름)
  if (provinceEng === 'Seoul' && cityOrDistrictEng) {
    englishName = `${provinceEng} ${cityOrDistrictEng}`;
  } 
  // 3.2 기본 형식: 도 + 시
  else if (provinceEng && cityOrDistrictEng) {
    // 예외: 도시 이름이 이미 도/광역시 포함하는 경우
    if (cityOrDistrictEng.includes(provinceEng)) {
      englishName = cityOrDistrictEng;
    } else {
      englishName = `${provinceEng} ${cityOrDistrictEng}`;
    }
  }
  // 3.3 광역시/도만 있는 경우
  else if (provinceEng) {
    englishName = provinceEng;
  }
  // 3.4 시/군/구만 있는 경우
  else if (cityOrDistrictEng) {
    englishName = cityOrDistrictEng;
  }
  
  // 3.5 상세 지역 이름 추가 (옵션)
  if (detailLocationEng && englishName) {
    englishName = `${englishName} ${detailLocationEng}`;
  }
  
  // 4. 특수 케이스 강제 처리
  if (province && province.includes('제주')) {
    if (city && city.includes('서귀포')) {
      englishName = 'Jeju-do Seogwipo-si';
    } else if (city && city.includes('제주시')) {
      englishName = 'Jeju-do Jeju-si';
    }
    
    // 상세 지역 추가
    if (quarter && quarter.includes('안덕면')) {
      englishName += ' Andeok-myeon';
    } else if (quarter && quarter.includes('사계리')) {
      englishName += ' Sagye-ri';
    }
  }
  
  // 서울 동작구 강제 처리
  if (province && province.includes('서울') && ((city && city.includes('동작')) || (borough && borough.includes('동작')))) {
    englishName = 'Seoul Dongjak-gu';
    
    // 상도동 추가
    if (quarter && quarter.includes('상도')) {
      englishName += ' Sangdo-dong';
    }
  }
  
  console.log(`최종 영어 지역 이름: ${englishName}`);
  return englishName;
};

/**
 * 위치 데이터에서 지역 코드를 직접 추출하는 함수
 * @param {Object} locationData - 위치 데이터 (reverseGeocode 결과)
 * @returns {Object} - 지역 코드 정보 (province_code, city_code)
 */
export const getLocationCodes = (locationData) => {
  if (!locationData) return { province_code: null, city_code: null };
  
  console.log('지역 코드 직접 추출 시작:', locationData);
  
  // 결과 객체
  const result = {
    province_code: null,
    province_name: null,
    city_code: null,
    city_name: null
  };
  
  // 1. 직접 코드 매핑 테이블 - 구분하여 관리 (광역시/도와 시/군/구 분리)
  const provinceCodeMapping = {
    // 광역시/도 코드
    '서울특별시': '11',
    '서울': '11',
    '부산광역시': '26',
    '부산': '26',
    '대구광역시': '27',
    '대구': '27',
    '인천광역시': '28',
    '인천': '28',
    '광주광역시': '29', 
    '광주': '29',
    '대전광역시': '30',
    '대전': '30',
    '울산광역시': '31',
    '울산': '31',
    '세종특별자치시': '36',
    '세종': '36',
    '경기도': '41',
    '경기': '41',
    '강원특별자치도': '42',
    '강원도': '42',
    '강원': '42',
    '충청북도': '43',
    '충북': '43',
    '충청남도': '44',
    '충남': '44',
    '전라북도': '45',
    '전북': '45',
    '전라남도': '46',
    '전남': '46',
    '경상북도': '47',
    '경북': '47',
    '경상남도': '48',
    '경남': '48',
    '제주특별자치도': '50',
    '제주도': '50',
    '제주': '50'
  };
  
  // 특정 도시/군/구에 대한 직접 매핑 (문제가 되는 지역들)
  const cityCodeMapping = {
    // 제주도 도시
    '제주시': '50110',
    '서귀포시': '50130',
    
    // 서울 구
    '종로구': '11110',
    '중구': '11140',
    '용산구': '11170',
    '성동구': '11200',
    '광진구': '11215',
    '동대문구': '11230',
    '중랑구': '11260',
    '성북구': '11290',
    '강북구': '11305',
    '도봉구': '11320',
    '노원구': '11350',
    '은평구': '11380',
    '서대문구': '11410',
    '마포구': '11440',
    '양천구': '11470',
    '강서구': '11500',
    '구로구': '11530',
    '금천구': '11545',
    '영등포구': '11560',
    '동작구': '11590',
    '관악구': '11620',
    '서초구': '11650',
    '강남구': '11680',
    '송파구': '11710',
    '강동구': '11740'
  };
  
  // 2. 지역 정보 확인
  const province = locationData.province;
  const city = locationData.city;
  const borough = locationData.borough || '';
  const quarter = locationData.quarter || '';
  
  // 로깅
  console.log('지역 정보:', { province, city, borough, quarter });
  
  // 3. 광역시/도 코드 매핑
  // 3.1 직접 매핑에서 province_code 찾기
  if (province && provinceCodeMapping[province]) {
    result.province_code = provinceCodeMapping[province];
    result.province_name = province;
    console.log(`광역시/도 직접 코드 매핑 성공: ${province} -> ${result.province_code}`);
  }
  // 3.2 regionInfo가 이미 있는 경우 활용
  else if (locationData.regionInfo && locationData.regionInfo.province_code) {
    result.province_code = locationData.regionInfo.province_code;
    result.province_name = locationData.regionInfo.province_name || province;
    console.log(`광역시/도 코드 regionInfo 매핑 성공: ${result.province_name} -> ${result.province_code}`);
  }
  // 3.3 이름 기반으로 regionMapping에서 찾기
  else if (province) {
    for (const provinceCode in regionMapping) {
      const provinceInfo = regionMapping[provinceCode];
      if (province === provinceInfo.name || 
          province.includes(provinceInfo.name) || 
          provinceInfo.name.includes(province)) {
        result.province_code = provinceCode;
        result.province_name = provinceInfo.name;
        console.log(`광역시/도 이름 기반 코드 매핑 성공: ${province} -> ${result.province_code}`);
        break;
      }
    }
  }
  
  // 4. 시/군/구 코드 매핑
  // 우선순위: 구(borough) > 시(city) > 읍/면/동(quarter)
  
  // 4.1 구(borough) 처리 - 서울, 부산 등의 구
  if (borough) {
    // 직접 매핑에서 찾기
    if (cityCodeMapping[borough]) {
      result.city_code = cityCodeMapping[borough];
      result.city_name = borough;
      console.log(`구(borough) 직접 코드 매핑 성공: ${borough} -> ${result.city_code}`);
    } 
    // regionMapping에서 찾기
    else if (result.province_code) {
      const provinceInfo = regionMapping[result.province_code];
      if (provinceInfo && provinceInfo.children) {
        const cityInfo = provinceInfo.children.find(c => 
          borough === c.name || 
          borough.includes(c.name) || 
          c.name.includes(borough)
        );
        
        if (cityInfo) {
          result.city_code = cityInfo.code;
          result.city_name = cityInfo.name;
          console.log(`구(borough) 이름 기반 코드 매핑 성공: ${borough} -> ${result.city_code}`);
        }
      }
    }
  }
  
  // 4.2 city가 있고 아직 city_code가 없는 경우 처리
  if (city && !result.city_code) {
    // 직접 매핑에서 찾기
    if (cityCodeMapping[city]) {
      result.city_code = cityCodeMapping[city];
      result.city_name = city;
      console.log(`시/군(city) 직접 코드 매핑 성공: ${city} -> ${result.city_code}`);
    }
    // regionMapping에서 찾기
    else if (result.province_code) {
      const provinceInfo = regionMapping[result.province_code];
      if (provinceInfo && provinceInfo.children) {
        const cityInfo = provinceInfo.children.find(c => 
          city === c.name || 
          city.includes(c.name) || 
          c.name.includes(city)
        );
        
        if (cityInfo) {
          result.city_code = cityInfo.code;
          result.city_name = cityInfo.name;
          console.log(`시/군(city) 이름 기반 코드 매핑 성공: ${city} -> ${result.city_code}`);
        }
      }
    }
  }
  
  // 4.3 읍/면/동(quarter) 정보로 상위 시/군/구 찾기 (보조 수단)
  if (quarter && !result.city_code && result.province_code) {
    // 각 시/군/구의 이름이 읍/면/동 이름에 포함되어 있는지 확인
    const provinceInfo = regionMapping[result.province_code];
    if (provinceInfo && provinceInfo.children) {
      // quarter 이름으로부터 상위 시/군/구 유추 (예: '역삼동'에서 '강남구' 유추)
      for (const cityInfo of provinceInfo.children) {
        // 예: '강남구 역삼동'에서 '강남구' 추출
        if (quarter.includes(cityInfo.name)) {
          result.city_code = cityInfo.code;
          result.city_name = cityInfo.name;
          console.log(`읍/면/동(quarter)에서 상위 시/군/구 유추 성공: ${quarter} -> ${cityInfo.name} (${cityInfo.code})`);
          break;
        }
      }
    }
  }
  
  // 5. 특수 케이스 처리
  // 5.1 제주 서귀포시 케이스를 위한 특별 처리
  if (province && province.includes('제주') && !result.city_code) {
    if (city && city.includes('서귀포')) {
      result.province_code = '50';  // 제주특별자치도 코드
      result.city_code = '50130';   // 서귀포시 코드
      result.province_name = '제주특별자치도';
      result.city_name = '서귀포시';
      console.log('제주 서귀포시 특수 케이스 처리 완료');
    } else if (city && city.includes('제주시')) {
      result.province_code = '50';
      result.city_code = '50110';   // 제주시 코드
      result.province_name = '제주특별자치도';
      result.city_name = '제주시';
      console.log('제주 제주시 특수 케이스 처리 완료');
    }
  }
  
  // 5.2 서울 특별시의 구 처리
  if (province && (province.includes('서울') || result.province_code === '11') && !result.city_code) {
    // 동작구 케이스
    if (borough && borough.includes('동작')) {
      result.city_code = '11590';
      result.city_name = '동작구';
      console.log('서울 동작구 특수 케이스 처리 완료');
    }
    // 다른 구들도 필요시 추가
  }
  
  // 5.3 regionInfo에서 city_code 있는데 사용 안된 경우
  if (!result.city_code && locationData.regionInfo && locationData.regionInfo.city_code) {
    result.city_code = locationData.regionInfo.city_code;
    result.city_name = locationData.regionInfo.city_name || city;
    console.log(`마지막 시도: regionInfo 시/군/구 코드 사용: ${result.city_name} -> ${result.city_code}`);
  }
  
  console.log('최종 지역 코드 결과:', result);
  return result;
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