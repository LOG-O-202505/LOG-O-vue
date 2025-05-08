// Google Maps API 관련 서비스

// Google Maps API 키 (환경 변수에서 가져오기)
const GOOGLE_MAPS_API_KEY = process.env.VUE_APP_GOOGLE_MAPS_API_KEY;

// 전역 변수
let googleMapsLoaded = false;
let googleMapsCallbacks = [];
let placesAutocompleteService = null;
let placesService = null;

/**
 * Google Maps API 스크립트 로드 함수 (수정됨)
 * @returns {Promise} - 스크립트 로드 완료 시 resolve
 */
export const loadGoogleMapsScript = () => {
  return new Promise((resolve) => {
    // 이미 로드된 경우
    if (window.google && window.google.maps) {
      console.log("Google Maps API가 이미 로드되어 있습니다");
      googleMapsLoaded = true;
      resolve();
      return;
    }
    
    console.log("Google Maps API 로드 시작...");
    
    // 콜백 등록
    googleMapsCallbacks.push(resolve);
    
    // 첫 번째 호출인 경우에만 스크립트 로드
    if (googleMapsCallbacks.length === 1) {
      // 전역 콜백 함수 정의
      window.initGoogleMapsApi = () => {
        console.log("Google Maps API 로드 완료!");
        googleMapsLoaded = true;
        googleMapsCallbacks.forEach(callback => callback());
        googleMapsCallbacks = [];
      };
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMapsApi`;
      script.async = true;
      script.defer = true;
      
      // 로드 오류 처리
      script.onerror = (error) => {
        console.error("Google Maps API 로드 실패:", error);
        // 오류가 발생해도 콜백 처리
        googleMapsCallbacks.forEach(callback => callback());
        googleMapsCallbacks = [];
      };
      
      document.head.appendChild(script);
      console.log("Google Maps 스크립트 태그 추가됨");
    }
  });
};

/**
 * Google Maps API가 로드되었는지 확인하는 함수 (추가됨)
 * @returns {boolean} - 로드 여부
 */
export const isGoogleMapsLoaded = () => {
  return googleMapsLoaded && window.google && window.google.maps;
};

/**
 * 장소 자동완성 서비스 초기화
 * @returns {Object} - 자동완성 서비스 객체
 */
export const getPlacesAutocompleteService = async () => {
  if (!isGoogleMapsLoaded()) {
    await loadGoogleMapsScript();
  }
  
  if (!placesAutocompleteService && window.google && window.google.maps && window.google.maps.places) {
    console.log("Places 자동완성 서비스 초기화");
    placesAutocompleteService = new window.google.maps.places.AutocompleteService();
  }
  
  return placesAutocompleteService;
};

/**
 * 장소 서비스 초기화
 * @returns {Object} - 장소 서비스 객체
 */
export const getPlacesService = async () => {
  if (!isGoogleMapsLoaded()) {
    await loadGoogleMapsScript();
  }
  
  if (!placesService && window.google && window.google.maps && window.google.maps.places) {
    console.log("Places 서비스 초기화");
    // 임시 DOM 요소 생성 (PlacesService에 필요)
    const tempDiv = document.createElement('div');
    placesService = new window.google.maps.places.PlacesService(tempDiv);
  }
  
  return placesService;
};

/**
 * 장소 검색 함수 (수정됨)
 * @param {string} query - 검색어
 * @returns {Promise<Array>} - 검색 결과
 */
export const searchPlaces = async (query) => {
  if (!query || query.length < 2) {
    console.log("검색어가 너무 짧습니다");
    return [];
  }
  
  try {
    const autocompleteService = await getPlacesAutocompleteService();
    
    if (!autocompleteService) {
      console.error("Places 자동완성 서비스를 초기화하지 못했습니다");
      return [];
    }
    
    console.log("장소 검색:", query);
    
    return new Promise((resolve) => {
      autocompleteService.getPlacePredictions(
        {
          input: query,
          types: ['geocode', 'establishment']
        },
        (predictions, status) => {
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
            console.warn("검색 결과 없음:", status);
            resolve([]);
            return;
          }
          
          console.log(`검색 결과: ${predictions.length}개 항목 찾음`);
          resolve(predictions);
        }
      );
    });
  } catch (error) {
    console.error("장소 검색 오류:", error);
    return [];
  }
};

/**
 * 장소 상세 정보 가져오기 (수정됨)
 * @param {string} placeId - 장소 ID
 * @returns {Promise<Object>} - 장소 상세 정보
 */
export const getPlaceDetails = async (placeId) => {
  try {
    const placesService = await getPlacesService();
    
    if (!placesService) {
      console.error("Places 서비스를 초기화하지 못했습니다");
      throw new Error("Places 서비스 초기화 실패");
    }
    
    console.log("장소 상세정보 요청:", placeId);
    
    return new Promise((resolve) => {
      placesService.getDetails(
        {
          placeId: placeId,
          fields: ['formatted_address', 'name', 'geometry']
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            console.log("장소 상세정보 수신 성공");
            resolve(place);
          } else {
            console.error("장소 상세정보 가져오기 실패:", status);
            resolve(null);
          }
        }
      );
    });
  } catch (error) {
    console.error("장소 상세정보 오류:", error);
    throw error;
  }
};

/**
 * 지도 인스턴스 생성 (수정됨)
 * @param {HTMLElement} mapContainer - 지도를 표시할 컨테이너
 * @param {Object} place - 장소 정보
 * @returns {Object} - 지도 및 마커 객체
 */
export const createMap = async (mapContainer, place) => {
  if (!isGoogleMapsLoaded()) {
    await loadGoogleMapsScript();
  }
  
  if (!window.google || !window.google.maps) {
    console.error("Google Maps API가 로드되지 않았습니다");
    return null;
  }
  
  try {
    console.log("지도 생성 시작:", place ? place.name : "위치 정보 없음");
    
    // 위치 정보가 없는 경우 서울 중심으로 설정
    const position = place && place.geometry && place.geometry.location
      ? place.geometry.location
      : new window.google.maps.LatLng(37.5665, 126.9780); // 서울
    
    // 지도 옵션
    const mapOptions = {
      center: position,
      zoom: 14,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU
      },
      streetViewControl: true,
      fullscreenControl: true
    };
    
    // 지도가 표시될 컨테이너 확인
    if (!mapContainer) {
      console.error("지도 컨테이너가 존재하지 않습니다");
      return null;
    }
    
    // 지도 생성
    const map = new window.google.maps.Map(mapContainer, mapOptions);
    
    // 마커 추가
    const marker = new window.google.maps.Marker({
      position: position,
      map: map,
      animation: window.google.maps.Animation.DROP,
      title: place && place.name ? place.name : '선택한 위치'
    });
    
    // 정보창 추가
    const infoWindowContent = `
      <div class="info-window">
        <strong>${place && place.name ? place.name : '선택한 위치'}</strong>
        <p>${place && place.formatted_address ? place.formatted_address : ''}</p>
      </div>
    `;
    
    const infoWindow = new window.google.maps.InfoWindow({
      content: infoWindowContent
    });
    
    // 마커 클릭 시 정보창 표시
    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
    
    // 지도 로드 완료 시 정보창 자동 표시
    window.google.maps.event.addListenerOnce(map, "idle", () => {
      infoWindow.open(map, marker);
      
      // 2초 후 자동으로 닫힘
      setTimeout(() => {
        infoWindow.close();
      }, 2000);
    });
    
    console.log("지도 생성 완료");
    
    return { map, marker, infoWindow };
  } catch (error) {
    console.error("지도 생성 오류:", error);
    return null;
  }
};