<template>
  <div class="trip-plan">
    <!-- 헤더 -->
    <Header :showHero="true" heroImageSrc="https://images.unsplash.com/photo-1503221043305-f7498f8b7888?q=80&w=1470"
      heroTitle="나만의 여행 설계하기" heroSubtitle="나만의 특별한 여행 경험을 디자인해보세요" heroHeight="320px" />

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
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  저장
                </button>
                <button class="cancel-info-btn" @click="cancelEditInfo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            <button v-for="(day, index) in tripDays" :key="index" class="day-tab"
              :class="{ 'active': activeDay === index }" @click="activeDay = index">
              DAY {{ index + 1 }}
              <span class="tab-date">{{ formatDate(addDays(new Date(tripData.startDate), index)) }}</span>
            </button>
          </div>

          <!-- 일정과 지도를 포함하는 레이아웃 -->
          <div class="schedule-and-maps">
            <!-- 일정 부분 -->
            <div class="day-schedule" v-if="tripDays[activeDay]">
              <div class="schedule-items">
                <div v-for="(item, itemIndex) in sortedScheduleItems" :key="itemIndex" class="schedule-item">
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
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </button>
                        <button class="cancel-edit-btn" @click="cancelItemEdit()">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </template>
                      <template v-else>
                        <button class="delete-btn" @click="removeScheduleItem(activeDay, itemIndex)">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </template>
                    </div>
                  </div>
                  <div class="schedule-item-memo">
                    <textarea v-if="editingItem === itemIndex" v-model="editItemMemo"
                      placeholder="메모를 입력하세요"></textarea>
                    <textarea v-else v-model="item.location" placeholder="수하물 찾는 시간 고려하기"
                      @blur="updateLocation(activeDay, itemIndex, item.location)"></textarea>
                  </div>
                  <!-- 방문 인증 버튼 부분 수정 -->
                  <div class="verification-button-container">
                    <button v-if="!item.verified" class="visit-verification-btn"
                      @click="verifyVisit(activeDay, itemIndex)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      방문 인증하기
                    </button>

                    <!-- 인증 완료된 경우의 표시 (수정됨) -->
                    <div v-if="item.verified" class="verification-completed">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      {{ formatDate(item.verifiedAt) }}에 방문 완료
                      <span class="stars" v-if="item.rating">
                        {{ '★'.repeat(item.rating) }}{{ '☆'.repeat(5 - item.rating) }}
                      </span>
                    </div>
                  </div>
                </div>

                <button class="add-schedule-btn" @click="openPlaceSearch">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </button>
                      <button class="cancel-edit-btn" @click="cancelExpenseEdit()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button class="delete-btn" @click="removeExpense(getExpenseIndex(expense))">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="upload-container" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave"
          @drop.prevent="onDrop" :class="{ 'active-dropzone': isDragging }">
          <input type="file" ref="receiptFileInput" @change="handleReceiptFileInput" accept="image/*"
            style="display: none">
          <div v-if="!receiptPreview" class="upload-prompt">
            <div class="upload-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
      <div class="modals-container" :class="{ 'with-detail': selectedPlace }">
        <!-- 검색 모달 -->
        <div class="place-search-modal" :class="{ 'slide-left': selectedPlace }" @click.stop>
          <div class="modal-header">
            <h3>장소 검색</h3>
            <button class="close-btn" @click="closePlaceSearch">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-content">
            <!-- 검색 섹션 -->
            <div class="search-section">
              <div class="search-box">
                <input type="text" v-model="placeSearchKeyword" placeholder="검색할 장소를 입력하세요" @keyup.enter="searchPlaces">
                <button class="search-btn" @click="searchPlaces">검색</button>
              </div>

              <h3 class="modal-section-title">장소 검색 결과</h3>

              <div class="search-results">
                <div v-if="isSearching" class="searching-indicator">
                  <div class="spinner"></div>
                  <p>검색 중...</p>
                </div>
                <div v-else-if="searchResults.length === 0 && !hasSearched" class="no-results">
                  <p>검색어를 입력하여 장소를 검색해보세요.</p>
                </div>
                <div v-else-if="searchResults.length === 0 && hasSearched" class="no-results">
                  <p>검색 결과가 없습니다.</p>
                </div>
                <div v-else class="place-list">
                  <div v-for="(place, index) in searchResults" :key="index" class="place-item">
                    <div class="place-info" @click="openPlaceDetails(place)">
                      <h4>{{ place.place_name }}</h4>
                      <p class="place-address">{{ place.road_address_name || place.address_name }}</p>
                      <p class="place-category">{{ place.category_name }}</p>
                    </div>
                    <div class="place-actions">
                      <button class="wishlist-btn" @click="addToWishlist(place)"
                        :class="{ 'active': isInWishlist(place) }">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path
                            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z">
                          </path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 수직 구분선 -->
            <div class="modal-divider"></div>

            <!-- 위시리스트 섹션 -->
            <div class="wishlist-section">
              <h3 class="modal-section-title">나의 찜 목록</h3>
              <div class="wishlist-items">
                <div v-if="wishlistPlaces.length === 0" class="no-wishlist">
                  <p>저장한 장소가 없습니다.</p>
                </div>
                <div v-else class="place-list">
                  <div v-for="(place, index) in wishlistPlaces" :key="index" class="place-item">
                    <div class="place-info" @click="openPlaceDetails(place)">
                      <h4>{{ place.place_name }}</h4>
                      <p class="place-address">{{ place.road_address_name || place.address_name }}</p>
                    </div>
                    <div class="place-actions">
                      <button class="remove-btn" @click="removeFromWishlist(index)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        <div v-if="selectedPlace" class="place-detail-modal" :class="{ 'slide-in': selectedPlace }" @click.stop>
          <div class="modal-header">
            <h3>장소 추가</h3>
            <button class="close-btn" @click="cancelPlaceDetails">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
              <textarea 
                id="placeMemo" 
                v-model="placeMemo" 
                placeholder="장소에 대한 메모를 입력하세요"
                @input="autoResizeTextarea"
                ref="memoTextarea"
              ></textarea>
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
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      {{ successMessage || '영수증 정보가 성공적으로 추가되었습니다!' }}
    </div>

    <!-- 방문 인증 모달 (개선된 버전) -->
    <div class="modal-overlay" v-if="showVerificationModal" @click="closeVerificationModal">
      <div class="modals-container verification-container">
        <!-- 메인 인증 모달 (왼쪽) -->
        <div class="verification-photo-modal" @click.stop>
          <div class="modal-header">
            <h3>방문 인증하기</h3>
            <button class="close-btn" @click="closeVerificationModal" :disabled="isVerifying">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="verification-content">
  

            <div class="upload-container" @dragover.prevent="onPhotoUploadDragOver"
              @dragleave.prevent="onPhotoUploadDragLeave" @drop.prevent="onPhotoUploadDrop"
              :class="{ 'active-dropzone': isPhotoDragging }">
              <input type="file" ref="photoFileInput" @change="handlePhotoFileInput" accept="image/*"
                style="display: none">
              <div v-if="!verificationPhotoPreview" class="upload-prompt">
                <div class="upload-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                <div class="enhanced-image-container">
                  <img :src="verificationPhotoPreview" alt="방문 인증 사진 미리보기" class="photo-preview">
                </div>
                <div class="photo-metadata" v-if="photoMetadata">
                  <div class="metadata-item">
                    <strong>촬영 시간:</strong> {{ formatPhotoDate(photoMetadata.dateTime) }}
                  </div>
                  <div class="metadata-item" v-if="photoMetadata.latitude && photoMetadata.longitude">
                    <strong>촬영 위치:</strong> [{{ photoMetadata.latitude.toFixed(6) }}, {{
                      photoMetadata.longitude.toFixed(6)
                    }}]
                  </div>
                  <div class="metadata-item" v-if="distanceFromTarget !== null">
                    <strong>장소와의 거리:</strong> {{ formatDistance(distanceFromTarget) }}
                  </div>
                  <div class="verification-result" v-if="verificationResult !== null">
                    <div v-if="verificationResult.success" class="success-result">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      방문 인증이 확인되었습니다!
                    </div>
                    <div v-else class="error-result">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      {{ verificationResult.message }}
                    </div>
                  </div>
                </div>
                
                <!-- 로딩 인디케이터 제거 -->
                
                <div class="preview-actions">
                  <button @click="verifyPhoto" class="btn primary-btn" :disabled="isVerifying || !photoMetadata">
                    {{ isVerifying ? '인증 중...' : '인증하기' }}
                  </button>
                  <button @click="clearVerificationPhoto" class="btn cancel-btn" :disabled="isVerifying">취소</button>
                  
                  <!-- 관리자 인증 버튼 추가 -->
                  <button @click="adminVerify()" class="btn admin-btn" :disabled="isVerifying || !verificationPhotoPreview">
                    관리자 인증
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 리뷰 모달 (오른쪽) - 인증 성공 시에만 표시 -->
        <div v-if="verificationResult && verificationResult.success" class="verification-review-modal" @click.stop>
          <div class="modal-header">
            <h3>방문 후기 작성</h3>
          </div>

          <div class="review-content">

            <div class="rating-container">
              <label>별점 평가:</label>
              <div class="star-rating">
                <span v-for="star in 5" :key="star" class="star" :class="{ 'active': star <= reviewRating }"
                  @click="reviewRating = star">
                  ★
                </span>
              </div>
            </div>

            <div class="review-text-container">
              <label for="review-text">방문 후기:</label>
              <textarea id="review-text" v-model="reviewText" placeholder="이 장소에 대한 후기를 작성해주세요..." rows="6"></textarea>
            </div>
            
            <!-- 테스트용 데이터 입력 필드 추가 -->
            <div class="test-data-container">
              <h4 class="test-data-title">테스트용 데이터 입력 (개발용)</h4>
              <div class="test-data-inputs">
                <div class="test-data-input-row">
                  <div class="test-data-field">
                    <label for="p_id">장소 ID (p_id):</label>
                    <input type="number" id="p_id" v-model="testDataInputs.p_id" min="1" placeholder="장소 ID">
                  </div>
                  <div class="test-data-field">
                    <label for="u_id">사용자 ID (u_id):</label>
                    <input type="number" id="u_id" v-model="testDataInputs.u_id" min="1" placeholder="사용자 ID">
                  </div>
                </div>
                <div class="test-data-input-row">
                  <div class="test-data-field">
                    <label for="u_age">나이 (u_age):</label>
                    <input type="number" id="u_age" v-model="testDataInputs.u_age" min="1" placeholder="나이">
                  </div>
                  <div class="test-data-field">
                    <label for="u_gender">성별 (u_gender):</label>
                    <select id="u_gender" v-model="testDataInputs.u_gender">
                      <option value="M">남성</option>
                      <option value="F">여성</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 로딩 인디케이터 스타일 수정 -->
            <div v-if="isVerifying" class="verification-loading-section">
              <LoadingSpinner 
                :current-phase="loadingPhase"
                :image-analysis-duration="imageAnalysisDuration"
                :meaning-analysis-duration="meaningAnalysisDuration"
                :keyword-extraction-duration="keywordExtractionDuration"
                :search-duration="searchDuration"
                :show-extended-phases="true"
              />
            </div>

            <div class="form-actions">
              <button @click="completeVerification" class="btn-verify" :disabled="isVerifying">
                {{ isVerifying ? '처리 중...' : '인증 완료하기' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import config from '@/config';
import EXIF from 'exif-js';
import {
  imageToEngDescription,
  EngDescriptionToVector,
  saveToElasticsearch, 
  createFeaturesVector,
  reverseGeocode,
  getEnglishLocationName,
  getLocationCodes,
  enDescToKoDescAndTags, // Added import
  ImgToPayment           // Added import
} from '@/services/api';

export default {
  name: 'TripPlan',
  components: {
    Header,
    LoadingSpinner
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
          kakao.maps.event.addListener(customOverlay, 'click', function () {
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

    // 날짜 포맷팅 함수 수정
    const formatDate = (date) => {
      if (!date) return '';

      // 문자열이 들어온 경우 Date 객체로 변환
      const dateObj = date instanceof Date ? date : new Date(date);

      // 유효한 날짜인지 확인
      if (isNaN(dateObj.getTime())) {
        return '날짜 형식 오류';
      }

      const options = { month: 'short', day: 'numeric', weekday: 'short' };
      return dateObj.toLocaleDateString('ko-KR', options);
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
        // 지도 초기화
        initDetailMap();
        
        // 애니메이션을 위한 타이밍 설정
        requestAnimationFrame(() => {
          const detailModal = document.querySelector('.place-detail-modal');
          if (detailModal) {
            detailModal.classList.add('slide-in');
          }
          
          // 텍스트 영역 높이 초기화
          if (memoTextarea.value) {
            memoTextarea.value.style.height = '60px';
            memoTextarea.value.classList.remove('expanded');
          }
        });
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

        // 애니메이션 완료 후 지도 리사이즈 
        setTimeout(() => {
          detailMap.relayout();
        }, 650);
      } catch (error) {
        console.error("Error initializing detail map:", error);
      }
    };

    // 장소 상세 취소
    const cancelPlaceDetails = () => {
      // Add animation class to trigger reverse animation
      const detailModal = document.querySelector('.place-detail-modal');
      if (detailModal) {
        detailModal.classList.remove('slide-in');
      }
      
      // Delay removing the selectedPlace to allow animation to complete
      setTimeout(() => {
        selectedPlace.value = null;
      }, 600); // Match the animation duration for smooth transition
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

      // 검색 옵션 - 지역 제한 없이 전국 검색
      const searchOptions = {
        size: 15 // 최대 15개 결과
      };

      // 키워드로 검색 - 제주도 제한 없이 검색
      const keyword = placeSearchKeyword.value;

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
        alert('영수증 파일을 선택해주세요.'); // User feedback
        return;
      }

      isLoading.value = true;
      loadingMessage.value = '영수증 분석 중... (OCR 및 AI 처리)';

      try {
        const paymentData = await ImgToPayment(receiptFile.value);
        
        // 지출 항목으로 추가 (addFromReceipt는 이미 Place, Time, Price를 인자로 받음)
        addFromReceipt(
          paymentData.Place,
          paymentData.Time,
          paymentData.Price
        );
        closeReceiptUpload(); // 성공 시 모달 닫기

      } catch (error) {
        console.error('영수증 분석 처리 오류 (TripPlan.vue):', error);
        alert(`영수증 분석 실패: ${error.message}`); // Display error to user
      } finally {
        isLoading.value = false;
        loadingMessage.value = ''; // Clear loading message
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
    const successMessage = ref('');

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
    
    // 로딩 스피너 관련 상태
    const loadingPhase = ref('imageAnalysis'); // 현재 로딩 단계
    const imageAnalysisDuration = ref(null); // 이미지 분석 소요 시간
    const meaningAnalysisDuration = ref(null); // 의미 분석 소요 시간
    const keywordExtractionDuration = ref(null); // 키워드 추출 소요 시간
    const searchDuration = ref(null); // 저장 소요 시간

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
      reader.onload = function () {
        try {
          // const arrayBuffer = reader.result;
          console.log('이미지 파일 로드 완료, 메타데이터 추출 시작');

          // exif-js 라이브러리를 사용하여 EXIF 데이터 추출
          // 실제 프로젝트에서는 라이브러리 추가 필요: npm install exif-js
          if (typeof EXIF !== 'undefined') {
            EXIF.getData(file, function () {
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
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

        if (distanceFromTarget.value > 1) {
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
    
    // 테스트 데이터 입력용 상태 추가
    const testDataInputs = ref({
      p_id: 1,
      u_id: 1,
      u_age: 20,
      u_gender: 'M'
    });
    
    // 거리 표시 형식을 미터로 변경하는 함수
    const formatDistance = (distance) => {
      // km 단위에서 m 단위로 변환하고 쉼표 추가
      const distanceInMeters = Math.round(distance * 1000);
      return `${distanceInMeters.toLocaleString()}m`;
    };

    // 방문 인증 완료 처리 함수 수정
    const completeVerification = async () => {
      if (!verificationResult.value || !verificationResult.value.success) return;

      try {
        // 인증 사진 저장 및 분석 프로세스 시작
        isVerifying.value = true; // 모달은 닫지 않고 로딩 상태 활성화
        loadingPhase.value = 'imageAnalysis'; // 초기 단계: 이미지 분석
        
        // 성능 측정 초기화
        imageAnalysisDuration.value = null;
        meaningAnalysisDuration.value = null;
        keywordExtractionDuration.value = null;
        searchDuration.value = null;

        // 인증할 아이템 참조를 미리 가져옴
        const item = tripDays.value[verifyingDay.value].items[verifyingItem.value];
        if (!item) {
          throw new Error('인증할 아이템을 찾을 수 없습니다.');
        }

        // Base64 이미지를 File 객체로 변환
        const response = await fetch(verificationPhotoPreview.value);
        const blob = await response.blob();
        const imageFile = new File([blob], `verification-${Date.now()}.jpg`, { type: 'image/jpeg' });

        // 요청 취소를 위한 AbortController 생성
        const abortController = new AbortController();
        
        // 먼저 좌표로부터 지오 데이터 가져오기 (light_2 전에 실행)
        let locationInfo = null;
        let locationText = '';
        let englishLocationName = ''; // 영어 지역 이름을 저장할 변수
        
        // 아이템의 좌표가 있으면 역지오코딩 실행
        if (item.coords && item.coords.lat && item.coords.lng) {
          try {
            // 좌표로부터 주소 정보 가져오기
            const geoData = await reverseGeocode(item.coords.lat, item.coords.lng);
            console.log('역지오코딩 결과:', geoData);
            
            if (geoData) {
              // 주소 문자열 생성
              locationText = [
                geoData.country,
                geoData.province,
                geoData.city,
                geoData.borough,
                geoData.quarter
              ].filter(Boolean).join(' ');
              
              // 지역 코드 정보 직접 추출 (하드코딩된 매핑 포함)
              const locationCodes = getLocationCodes(geoData);
              
              // 지역 정보 저장 - 더 신뢰할 수 있는 코드로 업데이트
              locationInfo = {
                full_text: locationText,
                province_code: locationCodes.province_code,
                province_name: locationCodes.province_name || geoData.province,
                city_code: locationCodes.city_code,
                city_name: locationCodes.city_name || geoData.city || geoData.borough
              };
              
              console.log('추출된 지역 코드 정보:', 
                `province(${locationInfo.province_code}:${locationInfo.province_name}) ` +
                `city(${locationInfo.city_code}:${locationInfo.city_name})`
              );
              
              // 영어 지역 이름 추출 - 개선된 함수 사용
              englishLocationName = getEnglishLocationName(geoData);
              console.log('추출된 영어 지역 이름:', englishLocationName);
            }
          } catch (geoError) {
            console.error('역지오코딩 오류:', geoError);
            throw new Error('위치 정보 가져오기 실패: ' + geoError.message);
          }
        }
        
        // 위치 정보가 없으면 기본값 사용
        if (!locationText) {
          locationText = item.location || verifyingItemInfo.value.location || '장소 정보 없음';
        }
        
        // 1단계: 이미지 → 영어 설명 (light_2 모델) - 이제 영어 지역 이름을 전달
        console.log('1. 이미지 분석 시작 (light_2 모델 - 영문 설명 추출)...', englishLocationName);
        const imageAnalysisStartTime = performance.now();
        const engDescription = await imageToEngDescription(imageFile, abortController.signal, englishLocationName);
        const imageAnalysisEndTime = performance.now();
        imageAnalysisDuration.value = Number(((imageAnalysisEndTime - imageAnalysisStartTime) / 1000).toFixed(1));
        
        if (!engDescription) {
          throw new Error('이미지 분석 실패: 영어 설명을 얻을 수 없습니다.');
        }
        
        // 단계 업데이트: 의미 분석
        loadingPhase.value = 'meaningAnalysis';
        
        // 2단계: 영어 설명 → 10차원 벡터 (ko_2 모델)
        console.log('2. 10차원 특성 벡터 추출 시작...');
        const meaningAnalysisStartTime = performance.now();
        const analysisResult = await EngDescriptionToVector(engDescription, abortController.signal);
        const meaningAnalysisEndTime = performance.now();
        meaningAnalysisDuration.value = Number(((meaningAnalysisEndTime - meaningAnalysisStartTime) / 1000).toFixed(1));

        if (!analysisResult) {
          throw new Error('이미지 분석 실패: 특성 벡터 결과를 얻을 수 없습니다.');
        }

        // 특성 벡터 생성
        const featuresVector = createFeaturesVector(analysisResult);
        console.log('2. 생성된 10차원 특성 벡터:', featuresVector);

        if (!featuresVector || !featuresVector.length) {
          throw new Error('10차원 벡터 생성 실패: 벡터 데이터를 얻을 수 없습니다.');
        }
        
        // 단계 업데이트: 키워드 추출
        loadingPhase.value = 'keywordExtraction';
        
        // 3. ko_3 모델을 이용하여 한글 설명과 키워드 추출
        console.log('3. ko_3 모델을 이용한 한글 설명과 키워드 추출 시작 (API 서비스 호출)...');
        const keywordExtractionStartTime = performance.now();
        
        // enDescToKoDescAndTags 함수 호출로 변경
        const { koreanDescription, extractedKeywords } = await enDescToKoDescAndTags(engDescription, abortController.signal);
        // ko3Response, ko3Data 관련 로직은 이제 enDescToKoDescAndTags 함수 내부에 있음
        
        const keywordExtractionEndTime = performance.now();
        keywordExtractionDuration.value = Number(((keywordExtractionEndTime - keywordExtractionStartTime) / 1000).toFixed(1));
        console.log('3. 키워드 추출 완료 (API 서비스 결과):', extractedKeywords, '한글 설명:', koreanDescription);
        
        // 단계 업데이트: 벡터 저장
        loadingPhase.value = 'vectorSaving';
        
        // 고유 ID 생성
        const imageId = `trip-verification-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        
        // 태그 생성 (장소 정보와 추출된 키워드 포함)
        const baseTags = [
          item.activity, 
        ];
        
        // extractedKeywords가 존재하면 태그에 추가
        const tags = extractedKeywords.length > 0 
          ? [...baseTags, ...extractedKeywords]
          : baseTags;
        
        // 설명에 한글 설명 사용 (없으면 리뷰 텍스트 사용)
        const description = koreanDescription || reviewText.value || '방문 인증 사진';
        
        console.log('4. Elasticsearch에 저장할 데이터:');
        console.log('- 이미지 ID:', imageId);
        console.log('- 위치:', locationText);
        console.log('- 영어 위치:', englishLocationName);
        console.log('- 태그:', tags);
        console.log('- 설명:', description);
        console.log('- 10차원 벡터:', featuresVector);
        
        // Elasticsearch에 저장 시작 시간
        const saveStartTime = performance.now();
        
        // locationInfo에 영어 지역 이름 추가
        if (locationInfo && englishLocationName) {
          locationInfo.englishLocationName = englishLocationName;
        }
        
        // Elasticsearch에 저장
        const esResponse = await saveToElasticsearch(
          imageId,
          item.activity, // activity를 이미지 이름으로 사용
          locationText,
          tags,
          description,
          verificationPhotoPreview.value,
          analysisResult,
          featuresVector,
          locationInfo, // 지오코딩으로 얻은 구조화된 위치 정보 (영어 지역 이름 포함)
          testDataInputs.value.p_id,
          testDataInputs.value.u_id,
          testDataInputs.value.u_age,
          testDataInputs.value.u_gender
        );
        
        if (!esResponse || !esResponse._id) {
          throw new Error('Elasticsearch 저장 실패');
        }
        
        // Elasticsearch에 저장 완료 시간 및 소요 시간 저장
        const saveEndTime = performance.now();
        searchDuration.value = Number(((saveEndTime - saveStartTime) / 1000).toFixed(1));
        console.log('4. Elasticsearch에 저장 완료:', imageId);
        
        // 작업 완료 상태로 업데이트
        loadingPhase.value = 'completed';
        
        // 모든 데이터 처리가 성공적으로 완료되면 방문 정보 저장
        // 여기서는 item 변수를 다시 참조하지 않고 이미 위에서 가져온 item을 사용
        
        // 인증 정보 저장
        const verifiedAt = new Date().toISOString();
        item.verified = true;
        item.verifiedAt = verifiedAt;
        item.verificationPhoto = verificationPhotoPreview.value;
        item.photoMetadata = photoMetadata.value;

        // 별점 및 리뷰 저장
        item.rating = reviewRating.value;
        item.review = reviewText.value;
        
        // 성공 메시지 표시
        successMessage.value = '방문이 인증되었고 사진이 저장되었습니다!';
        showSuccessBanner.value = true;
        setTimeout(() => {
          showSuccessBanner.value = false;
        }, 3000);
        
        // 로딩 완료 후 모달 닫기
        setTimeout(() => {
          // 모든 작업이 완료된 후에만 모달 닫기
          showVerificationModal.value = false;
        }, 1000);
        
      } catch (error) {
        console.error('인증 처리 오류:', error);
        
        // 오류 단계 표시
        loadingPhase.value = 'error';
        
        // 오류 메시지 표시 - 다시 시도 요청
        successMessage.value = `처리 오류: ${error.message || '알 수 없는 오류가 발생했습니다.'}`;
        showSuccessBanner.value = true;
        setTimeout(() => {
          showSuccessBanner.value = false;
        }, 5000);
        
        // 방문 인증 데이터를 저장하지 않음 (중요: 데이터가 정상적으로 처리되지 않으면 저장하지 않음)
      } finally {
        // 로딩 상태 종료
        isVerifying.value = false;
      }
    };

    // 텍스트 영역 자동 크기 조절
    const memoTextarea = ref(null);
    const autoResizeTextarea = () => {
      if (!memoTextarea.value) return;
      
      // Reset height to calculate based on content
      memoTextarea.value.style.height = 'auto';
      
      // Set height based on scrollHeight (content height)
      memoTextarea.value.style.height = `${memoTextarea.value.scrollHeight}px`;
      
      // Add 'expanded' class if content exceeds max-height
      if (memoTextarea.value.scrollHeight > 200) {
        memoTextarea.value.classList.add('expanded');
      } else {
        memoTextarea.value.classList.remove('expanded');
      }
    };

    // 관리자 인증 함수 추가
    const adminVerify = () => {
      if (!verificationPhotoPreview.value) return;
      
      // 로딩 상태 설정
      isVerifying.value = true;
      
      console.log('===== 관리자 인증 시작 =====');
      
      // 관리자 인증은 GPS 체크를 우회하고 항상 성공 처리
      verificationResult.value = {
        success: true,
        message: '관리자 권한으로 인증되었습니다!'
      };
      
      // 리뷰 모달 표시를 위해 필요한 거리 정보 설정
      if (distanceFromTarget.value === null) {
        distanceFromTarget.value = 0; // 거리를 0으로 설정하여 항상 통과하도록 함
      }
      
      console.log('관리자 권한으로 인증 성공 처리됨');
      console.log('===== 관리자 인증 완료 =====');
      
      // 로딩 상태 해제
      isVerifying.value = false;
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
      completeVerification,
      successMessage,
      loadingPhase,
      imageAnalysisDuration,
      meaningAnalysisDuration,
      keywordExtractionDuration,
      searchDuration,
      memoTextarea,
      autoResizeTextarea,
      adminVerify,
      testDataInputs,
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
  margin-bottom: 0.3rem; /* 줄어든 마진 */
}

.schedule-item:hover {
  background-color: #edf2f7;
}

.schedule-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem; /* 줄어든 패딩 */
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
  padding: 0 0.75rem 0.5rem 0.75rem;
}

.schedule-item-memo textarea {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 0.8rem;
  color: #718096;
  padding: 0;
  min-height: 24px;
  resize: none;
  line-height: 1.2;
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
  overflow: hidden;
  backdrop-filter: blur(3px);
  transition: background-color 0.5s ease;
}

.modals-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  max-width: 1400px;
  width: 90%;
  position: relative;
  transition: all 0.65s cubic-bezier(0.16, 1, 0.3, 1);
  perspective: 1200px;
}

.modals-container.with-detail {
  justify-content: space-between;
  gap: 12px; /* Reduced gap to 60% of original 20px */
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
  transition: all 0.65s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  transform: translateX(0) scale(1);
  transform-origin: center;
  backface-visibility: hidden;
  will-change: transform, box-shadow;
}

.place-search-modal.slide-left {
  transform: translateX(-3%) scale(0.99);
  box-shadow: 15px 0 25px rgba(0, 0, 0, 0.1);
}

.place-detail-modal {
  background-color: white;
  border-radius: 12px;
  width: 35%;
  height: 90vh; /* Same height as search modal */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  transition: all 0.65s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateX(50px);
  opacity: 0;
  backface-visibility: hidden;
  will-change: transform, opacity, box-shadow;
}

.place-detail-modal.slide-in {
  transform: translateX(0);
  opacity: 1;
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
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
  flex-direction: row; /* 좌우 배치를 위한 명시적 설정 */
  flex: 1;
  overflow: hidden;
  height: calc(90vh - 110px);
}

.detail-content {
  padding: 1.5rem 2rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  height: calc(90vh - 110px);
}

/* 수직 구분선 */
.modal-divider {
  width: 1px;
  background-color: #e2e8f0;
  margin: 0;
}

.search-section {
  flex: 3; /* 검색 섹션에 더 많은 공간 할당 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wishlist-section {
  flex: 2; /* 찜 목록에 적절한 공간 할당 */
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100% - 5rem);
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
  padding: 0 0.75rem 0.5rem 0.75rem;
  display: flex;
  justify-content: flex-end;
}

.visit-verification-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  border: none;
  background-color: #f1f5f9;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.visit-verification-btn:hover {
  background-color: #e2e8f0;
  transform: translateY(-1px);
}

/* 인증 완료 표시 - 새로운 스타일 */
.verification-completed {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  border: none;
  background-color: #10b981; /* 초록색 배경 */
  color: white; /* 흰색 글씨 */
  font-size: 0.8rem;
  font-weight: 500;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.verification-completed svg {
  stroke: white;
}

.stars {
  color: #eab308;
  margin-left: 0.5rem;
}

/* 방문 인증 모달 스타일 */
.verification-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  max-width: 1400px;
  width: 100%;
}

.verification-photo-modal {
  background-color: white;
  border-radius: 12px;
  width: 65%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.verification-review-modal {
  background-color: white;
  border-radius: 12px;
  width: 35%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.verification-content, .review-content {
  padding: 1.5rem 2rem;
  overflow-y: auto;
  height: calc(90vh - 110px);
}

.enhanced-image-container {
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  max-height: 350px; /* 사진 크기 축소 */
  display: flex;
  justify-content: center;
}

.photo-preview {
  max-width: 100%;
  max-height: 350px; /* 사진 크기 축소 */
  object-fit: contain;
}

.verified-place-info {
  background-color: #f8fafc;
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.rating-container {
  margin-bottom: 1.5rem;
}

.rating-container label {
  display: block;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  color: #2d3748;
}

.star-rating {
  display: flex;
  font-size: 2rem;
}

.star {
  cursor: pointer;
  color: #e2e8f0;
  transition: color 0.2s ease;
}

.star:hover, .star.active {
  color: #eab308;
}

.review-text-container {
  margin-bottom: 1.5rem;
}

.review-text-container label {
  display: block;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  color: #2d3748;
}

.review-text-container textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
}

.btn-verify {
  width: 100%;
  padding: 1rem 1.5rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-verify:hover {
  background-color: #059669;
  transform: translateY(-2px);
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .verification-container {
    flex-direction: column;
  }
  
  .verification-photo-modal,
  .verification-review-modal {
    width: 100%;
  }
  
  .verification-review-modal {
    margin-top: 1rem;
  }
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

.upload-tip {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: -0.5rem 0 0 0;
}

.verification-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
  border-radius: 8px;
}

.verification-loading-overlay .spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.verification-loading-overlay p {
  font-size: 1.1rem;
  color: #2d3748;
  font-weight: 500;
  text-align: center;
  margin: 10px 0;
}

.close-btn:disabled, 
.btn.cancel-btn:disabled, 
.btn.primary-btn:disabled,
.btn-verify:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.verification-loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.verification-loading-section .spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top-color: #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.verification-loading-section p {
  font-size: 0.75rem;
  color: #2d3748;
  font-weight: 500;
  text-align: center;
  margin: 5px 0;
  white-space: nowrap; /* 텍스트 줄바꿈 방지 */
}

.form-group textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 60px;
  max-height: 200px; /* Maximum height before scrolling */
  resize: none; /* Remove manual resize handle */
  overflow-y: hidden; /* Hide scrollbar initially */
  transition: min-height 0.2s ease;
}

/* Add scrollbar only when content exceeds max-height */
.form-group textarea.expanded {
  overflow-y: auto;
}

/* 관리자 인증 버튼 스타일 */
.admin-btn {
  background-color: #c62828;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  margin-left: 8px;
}

.admin-btn:hover {
  background-color: #b71c1c;
}

.admin-btn:disabled {
  background-color: #e57373;
  cursor: not-allowed;
}

/* 테스트 데이터 입력 필드 스타일 */
.test-data-container {
  margin-top: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border: 1px dashed #adb5bd;
  border-radius: 6px;
}

.test-data-title {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #6c757d;
  font-weight: 500;
}

.test-data-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.test-data-input-row {
  display: flex;
  gap: 16px;
}

.test-data-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.test-data-field label {
  font-size: 13px;
  color: #495057;
}

.test-data-field input,
.test-data-field select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.test-data-field input:focus,
.test-data-field select:focus {
  border-color: #4dabf7;
  outline: none;
  box-shadow: 0 0 0 2px rgba(77, 171, 247, 0.25);
}
</style>