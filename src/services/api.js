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
 * @returns {Promise<string>} - 영어 설명 텍스트
 */
export const imageToEngDescription = async (imageFile, signal) => {
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
    
    // Ollama API 형식으로 요청 구성
    const descriptionRequestBody = {
      model: 'light_2', // 영어 설명 생성 모델
      prompt: 'Describe this travel destination in detail according to your instructions.',
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
    
    // 검색 쿼리 구성
    const query = {
      multi_match: {
        query: keyword,
        fields: [
          "p_name", 
          "p_tags", 
          "p_description", 
          "p_description_en",
          "p_address"
        ],
        type: "best_fields",
        operator: "or"
      }
    };
    
    // config에서 Elasticsearch API URL 사용
    const response = await fetch(`${config.ES_API}/travel_places/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        size: size,
        from: from,
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
          "u_gender"
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
  
  for (const cityInfo of province.children) {
    // 서울 강남구 -> 강남구, 서울 역삼동 -> 역삼동 등으로 정규화
    const normalizedCityName = cityName.replace(/^(.+)(시|구|군|동)$/, '$1$2');
    
    if (normalizedCityName === cityInfo.name || 
        normalizedCityName.includes(cityInfo.name) || 
        cityInfo.name.includes(normalizedCityName)) {
      console.log(`시/군/구 매칭 성공: ${cityInfo.name} (코드: ${cityInfo.code})`);
      result.city_code = cityInfo.code;
      result.city_name = cityInfo.name;
      break;
    }
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