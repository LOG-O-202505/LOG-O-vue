/**
 * 쿠키에서 특정 이름의 값을 가져오는 함수
 * @param {string} name - 쿠키 이름
 * @returns {string|null} - 쿠키 값 또는 null
 */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
}

/**
 * 쿠키에서 access_token을 가져와서 Bearer 토큰 형식으로 반환하는 함수
 * @returns {string|null} - "Bearer {token}" 형식의 문자열 또는 null
 */
export function getAuthToken() {
  const accessToken = getCookie('access_token');
  if (accessToken) {
    return `Bearer ${accessToken}`;
  }
  return null;
}

/**
 * API 요청에 사용할 Authorization 헤더를 생성하는 함수
 * @returns {object} - Authorization 헤더 객체
 */
export function getAuthHeaders() {
  const token = getAuthToken();
  if (token) {
    return {
      'Authorization': token,
      'Content-Type': 'application/json'
    };
  }
  return {
    'Content-Type': 'application/json'
  };
}

/**
 * 쿠키에서 access_token을 설정하는 함수
 * @param {string} token - 설정할 토큰 값
 * @param {number} days - 쿠키 유효 기간 (일 단위, 기본값: 7일)
 */
export function setAccessToken(token, days = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `access_token=${token}; expires=${expires.toUTCString()}; path=/`;
}

/**
 * access_token 쿠키를 삭제하는 함수
 */
export function removeAccessToken() {
  document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
}

/**
 * 사용자가 로그인되어 있는지 확인하는 함수
 * @returns {boolean} - 로그인 상태 여부
 */
export function isAuthenticated() {
  return !!getCookie('access_token');
}

// 백엔드 API URL 설정
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * 인증이 필요한 API 요청을 보내는 범용 함수
 * @param {string} endpoint - API 엔드포인트 (예: '/users/profile')
 * @param {object} options - fetch 옵션 (method, body 등)
 * @returns {Promise<Response>} - fetch 응답
 */
export async function authenticatedFetch(endpoint, options = {}) {
  const authHeaders = getAuthHeaders();
  
  const config = {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers
    }
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  // 401 Unauthorized 응답 시 토큰 삭제
  if (response.status === 401) {
    removeAccessToken();
    throw new Error('Authentication failed. Please login again.');
  }
  
  return response;
}

/**
 * 사용자 프로필을 가져오는 함수
 * @returns {Promise<object>} - 사용자 프로필 데이터
 */
export async function getUserProfile() {
  try {
    const response = await authenticatedFetch('/users/profile');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
}

/**
 * GET 요청을 보내는 헬퍼 함수
 * @param {string} endpoint - API 엔드포인트
 * @returns {Promise<object>} - 응답 데이터
 */
export async function apiGet(endpoint) {
  try {
    const response = await authenticatedFetch(endpoint, {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to GET ${endpoint}:`, error);
    throw error;
  }
}

/**
 * POST 요청을 보내는 헬퍼 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {object} data - 전송할 데이터
 * @returns {Promise<object>} - 응답 데이터
 */
export async function apiPost(endpoint, data) {
  try {
    const response = await authenticatedFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to POST ${endpoint}:`, error);
    throw error;
  }
}

/**
 * PUT 요청을 보내는 헬퍼 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {object} data - 전송할 데이터
 * @returns {Promise<object>} - 응답 데이터
 */
export async function apiPut(endpoint, data) {
  try {
    const response = await authenticatedFetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to PUT ${endpoint}:`, error);
    throw error;
  }
}

/**
 * DELETE 요청을 보내는 헬퍼 함수
 * @param {string} endpoint - API 엔드포인트
 * @returns {Promise<object>} - 응답 데이터
 */
export async function apiDelete(endpoint) {
  try {
    const response = await authenticatedFetch(endpoint, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Failed to DELETE ${endpoint}:`, error);
    throw error;
  }
} 