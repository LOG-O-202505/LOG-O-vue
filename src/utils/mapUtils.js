/**
 * Map utility functions for Kakao Maps
 */

/**
 * Safely cleans up a Kakao map instance, removing markers and freeing resources
 * @param {Object} mapInstance - The Kakao map instance to clean up
 */
export const safelyCleanupMap = (mapInstance) => {
  if (!mapInstance) return;
  
  console.log("지도 인스턴스 정리 시도:", mapInstance);
  
  try {
    // 지도에 연결된 모든 마커 및 오버레이 제거 시도
    const markersSample = mapInstance.Uh || mapInstance.Kc || mapInstance._markers || [];
    if (Array.isArray(markersSample)) {
      console.log(`${markersSample.length}개의 마커/오버레이 제거 시도`);
      markersSample.forEach(marker => {
        if (marker && typeof marker.setMap === 'function') {
          marker.setMap(null);
        }
      });
    }
    
    // 지도 인스턴스 메모리 정리 (destroy 메서드가 있으면 호출, 없으면 대체 방법 사용)
    if (typeof mapInstance.destroy === 'function') {
      console.log("destroy 메서드 호출");
      mapInstance.destroy();
    } else {
      console.log("destroy 메서드가 없음, 대체 방식으로 정리");
      // 컨테이너 캐시 해제 시도
      if (mapInstance.a) {
        mapInstance.a.innerHTML = '';
      }
      // 기타 대체 정리 로직 (이벤트 리스너가 있다면 제거)
      if (typeof mapInstance.removeAllListeners === 'function') {
        mapInstance.removeAllListeners();
      }
    }
  } catch (error) {
    console.warn("지도 정리 중 오류 발생:", error);
  }
};

/**
 * Checks if Kakao Maps SDK is loaded and ready to use
 * @returns {boolean} True if Kakao Maps SDK is loaded and ready
 */
export const isKakaoMapsLoaded = () => {
  return window.kakao && 
         window.kakao.maps && 
         typeof window.kakao.maps.Map === 'function';
};

/**
 * Waits for Kakao Maps SDK to be loaded with a timeout
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<boolean>} Resolves to true if SDK loaded, false if timed out
 */
export const waitForKakaoMapsSDK = (timeout = 5000) => {
  return new Promise((resolve) => {
    // If already loaded, resolve immediately
    if (isKakaoMapsLoaded()) {
      resolve(true);
      return;
    }

    let elapsed = 0;
    const interval = 100;
    
    // Check periodically for SDK to be loaded
    const checkInterval = setInterval(() => {
      elapsed += interval;
      
      if (isKakaoMapsLoaded()) {
        clearInterval(checkInterval);
        resolve(true);
        return;
      }
      
      if (elapsed >= timeout) {
        clearInterval(checkInterval);
        console.warn("Kakao Maps SDK 로드 타임아웃");
        resolve(false);
      }
    }, interval);
  });
}; 