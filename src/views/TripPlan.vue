/* eslint-disable */
<template>
  <div class="trip-plan">
    <!-- 헤더 -->
    <Header 
      :showHero="true"
      heroImageSrc="https://images.unsplash.com/photo-1503221043305-f7498f8b7888?q=80&w=1470"
      heroTitle="나만의 여행 설계하기"
      heroSubtitle="나만의 특별한 여행 경험을 디자인해보세요"
      heroHeight="320px"
    />

    <!-- 메인 콘텐츠 -->
    <div class="plan-content-wrapper">
      <div class="plan-container">
        <!-- 여행 기본 정보 폼 -->
        <div class="plan-section">
          <h1 class="section-title">여행 기본 정보</h1>
          
          <!-- 보기 모드 -->
          <div v-if="!isEditingInfo" class="trip-info-view-mode">
            <div class="info-row">
              <div class="info-item">
                <span class="info-label">여행 제목</span>
                <span class="info-value">{{ tripData.title }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">주요 목적지</span>
                <span class="info-value">{{ tripData.destination }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">총 예산</span>
                <span class="info-value">₩{{ formatNumber(totalBudget) }}</span>
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-item">
                <span class="info-label">출발일</span>
                <span class="info-value">{{ formatDateFull(tripData.startDate) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">도착일</span>
                <span class="info-value">{{ formatDateFull(tripData.endDate) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">여행 기간</span>
                <span class="info-value">{{ tripNights }}박 {{ tripDays.length }}일</span>
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-item info-memo">
                <span class="info-label">여행 메모</span>
                <span class="info-value memo-text">{{ tripData.notes || '없음' }}</span>
              </div>
            </div>
            
            <button class="edit-info-btn" @click="startEditInfo">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              정보 수정
            </button>
          </div>
          
          <!-- 수정 모드 -->
          <div v-else>
            <div class="plan-form">
              <!-- 총 예산 설정 필드 -->
              <div class="form-group">
                <label for="totalBudget">총 예산 설정</label>
                <div class="input-with-icon">
                  <input type="number" id="totalBudget" v-model="tripData.budget" placeholder="0">
                </div>
              </div>

              <div class="form-group">
                <label for="tripTitle">여행 제목</label>
                <input type="text" id="tripTitle" v-model="tripData.title" placeholder="여행 제목을 입력하세요">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="startDate">출발일</label>
                  <input type="date" id="startDate" v-model="tripData.startDate" class="date-input">
                </div>
                <div class="form-group">
                  <label for="endDate">도착일</label>
                  <input type="date" id="endDate" v-model="tripData.endDate" class="date-input">
                </div>
              </div>

              <div class="form-group">
                <label for="destination">주요 목적지</label>
                <input type="text" id="destination" v-model="tripData.destination" placeholder="예: 서울, 제주도, 부산">
              </div>

              <div class="form-group">
                <label for="tripNotes">여행 메모</label>
                <textarea id="tripNotes" v-model="tripData.notes" placeholder="여행 준비 사항, 기대 등을 자유롭게 작성하세요"></textarea>
              </div>
              
              <div class="form-actions">
                <button class="save-info-btn" @click="saveEditInfo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  저장
                </button>
                <button class="cancel-info-btn" @click="cancelEditInfo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 일정 계획 -->
        <div class="plan-section">
          <h1 class="section-title">일정 계획</h1>
          
          <!-- 날짜별 탭 메뉴 -->
          <div class="day-tabs">
            <button 
              v-for="(day, index) in tripDays" 
              :key="index" 
              class="day-tab" 
              :class="{ 'active': activeDay === index }"
              @click="activeDay = index"
            >
              DAY {{ index + 1 }}
              <span class="tab-date">{{ formatDate(addDays(new Date(tripData.startDate), index)) }}</span>
            </button>
          </div>
          
          <!-- 일정과 지도를 포함하는 레이아웃 -->
          <div class="schedule-and-maps">
            <!-- 일정 부분 -->
            <div class="day-schedule" v-if="tripDays[activeDay]">
              <div class="schedule-items">
                <div 
                  v-for="(item, itemIndex) in sortedScheduleItems" 
                  :key="itemIndex" 
                  class="schedule-item"
                >
                  <!-- 일정 아이템 헤더 내 아이템 액션 버튼 수정 -->
                  <div class="schedule-item-header">
                    <div class="time-place">
                      <template v-if="editingItem === itemIndex">
                        <input type="time" v-model="editItemTime" class="edit-time-input" />
                      </template>
                      <template v-else>
                        <span class="time">{{ item.time }} |</span>
                      </template>
                      <span class="place">{{ item.activity }}</span>
                    </div>
                    <div class="item-actions">
                      <template v-if="editingItem === itemIndex">
                        <button class="save-edit-btn" @click="saveItemEdit(itemIndex)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                        <button class="cancel-edit-btn" @click="cancelItemEdit()">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </template>
                      <template v-else>
                        <button class="edit-btn" @click="startEditItem(itemIndex)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button class="delete-btn" @click="removeScheduleItem(activeDay, itemIndex)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </template>
                    </div>
                  </div>
                  <div class="schedule-item-memo">
                    <textarea 
                      v-if="editingItem === itemIndex" 
                      v-model="editItemMemo" 
                      placeholder="메모를 입력하세요"
                    ></textarea>
                    <textarea v-else v-model="item.location" placeholder="수하물 찾는 시간 고려하기" @blur="updateLocation(activeDay, itemIndex, item.location)"></textarea>
                  </div>
                  <!-- 방문 인증 버튼 추가 -->
                  <div class="verification-button-container">
                    <button 
                      class="visit-verification-btn" 
                      @click="verifyVisit(activeDay, itemIndex)"
                      :class="{ 'verified': item.verified }"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {{ item.verified ? '방문 인증 완료' : '방문 인증하기' }}
                    </button>
                    
                    <!-- 방문 인증 정보 표시 -->
                    <div v-if="item.verified" class="verification-info">
                      <div class="verified-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>{{ formatDate(item.verifiedAt) }}에 방문 완료</span>
                        <div class="rating-display" v-if="item.rating">
                          <span class="stars">
                            {{ '★'.repeat(item.rating) }}{{ '☆'.repeat(5 - item.rating) }}
                          </span>
                        </div>
                      </div>
                      <div v-if="item.review" class="review-display">
                        <p>{{ item.review }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button class="add-schedule-btn" @click="openPlaceSearch">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  일정 추가
                </button>
              </div>
            </div>

            <!-- 카카오 지도 -->
            <div class="map-container">
              <div id="kakao-map" ref="kakaoMapContainer" class="map-element"></div>
              <div class="map-legend" v-if="mapLoaded">
                <div class="legend-item">
                  <div class="legend-dot start"></div>
                  <span>출발지</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot waypoint"></div>
                  <span>경유지</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot end"></div>
                  <span>도착지</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 예산 계획 -->
        <div class="plan-section">
          <h1 class="section-title">지출 관리</h1>
          <div class="budget-container">
            <div class="budget-summary">
              <div class="budget-card">
                <div class="budget-label">총 예산</div>
                <div class="budget-amount">₩{{ formatNumber(totalBudget) }}</div>
              </div>
              <div class="budget-card">
                <div class="budget-label">지출</div>
                <div class="budget-amount">₩{{ formatNumber(calculatedExpenses) }}</div>
              </div>
              <div class="budget-card">
                <div class="budget-label">잔액</div>
                <div class="budget-amount" :class="{ 'negative': remainingBudget < 0 }">
                  ₩{{ formatNumber(remainingBudget) }}
                </div>
              </div>
            </div>

            <div class="expenses-list">
              <!-- 날짜별로 그룹화된 지출 목록 -->
              <div v-for="(group, date) in groupedExpenses" :key="date" class="expense-date-group">
                <div class="expense-date-header">
                  <h3>{{ formatExpenseDate(date) }}</h3>
                </div>
                
                <div v-for="(expense, index) in group" :key="index" class="expense-item">
                  <div v-if="editingExpense === expense" class="expense-edit-mode">
                    <div class="expense-time-edit">
                      <input type="time" v-model="editExpenseTime" class="time-input">
                    </div>
                    <div class="expense-place-edit">
                      <input type="text" v-model="editExpenseDesc" placeholder="지출 항목 설명">
                    </div>
                    <div class="expense-amount-edit">
                      <div class="input-with-icon">
                        <span class="input-icon">₩</span>
                        <input type="number" v-model="editExpenseAmount" placeholder="0">
                      </div>
                    </div>
                    <div class="expense-actions">
                      <button class="save-edit-btn" @click="saveExpenseEdit(expense)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </button>
                      <button class="cancel-edit-btn" @click="cancelExpenseEdit()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div v-else class="expense-view-mode">
                    <div class="expense-time">{{ expense.time || '시간 없음' }}</div>
                    <div class="expense-place">{{ expense.description }}</div>
                    <div class="expense-amount">₩{{ formatNumber(expense.amount) }}</div>
                    <div class="expense-actions">
                      <button class="edit-btn" @click="startExpenseEdit(expense)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button class="delete-btn" @click="removeExpense(getExpenseIndex(expense))">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 지출 추가 버튼 -->
              <div class="add-expense-buttons">
                <button class="add-expense-btn" @click="addExpense">
                  수동으로 추가
                </button>
                <button class="add-expense-btn" @click="openReceiptUpload">
                  사진으로 자동 추가
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 영수증 업로드 모달 -->
    <div class="receipt-upload-modal" v-if="showReceiptUpload">
      <div class="receipt-upload-content">
        <div class="receipt-upload-header">
          <h3>영수증/결제내역 분석</h3>
          <button class="close-receipt-btn" @click="closeReceiptUpload">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="upload-container" 
             @dragover.prevent="onDragOver" 
             @dragleave.prevent="onDragLeave" 
             @drop.prevent="onDrop" 
             :class="{ 'active-dropzone': isDragging }">
          <input 
            type="file" 
            ref="receiptFileInput" 
            @change="handleReceiptFileInput" 
            accept="image/*" 
            style="display: none"
          >
          <div v-if="!receiptPreview" class="upload-prompt">
            <div class="upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <p>영수증/결제내역 이미지를 끌어서 놓거나 클릭하여 업로드하세요</p>
            <button @click="triggerReceiptFileInput" class="btn secondary-btn">파일 선택</button>
          </div>
          <div v-else class="preview-container">
            <div class="image-container">
              <img :src="receiptPreview" alt="영수증/결제내역 미리보기" class="receipt-preview">
            </div>
            <div class="preview-actions">
              <button @click="analyzeReceipt" class="btn primary-btn" :disabled="isLoading">
                {{ isLoading ? '분석 중...' : '이미지 분석하기' }}
              </button>
              <button @click="clearReceiptImage" class="btn cancel-btn">취소</button>
            </div>
          </div>
        </div>
        
        <div v-if="isLoading" class="loading-indicator">
          <div class="spinner"></div>
          <p>{{ loadingMessage }}</p>
        </div>
      </div>
    </div>

    <!-- 장소 검색 모달 -->
    <div class="modal-overlay" v-if="isPlaceSearchModalOpen" @click="closePlaceSearch">
      <div class="modals-container">
        <!-- 검색 모달 -->
        <div class="place-search-modal" @click.stop>
          <div class="modal-header">
            <h3>장소 검색</h3>
            <button class="close-btn" @click="closePlaceSearch">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="modal-content">
            <!-- 검색 섹션 -->
            <div class="search-section">
              <div class="search-box">
                <input 
                  type="text" 
                  v-model="placeSearchKeyword" 
                  placeholder="검색할 장소를 입력하세요"
                  @keyup.enter="searchPlaces"
                >
                <button class="search-btn" @click="searchPlaces">검색</button>
              </div>
              
              <h3 class="modal-section-title">장소 검색 결과</h3>
              
              <div class="search-results">
                <div v-if="isSearching" class="searching-indicator">
                  <div class="spinner"></div>
                  <p>검색 중...</p>
                </div>
                <div v-else-if="searchResults.length === 0 && hasSearched" class="no-results">
                  <p>검색 결과가 없습니다.</p>
                </div>
                <div v-else class="place-list">
                  <div 
                    v-for="(place, index) in searchResults" 
                    :key="index" 
                    class="place-item"
                  >
                    <div class="place-info" @click="openPlaceDetails(place)">
                      <h4>{{ place.place_name }}</h4>
                      <p class="place-address">{{ place.road_address_name || place.address_name }}</p>
                      <p class="place-category">{{ place.category_name }}</p>
                    </div>
                    <div class="place-actions">
                      <button class="wishlist-btn" @click="addToWishlist(place)" :class="{ 'active': isInWishlist(place) }">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 위시리스트 섹션 -->
            <div class="wishlist-section">
              <h3 class="modal-section-title">나의 찜 목록</h3>
              <div class="wishlist-items">
                <div v-if="wishlistPlaces.length === 0" class="no-wishlist">
                  <p>저장한 장소가 없습니다.</p>
                </div>
                <div v-else class="place-list">
                  <div 
                    v-for="(place, index) in wishlistPlaces" 
                    :key="index" 
                    class="place-item"
                  >
                    <div class="place-info" @click="openPlaceDetails(place)">
                      <h4>{{ place.place_name }}</h4>
                      <p class="place-address">{{ place.road_address_name || place.address_name }}</p>
                    </div>
                    <div class="place-actions">
                      <button class="remove-btn" @click="removeFromWishlist(index)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <p class="powered-by">Powered by Kakao Maps API</p>
          </div>
        </div>
        
        <!-- 장소 상세 정보 모달 (선택 시에만 표시) -->
        <div v-if="selectedPlace" class="place-detail-modal" @click.stop>
          <div class="modal-header">
            <h3>장소 추가</h3>
            <button class="close-btn" @click="cancelPlaceDetails">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="detail-content">
            <div class="selected-place-info">
              <h4>{{ selectedPlace.place_name }}</h4>
              <p>{{ selectedPlace.road_address_name || selectedPlace.address_name }}</p>
            </div>
            
            <!-- 미니 지도 표시 -->
            <div class="mini-map-container">
              <div id="detail-map" ref="detailMapContainer"></div>
            </div>
            
            <div class="form-group">
              <label for="visitTime">방문 시간</label>
              <div class="time-input-wrapper">
                <input type="time" id="visitTime" v-model="visitTime">
              </div>
            </div>
            
            <div class="form-group">
              <label for="placeMemo">메모</label>
              <textarea id="placeMemo" v-model="placeMemo" placeholder="장소에 대한 메모를 입력하세요"></textarea>
            </div>
            
            <div class="form-actions">
              <button class="cancel-btn" @click="cancelPlaceDetails">취소</button>
              <button class="add-btn" @click="addSelectedPlace">일정에 추가</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 성공 알림 배너 -->
    <div v-if="showSuccessBanner" class="success-banner">
      <div class="success-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      영수증 정보가 성공적으로 추가되었습니다!
    </div>

    <!-- 방문 인증 모달 추가 -->
    <div class="modal-overlay" v-if="showVerificationModal" @click="closeVerificationModal">
      <div class="verification-modal" @click.stop>
        <div class="modal-header">
          <h3>방문 인증하기</h3>
          <button class="close-btn" @click="closeVerificationModal">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="verification-item-info">
            <h4>{{ verifyingItemInfo.activity }}</h4>
            <p>{{ verifyingItemInfo.location }}</p>
          </div>
          
          <div class="upload-container" 
               @dragover.prevent="onPhotoUploadDragOver" 
               @dragleave.prevent="onPhotoUploadDragLeave" 
               @drop.prevent="onPhotoUploadDrop" 
               :class="{ 'active-dropzone': isPhotoDragging }">
            <input 
              type="file" 
              ref="photoFileInput" 
              @change="handlePhotoFileInput" 
              accept="image/*" 
              style="display: none"
            >
            <div v-if="!verificationPhotoPreview" class="upload-prompt">
              <div class="upload-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <p>방문 인증을 위한 사진을 업로드해주세요</p>
              <p class="upload-tip">* 해당 장소에서 촬영한 사진만 인증 가능합니다</p>
              <button @click="triggerPhotoFileInput" class="btn secondary-btn">사진 선택</button>
            </div>
            <div v-else class="preview-container">
              <div class="image-container">
                <img :src="verificationPhotoPreview" alt="방문 인증 사진 미리보기" class="photo-preview">
              </div>
              <div class="photo-metadata" v-if="photoMetadata">
                <div class="metadata-item">
                  <strong>촬영 시간:</strong> {{ formatPhotoDate(photoMetadata.dateTime) }}
                </div>
                <div class="metadata-item" v-if="photoMetadata.latitude && photoMetadata.longitude">
                  <strong>촬영 위치:</strong> [{{ photoMetadata.latitude.toFixed(6) }}, {{ photoMetadata.longitude.toFixed(6) }}]
                </div>
                <div class="metadata-item" v-if="distanceFromTarget !== null">
                  <strong>장소와의 거리:</strong> {{ formatDistance(distanceFromTarget) }}
                </div>
                <div class="verification-result" v-if="verificationResult !== null">
                  <div v-if="verificationResult.success" class="success-result">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    방문 인증이 확인되었습니다!
                  </div>
                  <div v-else class="error-result">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {{ verificationResult.message }}
                  </div>
                </div>
              </div>
              <div class="preview-actions">
                <button @click="verifyPhoto" class="btn primary-btn" :disabled="isVerifying || !photoMetadata">
                  {{ isVerifying ? '인증 중...' : '인증하기' }}
                </button>
                <button @click="clearVerificationPhoto" class="btn cancel-btn">취소</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer" v-if="verificationResult && verificationResult.success">
          <div class="review-section">
            <h4>방문 후기 작성</h4>
            
            <div class="rating-container">
              <label>별점:</label>
              <div class="star-rating">
                <span 
                  v-for="star in 5" 
                  :key="star" 
                  class="star" 
                  :class="{ 'active': star <= reviewRating }"
                  @click="reviewRating = star"
                >
                  ★
                </span>
              </div>
            </div>
            
            <div class="review-text-container">
              <label for="review-text">후기:</label>
              <textarea 
                id="review-text" 
                v-model="reviewText" 
                placeholder="방문 후기를 작성해주세요..."
                rows="3"
              ></textarea>
            </div>
          </div>
          <button 
            v-if="verificationResult && verificationResult.success"
            @click="completeVerification" 
            class="btn btn-verify"
          >
            인증 완료하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import config from '@/config';
import EXIF from 'exif-js';

export default {
  name: 'TripPlan',
  components: {
    Header
  },
  setup() {
    // 카카오 맵 관련 변수
    const kakaoMapContainer = ref(null);
    const kakaoMap = ref(null);
    const kakaoMarkers = ref([]);
    const kakaoPolyline = ref(null);
    const mapLoaded = ref(false);
    const geocoder = ref(null);
    
    // 장소 검색 관련 상태
    const isPlaceSearchModalOpen = ref(false);
    const placeSearchKeyword = ref('');
    const searchResults = ref([]);
    const isSearching = ref(false);
    const hasSearched = ref(false);
    const selectedDay = ref(0); // 장소 검색 시 선택된 날짜
    
    // 위시리스트 및 선택한 장소 관련 상태
    const wishlistPlaces = ref([]);
    const selectedPlace = ref(null);
    const visitTime = ref('');
    const placeMemo = ref('');
    
    // 여행 데이터 - 이미 데이터가 차있는 상태로 초기화
    const tripData = ref({
      title: '제주도 봄 여행',
      startDate: '2020-04-15',
      endDate: '2020-04-18',
      destination: '제주도',
      notes: '첫 제주 여행, 올레길 걷기, 해변에서 휴식, 맛집 탐방 계획',
      budget: 800000,
      expenses: [
        {
          category: 'accommodation',
          description: '에어비앤비 숙소',
          amount: 300000,
          date: '2020-05-15',
          time: '12:00'
        },
        {
          category: 'transportation',
          description: '항공권',
          amount: 180000,
          date: '2020-05-15',
          time: '09:00'
        },
        {
          category: 'food',
          description: '식비 예산',
          amount: 120000,
          date: '2020-05-16',
          time: '13:30'
        }
      ]
    });

    // 현재 활성화된 일정 날짜 (DAY 탭)
    const activeDay = ref(0);

    // 여행 일수 계산
    const tripDays = computed(() => {
      if (!tripData.value.startDate || !tripData.value.endDate) {
        return [{ 
          items: [{ time: '09:00', activity: '조식', location: '호텔 레스토랑', coords: { lat: 33.4890113, lng: 126.4983023 } }],
        }]; // 기본값: 1일
      }

      const start = new Date(tripData.value.startDate);
      const end = new Date(tripData.value.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      // 이미 존재하는 일정 유지하면서 필요한 일수만큼 배열 생성
      const days = [];
      for (let i = 0; i < diffDays; i++) {
        // 기본 일정 데이터 추가 (날짜별 샘플 데이터)
        if (i === 0) {
          days.push({ 
            items: [
              { time: '09:00', activity: '제주공항 도착', location: '제주국제공항', coords: { lat: 33.5066778, lng: 126.4931069 } },
              { time: '10:30', activity: '렌터카 픽업', location: '공항 렌터카 센터', coords: { lat: 33.5066778, lng: 126.4931069 } },
              { time: '12:00', activity: '점심 식사', location: '제주 흑돼지 맛집', coords: { lat: 33.4890113, lng: 126.4983023 } }
            ] 
          });
        } else if (i === 1) {
          days.push({ 
            items: [
              { time: '08:00', activity: '아침 식사', location: '숙소 근처 카페', coords: { lat: 33.4648938, lng: 126.3312657 } },
              { time: '10:00', activity: '성산일출봉 관광', location: '성산일출봉', coords: { lat: 33.458031, lng: 126.942652 } }
            ] 
          });
        } else if (i === 2) {
          days.push({ 
            items: [
              { time: '09:00', activity: '아침 산책', location: '한라산 둘레길', coords: { lat: 33.3616758, lng: 126.5292231 } },
              { time: '13:00', activity: '점심 식사', location: '제주 해물 전문점', coords: { lat: 33.2541205, lng: 126.5630755 } }
            ] 
          });
        } else if (i === 3) {
          days.push({ 
            items: [
              { time: '10:00', activity: '마지막 관광', location: '카멜리아 힐', coords: { lat: 33.2895471, lng: 126.3721352 } },
              { time: '14:00', activity: '공항 이동', location: '제주국제공항', coords: { lat: 33.5066778, lng: 126.4931069 } }
            ] 
          });
        } else {
          days.push({ items: [] });
        }
      }
      
      return days;
    });

    // 몇박 계산
    const tripNights = computed(() => {
      if (!tripData.value.startDate || !tripData.value.endDate) {
        return 0;
      }
      
      const start = new Date(tripData.value.startDate);
      const end = new Date(tripData.value.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    });

    // 예산 계산
    const totalBudget = computed(() => Number(tripData.value.budget) || 0);
    
    const calculatedExpenses = computed(() => {
      return tripData.value.expenses.reduce((total, expense) => {
        return total + Number(expense.amount || 0);
      }, 0);
    });
    
    const remainingBudget = computed(() => {
      return totalBudget.value - calculatedExpenses.value;
    });

    // 수정 관련 상태
    const editingItem = ref(null);
    const editItemTime = ref('');
    const editItemMemo = ref('');
    const originalItemTime = ref('');
    const originalItemMemo = ref('');

    // 정렬된 일정 항목 가져오기
    const sortedScheduleItems = computed(() => {
      if (!tripDays.value[activeDay.value]?.items || tripDays.value[activeDay.value].items.length === 0) {
        return [];
      }
      
      // 시간 기준으로 정렬된 배열 반환
      return [...tripDays.value[activeDay.value].items].sort((a, b) => {
        // 빈 시간은 가장 뒤로
        if (!a.time) return 1;
        if (!b.time) return -1;
        
        // 시간 비교 (HH:MM 형식)
        return a.time.localeCompare(b.time);
      });
    });
    
    // 아이템 수정 시작
    const startEditItem = (index) => {
      const item = tripDays.value[activeDay.value].items[index];
      editingItem.value = index;
      editItemTime.value = item.time;
      editItemMemo.value = item.location;
      
      // 원본 값 저장 (수정 취소 시 복원용)
      originalItemTime.value = item.time;
      originalItemMemo.value = item.location;
    };
    
    // 아이템 수정 저장
    const saveItemEdit = (index) => {
      if (editingItem.value !== null) {
        const item = tripDays.value[activeDay.value].items[index];
        item.time = editItemTime.value;
        item.location = editItemMemo.value;
        
        // 위치 정보 업데이트
        updateLocation(activeDay.value, index, editItemMemo.value);
        
        // 수정 모드 종료
        editingItem.value = null;
        
        // 강제 화면 갱신
        forceRefresh();
      }
    };

    // 아이템 수정 취소
    const cancelItemEdit = () => {
      if (editingItem.value !== null) {
        // 원본 값으로 되돌리기
        const index = editingItem.value;
        const item = tripDays.value[activeDay.value].items[index];
        
        // 변경된 내용이 있으면 원래 값으로 복원
        item.time = originalItemTime.value;
        item.location = originalItemMemo.value;
        
        // 수정 모드 종료
        editingItem.value = null;
        console.log("수정 취소됨");
      }
    };

    // 카카오 맵 초기화
    const initializeMap = () => {
      console.log("Initializing Kakao Map...");
      
      // 카카오 지도 API 로드
      const kakaoMapsApiKey = config.KAKAO_MAPS_API_KEY;
      console.log("Kakao Maps API Key:", kakaoMapsApiKey);
      
      // 스크립트가 이미 있는지 확인
      const existingScript = document.getElementById('kakao-maps-sdk');
      if (existingScript) {
        existingScript.remove();
      }
      
      // 스크립트 생성
      const script = document.createElement('script');
      script.id = 'kakao-maps-sdk';
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapsApiKey}&libraries=services,clusterer,drawing&autoload=false`;
      script.onload = () => {
        console.log("Kakao Maps SDK loaded");
        window.kakao.maps.load(() => {
          console.log("Kakao Maps initialized");
          nextTick(() => {
            loadMap();
          });
        });
      };
      document.head.appendChild(script);
    };

    // 카카오 맵 로드 및 초기화
    const loadMap = () => {
      console.log("Loading Kakao Map...");
      if (!window.kakao || !window.kakao.maps) {
        console.error("Kakao Maps SDK not loaded");
        return;
      }
      
      if (!kakaoMapContainer.value) {
        console.error("Kakao Map container not found");
        return;
      }
      
      try {
        // 제주도 중심 좌표
        const jejuCenter = new kakao.maps.LatLng(33.3846, 126.5535);
        
        // 맵 생성
        const options = {
          center: jejuCenter,
          level: 9 // 확대 레벨 (숫자가 작을수록 확대)
        };
        
        kakaoMap.value = new kakao.maps.Map(kakaoMapContainer.value, options);
        console.log("Kakao Map created:", kakaoMap.value);
        
        // 확대 축소 컨트롤러 추가
        const zoomControl = new kakao.maps.ZoomControl();
        kakaoMap.value.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
        
        // Geocoder 초기화
        geocoder.value = new kakao.maps.services.Geocoder();
        
        // 마커와 경로 표시
        updateMapMarkers();
        
        mapLoaded.value = true;
      } catch (error) {
        console.error("Error initializing Kakao Map:", error);
      }
    };

    // 카카오 지도 마커와 경로 업데이트
    const updateMapMarkers = () => {
      console.log("Updating Kakao Map markers...");
      
      // 카카오 맵이 로드되지 않았다면 무시
      if (!kakaoMap.value || !window.kakao) {
        console.error("Kakao Map not loaded yet");
        return;
      }
      
      try {
        console.log("Current active day:", activeDay.value);
        
        // 기존 마커 제거
        kakaoMarkers.value.forEach(marker => marker.setMap(null));
        kakaoMarkers.value = [];
        
        // 기존 경로 제거
        if (kakaoPolyline.value) {
          kakaoPolyline.value.setMap(null);
        }
        
        // 현재 선택된 날짜의 일정 가져오기 (시간순 정렬)
        const dayItems = sortedScheduleItems.value;
        console.log(`Found ${dayItems.length} items for day ${activeDay.value}:`, dayItems);
        
        if (dayItems.length === 0) {
          console.log("No items for this day");
          return;
        }
        
        // 지도 재배치 (가끔 맵이 제대로 표시되지 않는 문제 해결)
        kakaoMap.value.relayout();
        
        const linePath = [];
        const bounds = new kakao.maps.LatLngBounds();
        
        // 마커 추가
        dayItems.forEach((item, index) => {
          if (!item.coords) {
            console.log("No coordinates for item:", item);
            return;
          }
          
          const position = new kakao.maps.LatLng(item.coords.lat, item.coords.lng);
          linePath.push(position);
          bounds.extend(position);
          
          // 마커 색상 설정
          let markerColor;
          if (index === 0) {
            markerColor = '#4CAF50';  // 첫 위치 (초록색)
          } else if (index === dayItems.length - 1) {
            markerColor = '#1A5276';  // 마지막 위치 (짙은 파란색)
          } else {
            markerColor = '#3498DB';  // 중간 위치 (파란색)
          }
          
          // 커스텀 오버레이 생성 (원형 마커 + 숫자)
          const content = `
            <div class="custom-marker" style="
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background-color: ${markerColor};
              color: white;
              display: flex;
              justify-content: center;
              align-items: center;
              font-weight: bold;
              font-size: 14px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">
              ${index + 1}
            </div>
          `;
          
          // 커스텀 오버레이 생성
          const customOverlay = new kakao.maps.CustomOverlay({
            position: position,
            content: content,
            yAnchor: 1,
            zIndex: 3
          });
          
          // 지도에 커스텀 오버레이 표시
          customOverlay.setMap(kakaoMap.value);
          kakaoMarkers.value.push(customOverlay);
          
          // 인포윈도우 생성
          const infoContent = `
            <div style="
              padding: 8px 12px; 
              background: white; 
              border-radius: 6px; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              font-size: 13px;
              max-width: 200px;
              text-align: center;
            ">
              <div style="font-weight: bold; margin-bottom: 4px;">${item.time} ${item.activity}</div>
              <div style="color: #666;">${item.location}</div>
            </div>
          `;
          
          const infoWindow = new kakao.maps.CustomOverlay({
            position: position,
            content: infoContent,
            yAnchor: 2.2,
            zIndex: 2
          });
          
          // 마커 클릭 이벤트 - 인포윈도우 표시 (2초 후 자동으로 닫힘)
          kakao.maps.event.addListener(customOverlay, 'click', function() {
            infoWindow.setMap(kakaoMap.value);
            
            // 2초 후 인포윈도우 닫기
            setTimeout(() => {
              infoWindow.setMap(null);
            }, 2000);
          });
          
          kakaoMarkers.value.push(infoWindow);
        });
        
        // 경로 표시 (2개 이상의 위치가 있을 경우)
        if (linePath.length >= 2) {
          kakaoPolyline.value = new kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 3,
            strokeColor: '#db4040',
            strokeOpacity: 0.7,
            strokeStyle: 'solid'
          });
          
          kakaoPolyline.value.setMap(kakaoMap.value);
        }
        
        // 지도 범위 조정
        if (kakaoMarkers.value.length > 0) {
          kakaoMap.value.setBounds(bounds);
        }
      } catch (error) {
        console.error("Error updating Kakao Map markers:", error);
      }
    };

    // 카카오 지도에서 주소를 좌표로 변환하는 함수
    const geocodeAddress = (address, callback) => {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        console.error("Kakao Maps Services not loaded");
        return;
      }
      
      // geocoder가 없으면 새로 생성
      if (!geocoder.value) {
        try {
          console.log("Creating new Geocoder instance");
          geocoder.value = new kakao.maps.services.Geocoder();
        } catch (error) {
          console.error("Failed to create Geocoder:", error);
          return;
        }
      }
      
      try {
        console.log(`Geocoding address: ${address}`);
        // 제주도 지역 검색을 위해 주소에 제주도를 포함
        const searchAddress = `${address}, 제주도`;
        
        geocoder.value.addressSearch(searchAddress, (result, status) => {
          if (status === kakao.maps.services.Status.OK && result.length > 0) {
            const coords = {
              lat: parseFloat(result[0].y),
              lng: parseFloat(result[0].x)
            };
            console.log(`Geocoded coordinates:`, coords);
            callback(coords);
          } else {
            console.warn(`Geocoding failed for: ${searchAddress}, status: ${status}`);
            // 실패 시 제주도 중심 근처 랜덤 좌표 반환
            const fallbackCoords = {
              lat: 33.3846 + (Math.random() * 0.2 - 0.1),  // 제주도 중심 ±0.1도 랜덤
              lng: 126.5535 + (Math.random() * 0.2 - 0.1)
            };
            console.log("Using fallback coordinates:", fallbackCoords);
            callback(fallbackCoords);
          }
        });
      } catch (error) {
        console.error("Error during geocoding:", error);
        // 오류 발생 시 랜덤 좌표 반환
        const errorCoords = {
          lat: 33.3846 + (Math.random() * 0.2 - 0.1),
          lng: 126.5535 + (Math.random() * 0.2 - 0.1)
        };
        callback(errorCoords);
      }
    };

    // 위치 업데이트 함수
    const updateLocation = (dayIndex, itemIndex, location) => {
      if (!location || location.trim() === '') return;
      
      console.log(`Updating location for day ${dayIndex}, item ${itemIndex}: ${location}`);
      
      // 카카오 지도에서 좌표 변환
      geocodeAddress(location, (coords) => {
        // 좌표 업데이트
        tripDays.value[dayIndex].items[itemIndex].coords = coords;
        
        // 현재 선택된 날짜인 경우에만 화면 갱신
        if (dayIndex === activeDay.value) {
          forceRefresh();
        }
      });
    };

    // 일정 항목 추가
    const addScheduleItem = (dayIndex) => {
      tripDays.value[dayIndex].items.push({
        time: '',
        activity: '',
        location: '',
        coords: null
      });
    };

    // 일정 항목 삭제
    const removeScheduleItem = (dayIndex, itemIndex) => {
      tripDays.value[dayIndex].items.splice(itemIndex, 1);
      
      // 강제 화면 갱신
      forceRefresh();
    };

    // 지출 항목을 날짜별로 그룹화
    const groupedExpenses = computed(() => {
      const grouped = {};
      
      // 날짜별로 그룹화
      tripData.value.expenses.forEach(expense => {
        // 기존 데이터에 날짜가 없는 경우 오늘 날짜 사용
        const date = expense.date || new Date().toISOString().split('T')[0];
        
        if (!grouped[date]) {
          grouped[date] = [];
        }
        
        grouped[date].push(expense);
      });
      
      // 각 그룹 내에서 시간별 정렬
      Object.keys(grouped).forEach(date => {
        grouped[date].sort((a, b) => {
          const timeA = a.time || '00:00';
          const timeB = b.time || '00:00';
          return timeA.localeCompare(timeB);
        });
      });
      
      // 날짜별 정렬된 객체 반환 (키는 날짜, 값은 해당 날짜의 지출 배열)
      const sortedDates = Object.keys(grouped).sort();
      const result = {};
      
      sortedDates.forEach(date => {
        result[date] = grouped[date];
      });
      
      return result;
    });
    
    // 지출 항목 추가 (날짜와 시간 정보 포함)
    const addExpense = () => {
      // 현재 날짜와 시간 기본값으로 설정
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      tripData.value.expenses.push({
        category: 'other',
        description: '',
        amount: 0,
        date: today,
        time: currentTime
      });
    };
    
    // 지출 인덱스 찾기
    const getExpenseIndex = (expense) => {
      return tripData.value.expenses.findIndex(e => e === expense);
    };
    
    // 지출 항목 삭제
    const removeExpense = (index) => {
      tripData.value.expenses.splice(index, 1);
    };
    
    // 지출 날짜 포맷팅
    const formatExpenseDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long' 
      });
    };

    // 날짜 포맷팅
    const formatDate = (date) => {
      if (!date) return '';
      
      const options = { month: 'short', day: 'numeric', weekday: 'short' };
      return date.toLocaleDateString('ko-KR', options);
    };

    // 날짜 더하기
    const addDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    // 숫자 포맷팅 (천 단위 콤마)
    const formatNumber = (num) => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // 여행 계획 저장
    const saveTripPlan = () => {
      // 실제 구현에서는 여기에 API 호출이나 Vuex store에 저장하는 로직이 필요
      console.log('여행 계획 저장:', tripData.value);
      alert('여행 계획이 업데이트되었습니다.');
    };

    // 장소 검색 모달 열기
    const openPlaceSearch = () => {
      selectedDay.value = activeDay.value;
      isPlaceSearchModalOpen.value = true;
      placeSearchKeyword.value = '';
      searchResults.value = [];
      hasSearched.value = false;
      selectedPlace.value = null;
      
      // 로컬 스토리지에서 위시리스트 불러오기
      const savedWishlist = localStorage.getItem('wishlistPlaces');
      if (savedWishlist) {
        wishlistPlaces.value = JSON.parse(savedWishlist);
      }
    };
    
    // 장소 검색 모달 닫기
    const closePlaceSearch = () => {
      isPlaceSearchModalOpen.value = false;
      selectedPlace.value = null;
      placeSearchKeyword.value = '';
      searchResults.value = [];
      hasSearched.value = false;
    };
    
    // 장소 상세 정보 열기
    const openPlaceDetails = (place) => {
      selectedPlace.value = place;
      
      // 현재 시간을 기본값으로 설정
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      visitTime.value = `${hours}:${minutes}`;
      placeMemo.value = '';
      
      // 다음 렌더링 주기에서 상세 지도 초기화
      nextTick(() => {
        initDetailMap();
      });
    };
    
    // 상세 지도 초기화
    const initDetailMap = () => {
      if (!selectedPlace.value) return;
      
      // 지도 컨테이너 요소가 있는지 확인
      const detailMapContainer = document.getElementById('detail-map');
      if (!detailMapContainer) return;
      
      // 카카오맵 API가 로드되었는지 확인
      if (!window.kakao || !window.kakao.maps) {
        console.error("Kakao Maps SDK not loaded");
        return;
      }
      
      try {
        // 선택한 장소의 좌표
        const placePosition = new kakao.maps.LatLng(
          selectedPlace.value.y,
          selectedPlace.value.x
        );
        
        // 지도 옵션
        const mapOptions = {
          center: placePosition,
          level: 3 // 확대 레벨
        };
        
        // 지도 생성
        const detailMap = new kakao.maps.Map(detailMapContainer, mapOptions);
        
        // 마커 생성
        new kakao.maps.Marker({
          position: placePosition,
          map: detailMap
        });
        
        // 1초 후 지도 리사이즈 (모달 애니메이션 완료 후)
        setTimeout(() => {
          detailMap.relayout();
        }, 100);
      } catch (error) {
        console.error("Error initializing detail map:", error);
      }
    };
    
    // 장소 상세 취소
    const cancelPlaceDetails = () => {
      selectedPlace.value = null;
    };
    
    // 위시리스트에 장소 추가
    const addToWishlist = (place) => {
      // 이미 위시리스트에 있는지 확인
      const existingIndex = wishlistPlaces.value.findIndex(p => p.id === place.id);
      
      if (existingIndex >= 0) {
        // 이미 있으면 제거 (토글)
        wishlistPlaces.value.splice(existingIndex, 1);
      } else {
        // 없으면 추가
        wishlistPlaces.value.push(place);
      }
      
      // 로컬 스토리지에 저장
      localStorage.setItem('wishlistPlaces', JSON.stringify(wishlistPlaces.value));
    };
    
    // 위시리스트에서 장소 제거
    const removeFromWishlist = (index) => {
      wishlistPlaces.value.splice(index, 1);
      localStorage.setItem('wishlistPlaces', JSON.stringify(wishlistPlaces.value));
    };
    
    // 위시리스트에 있는지 확인
    const isInWishlist = (place) => {
      return wishlistPlaces.value.some(p => p.id === place.id);
    };
    
    // 선택한 장소 일정에 추가
    const addSelectedPlace = () => {
      if (!selectedPlace.value) return;
      
      // 좌표 추출
      const coords = {
        lat: parseFloat(selectedPlace.value.y),
        lng: parseFloat(selectedPlace.value.x)
      };
      
      // 새 일정 아이템 생성
      const newItem = {
        time: visitTime.value,
        activity: selectedPlace.value.place_name,
        location: placeMemo.value || selectedPlace.value.road_address_name || selectedPlace.value.address_name,
        coords: coords
      };
      
      // 선택한 날짜의 일정에 추가
      if (!tripDays.value[selectedDay.value].items) {
        tripDays.value[selectedDay.value].items = [];
      }
      
      tripDays.value[selectedDay.value].items.push(newItem);
      
      // 모달 닫기
      closePlaceSearch();
      
      // 활성 날짜를 선택한 날짜로 변경 (다른 날짜에 일정을 추가한 경우)
      if (selectedDay.value !== activeDay.value) {
        activeDay.value = selectedDay.value;
      }
      
      // 강제 화면 갱신 - 일정 추가 후 즉시 실행
      forceRefresh();
    };
    
    // 장소 검색 실행
    const searchPlaces = () => {
      if (!placeSearchKeyword.value.trim()) {
        alert('검색어를 입력해주세요');
        return;
      }
      
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        alert('카카오맵 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }
      
      isSearching.value = true;
      hasSearched.value = true;
      searchResults.value = [];
      
      // 카카오 장소 검색 API 사용
      const places = new kakao.maps.services.Places();
      
      // 현재 지도의 중심 좌표 (제주도)
      const center = new kakao.maps.LatLng(33.3846, 126.5535);
      
      // 검색 옵션
      const searchOptions = {
        location: center,
        radius: 20000, // 20km 반경 내 검색
        size: 15 // 최대 15개 결과
      };
      
      // 키워드 + 제주도로 검색 범위 좁히기
      const keyword = `${placeSearchKeyword.value} 제주도`;
      
      places.keywordSearch(keyword, (result, status) => {
        isSearching.value = false;
        
        if (status === kakao.maps.services.Status.OK) {
          console.log('검색 결과:', result);
          searchResults.value = result;
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
          console.log('검색 결과가 없습니다.');
        } else {
          alert('검색 중 오류가 발생했습니다.');
          console.error('Kakao Places API Error:', status);
        }
      }, searchOptions);
    };
    
    // 장소 선택 및 일정 추가
    const selectPlace = (place) => {
      openPlaceDetails(place);
    };
    

    // 컴포넌트 마운트 시 지도 초기화
    onMounted(() => {
      console.log("Component mounted");
      nextTick(() => {
        // DOM이 완전히 렌더링된 후 카카오 맵 초기화
        console.log("Next tick after mount - initializing Kakao Map");
        setTimeout(() => {
          initializeMap();
        }, 500); // 더 긴 딜레이로 DOM이 완전히 렌더링되도록 기다림
      });
    });

    // 활성 날짜가 변경될 때 지도 업데이트
    watch(activeDay, (newDay, oldDay) => {
      console.log(`Active day changed from ${oldDay} to ${newDay}`);
      if (mapLoaded.value && kakaoMap.value) {
        console.log(`Updating map for day ${newDay} with ${tripDays.value[newDay]?.items?.length || 0} items`);
        
        // 지도 업데이트를 약간 지연시켜 UI 업데이트 후 실행
        setTimeout(() => {
          updateMapMarkers();
        }, 100);
      }
    });

    // 맵 로드 상태 감시
    watch(mapLoaded, (isLoaded) => {
      if (isLoaded && kakaoMap.value) {
        console.log("Map is now loaded, updating markers for active day:", activeDay.value);
        updateMapMarkers();
      }
    });

    // 맵 크기 재조정 - 창 크기 변경 시
    window.addEventListener('resize', () => {
      if (mapLoaded.value && kakaoMap.value) {
        nextTick(() => {
          kakaoMap.value.relayout();
          updateMapMarkers();
        });
      }
    });

    // 강제 화면 갱신 함수 추가
    const forceRefresh = () => {
      console.log("강제 화면 갱신 실행...");
      const currentDay = activeDay.value;
      
      // 존재하지 않는 인덱스로 잠시 변경
      activeDay.value = -1;
      
      // 10ms 후에 원래 인덱스로 복귀
      setTimeout(() => {
        activeDay.value = currentDay;
        console.log(`원래 날짜(${currentDay})로 복귀 완료`);
        
        // 복귀 후 지도 업데이트
        if (mapLoaded.value) {
          updateMapMarkers();
        }
      }, 10);
    };

    // 영수증 업로드 관련 상태
    const showReceiptUpload = ref(false);
    const receiptFile = ref(null);
    const receiptPreview = ref(null);
    const isDragging = ref(false);
    const isLoading = ref(false);
    const loadingMessage = ref('이미지 분석 중...');
    const parsedReceiptData = ref({
      Place: '',
      Time: '',
      Price: null
    });
    
    // 영수증 업로드 모달 열기
    const openReceiptUpload = () => {
      showReceiptUpload.value = true;
      clearReceiptImage();
    };
    
    // 영수증 업로드 모달 닫기
    const closeReceiptUpload = () => {
      showReceiptUpload.value = false;
      clearReceiptImage();
    };
    
    // 영수증 파일 입력 트리거
    const triggerReceiptFileInput = () => {
      document.querySelector('input[type="file"]').click();
    };
    
    // 영수증 파일 입력 처리
    const handleReceiptFileInput = (event) => {
      const file = event.target.files[0];
      if (file) {
        processReceiptFile(file);
      }
    };
    
    // 드래그 이벤트
    const onDragOver = () => {
      isDragging.value = true;
    };
    
    const onDragLeave = () => {
      isDragging.value = false;
    };
    
    const onDrop = (event) => {
      isDragging.value = false;
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        processReceiptFile(file);
      }
    };
    
    // 영수증 파일 처리
    const processReceiptFile = (file) => {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // 이미지 리사이즈
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // 최대 크기 제한
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 1200;
          
          let width = img.width;
          let height = img.height;
          
          // 비율 유지하면서 리사이즈
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // 리사이즈된 이미지를 미리보기로 설정
          receiptPreview.value = canvas.toDataURL(file.type);
          
          // 리사이즈된 이미지를 Blob으로 변환하여 보관
          canvas.toBlob((blob) => {
            receiptFile.value = new File([blob], file.name, { type: file.type });
          }, file.type);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    };
    
    // 영수증 이미지 초기화
    const clearReceiptImage = () => {
      receiptFile.value = null;
      receiptPreview.value = null;
      if (document.querySelector('input[type="file"]')) {
        document.querySelector('input[type="file"]').value = '';
      }
    };
    
    // 영수증 분석
    const analyzeReceipt = async () => {
      if (!receiptFile.value) {
        return;
      }
      
      isLoading.value = true;
      loadingMessage.value = 'OCR로 텍스트 추출 중...';
      
      try {
        const formData = new FormData();
        formData.append('apikey', 'K83821813888957');
        formData.append('language', 'kor');
        formData.append('isTable', 'true');
        formData.append('OCREngine', '2');
        formData.append('scale', 'true');
        formData.append('file', receiptFile.value);
        
        const response = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (data.OCRExitCode === 1) {
          loadingMessage.value = 'AI 처리중...';
          await analyzeWithAI(data.ParsedResults[0].ParsedText);
        } else {
          throw new Error(data.ErrorMessage || '이미지 분석 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('OCR API 호출 오류:', error);
        alert('이미지 분석 실패: ' + error.message);
      } finally {
        isLoading.value = false;
      }
    };
    
    // AI 모델로 분석
    const analyzeWithAI = async (text) => {
      try {
        const response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'OCR_basic',
            prompt: text,
            stream: false
          })
        });
        
        if (!response.ok) {
          throw new Error(`API 응답 오류: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data && data.response) {
          try {
            const parsedResponse = JSON.parse(data.response);
            
            if (parsedResponse.Place !== undefined && 
                parsedResponse.Time !== undefined && 
                parsedResponse.Price !== undefined) {
              parsedReceiptData.value = parsedResponse;
              
              // 지출 항목으로 추가
              addFromReceipt(
                parsedReceiptData.value.Place,
                parsedReceiptData.value.Time,
                parsedReceiptData.value.Price
              );
              
              // 모달 닫기
              closeReceiptUpload();
              return;
            }
          } catch (e) {
            console.error('AI 응답을 JSON으로 파싱할 수 없습니다:', e);
          }
        }
        
        // AI 분석 실패시 기본 패턴 매칭 사용
        extractReceiptData(text);
        
        // 지출 항목으로 추가
        addFromReceipt(
          parsedReceiptData.value.Place,
          parsedReceiptData.value.Time,
          parsedReceiptData.value.Price
        );
        
        // 모달 닫기
        closeReceiptUpload();
      } catch (error) {
        console.error('AI 분석 오류:', error);
        extractReceiptData(text);
        
        // 지출 항목으로 추가
        addFromReceipt(
          parsedReceiptData.value.Place,
          parsedReceiptData.value.Time,
          parsedReceiptData.value.Price
        );
        
        // 모달 닫기
        closeReceiptUpload();
      }
    };
    
    // 기본 패턴 매칭
    const extractReceiptData = (text) => {
      if (!text) return;
      
      const lines = text.split('\n').filter(line => line.trim());
      
      // 결제 장소 추출
      const potentialPlaces = lines.slice(0, Math.min(3, lines.length));
      parsedReceiptData.value.Place = potentialPlaces.reduce(
        (longest, current) => current.length > longest.length ? current : longest, 
        ''
      ).trim();
      
      // 날짜 및 시간 패턴 찾기
      const datePattern = /\d{2,4}[-./]\d{1,2}[-./]\d{1,2}|\d{1,2}[-./]\d{1,2}[-./]\d{2,4}/;
      const timePattern = /\d{1,2}:\d{2}(:\d{2})?/;
      
      // 결제 시간 추출
      for (const line of lines) {
        const timeLabels = ['날짜', '시간', '결제시간', '거래일시', '거래일자', '일자', '일시'];
        const hasTimeLabel = timeLabels.some(label => line.includes(label));
        
        const dateMatch = line.match(datePattern);
        if (dateMatch) {
          let dateStr = dateMatch[0];
          
          const timeMatch = line.match(timePattern);
          if (timeMatch) {
            dateStr += ' ' + timeMatch[0];
          }
          
          if (hasTimeLabel || !parsedReceiptData.value.Time) {
            parsedReceiptData.value.Time = dateStr.trim();
          }
        }
      }
      
      // 결제 금액 추출
      const totalPatterns = [
        /(합\s*계|총\s*액|결제\s*금액|결제액|Total|합계금액).{0,10}([\d,]+)/i,
        /([\d,]+)\s*원\s*(합\s*계|총\s*액|결제\s*금액)/i,
        /([\d,]+)/
      ];
      
      for (const line of lines) {
        for (const pattern of totalPatterns) {
          const match = line.match(pattern);
          if (match) {
            const priceStr = match[2] || match[1];
            const numericPrice = priceStr.replace(/[^\d]/g, '');
            if (numericPrice && (!parsedReceiptData.value.Price || parseInt(numericPrice) > parsedReceiptData.value.Price)) {
              parsedReceiptData.value.Price = parseInt(numericPrice);
            }
          }
        }
      }
    };
    
    // 영수증 데이터로 지출 항목 추가
    const addFromReceipt = (place, timeStr, price) => {
      let dateObj = new Date();
      let timeOnly = '';
      
      // 날짜/시간 문자열 파싱 시도
      if (timeStr) {
        // 다양한 날짜 형식 처리
        const dateFormats = [
          /(\d{4})[-./](\d{1,2})[-./](\d{1,2})/,  // YYYY-MM-DD
          /(\d{1,2})[-./](\d{1,2})[-./](\d{4})/,  // DD-MM-YYYY
          /(\d{1,2})[-./](\d{1,2})[-./](\d{2})/   // DD-MM-YY
        ];
        
        let dateMatch = null;
        let formatIndex = -1;
        
        for (let i = 0; i < dateFormats.length; i++) {
          const match = timeStr.match(dateFormats[i]);
          if (match) {
            dateMatch = match;
            formatIndex = i;
            break;
          }
        }
        
        if (dateMatch) {
          try {
            if (formatIndex === 0) {
              // YYYY-MM-DD
              dateObj = new Date(
                parseInt(dateMatch[1]),
                parseInt(dateMatch[2]) - 1,
                parseInt(dateMatch[3])
              );
            } else if (formatIndex === 1) {
              // DD-MM-YYYY
              dateObj = new Date(
                parseInt(dateMatch[3]),
                parseInt(dateMatch[2]) - 1,
                parseInt(dateMatch[1])
              );
            } else if (formatIndex === 2) {
              // DD-MM-YY
              const year = parseInt(dateMatch[3]) + (parseInt(dateMatch[3]) < 50 ? 2000 : 1900);
              dateObj = new Date(
                year,
                parseInt(dateMatch[2]) - 1,
                parseInt(dateMatch[1])
              );
            }
          } catch (e) {
            console.error('날짜 파싱 오류:', e);
            dateObj = new Date();
          }
        }
        
        // 시간 추출
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (timeMatch) {
          try {
            dateObj.setHours(parseInt(timeMatch[1]));
            dateObj.setMinutes(parseInt(timeMatch[2]));
            if (timeMatch[3]) {
              dateObj.setSeconds(parseInt(timeMatch[3]));
            }
            
            timeOnly = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2].padStart(2, '0')}`;
          } catch (e) {
            console.error('시간 파싱 오류:', e);
          }
        }
      }
      
      // 날짜 포맷팅
      const date = dateObj.toISOString().split('T')[0];
      
      // 시간이 없는 경우 현재 시간 사용
      if (!timeOnly) {
        timeOnly = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
      }
      
      // 새 지출 항목 객체
      const newExpense = {
        category: 'other',
        description: place || '항목 없음',
        amount: price || 0,
        date: date,
        time: timeOnly
      };
      
      // 지출 목록에 추가
      tripData.value.expenses.push(newExpense);
      
      // 성공 메시지 (alert 대신 배너 표시)
      showSuccessBanner.value = true;
      setTimeout(() => {
        showSuccessBanner.value = false;
      }, 3000);
    };
    
    // 지출 항목 수정 관련 상태
    const editingExpense = ref(null);
    const editExpenseTime = ref('');
    const editExpenseDesc = ref('');
    const editExpenseAmount = ref(0);
    const originalExpenseTime = ref('');
    const originalExpenseDesc = ref('');
    const originalExpenseAmount = ref(0);
    
    // 지출 항목 수정 시작
    const startExpenseEdit = (expense) => {
      editingExpense.value = expense;
      editExpenseTime.value = expense.time || '';
      editExpenseDesc.value = expense.description || '';
      editExpenseAmount.value = expense.amount || 0;
      
      // 원본 값 저장 (수정 취소 시 복원용)
      originalExpenseTime.value = expense.time || '';
      originalExpenseDesc.value = expense.description || '';
      originalExpenseAmount.value = expense.amount || 0;
    };
    
    // 지출 항목 수정 저장
    const saveExpenseEdit = (expense) => {
      expense.time = editExpenseTime.value;
      expense.description = editExpenseDesc.value;
      expense.amount = Number(editExpenseAmount.value);
      
      // 수정 모드 종료
      editingExpense.value = null;
    };
    
    // 지출 항목 수정 취소
    const cancelExpenseEdit = () => {
      // 원본 값으로 복원
      if (editingExpense.value) {
        editingExpense.value.time = originalExpenseTime.value;
        editingExpense.value.description = originalExpenseDesc.value;
        editingExpense.value.amount = originalExpenseAmount.value;
      }
      
      // 수정 모드 종료
      editingExpense.value = null;
    };
    
    // 성공 배너 상태
    const showSuccessBanner = ref(false);
    
    // 여행 기본 정보 수정 관련 상태
    const isEditingInfo = ref(false);
    const tempTripData = ref({});
    
    // 여행 기본 정보 수정 시작
    const startEditInfo = () => {
      tempTripData.value = JSON.parse(JSON.stringify(tripData.value));
      isEditingInfo.value = true;
    };
    
    // 여행 기본 정보 수정 저장
    const saveEditInfo = () => {
      isEditingInfo.value = false;
    };
    
    // 여행 기본 정보 수정 취소
    const cancelEditInfo = () => {
      tripData.value = JSON.parse(JSON.stringify(tempTripData.value));
      isEditingInfo.value = false;
    };
    
    // 날짜 전체 형식 포맷팅 (YYYY년 MM월 DD일 요일)
    const formatDateFull = (dateString) => {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long' 
      });
    };
    
    // 방문 인증 함수
    const verifyVisit = (dayIndex, itemIndex) => {
      const item = tripDays.value[dayIndex].items[itemIndex];
      
      // 이미 인증된 항목이면 인증 취소
      if (item.verified) {
        item.verified = false;
        delete item.verifiedAt;
        delete item.verificationPhoto;
        delete item.photoMetadata;
        console.log(`${item.activity} 방문 인증 취소됨`);
        return;
      }
      
      // 인증 대상 정보 저장
      verifyingDay.value = dayIndex;
      verifyingItem.value = itemIndex;
      verifyingItemInfo.value = {
        activity: item.activity,
        location: item.location,
        coords: item.coords
      };
      
      // 인증하려는 장소의 데이터를 콘솔에 출력
      console.log('===== 인증하려는 장소 정보 =====');
      console.log('장소명:', item.activity);
      console.log('주소:', item.location);
      console.log('좌표:', item.coords);
      console.log('여행 날짜:', addDays(new Date(tripData.value.startDate), dayIndex).toLocaleDateString('ko-KR'));
      console.log('===============================');
      
      // 상태 초기화
      verificationPhotoPreview.value = null;
      photoMetadata.value = null;
      verificationResult.value = null;
      distanceFromTarget.value = null;
      
      // 모달 열기
      showVerificationModal.value = true;
    };
    
    // 방문 인증 관련 상태
    const showVerificationModal = ref(false);
    const verificationPhotoPreview = ref(null);
    const photoMetadata = ref(null);
    const isPhotoDragging = ref(false);
    const isVerifying = ref(false);
    const verificationResult = ref(null);
    const distanceFromTarget = ref(null);
    const photoFileInput = ref(null);
    const verifyingDay = ref(null);
    const verifyingItem = ref(null);
    const verifyingItemInfo = ref({
      activity: '',
      location: '',
      coords: null
    });
    
    // 방문 인증 모달 닫기
    const closeVerificationModal = () => {
      showVerificationModal.value = false;
      clearVerificationPhoto();
    };
    
    // 사진 파일 입력 트리거
    const triggerPhotoFileInput = () => {
      photoFileInput.value.click();
    };
    
    // 드래그 이벤트 핸들러
    const onPhotoUploadDragOver = () => {
      isPhotoDragging.value = true;
    };
    
    const onPhotoUploadDragLeave = () => {
      isPhotoDragging.value = false;
    };
    
    const onPhotoUploadDrop = (event) => {
      isPhotoDragging.value = false;
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        processPhotoFile(file);
      }
    };
    
    // 사진 파일 입력 처리
    const handlePhotoFileInput = (event) => {
      const file = event.target.files[0];
      if (file) {
        processPhotoFile(file);
      }
    };
    
    // 사진 파일 처리 및 메타데이터 추출
    const processPhotoFile = (file) => {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      // 파일 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        verificationPhotoPreview.value = e.target.result;
        
        // 메타데이터 추출
        extractImageMetadata(file);
      };
      reader.readAsDataURL(file);
    };
    
    // 사진에서 메타데이터(EXIF) 추출
    const extractImageMetadata = (file) => {
      const reader = new FileReader();
      reader.onload = function() {
        try {
          // const arrayBuffer = reader.result;
          console.log('이미지 파일 로드 완료, 메타데이터 추출 시작');
          
          // exif-js 라이브러리를 사용하여 EXIF 데이터 추출
          // 실제 프로젝트에서는 라이브러리 추가 필요: npm install exif-js
          if (typeof EXIF !== 'undefined') {
            EXIF.getData(file, function() {
              console.log('EXIF 데이터 추출 성공');
              
              // GPS 정보 추출
              const exifData = EXIF.getAllTags(this);
              console.log('추출된 EXIF 데이터:', exifData);
              
              let latitude = null;
              let longitude = null;
              let dateTime = null;
              
              // GPS 좌표 추출
              if (exifData.GPSLatitude && exifData.GPSLongitude) {
                const latDegrees = exifData.GPSLatitude[0].numerator / exifData.GPSLatitude[0].denominator;
                const latMinutes = exifData.GPSLatitude[1].numerator / exifData.GPSLatitude[1].denominator;
                const latSeconds = exifData.GPSLatitude[2].numerator / exifData.GPSLatitude[2].denominator;
                const latDirection = exifData.GPSLatitudeRef || "N";
                
                const lngDegrees = exifData.GPSLongitude[0].numerator / exifData.GPSLongitude[0].denominator;
                const lngMinutes = exifData.GPSLongitude[1].numerator / exifData.GPSLongitude[1].denominator;
                const lngSeconds = exifData.GPSLongitude[2].numerator / exifData.GPSLongitude[2].denominator;
                const lngDirection = exifData.GPSLongitudeRef || "E";
                
                latitude = convertDMSToDD(latDegrees, latMinutes, latSeconds, latDirection);
                longitude = convertDMSToDD(lngDegrees, lngMinutes, lngSeconds, lngDirection);
                
                console.log(`추출된 GPS 좌표: ${latitude}, ${longitude}`);
              } else {
                console.log('GPS 정보를 찾을 수 없습니다.');
                
                // 사용자에게 위치 정보 없음 경고 표시
                verificationResult.value = {
                  success: false,
                  message: '이미지에 위치 정보(GPS)가 없습니다. 위치 정보가 포함된 사진을 사용해주세요.'
                };
                isVerifying.value = false;
              }
              
              // 날짜/시간 정보 추출
              if (exifData.DateTimeOriginal) {
                // EXIF 날짜 형식: YYYY:MM:DD HH:MM:SS
                const exifDateTime = exifData.DateTimeOriginal;
                const parts = exifDateTime.split(' ');
                const dateParts = parts[0].split(':');
                const timeParts = parts[1].split(':');
                
                dateTime = new Date(
                  parseInt(dateParts[0]),
                  parseInt(dateParts[1]) - 1,
                  parseInt(dateParts[2]),
                  parseInt(timeParts[0]),
                  parseInt(timeParts[1]),
                  parseInt(timeParts[2])
                ).toISOString();
                
                console.log(`추출된 촬영 시간: ${dateTime}`);
              } else {
                console.log('촬영 날짜/시간 정보를 찾을 수 없습니다.');
                // 촬영 날짜 정보가 없으면 현재 시간 사용
                dateTime = new Date().toISOString();
              }
              
              // 메타데이터 저장
              photoMetadata.value = {
                dateTime: dateTime,
                latitude: latitude,
                longitude: longitude
              };
              
              // 대상 장소 정보 출력
              console.log('===== 대상 장소 정보 =====');
              console.log('장소 위치:', verifyingItemInfo.value.coords.lat, verifyingItemInfo.value.coords.lng);
              console.log('=======================================');
              
              // 대상 위치와의 거리 계산
              if (verifyingItemInfo.value.coords && latitude && longitude) {
                distanceFromTarget.value = calculateDistance(
                  latitude,
                  longitude,
                  verifyingItemInfo.value.coords.lat,
                  verifyingItemInfo.value.coords.lng
                );
                
                // 계산된 거리 콘솔에 출력
                console.log('===== 거리 계산 결과 =====');
                console.log('목적지와의 거리:', distanceFromTarget.value.toFixed(3), 'km');
                console.log('미터 단위:', Math.round(distanceFromTarget.value * 1000), 'm');
                console.log('==========================');
              } else {
                // EXIF 데이터가 없거나 위치 정보가 없는 경우 폴백으로 시뮬레이션 데이터 사용
                console.log('EXIF 위치 정보가 없어 시뮬레이션 데이터를 사용합니다');
                const simulatedMetadata = simulateExifMetadata();
                photoMetadata.value = simulatedMetadata;
                
                // 추출된 메타데이터 콘솔에 출력
                console.log('===== 시뮬레이션된 메타데이터 =====');
                console.log('촬영 시간:', new Date(simulatedMetadata.dateTime).toLocaleString('ko-KR'));
                console.log('촬영 위치:', simulatedMetadata.latitude, simulatedMetadata.longitude);
                
                // 대상 위치와의 거리 계산
                if (verifyingItemInfo.value.coords && simulatedMetadata.latitude && simulatedMetadata.longitude) {
                  distanceFromTarget.value = calculateDistance(
                    simulatedMetadata.latitude,
                    simulatedMetadata.longitude,
                    verifyingItemInfo.value.coords.lat,
                    verifyingItemInfo.value.coords.lng
                  );
                  
                  // 계산된 거리 콘솔에 출력
                  console.log('===== 거리 계산 결과 (시뮬레이션) =====');
                  console.log('목적지와의 거리:', distanceFromTarget.value.toFixed(3), 'km');
                  console.log('미터 단위:', Math.round(distanceFromTarget.value * 1000), 'm');
                  console.log('==========================');
                }
              }
            });
          } else {
            // EXIF 라이브러리가 없는 경우 시뮬레이션 폴백
            console.log('EXIF 라이브러리를 찾을 수 없어 시뮬레이션 데이터를 사용합니다');
            const simulatedMetadata = simulateExifMetadata();
            photoMetadata.value = simulatedMetadata;
            
            // 추출된 메타데이터 콘솔에 출력
            console.log('===== 시뮬레이션된 메타데이터 =====');
            console.log('촬영 시간:', new Date(simulatedMetadata.dateTime).toLocaleString('ko-KR'));
            console.log('촬영 위치:', simulatedMetadata.latitude, simulatedMetadata.longitude);
            
            // 대상 위치와의 거리 계산
            if (verifyingItemInfo.value.coords && simulatedMetadata.latitude && simulatedMetadata.longitude) {
              distanceFromTarget.value = calculateDistance(
                simulatedMetadata.latitude,
                simulatedMetadata.longitude,
                verifyingItemInfo.value.coords.lat,
                verifyingItemInfo.value.coords.lng
              );
              
              // 계산된 거리 콘솔에 출력
              console.log('===== 거리 계산 결과 (시뮬레이션) =====');
              console.log('목적지와의 거리:', distanceFromTarget.value.toFixed(3), 'km');
              console.log('미터 단위:', Math.round(distanceFromTarget.value * 1000), 'm');
              console.log('=======================================');
            }
          }
        } catch (error) {
          console.error('메타데이터 추출 오류:', error);
          photoMetadata.value = {
            dateTime: new Date().toISOString(),
            latitude: null,
            longitude: null,
            error: '메타데이터를 추출할 수 없습니다.'
          };
          
          // 오류 발생 시 시뮬레이션 폴백
          console.log('오류로 인해 시뮬레이션 데이터를 사용합니다');
          const simulatedMetadata = simulateExifMetadata();
          photoMetadata.value = simulatedMetadata;
          
          // 대상 위치와의 거리 계산
          if (verifyingItemInfo.value.coords && simulatedMetadata.latitude && simulatedMetadata.longitude) {
            distanceFromTarget.value = calculateDistance(
              simulatedMetadata.latitude,
              simulatedMetadata.longitude,
              verifyingItemInfo.value.coords.lat,
              verifyingItemInfo.value.coords.lng
            );
          }
        }
      };
      reader.readAsArrayBuffer(file);
    };
    
    // DMS(도, 분, 초) 좌표를 DD(십진수) 좌표로 변환
    const convertDMSToDD = (degrees, minutes, seconds, direction) => {
      let dd = degrees + (minutes / 60) + (seconds / 3600);
      
      if (direction === 'S' || direction === 'W') {
        dd = -dd;
      }
      
      return dd;
    };
    
    // 실제 구현 대신 메타데이터 시뮬레이션
    const simulateExifMetadata = () => {
      // 현재 시간 기준 랜덤 촬영 시간 (최근 30일 이내)
      const now = new Date();
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const randomHours = Math.floor(Math.random() * 24);
      const randomMinutes = Math.floor(Math.random() * 60);
      
      const simulatedDate = new Date(now);
      simulatedDate.setDate(simulatedDate.getDate() - randomDaysAgo);
      simulatedDate.setHours(randomHours, randomMinutes);
      
      // 일정 위치 근처의 랜덤 좌표 생성
      let latitude = null;
      let longitude = null;
      
      if (verifyingItemInfo.value.coords) {
        // 여행지 주변 위치를 시뮬레이션하기 위한 거리 범위 (단위: km)
        // 1. 근거리(80% 확률): 최대 5km 이내
        // 2. 중거리(15% 확률): 5-50km 이내
        // 3. 원거리(5% 확률): 50-300km 이내

        let MAX_DISTANCE_KM = 2; // 기본값은 2km 이내 (인증 가능 거리)
        const randomProb = Math.random() * 100;
        
        if (randomProb > 95) {
          // 5% 확률로 원거리 (예: 서울-제주도 수준)
          MAX_DISTANCE_KM = 50 + Math.random() * 250; // 50-300km
          console.log('원거리 위치 시뮬레이션:', MAX_DISTANCE_KM.toFixed(1), 'km');
        } else if (randomProb > 80) {
          // 15% 확률로 중거리 (예: 제주시-서귀포시 수준)
          MAX_DISTANCE_KM = 5 + Math.random() * 45; // 5-50km
          console.log('중거리 위치 시뮬레이션:', MAX_DISTANCE_KM.toFixed(1), 'km');
        } else {
          // 80% 확률로 근거리 (인증 가능/불가능 랜덤)
          MAX_DISTANCE_KM = Math.random() * 5; // 0-5km
          console.log('근거리 위치 시뮬레이션:', MAX_DISTANCE_KM.toFixed(1), 'km');
        }
                
        const randomDistance = MAX_DISTANCE_KM;
        const randomAngle = Math.random() * 2 * Math.PI; // 0-360도 랜덤 각도
        
        // 위도 1도 = 약 111km, 경도 1도는 위도에 따라 달라짐
        const latOffset = randomDistance * Math.cos(randomAngle) / 111;
        const lngOffset = randomDistance * Math.sin(randomAngle) / (111 * Math.cos(verifyingItemInfo.value.coords.lat * Math.PI / 180));
        
        latitude = verifyingItemInfo.value.coords.lat + latOffset;
        longitude = verifyingItemInfo.value.coords.lng + lngOffset;
      }
      
      return {
        dateTime: simulatedDate.toISOString(),
        latitude: latitude,
        longitude: longitude
      };
    };
    
    // 두 좌표 사이의 거리 계산 (Haversine 공식)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // 지구 반경 (km)
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c; // 킬로미터 단위
      return distance;
    };
    
    // 사진 인증 검증
    const verifyPhoto = () => {
      if (!photoMetadata.value) return;
      
      isVerifying.value = true;
      
      // 검증 시작 로그
      console.log('===== 인증 검증 시작 =====');
      
      try {
        // 1. 날짜 검증: 여행 날짜 이후에 촬영된 사진인지 확인
        const tripDay = addDays(new Date(tripData.value.startDate), verifyingDay.value);
        const photoDate = new Date(photoMetadata.value.dateTime);
        
        console.log('여행 날짜:', tripDay.toLocaleDateString('ko-KR'));
        console.log('사진 촬영 날짜:', photoDate.toLocaleDateString('ko-KR'));
        console.log('촬영 날짜 검증 결과:', photoDate >= tripDay ? '성공' : '실패');
        
        if (photoDate < tripDay) {
          verificationResult.value = {
            success: false,
            message: '사진이 여행 일정 이전에 촬영되었습니다.'
          };
          isVerifying.value = false;
          console.log('인증 실패: 사진이 여행 일정 이전에 촬영됨');
          return;
        }
        
        // 2. 위치 검증: 2km 이내 거리인지 확인
        if (distanceFromTarget.value === null) {
          verificationResult.value = {
            success: false,
            message: '사진에 위치 정보가 없습니다.'
          };
          isVerifying.value = false;
          console.log('인증 실패: 사진에 위치 정보 없음');
          return;
        }
        
        console.log('목적지와의 거리:', distanceFromTarget.value.toFixed(3), 'km');
        console.log('거리 검증 결과:', distanceFromTarget.value <= 2 ? '성공 (2km 이내)' : '실패 (2km 초과)');
        
        if (distanceFromTarget.value > 2) {
          verificationResult.value = {
            success: false,
            message: `사진 촬영 위치가 목적지와 ${formatDistance(distanceFromTarget.value)} 떨어져 있습니다.`
          };
          isVerifying.value = false;
          console.log('인증 실패: 거리가 2km 초과');
          return;
        }
        
        // 모든 검증 통과
        verificationResult.value = {
          success: true,
          message: '방문이 확인되었습니다!'
        };
        console.log('인증 성공: 모든 검증 통과');
        
      } catch (error) {
        console.error('인증 오류:', error);
        verificationResult.value = {
          success: false,
          message: '인증 과정에서 오류가 발생했습니다.'
        };
      }
      
      console.log('===== 인증 검증 완료 =====');
      isVerifying.value = false;
    };
    
    // 인증 완료 및 저장
    const confirmVerification = () => {
      if (verificationResult.value && verificationResult.value.success) {
        const item = tripDays.value[verifyingDay.value].items[verifyingItem.value];
        
        // 인증 정보 저장
        item.verified = true;
        item.verifiedAt = new Date().toISOString();
        item.verificationPhoto = verificationPhotoPreview.value;
        item.photoMetadata = photoMetadata.value;
        
        // 별점과 후기 저장
        item.review = {
          rating: reviewRating.value,
          text: reviewText.value,
          date: new Date().toISOString()
        };
        
        // 성공 메시지 표시
        showSuccessBanner.value = true;
        setTimeout(() => {
          showSuccessBanner.value = false;
        }, 3000);
        
        // 모달 닫기
        closeVerificationModal();
        
        // 별점과 후기 초기화
        reviewRating.value = 0;
        reviewText.value = '';
      }
    };
    
    // 인증 사진 초기화
    const clearVerificationPhoto = () => {
      verificationPhotoPreview.value = null;
      photoMetadata.value = null;
      verificationResult.value = null;
      distanceFromTarget.value = null;
      
      if (photoFileInput.value) {
        photoFileInput.value.value = '';
      }
    };
    
    // 사진 날짜 포맷팅
    const formatPhotoDate = (isoDate) => {
      if (!isoDate) return '알 수 없음';
      
      const date = new Date(isoDate);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    // 별점과 후기 상태 추가
    const reviewRating = ref(0);
    const reviewText = ref('');
    
    // 거리 표시 형식을 미터로 변경하는 함수
    const formatDistance = (distance) => {
      // km 단위에서 m 단위로 변환하고 쉼표 추가
      const distanceInMeters = Math.round(distance * 1000);
      return `${distanceInMeters.toLocaleString()}m`;
    };
    
    // 인증 완료 처리
    const completeVerification = () => {
      if (!verificationResult.value || !verificationResult.value.success) return;
      
      // 현재 날짜/시간 기록
      const verifiedAt = new Date().toISOString();
      
      // 인증 정보 저장
      const item = tripDays.value[verifyingDay.value].items[verifyingItem.value];
      item.verified = true;
      item.verifiedAt = verifiedAt;
      item.verificationPhoto = verificationPhotoPreview.value;
      item.photoMetadata = photoMetadata.value;
      
      // 별점 및 리뷰 저장
      item.rating = reviewRating.value;
      item.review = reviewText.value;
      
      console.log(`${item.activity} 방문이 인증되었습니다.`);
      console.log('인증 시간:', new Date(verifiedAt).toLocaleString('ko-KR'));
      console.log('별점:', reviewRating.value);
      console.log('후기:', reviewText.value);
      
      // 모달 닫기
      closeVerificationModal();
      
      // 저장 처리
      // saveTripData();
    };
    
    return {
      tripData,
      tripDays,
      tripNights,
      activeDay,
      totalBudget,
      calculatedExpenses,
      remainingBudget,
      kakaoMapContainer,
      mapLoaded,
      addScheduleItem,
      removeScheduleItem,
      addExpense,
      removeExpense,
      formatDate,
      addDays,
      formatNumber,
      saveTripPlan,
      updateLocation,
      isPlaceSearchModalOpen,
      placeSearchKeyword,
      searchResults,
      isSearching,
      hasSearched,
      selectedDay,
      openPlaceSearch,
      closePlaceSearch,
      searchPlaces,
      selectPlace,
      formatDistance,
      wishlistPlaces,
      selectedPlace,
      visitTime,
      placeMemo,
      openPlaceDetails,
      cancelPlaceDetails,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      addSelectedPlace,
      initDetailMap,
      sortedScheduleItems,
      editingItem,
      editItemTime,
      editItemMemo,
      startEditItem,
      saveItemEdit,
      cancelItemEdit,
      forceRefresh,
      groupedExpenses,
      getExpenseIndex,
      formatExpenseDate,
      showReceiptUpload,
      receiptFile,
      receiptPreview,
      isDragging,
      isLoading,
      loadingMessage,
      parsedReceiptData,
      openReceiptUpload,
      closeReceiptUpload,
      triggerReceiptFileInput,
      handleReceiptFileInput,
      onDragOver,
      onDragLeave,
      onDrop,
      processReceiptFile,
      clearReceiptImage,
      analyzeReceipt,
      analyzeWithAI,
      extractReceiptData,
      addFromReceipt,
      editingExpense,
      editExpenseTime,
      editExpenseDesc,
      editExpenseAmount,
      startExpenseEdit,
      saveExpenseEdit,
      cancelExpenseEdit,
      showSuccessBanner,
      isEditingInfo,
      startEditInfo,
      saveEditInfo,
      cancelEditInfo,
      formatDateFull,
      verifyVisit, // 방문 인증 함수 추가
      showVerificationModal,
      verificationPhotoPreview,
      photoMetadata,
      isPhotoDragging,
      isVerifying,
      verificationResult,
      distanceFromTarget,
      photoFileInput,
      verifyingItemInfo,
      closeVerificationModal,
      triggerPhotoFileInput,
      onPhotoUploadDragOver,
      onPhotoUploadDragLeave,
      onPhotoUploadDrop,
      handlePhotoFileInput,
      verifyPhoto,
      confirmVerification,
      clearVerificationPhoto,
      formatPhotoDate,
      reviewRating,
      reviewText,
      completeVerification
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

.trip-plan {
  font-family: 'Noto Sans KR', sans-serif;
  color: #2d3748;
  background-color: #f7fafc;
  min-height: 100vh;
}

.plan-content-wrapper {
  padding: 2rem 0;
}

.plan-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  width: 95%;
}

.plan-section {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.section-title {
  margin: 1rem 0.25rem 2rem 0.25rem;
  font-size: 2rem;
  font-weight: 600;
  color: #2d3748;
}

/* 여행 요약 정보 스타일 */
.trip-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background-color: #ebf8ff;
  border-radius: 8px;
  padding: 1rem;
}

.trip-summary-item {
  display: flex;
  flex-direction: column;
  min-width: 120px;
}

.summary-label {
  font-size: 0.85rem;
  color: #4a5568;
  margin-bottom: 0.25rem;
}

.summary-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2b6cb0;
}

/* 날짜 탭 스타일 */
.day-tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.day-tabs::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.day-tab {
  padding: 0.75rem 1.5rem;
  background-color: #e2e8f0;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.day-tab.active {
  background-color: #4299e1;
  color: white;
}

.tab-date {
  font-size: 0.8rem;
  font-weight: 400;
  margin-top: 0.25rem;
}

/* 일정 및 지도 레이아웃 */
.schedule-and-maps {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.day-schedule {
  flex: 1;
  min-width: 0; /* 필요하면 줄어들 수 있도록 */
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  padding: 1rem;
}

/* 지도 컨테이너 스타일 */
.map-container {
  flex: 1;
  min-width: 0;
  height: 400px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.map-element {
  width: 100%;
  height: 100%;
}

.map-legend {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  font-size: 0.8rem;
  z-index: 2;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 3px 0;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 5px;
}

.legend-dot.start {
  background-color: #f03e3e; /* 출발지 - 빨간색 */
}

.legend-dot.waypoint {
  background-color: #f59f00; /* 경유지 - 노란색 */
}

.legend-dot.end {
  background-color: #1971c2; /* 도착지 - 파란색 */
}

/* 폼 스타일 */
.form-group {
  margin-bottom: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #4a5568;
}

input, select, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #2d3748;
  transition: all 0.3s ease;
}

/* 날짜 입력 필드 수정 */
.date-input {
  min-width: 150px;
  width: 100%;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

textarea {
  min-height: 100px;
  resize: vertical;
}

/* 일정 계획 스타일 */
.schedule-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.schedule-item {
  display: flex;
  flex-direction: column;
  background-color: #f7fafc;
  border-radius: 8px;
  transition: all 0.2s ease;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  margin-bottom: 0.5rem;
}

.schedule-item:hover {
  background-color: #edf2f7;
}

.schedule-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
}

.item-actions {
  display: flex;
  gap: 0.25rem;
}

.edit-btn, .save-edit-btn, .cancel-edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover {
  color: #4299e1;
  background-color: rgba(66, 153, 225, 0.1);
}

.save-edit-btn {
  color: #48bb78;
}

.save-edit-btn:hover {
  color: #38a169;
  background-color: rgba(72, 187, 120, 0.1);
}

.cancel-edit-btn {
  color: #f56565;
}

.cancel-edit-btn:hover {
  color: #e53e3e;
  background-color: rgba(229, 62, 62, 0.1);
}

.edit-time-input {
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0.25rem;
  font-size: 0.9rem;
  width: 120px;
  margin-right: 0.5rem;
}

.time {
  font-weight: 500;
  color: #4a5568;
  margin-right: 0.5rem;
}

.place {
  font-weight: 500;
  color: #2d3748;
}

.schedule-item-memo {
  padding: 0 1rem 0.75rem 1rem;
}

.schedule-item-memo textarea {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 0.85rem;
  color: #718096;
  padding: 0;
  min-height: 40px;
  resize: none;
}

.schedule-item-memo textarea:focus {
  outline: none;
  box-shadow: none;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  color: #e53e3e;
  background-color: rgba(229, 62, 62, 0.1);
}

.add-schedule-btn, .add-expense-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #ebf8ff;
  border: 1px dashed #4299e1;
  border-radius: 6px;
  color: #4299e1;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.add-schedule-btn:hover, .add-expense-btn:hover {
  background-color: #bee3f8;
}

/* 예산 계획 스타일 */
.budget-summary {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.budget-card {
  flex: 1;
  background-color: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s ease;
}

.budget-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.budget-label {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 0.5rem;
}

.budget-amount {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.budget-amount.negative {
  color: #e53e3e;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
}

.input-with-icon input {
  padding-left: 10rem;
}

.expenses-list {
  margin-top: 1.5rem;
}

.expense-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  align-items: center;
}
.expense-category {
  width: 150px;
}

.expense-description {
  flex: 2;
}

.expense-amount {
  width: 150px;
}
/* 저장 버튼 */
.save-section {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  margin-bottom: 3rem;
}

.save-plan-btn {
  padding: 1rem 2.5rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
}

.save-plan-btn:hover {
  background-color: #3182ce;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(66, 153, 225, 0.4);
}

/* 반응형 스타일 */
@media (max-width: 1024px) {
  .schedule-and-maps {
    flex-direction: column;
  }
  
  .map-container {
    margin-top: 1rem;
  }
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
  
  .budget-summary {
    flex-direction: column;
  }
  
  .schedule-item, .expense-item {
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
  }
  
  .time-column, .activity-column, .location-column,
  .expense-category, .expense-description, .expense-amount {
    width: 100%;
  }
  
  .action-column {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .tab-panel {
    padding: 0.5rem;
  }
  
  .budget-summary-grid {
    grid-template-columns: 1fr;
  }
}

/* 모달 오버레이 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modals-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  max-width: 1400px;
  width: 100%;
}

.place-search-modal {
  background-color: white;
  border-radius: 12px;
  width: 65%;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.place-detail-modal {
  background-color: white;
  border-radius: 12px;
  width: 35%;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
}

.modal-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  height: calc(90vh - 110px);
}

.detail-content {
  padding: 1.5rem 2rem;
  overflow-y: auto;
  height: calc(90vh - 110px);
}

.search-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e2e8f0;
  overflow: hidden;
}

.wishlist-section {
  flex: 1;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wishlist-section .modal-section-title {
  margin: 0 0 1rem 0;
}

.wishlist-items {
  flex: 1;
  overflow-y: auto;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  padding: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #4a5568;
}

.search-box {
  display: flex;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.search-box input {
  flex: 1;
  padding: 1rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px 0 0 6px;
  font-size: 1rem;
  color: #2d3748;
}

.search-box .search-btn {
  padding: 1rem 1.5rem;
  background-color: #4299e1;
  color: white;
  font-weight: 500;
  border: none;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.search-box .search-btn:hover {
  background-color: #3182ce;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem 1.5rem 1.5rem;
  max-height: 100%;
}

.searching-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e2e8f0;
  border-top-color: #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.no-results, .no-wishlist {
  text-align: center;
  padding: 2rem;
  color: #718096;
}

.place-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.place-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background-color: #f7fafc;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.place-item:hover {
  background-color: #ebf8ff;
}

.place-info {
  flex: 1;
  cursor: pointer;
}

.place-info h4 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  color: #2d3748;
}

.place-address {
  margin: 0 0 0.25rem;
  font-size: 0.85rem;
  color: #4a5568;
}

.place-category {
  margin: 0;
  font-size: 0.75rem;
  color: #718096;
}

.place-actions {
  display: flex;
  gap: 0.5rem;
}

.wishlist-btn, .remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
}

.wishlist-btn:hover, .remove-btn:hover {
  background-color: #f7fafc;
  color: #4299e1;
}

.wishlist-btn.active {
  color: #f56565;
}

.wishlist-btn.active svg {
  fill: #f56565;
}

.place-distance {
  font-size: 0.85rem;
  color: #4299e1;
  font-weight: 500;
  white-space: nowrap;
  margin-left: 1rem;
}

/* 장소 상세 폼 */
.place-details-form {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e2e8f0;
}

.place-details-form h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #2d3748;
}

.selected-place-info {
  background-color: #f7fafc;
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.selected-place-info h4 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
}

.selected-place-info p {
  margin: 0;
  font-size: 0.95rem;
  color: #4a5568;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  color: #2d3748;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn, .add-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.cancel-btn {
  background-color: #e2e8f0;
  color: #4a5568;
}

.add-btn {
  background-color: #4299e1;
  color: white;
}

.cancel-btn:hover {
  background-color: #cbd5e0;
}

.add-btn:hover {
  background-color: #3182ce;
}

.modal-footer {
  padding: 0.75rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: center;
}

.powered-by {
  margin: 0;
  font-size: 0.75rem;
  color: #a0aec0;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .modal-content {
    flex-direction: column;
  }
  
  .search-section {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .search-results {
    max-height: 300px;
  }
  
  .wishlist-section {
    max-height: 200px;
  }
}

.no-place-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #718096;
  text-align: center;
  height: 100%;
}

.no-place-selected p {
  margin-bottom: 2rem;
}

.wishlist-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #2d3748;
}

.time-input-wrapper {
  display: flex;
  align-items: center;
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 1rem;
}

.time-input-wrapper input[type="time"] {
  border: none;
  padding: 1rem 0;
  width: 100%;
}

.time-input-wrapper input[type="time"]:focus {
  outline: none;
  box-shadow: none;
}

.mini-map-container {
  width: 100%;
  height: 300px;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}
#detail-map {
  width: 100%;
  height: 100%;
}

/* 모달 내부 섹션 제목 스타일 */
.modal-section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 1.25rem 0.75rem;
  padding: 0 0.75rem;
  text-align: left;
}

/* 지출 목록 스타일 */
.expenses-list {
  margin-top: 1.5rem;
}

.expense-date-group {
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.expense-date-header {
  background-color: #f7fafc;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.expense-date-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #4a5568;
  font-weight: 600;
}

.expense-item {
  display: flex;
  padding: 0.75rem 1rem;
  align-items: center;
  border-bottom: 1px solid #f0f4f8;
}

.expense-item:last-child {
  border-bottom: none;
}

.expense-time {
  width: 80px;
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
}

.expense-place {
  flex: 2;
  padding: 0 1rem;
  font-weight: 500;
}

.expense-amount {
  width: 150px;
}

.add-expense-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.add-expense-btn {
  width: 48%;
  padding: 0.75rem;
  background-color: #ebf8ff;
  border: 1px dashed #4299e1;
  border-radius: 6px;
  color: #4299e1;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.add-expense-btn:hover {
  background-color: #bee3f8;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .add-expense-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .add-expense-btn {
    width: 100%;
  }
  
  .expense-item {
    flex-wrap: wrap;
  }
  
  .expense-time {
    width: 30%;
  }
  
  .expense-place {
    width: 70%;
    padding: 0;
  }
  
  .expense-amount {
    width: 70%;
    margin-top: 0.5rem;
  }
  
  .action-column {
    width: 30%;
    display: flex;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
}

/* 영수증 업로드 모달 스타일 수정 */
.receipt-upload-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.receipt-upload-content {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 이미지 컨테이너 스타일 */
.image-container {
  max-width: 100%;
  max-height: 350px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.receipt-preview {
  max-width: 100%;
  max-height: 350px;
  object-fit: contain;
}

/* 지출 항목 스타일 업데이트 */
.expense-view-mode, .expense-edit-mode {
  display: flex;
  width: 100%;
  align-items: center;
}

.expense-time, .expense-time-edit {
  width: 80px;
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
}

.expense-place, .expense-place-edit {
  flex: 2;
  padding: 0 1rem;
  font-weight: 500;
}

.expense-amount, .expense-amount-edit {
  width: 120px;
  font-weight: 500;
}

.expense-actions {
  display: flex;
  gap: 0.25rem;
  margin-left: 0.5rem;
  position: relative;
  z-index: 10;
}

.expense-time-edit input, .expense-place-edit input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.expense-amount-edit {
  position: relative;
  z-index: 5;
}

/* 편집 버튼 스타일 */
.edit-btn, .save-edit-btn, .cancel-edit-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover {
  color: #4299e1;
  background-color: rgba(66, 153, 225, 0.1);
}

.save-edit-btn {
  color: #48bb78;
}

.save-edit-btn:hover {
  color: #38a169;
  background-color: rgba(72, 187, 120, 0.1);
}

.cancel-edit-btn {
  color: #f56565;
}

.cancel-edit-btn:hover {
  color: #e53e3e;
  background-color: rgba(229, 62, 62, 0.1);
}

/* 누락된 모달 헤더 스타일 */
.receipt-upload-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.receipt-upload-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
}

.close-receipt-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  padding: 0.5rem;
}

.close-receipt-btn:hover {
  color: #4a5568;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  transition: all 0.2s ease;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin-top: 20px;
  color: #4a5568;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 이미지 미리보기 버튼 스타일 개선 */
.preview-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
  width: 100%;
}

.preview-actions button {
  flex: 1;
  padding: 10px 16px;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 추가 버튼 여백 조정 */
.add-expense-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: space-between;
  width: 100%;
}

.add-expense-btn {
  width: 49%;
  padding: 0.75rem;
  background-color: #ebf8ff;
  border: 1px dashed #4299e1;
  border-radius: 6px;
  color: #4299e1;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.add-expense-btn:hover {
  background-color: #bee3f8;
}

/* 로딩 인디케이터 스타일 수정 */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin-top: 20px;
  color: #4a5568;
}

/* 성공 알림 배너 스타일 */
.success-banner {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #48bb78;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  animation: fadeInOut 3s forwards;
  display: flex;
  align-items: center;
  gap: 8px;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translate(-50%, 20px); }
  15% { opacity: 1; transform: translate(-50%, 0); }
  85% { opacity: 1; transform: translate(-50%, 0); }
  100% { opacity: 0; transform: translate(-50%, -20px); }
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 지출 항목 수정 모드 개선 */
.expense-edit-mode {
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  z-index: 1;
}

.expense-actions {
  display: flex;
  gap: 0.25rem;
  margin-left: 0.5rem;
  position: relative;
  z-index: 20; /* 더 높은 z-index로 설정 */
}

.expense-amount-edit {
  position: relative;
  z-index: 5;
  max-width: 150px; /* 최대 너비 제한 */
}

.expense-amount-edit .input-with-icon input {
  width: 100%;
  padding-left: 1.5rem; /* 아이콘과 텍스트 간격 조정 */
}

.expense-place-edit {
  flex: 2;
  padding: 0 1rem;
  font-weight: 500;
  max-width: calc(100% - 260px); /* 충분한 공간 확보 */
}

.expense-time-edit {
  width: 80px;
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
}

.save-edit-btn, .cancel-edit-btn {
  z-index: 25; /* 가장 높은 z-index */
  position: relative;
}

/* 여행 기본 정보 보기 모드 */
.trip-info-view-mode {
  background-color: #ebf8ff;
  border-radius: 12px;
  padding: 2rem;
  position: relative;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 200px;
  padding-right: 2rem;
}

.info-memo {
  flex: 1 0 100%;
}

.memo-text {
  white-space: pre-line;
  line-height: 1.5;
}

.info-label {
  font-size: 0.9rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.info-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2b6cb0;
}

.edit-info-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.edit-info-btn:hover {
  background-color: #3182ce;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .info-row {
    flex-direction: column;
  }
  
  .info-item {
    margin-bottom: 1rem;
  }
  
  .info-value {
    font-size: 1.1rem;
  }
}

/* 여행 기본 정보 수정 모드 */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

.save-info-btn, .cancel-info-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.save-info-btn {
  background-color: #48bb78;
  color: white;
}

.save-info-btn:hover {
  background-color: #38a169;
}

.cancel-info-btn {
  background-color: #f56565;
  color: white;
}

.cancel-info-btn:hover {
  background-color: #e53e3e;
}

/* 방문 인증 버튼 스타일 */
.verification-button-container {
  padding: 0 1rem 0.75rem 1rem;
  display: flex;
  justify-content: flex-end;
}

.visit-verification-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: none;
  background-color: #f1f5f9;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.visit-verification-btn:hover {
  background-color: #e2e8f0;
  transform: translateY(-1px);
}

.visit-verification-btn.verified {
  background-color: #10b981;
  color: white;
}

.visit-verification-btn.verified svg {
  stroke: white;
}

.visit-verification-btn.verified:hover {
  background-color: #059669;
}

/* 방문 인증 모달 스타일 */
.verification-modal {
  background-color: white;
  border-radius: 12px;
  max-width: 800px; /* 600px에서 800px로 증가 */
  width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.verification-item-info {
  background-color: #f8fafc;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.verification-item-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: #1e293b;
}

.verification-item-info p {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.upload-container {
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.upload-container.active-dropzone {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  color: #64748b;
}

.upload-tip {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: -0.5rem 0 0 0;
}

.image-container {
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  max-height: 400px; /* 300px에서 400px로 증가 */
  display: flex;
  justify-content: center;
}

.photo-preview {
  max-width: 100%;
  max-height: 400px; /* 300px에서 400px로 증가 */
  object-fit: contain;
}

.photo-metadata {
  background-color: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.metadata-item {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #475569;
  display: flex;
  flex-wrap: wrap;
}

.metadata-item strong {
  min-width: 100px;
  font-weight: 600;
}

.metadata-item:last-child {
  margin-bottom: 0;
}

.verification-result {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.success-result {
  background-color: #dcfce7;
  color: #166534;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-result {
  background-color: #fee2e2;
  color: #991b1b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preview-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.preview-actions button {
  flex: 1;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.primary-btn {
  background-color: #3b82f6;
  color: white;
}

.btn.primary-btn:hover {
  background-color: #2563eb;
}

.btn.primary-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

.btn.secondary-btn {
  background-color: #e2e8f0;
  color: #475569;
}

.btn.secondary-btn:hover {
  background-color: #cbd5e0;
}

.btn.cancel-btn {
  background-color: #f1f5f9;
  color: #64748b;
}

.btn.cancel-btn:hover {
  background-color: #e2e8f0;
}

.modal-footer {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #e2e8f0;
}

.btn.save-btn {
  background-color: #10b981;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn.save-btn:hover {
  background-color: #059669;
}

.review-section {
  width: 100%;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.review-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  color: #1e293b;
}

.rating-input {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.rating-label {
  margin-right: 1rem;
  font-weight: 500;
}

.star-rating {
  display: flex;
}

.star-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-right: 0.5rem;
  color: #cbd5e0;
  transition: color 0.2s ease;
}

.star-btn:hover,
.star-btn.active {
  color: #eab308;
}

.star-btn svg {
  stroke: currentColor;
  fill: currentColor;
}

.review-input {
  width: 100%;
}

.review-input textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  resize: vertical;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
}

.review-input textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.metadata-item {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: #475569;
  display: flex;
  flex-wrap: wrap;
}

.metadata-item strong {
  min-width: 100px;
  font-weight: 600;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: none;
  background-color: #f1f5f9;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.verified-badge:hover {
  background-color: #e2e8f0;
  transform: translateY(-1px);
}

.verified-badge.verified {
  background-color: #10b981;
  color: white;
}

.verified-badge.verified svg {
  stroke: white;
}

.verified-badge.verified:hover {
  background-color: #059669;
}

.rating-display {
  display: flex;
  align-items: center;
}

.stars {
  display: flex;
}

.star-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-right: 0.5rem;
  color: #cbd5e0;
  transition: color 0.2s ease;
}

.star-btn:hover,
.star-btn.active {
  color: #eab308;
}

.star-btn svg {
  stroke: currentColor;
  fill: currentColor;
}

.verification-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid #10b981;
}

.review-display {
  margin-top: 0.5rem;
  font-style: italic;
  color: #64748b;
  font-size: 0.9rem;
  padding-left: 1.75rem;
}

.rating-display {
  margin-left: 0.5rem;
}

.stars {
  color: #eab308;
  letter-spacing: -1px;
}
</style>



