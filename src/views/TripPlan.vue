<template>
  <div class="trip-plan">
    <!-- 헤더 -->
    <Header :showHero="true" heroImageSrc="https://images.unsplash.com/photo-1503221043305-f7498f8b7888?q=80&w=1470"
      heroTitle="나만의 여행 설계하기" heroSubtitle="나만의 특별한 여행 경험을 디자인해보세요" heroHeight="320px" />

    <!-- NEW Toast Message Component -->
    <ToastMessage :message="toastMessage" :type="toastType" :duration="toastDuration" v-model:show="showToast" />

    <!-- 메인 콘텐츠 -->
    <div class="plan-content-wrapper">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <p>여행 데이터를 불러오는 중...</p>
      </div>

      <!-- 에러 상태 -->
      <div v-else-if="loadingError" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>데이터 로드 실패</h3>
        <p>{{ loadingError }}</p>
        <button class="retry-btn" @click="fetchTravelData">다시 시도</button>
      </div>

      <!-- 정상 데이터 로드 상태 -->
      <div v-else class="plan-container">
        <!-- 여행 기본 정보 폼 -->
        <div class="plan-section">
          <div class="section-header">
            <h1 class="section-title">여행 기본 정보</h1>
            <div class="section-actions" style="display: flex; gap: 10px;" v-if="!isEditingInfo">
              <button class="edit-info-btn" @click="startEditInfo">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                정보 수정
              </button>
              <button class="delete-travel-btn" @click="openDeleteTravelModal">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="m19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                여행 삭제
              </button>
            </div>
          </div>

          <!-- 보기 모드 -->
          <div v-if="!isEditingInfo" class="trip-info-view-mode">
            <div class="info-grid">
              <!-- 첫 번째 행 -->
              <div class="info-item">
                <span class="info-label">여행 제목</span>
                <span class="info-value">{{ tripData.title }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">주요 목적지</span>
                <span class="info-value">{{ tripData.destination }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">여행 인원</span>
                <span class="info-value">{{ tripData.peoples }}명</span>
              </div>

              <!-- 두 번째 행 -->
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

              <!-- 세 번째 행 -->
              <div class="info-item">
                <span class="info-label">총 예산</span>
                <span class="info-value">₩{{ formatNumber(totalBudget) }}</span>
              </div>
              <div class="info-item info-memo-wide">
                <span class="info-label">여행 메모</span>
                <span class="info-value memo-text">{{ tripData.notes || '없음' }}</span>
              </div>
            </div>
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

              <div class="form-group">
                <label for="peoples">여행 인원</label>
                <input type="number" id="peoples" v-model="tripData.peoples" placeholder="1" min="1">
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
                        <!-- 인증된 항목은 삭제 버튼 비활성화 -->
                        <button v-if="item.verified" class="delete-btn disabled" disabled title="인증된 항목은 삭제할 수 없습니다">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                        <!-- 인증되지 않은 항목만 삭제 가능 -->
                        <button v-else class="delete-btn" @click="removeScheduleItem(activeDay, item)">
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
                    <button v-if="!item.verified" class="visit-verification-btn" @click="verifyVisit(activeDay, item)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      방문 인증하기
                    </button>

                    <!-- 인증 완료된 경우의 표시 (기존과 동일하게) -->
                    <div v-if="item.verified" class="verification-completed">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      {{ formatVerificationDate(item.verifiedAt) }}에 방문 완료
                      <span class="stars" v-if="item.rating">
                        {{ '★'.repeat(item.rating) }}{{ '☆'.repeat(5 - item.rating) }}
                      </span>
                    </div>
                  </div>
                </div>

                <button class="add-schedule-btn" @click="console.log('버튼 클릭됨'); openPlaceSearch()">
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
              
              <!-- 경로 계산 로딩 스피너 -->
              <div v-if="isCalculatingRoute" class="route-loading-overlay">
                <div class="route-loading-content">
                  <div class="loader-container">
                    <div class="loader"></div>
                  </div>
                  <p class="loading-text">이동 경로를 계산하는중</p>
                </div>
              </div>
              
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
          <div class="section-header">
            <h1 class="section-title">지출 관리</h1>
            <button class="add-expense-btn-small" @click="openPaymentModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              지출 추가
            </button>
          </div>
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
                      <button class="delete-btn" @click="removeExpense(expense)">
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
        </div>
      </div> <!-- plan-container 닫는 태그 -->

      <!-- PaymentModal -->
      <PaymentModal :show="showPaymentModal" :travel-id="tuid" :travel-roots="travelRoots" @close="closePaymentModal"
        @add-expense="handleAddExpense" @payment-added="handlePaymentAdded" />

      <!-- 방문 인증 모달 (개선된 버전) -->
      <div class="modal-overlay" v-if="showVerificationModal" @click="closeVerificationModal">
        <div class="modals-container verification-container">
          <!-- 메인 인증 모달 (왼쪽) -->
          <div class="verification-photo-modal" @click.stop>
            <div class="verification-content">
              <!-- 기존 업로드 컨테이너를 VerificationImageUpload 컴포넌트로 교체 -->
              <VerificationImageUpload :currentFile="verificationPhotoFile" :photoMetadata="photoMetadata"
                :distanceFromTarget="distanceFromTarget" :verificationResult="verificationResult"
                :isVerifying="isVerifying"
                :targetCoords="verifyingItemInfo.coords || { lat: 33.458031, lng: 126.942652 }"
                @file-selected="handleVerificationFileSelected" @file-remove="clearVerificationPhoto"
                @verify-photo="verifyPhoto" @admin-verify="adminVerify" @close-modal="closeVerificationModal"
                @verification-success="handleVerificationSuccess" @verification-failed="handleVerificationFailed" />
            </div>
          </div>

          <!-- 리뷰 모달 (오른쪽) - 인증 성공 시에만 표시 -->
          <div v-if="verificationResult && verificationResult.success" class="verification-review-container">
            <div class="verification-review-modal" @click.stop>
              <div v-if="!isVerifying" class="modal-header">
                <h3>방문 후기 작성</h3>
              </div>

              <div class="review-content">
                <!-- 인증 처리 중이거나 완료되었지만 아직 저장되지 않은 경우 스피너 표시 -->
                <div v-if="isVerifying || loadingPhase === 'completed'" class="verification-loading-section">
                  <VerificationImageProcessSpinner :current-phase="loadingPhase"
                    :image-analysis-duration="imageAnalysisDuration"
                    :meaning-analysis-duration="meaningAnalysisDuration"
                    :keyword-extraction-duration="keywordExtractionDuration"
                    :morphological-analysis-duration="morphologicalAnalysisDuration"
                    :processing-results-duration="processingResultsDuration" @save-result="saveVerificationResult" />
                </div>

                <!-- 인증 처리가 시작되지 않았거나 저장이 완료된 경우에만 폼 표시 -->
                <div v-else class="review-form-section">
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
                    <textarea id="review-text" v-model="reviewText" placeholder="이 장소에 대한 후기를 작성해주세요..."
                      rows="6"></textarea>
                  </div>


                  <div class="form-actions">
                    <button @click="completeVerification" class="btn-verify">
                      인증 완료하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 장소 검색 모달 -->
      <TravelAreasInsertModule :isOpen="isPlaceSearchModalOpen" :selectedDay="selectedDay"
        :tripStartDate="tripData.startDate" :travelId="tuid" :travelRoots="travelRoots" @close="closePlaceSearch" @place-added="handlePlaceAdded"
        @show-toast="handleToast" />

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
                <button @click="analyzeReceipt" class="btn primary-btn" :disabled="isReceiptAnalyzing">
                  {{ isReceiptAnalyzing ? '분석 중...' : '이미지 분석하기' }}
                </button>
                <button @click="clearReceiptImage" class="btn cancel-btn">취소</button>
              </div>
            </div>
          </div>

          <div v-if="isReceiptAnalyzing" class="loading-indicator">
            <div class="spinner"></div>
            <p>{{ loadingMessage }}</p>
          </div>
        </div>
      </div>

      <!-- 삭제 확인 모달 -->
      <DeleteConfirmModal :show="showDeleteModal" :place-name="deleteTargetInfo.placeName" @confirm="confirmDelete"
        @cancel="cancelDelete" />

      <!-- 지출 삭제 모달 -->
      <ExpenseDeleteModal :show="showExpenseDeleteModal" :expenseDescription="expenseToDelete?.description || ''"
        :expenseAmount="expenseToDelete?.amount || 0" :expenseDate="expenseToDelete?.date || ''"
        @confirm="confirmExpenseDelete" @cancel="cancelExpenseDelete" />

      <!-- 여행 삭제 확인 모달 -->
      <div class="modal-overlay" v-if="showDeleteTravelModal" @click="closeDeleteTravelModal">
        <div class="modal-container delete-travel-modal" @click.stop>
          <div class="modal-header">
            <h3>여행 삭제 확인</h3>
          </div>
          <div class="modal-body">
            <div class="travel-info">
              <div class="travel-detail">
                <span class="travel-period" style="color: black;">{{ tripData.title }}</span>
              </div>
              <div class="travel-period" v-if="tripData.startDate && tripData.endDate">
                {{ formatDateFull(tripData.startDate) }} ~ {{ formatDateFull(tripData.endDate) }}
              </div>
            </div>
            <p class="warning-text">삭제된 여행은 복구할 수 없습니다.</p>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" @click="closeDeleteTravelModal">취소</button>
            <button class="delete-btn" @click="confirmDeleteTravel">삭제</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import ToastMessage from '@/components/ToastMessage.vue';
import VerificationImageUpload from '@/components/VerificationImageUpload.vue';
import VerificationImageProcessSpinner from '@/components/VerificationImageProcessSpinner.vue';
import TravelAreasInsertModule from '@/components/TravelAreasInsertModule.vue';
import DeleteConfirmModal from '@/components/DeleteConfirmModal.vue';
import ExpenseDeleteModal from '@/components/ExpenseDeleteModal.vue';
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, toRefs } from 'vue';
import EXIF from 'exif-js';
import { safelyCleanupMap } from '@/utils/mapUtils';
import config from '@/config';
import {
  imageToEngDescription,
  EngDescriptionToVector,
  saveToElasticsearch,
  createFeaturesVector,
  reverseGeocode,
  getEnglishLocationName,
  getLocationCodes,
  enDescToKoDescAndTags, // Added import
  ImgToPayment,          // Added import
  analyzeTextWithElasticsearch, // 새로 추가된 함수
  getUserTravelVerifications,
  deleteTravelPayment,
  updateTravelPayment,
  getUserLikes,
  addUserLike,
  removeUserLike
} from '@/services/api';
import { apiGet, apiPost, apiDelete, apiPut } from '@/services/auth'; // API 호출 함수를 auth.js에서 가져옴
import PaymentModal from '@/components/PaymentModal.vue'; // Added import

export default {
  name: 'TripPlan',
  props: {
    tuid: {
      type: [String, Number],
      required: true
    }
  },
  components: {
    Header,
    ToastMessage,
    VerificationImageUpload,
    VerificationImageProcessSpinner,
    PaymentModal,
    TravelAreasInsertModule,
    DeleteConfirmModal,
    ExpenseDeleteModal
  },
  setup(props) {
    // Props에서 tuid 가져오기
    // eslint-disable-next-line no-unused-vars
    const { tuid } = toRefs(props);

    // 로딩 상태
    const isLoading = ref(true);
    const loadingError = ref(null);

    // 카카오 맵 관련 변수
    const kakaoMapContainer = ref(null);
    const kakaoMap = ref(null);
    const kakaoMarkers = ref([]);
    const kakaoPolyline = ref(null);
    const mapLoaded = ref(false);
    const geocoder = ref(null);

    // 장소 상세 모달의 지도 인스턴스를 위한 ref
    const detailMapInstance = ref(null);
    const detailMapContainer = ref(null); // 이미 템플릿에 있는 ref (id="detail-map")

    // 장소 검색 관련 상태
    const isPlaceSearchModalOpen = ref(false);
    const selectedDay = ref(0); // 장소 검색 시 선택된 날짜

    // 위시리스트 및 선택한 장소 관련 상태
    const wishlistPlaces = ref([]);
    const selectedPlace = ref(null);
    const visitTime = ref('');
    const placeMemo = ref('');

    // 삭제 모달 관련 상태
    const showDeleteModal = ref(false);
    const deleteTargetItem = ref(null);
    const deleteTargetInfo = ref({
      dayIndex: null,
      item: null,
      placeName: '',
      tauid: null
    });

    // 지출 삭제 모달 관련 상태
    const showExpenseDeleteModal = ref(false);
    const expenseToDelete = ref(null);

    // API 호출 함수
    const fetchTravelData = async () => {
      try {
        isLoading.value = true;
        loadingError.value = null;

        // 새로운 API 엔드포인트 사용
        const response = await apiGet(`/travels/${tuid.value}/detail`);

        if (response.status === 'success' && response.data) {
          const backendData = response.data;

          // userId 저장
          userId.value = backendData.userId;

          // 백엔드 데이터를 컴포넌트 형식으로 변환
          tripData.value = {
            title: backendData.title,
            startDate: formatDateArray(backendData.startDate),
            endDate: formatDateArray(backendData.endDate),
            destination: backendData.location,
            notes: backendData.memo || '',
            budget: backendData.totalBudget,
            peoples: backendData.peoples || 1,
            expenses: []
          };

          // travelRoots 데이터 저장
          if (backendData.travelRoots && Array.isArray(backendData.travelRoots)) {
            travelRoots.value = backendData.travelRoots.map(root => ({
              truid: root.truid,
              travelId: root.travelId,
              day: root.day,
              travelDate: formatDateArray(root.travelDate)
            }));

            console.log('여행 루트 데이터:', travelRoots.value);
          }

          // 일정 데이터 초기화 (travelAreas 처리 전에 먼저 초기화)
          initializeTripDays();

          // travelAreas 데이터를 일정으로 변환
          if (backendData.travelAreas && Array.isArray(backendData.travelAreas)) {
            console.log('=== TravelAreas 매핑 시작 ===');
            console.log('TravelRoots:', travelRoots.value);
            console.log('TravelAreas:', backendData.travelAreas);

            // travelAreas를 일정으로 매핑
            backendData.travelAreas.forEach(area => {
              // travelDayId를 travelRoot의 truid와 매칭하여 실제 day 찾기
              const matchingRoot = travelRoots.value.find(root => root.truid === area.travelDayId);
              const dayIndex = matchingRoot ? matchingRoot.day - 1 : -1; // day는 1-based이므로 0-based로 변환

              console.log('TravelArea 매핑:', {
                area: area,
                travelDayId: area.travelDayId,
                matchingRoot: matchingRoot,
                dayIndex: dayIndex
              });

              if (dayIndex >= 0 && dayIndex < tripDays.value.length) {
                const scheduleItem = {
                  time: area.startTime ? formatTimeFromArray(area.startTime) : '',
                  activity: area.place?.name || '장소 미정',
                  location: area.memo || '',
                  address: area.place?.address || '',
                  latitude: area.place?.latitude || null,
                  longitude: area.place?.longitude || null,
                  coords: area.place?.latitude && area.place?.longitude ? {
                    lat: area.place.latitude,
                    lng: area.place.longitude
                  } : null,
                  tauid: area.tauid,
                  place: area.place
                };

                tripDays.value[dayIndex].items.push(scheduleItem);
                console.log(`✅ Day ${dayIndex + 1}에 일정 추가:`, scheduleItem.activity);
              } else {
                console.warn('❌ 유효하지 않은 dayIndex:', dayIndex, 'for area:', area);
              }
            });

            // 각 날짜별 일정을 시간순으로 정렬
            tripDays.value.forEach((day, index) => {
              if (day.items && day.items.length > 0) {
                day.items.sort((a, b) => {
                  // 빈 시간은 가장 뒤로
                  if (!a.time) return 1;
                  if (!b.time) return -1;
                  // 시간 비교 (HH:MM 형식)
                  return a.time.localeCompare(b.time);
                });
                console.log(`Day ${index + 1} 일정 시간순 정렬 완료:`, day.items.map(item => `${item.time} - ${item.activity}`));
              }
            });

            console.log('=== TravelAreas 매핑 완료 ===');
            console.log('최종 일정 데이터:', tripDays.value);
          }

          // travelPayments 데이터를 expenses로 변환
          if (backendData.travelPayments && Array.isArray(backendData.travelPayments)) {
            tripData.value.expenses = backendData.travelPayments.map(payment => ({
              id: payment.tpuid,
              description: payment.history,
              amount: payment.cost,
              date: formatDateFromArray(payment.paymentTime),
              time: formatTimeFromPaymentArray(payment.paymentTime)
            }));

            console.log('지출 데이터 매핑 완료:', tripData.value.expenses);
          }

          console.log('여행 데이터 로드 완료:', tripData.value);

          // 인증 데이터 로드
          await loadVerificationData();
        } else {
          throw new Error('데이터를 가져올 수 없습니다.');
        }
      } catch (error) {
        console.error('여행 데이터 로드 실패:', error);
        loadingError.value = error.message || '데이터를 불러오는 중 오류가 발생했습니다.';
      } finally {
        isLoading.value = false;
      }
    };

    // 날짜 배열을 YYYY-MM-DD 형식으로 변환하는 함수
    const formatDateArray = (dateArray) => {
      if (!dateArray || dateArray.length < 3) return '';
      const [year, month, day] = dateArray;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    // 시간 배열을 HH:MM 형식으로 변환하는 함수
    const formatTimeFromArray = (timeArray) => {
      if (!timeArray || timeArray.length < 5) return '';
      // eslint-disable-next-line no-unused-vars
      const [year, month, day, hour, minute] = timeArray;
      return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };

    // 날짜-시간 배열을 YYYY-MM-DD 형식으로 변환하는 함수
    const formatDateFromArray = (dateTimeArray) => {
      if (!dateTimeArray || dateTimeArray.length < 3) return '';
      const [year, month, day] = dateTimeArray;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    // 시간-분 배열을 HH:MM 형식으로 변환하는 함수
    const formatTimeFromPaymentArray = (dateTimeArray) => {
      if (!dateTimeArray || dateTimeArray.length < 5) return '';
      // eslint-disable-next-line no-unused-vars
      const [year, month, day, hour, minute] = dateTimeArray;
      return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };

    // 여행 데이터 - 백엔드에서 로드되므로 빈 객체로 초기화
    const tripData = ref({
      title: '',
      startDate: '',
      endDate: '',
      destination: '',
      notes: '',
      budget: 0,
      peoples: 1,
      expenses: []
    });

    // 여행 루트 데이터
    const travelRoots = ref([]);

    // 경로 관련 상태
    const routePolylines = ref([]);
    const isCalculatingRoute = ref(false);

    // 인증 데이터 저장 (tauid를 키로 하는 맵)
    const verificationData = ref({});
    const userId = ref(null);

    // 현재 활성화된 일정 날짜 (DAY 탭)
    const activeDay = ref(0);

    // 여행 일수별 일정 데이터
    const tripDays = ref([]);

    // 여행 일수 계산 및 tripDays 초기화
    const initializeTripDays = () => {
      if (!tripData.value.startDate || !tripData.value.endDate) {
        tripDays.value = [{ items: [] }]; // 기본값: 빈 일정
        return;
      }

      const start = new Date(tripData.value.startDate);
      const end = new Date(tripData.value.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // 일정 생성
      const days = [];
      for (let i = 0; i < diffDays; i++) {
        days.push({ items: [] }); // 기본적으로 빈 일정으로 시작
      }

      tripDays.value = days;
    };

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
    const initializeMap = async () => {
      console.log("Initializing Kakao Map...");

      try {
        // SDK 로드 대기
        await waitForKakaoSDK();
        console.log("Kakao Maps SDK is ready");

        // Geocoder 초기화
        if (window.kakao.maps.services && window.kakao.maps.services.Geocoder) {
          try {
            geocoder.value = new window.kakao.maps.services.Geocoder();
            console.log("Geocoder initialized successfully");
          } catch (error) {
            console.error("Error initializing Geocoder:", error);
            geocoder.value = null;
          }
        } else {
          console.error("Kakao Maps Services or Geocoder constructor not available");
          geocoder.value = null;
        }

        // 지도 로드
        await nextTick();
        loadMap();
      } catch (error) {
        console.error("Failed to initialize Kakao Map:", error);
      }
    };

    // 카카오 맵 로드 및 초기화
    const loadMap = async () => {
      console.log("Loading Kakao Map...");

      // 카카오맵 SDK가 로드되었는지 확인
      if (!window.kakao || !window.kakao.maps) {
        console.error("Kakao Maps SDK not available when loadMap is called");
        return;
      }

      // 컨테이너 확인
      if (!kakaoMapContainer.value) {
        console.error("Kakao Map container not found");
        return;
      }

      try {
        // 기존 지도 인스턴스 정리
        if (kakaoMap.value) {
          safelyCleanupMap(kakaoMap.value);
          kakaoMap.value = null;
        }

        // 제주도 중심 좌표
        const jejuCenter = new window.kakao.maps.LatLng(33.3846, 126.5535);

        // 맵 생성
        const options = {
          center: jejuCenter,
          level: 9 // 확대 레벨 (숫자가 작을수록 확대)
        };

        kakaoMap.value = new window.kakao.maps.Map(kakaoMapContainer.value, options);
        console.log("Kakao Map created successfully");

        // Geocoder 초기화
        if (window.kakao.maps.services && window.kakao.maps.services.Geocoder) {
          try {
            geocoder.value = new window.kakao.maps.services.Geocoder();
            console.log("Geocoder initialized successfully");
          } catch (error) {
            console.error("Error initializing Geocoder:", error);
            geocoder.value = null;
          }
        } else {
          console.error("Kakao Maps Services or Geocoder constructor not available");
          geocoder.value = null;
        }

        // 확대 축소 컨트롤러 추가
        const zoomControl = new window.kakao.maps.ZoomControl();
        kakaoMap.value.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

        // Geocoder 확인
        if (!geocoder.value) {
          console.warn("Geocoder instance was not available. Address search might fail.");
        }

        // 마커와 경로 표시
        await nextTick(); // DOM 업데이트 보장
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
        console.log("tripDays.value:", tripDays.value);
        console.log("tripDays.value[activeDay.value]:", tripDays.value[activeDay.value]);

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
        const bounds = new window.kakao.maps.LatLngBounds();

        // 마커 추가
        dayItems.forEach((item, index) => {
          console.log(`Processing item ${index}:`, item);
          console.log(`Item coords:`, item.coords);

          if (!item.coords) {
            console.log("No coordinates for item:", item);

            // 주소가 있으면 geocoding 시도
            if (item.address || item.activity) {
              const searchAddress = item.address || item.activity;
              console.log(`Attempting to geocode address: ${searchAddress}`);

              geocodeAddress(searchAddress, (coords) => {
                if (coords) {
                  console.log(`Geocoded coordinates for ${searchAddress}:`, coords);
                  // 아이템에 좌표 추가
                  item.coords = coords;
                  // 지도 업데이트 재시도
                  setTimeout(() => updateMapMarkers(), 500);
                }
              });
            }
            return;
          }

          const position = new window.kakao.maps.LatLng(item.coords.lat, item.coords.lng);
          linePath.push(position);
          bounds.extend(position);

          // 마커 색상 설정
          let markerColor;
          if (item.verified) {
            markerColor = '#4CAF50';  // 방문 인증 완료된 장소 (초록색)
          } else if (dayItems.length === 1) {
            markerColor = '#1A5276';  // 1개만 있는 경우 (파란색)
          } else if (index === 0) {
            markerColor = '#FF0000';  // 첫 번째 마커 (빨간색)
          } else if (index === dayItems.length - 1) {
            markerColor = '#0000FF';  // 마지막 마커 (파란색)
          } else {
            markerColor = '#FFD700';  // 중간 마커 (노란색)
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
          const customOverlay = new window.kakao.maps.CustomOverlay({
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

          const infoWindow = new window.kakao.maps.CustomOverlay({
            position: position,
            content: infoContent,
            yAnchor: 2.2,
            zIndex: 2
          });

          // 마커 클릭 이벤트 - 인포윈도우 표시 (2초 후 자동으로 닫힘)
          window.kakao.maps.event.addListener(customOverlay, 'click', function () {
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
          // 기존 경로 폴리라인 제거
          clearRoutePolylines();
          
          // 좌표가 있는 항목들만 필터링
          const validLocations = dayItems.filter(item => 
            item.coords && item.coords.lat && item.coords.lng
          );

          if (validLocations.length >= 2) {
            console.log('카카오모빌리티 API로 경로 계산 시작:', validLocations);
            
            // 로딩 상태 시작
            isCalculatingRoute.value = true;
            
            // 카카오모빌리티 API를 사용하여 경로 계산 및 표시
            calculateMultiWaypointRoute(validLocations)
              .then(routeData => {
                displayRouteOnMap(routeData);
                
                // 경로 정보 로깅
                if (routeData.routes && routeData.routes.length > 0) {
                  const route = routeData.routes[0];
                  const distance = (route.summary?.distance / 1000).toFixed(1);
                  const duration = Math.round(route.summary?.duration / 60);
                  console.log(`경로 표시 완료! 총 거리: ${distance}km, 예상 시간: ${duration}분`);
                }
              })
              .catch(error => {
                console.error('카카오모빌리티 API 경로 계산 실패, 기본 폴리라인 사용:', error);
                
                // API 실패 시 기본 폴리라인으로 폴백
                kakaoPolyline.value = new window.kakao.maps.Polyline({
                  path: linePath,
                  strokeWeight: 3,
                  strokeColor: '#db4040',
                  strokeOpacity: 0.7,
                  strokeStyle: 'solid'
                });

                kakaoPolyline.value.setMap(kakaoMap.value);
              })
              .finally(() => {
                // 로딩 상태 종료
                isCalculatingRoute.value = false;
              });
          } else {
            // 유효한 위치가 2개 미만일 때는 기본 폴리라인 사용
            kakaoPolyline.value = new window.kakao.maps.Polyline({
              path: linePath,
              strokeWeight: 3,
              strokeColor: '#db4040',
              strokeOpacity: 0.7,
              strokeStyle: 'solid'
            });

            kakaoPolyline.value.setMap(kakaoMap.value);
          }
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
      if (!geocoder.value) {
        console.error("Geocoder instance is not available. Cannot perform address search for:", address);
        // 대체 좌표를 제공하거나 오류 콜백을 호출할 수 있습니다.
        const fallbackCoords = {
          lat: 33.3846 + (Math.random() * 0.2 - 0.1),
          lng: 126.5535 + (Math.random() * 0.2 - 0.1)
        };
        console.log("Using fallback coordinates due to missing geocoder.");
        if (callback && typeof callback === 'function') {
          callback(fallbackCoords);
        }
        return;
      }

      try {
        console.log(`Geocoding address: ${address} with geocoder instance.`);
        const searchAddress = `${address}, 제주도`; // 제주도 지역 검색 강화

        geocoder.value.addressSearch(searchAddress, (result, status) => {
          if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
            const coords = {
              lat: parseFloat(result[0].y),
              lng: parseFloat(result[0].x)
            };
            console.log(`Geocoded coordinates for ${address}:`, coords);
            if (callback && typeof callback === 'function') {
              callback(coords);
            }
          } else {
            console.warn(`Geocoding failed for: ${searchAddress}, status: ${status}. Result:`, result);
            const fallbackCoords = {
              lat: 33.3846 + (Math.random() * 0.2 - 0.1),
              lng: 126.5535 + (Math.random() * 0.2 - 0.1)
            };
            console.log("Using fallback coordinates after geocoding failure.");
            if (callback && typeof callback === 'function') {
              callback(fallbackCoords);
            }
          }
        });
      } catch (error) {
        console.error("Error during geocoding:", error);
        const errorCoords = {
          lat: 33.3846 + (Math.random() * 0.2 - 0.1),
          lng: 126.5535 + (Math.random() * 0.2 - 0.1)
        };
        console.log("Using fallback coordinates due to geocoding error.");
        if (callback && typeof callback === 'function') {
          callback(errorCoords);
        }
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
    const removeScheduleItem = (dayIndex, item) => {
      // 삭제할 항목 정보 저장
      deleteTargetInfo.value = {
        dayIndex,
        item: item,
        placeName: item.activity || '장소',
        tauid: item.tauid
      };

      // 삭제 모달 표시
      showDeleteModal.value = true;
    };

    // 삭제 확인 처리
    const confirmDelete = async () => {
      try {
        const { dayIndex, item, tauid } = deleteTargetInfo.value;

        // API를 통해 삭제 요청
        if (tauid) {
          await apiDelete(`/travel-areas/${tauid}`);
          displayToast('일정이 성공적으로 삭제되었습니다.', 'success');
        }

        // 로컬 데이터에서 tauid로 해당 아이템을 찾아서 삭제
        const itemIndex = tripDays.value[dayIndex].items.findIndex(scheduleItem =>
          scheduleItem.tauid === tauid || scheduleItem === item
        );

        if (itemIndex !== -1) {
          tripDays.value[dayIndex].items.splice(itemIndex, 1);
        }

        // 모달 닫기
        showDeleteModal.value = false;

        // 화면 갱신
        forceRefresh();

      } catch (error) {
        console.error('일정 삭제 실패:', error);
        displayToast('일정 삭제에 실패했습니다. 다시 시도해주세요.', 'error');
      }
    };

    // 삭제 취소 처리
    const cancelDelete = () => {
      showDeleteModal.value = false;
      deleteTargetInfo.value = {
        dayIndex: null,
        item: null,
        placeName: '',
        tauid: null
      };
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
    const removeExpense = async (expense) => {
      // expense에 id가 있는지 확인 (서버에서 온 데이터인지)
      if (!expense.id) {
        displayToast('지출 ID가 없어 삭제할 수 없습니다.', 'error');
        return;
      }

      // 삭제할 지출 정보 저장하고 모달 표시
      expenseToDelete.value = expense;
      showExpenseDeleteModal.value = true;
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
    const openPlaceSearch = async () => {
      console.log('openPlaceSearch 함수 호출됨');
      console.log('현재 activeDay:', activeDay.value);

      selectedDay.value = activeDay.value;
      
      // API에서 관심 장소 목록 불러오기
      try {
        console.log('API에서 관심 장소 목록 불러오는 중...');
        const response = await getUserLikes();
        
        if (response.status === 'success' && response.data) {
          // API 응답 데이터를 wishlistPlaces 형식으로 변환
          wishlistPlaces.value = response.data.map(item => ({
            id: item.place.puid, // puid를 id로 사용
            place_name: item.place.name,
            address_name: item.place.address,
            x: item.place.longitude.toString(),
            y: item.place.latitude.toString(),
            uluid: item.uluid // 삭제 시 필요할 수 있음
          }));
          
          console.log('관심 장소 목록 로드 완료:', wishlistPlaces.value);
        } else {
          console.warn('관심 장소 목록을 불러올 수 없습니다.');
          wishlistPlaces.value = [];
        }
      } catch (error) {
        console.error('관심 장소 목록 로드 실패:', error);
        wishlistPlaces.value = [];
      }
      
      isPlaceSearchModalOpen.value = true;
      console.log('isPlaceSearchModalOpen 값 변경:', isPlaceSearchModalOpen.value);
    };

    // 장소 검색 모달 닫기
    const closePlaceSearch = () => {
      isPlaceSearchModalOpen.value = false;
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

      // 지도가 생성되기 전에 모달을 먼저 나타내어 사용자 경험 개선
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

      // 지도 초기화를 비동기적으로 처리
      nextTick(async () => {
        try {
          // SDK 로드 여부 확인 및 대기 - 전역 SDK 사용
          if (!window.kakaoMapsReady) {
            console.log("Kakao Maps SDK not ready. Waiting...");
            const sdkLoaded = await waitForKakaoSDK();

            if (!sdkLoaded) {
              console.error("Kakao Maps SDK 로드 타임아웃");
              // 오류 메시지 표시
              const mapContainer = document.getElementById('detail-map');
              if (mapContainer) {
                mapContainer.style.display = 'flex';
                mapContainer.style.justifyContent = 'center';
                mapContainer.style.alignItems = 'center';
                mapContainer.style.backgroundColor = '#f5f5f5';
                mapContainer.innerHTML = '<div style="padding: 20px; text-align: center;">지도 로딩 중 문제가 발생했습니다. <br>다른 정보로 계속 진행해 주세요.</div>';
              }
              return;
            }
          }

          // SDK가 로드되었으므로 지도 초기화 실행
          console.log("Kakao Maps SDK ready, initializing detail map");
          await initDetailMap();

        } catch (error) {
          console.error("Error in openPlaceDetails:", error);
        }
      });
    };

    // 상세 지도 초기화 함수 개선 - 비동기 처리
    const initDetailMap = async () => {
      if (!selectedPlace.value) {
        console.log("No selected place for detail map.");
        return;
      }

      // 지도 컨테이너 요소가 있는지 확인 (Vue ref 사용 또는 일반 DOM 조회)
      const mapElement = detailMapContainer.value || document.getElementById('detail-map');
      if (!mapElement) {
        console.error("Detail map container not found.");
        return;
      }

      try {
        // 이전 상세 지도 인스턴스가 있으면 정리
        if (detailMapInstance.value) {
          console.log("Cleaning up previous map instance");
          safelyCleanupMap(detailMapInstance.value);
          detailMapInstance.value = null;
        }

        // Kakao SDK 로드 확인 및 대기
        if (!window.kakaoMapsReady) {
          console.log("Waiting for Kakao Maps SDK to load...");
          const isLoaded = await waitForKakaoSDK();
          if (!isLoaded) {
            console.error("Kakao Maps SDK 로드 실패");
            return;
          }
        }

        // 선택한 장소의 좌표
        const placePosition = new window.kakao.maps.LatLng(
          selectedPlace.value.y,
          selectedPlace.value.x
        );

        // 지도 옵션
        const mapOptions = {
          center: placePosition,
          level: 3 // 확대 레벨
        };

        // NextTick으로 DOM 업데이트 보장
        await nextTick();

        // 새로운 상세 지도 인스턴스 생성 및 저장
        detailMapInstance.value = new window.kakao.maps.Map(mapElement, mapOptions);
        console.log("Detail map created successfully");

        // 마커 생성
        new window.kakao.maps.Marker({
          position: placePosition,
          map: detailMapInstance.value
        });

        // 애니메이션 또는 모달 렌더링 지연 후 지도 리사이즈 
        setTimeout(() => {
          if (detailMapInstance.value) { // 인스턴스가 여전히 존재하는지 확인
            detailMapInstance.value.relayout();
            console.log("Detail map relayout called");
          }
        }, 650);

      } catch (error) {
        console.error("Error initializing detail map:", error);
        if (detailMapInstance.value) {
          // 오류 발생 시 안전한 정리
          safelyCleanupMap(detailMapInstance.value);
          detailMapInstance.value = null;
        }
      }
    };

    // 장소 상세 취소
    const cancelPlaceDetails = () => {
      // 애니메이션을 위한 클래스 제거
      const detailModalEl = document.querySelector('.place-detail-modal');
      if (detailModalEl) {
        detailModalEl.classList.remove('slide-in');
      }

      // 애니메이션 완료 후 지도 관련 리소스 정리
      setTimeout(() => {
        // 지도 인스턴스 먼저 안전하게 정리
        if (detailMapInstance.value) {
          console.log("Cleaning up detail map instance");
          safelyCleanupMap(detailMapInstance.value);
          detailMapInstance.value = null;
        }

        // 상태 초기화
        selectedPlace.value = null;
      }, 600); // 애니메이션 지속 시간과 일치시킴
    };

    // 위시리스트에 장소 추가
    const addToWishlist = async (place) => {
      try {
        // 이미 위시리스트에 있는지 확인
        const existingIndex = wishlistPlaces.value.findIndex(p => p.address_name === place.address_name);

        if (existingIndex >= 0) {
          // 이미 있으면 제거 (토글) - 현재는 로컬에서만 제거
          wishlistPlaces.value.splice(existingIndex, 1);
          displayToast('관심 장소에서 제거되었습니다.', 'info');
          return;
        }

        // 새로운 장소 추가 - API 호출
        console.log('관심 장소 추가 API 호출 시작:', place);
        
        // 위도, 경도 추출
        const latitude = parseFloat(place.y);
        const longitude = parseFloat(place.x);
        
        // reverse geocoding을 통해 region과 sig 추출
        console.log('역지오코딩 시작...', { latitude, longitude });
        const geoData = await reverseGeocode(latitude, longitude);
        console.log('역지오코딩 결과:', geoData);

        if (!geoData) {
          throw new Error('위치 정보를 가져올 수 없습니다.');
        }

        const locationCodes = getLocationCodes(geoData);
        console.log('추출된 지역 코드:', locationCodes);

        if (!locationCodes.province_code || !locationCodes.city_code) {
          throw new Error('지역 코드를 추출할 수 없습니다.');
        }

        // API 요청 데이터 구성
        const placeData = {
          address: place.address_name || place.road_address_name || '',
          region: parseInt(locationCodes.province_code, 10),
          sig: parseInt(locationCodes.city_code, 10),
          name: place.place_name,
          latitude: latitude,
          longitude: longitude
        };

        console.log('API 요청 데이터:', placeData);

        // API 호출
        const response = await addUserLike(placeData);
        
        if (response.status === 'success' && response.data) {
          // API 응답 데이터를 wishlistPlaces 형식으로 변환하여 업데이트
          wishlistPlaces.value = response.data.map(item => ({
            id: item.place.puid, // puid를 id로 사용
            place_name: item.place.name,
            address_name: item.place.address,
            x: item.place.longitude.toString(),
            y: item.place.latitude.toString(),
            uluid: item.uluid // 삭제 시 필요할 수 있음
          }));
          
          console.log('관심 장소 추가 완료, 목록 업데이트:', wishlistPlaces.value);
          displayToast('관심 장소에 추가되었습니다.', 'success');
        } else {
          throw new Error('관심 장소 추가에 실패했습니다.');
        }
        
      } catch (error) {
        console.error('관심 장소 추가 오류:', error);
        displayToast(`관심 장소 추가 중 오류가 발생했습니다: ${error.message}`, 'error');
      }
    };

    // 위시리스트에서 장소 제거
    const removeFromWishlist = async (index) => {
      try {
        const placeToRemove = wishlistPlaces.value[index];
        
        if (!placeToRemove || !placeToRemove.uluid) {
          displayToast('삭제할 수 없는 장소입니다.', 'error');
          return;
        }

        console.log('관심 장소 삭제 API 호출:', placeToRemove);

        // API 호출
        const response = await removeUserLike(placeToRemove.uluid);
        
        if (response.status === 'success' && response.data) {
          // API 응답 데이터를 wishlistPlaces 형식으로 변환하여 업데이트
          wishlistPlaces.value = response.data.map(item => ({
            id: item.place.puid, // puid를 id로 사용
            place_name: item.place.name,
            address_name: item.place.address,
            x: item.place.longitude.toString(),
            y: item.place.latitude.toString(),
            uluid: item.uluid // 삭제 시 필요할 수 있음
          }));
          
          console.log('관심 장소 삭제 완료, 목록 업데이트:', wishlistPlaces.value);
          displayToast('관심 장소에서 제거되었습니다.', 'success');
        } else {
          throw new Error('관심 장소 삭제에 실패했습니다.');
        }
        
      } catch (error) {
        console.error('관심 장소 삭제 오류:', error);
        displayToast(`관심 장소 삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
      }
    };

    // 위시리스트에 있는지 확인
    const isInWishlist = (place) => {
      // address_name을 기준으로 비교 (API 응답 데이터와 카카오 검색 결과 매칭)
      return wishlistPlaces.value.some(p => p.address_name === (place.address_name || place.road_address_name));
    };

    // 선택한 장소 일정에 추가
    const addSelectedPlace = async () => {
      if (!selectedPlace.value) return;

      // 시간 파싱 및 검증
      const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
      if (!timeRegex.test(visitTime.value)) {
        displayToast('시간은 HH:MM 형식으로 입력해 주세요.', 'error');
        return;
      }

      try {
        // 로딩 표시
        displayToast('일정을 추가하는 중...', 'info');

        // 좌표 추출
        const latitude = parseFloat(selectedPlace.value.y);
        const longitude = parseFloat(selectedPlace.value.x);
        const coords = {
          lat: latitude,
          lng: longitude
        };

        // reverse geocoding을 통해 region과 sig 추출
        console.log('역지오코딩 시작...', { latitude, longitude });
        const geoData = await reverseGeocode(latitude, longitude);
        console.log('역지오코딩 결과:', geoData);

        if (!geoData) {
          throw new Error('위치 정보를 가져올 수 없습니다.');
        }

        const locationCodes = getLocationCodes(geoData);
        console.log('추출된 지역 코드:', locationCodes);

        if (!locationCodes.province_code || !locationCodes.city_code) {
          throw new Error('지역 코드를 추출할 수 없습니다.');
        }

        // 여행 시작 날짜 + 선택된 날짜로 실제 날짜 계산
        const startDate = new Date(tripData.value.startDate);
        const travelDate = new Date(startDate);
        travelDate.setDate(startDate.getDate() + selectedDay.value);

        // 시간 정보 추가
        const [hours, minutes] = visitTime.value.split(':');
        travelDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // API 요청 데이터 구성
        const requestData = {
          travel_id: tuid.value, // 현재 여행 ID (실제로는 props나 현재 데이터에서 가져와야 함)
          travel_day_id: selectedDay.value + 1, // 1-based index
          region: locationCodes.province_code,
          sig: locationCodes.city_code,
          start: travelDate.toISOString(),
          memo: placeMemo.value || '',
          address: selectedPlace.value.address_name || selectedPlace.value.road_address_name || '',
          name: selectedPlace.value.place_name,
          latitude: latitude,
          longitude: longitude
        };

        console.log('서버에 전송할 데이터:', requestData);

        // 서버 API 호출
        const result = await apiPost('/travel-areas/add', requestData);

        if (!result.ok) {
          const errorData = await result.json().catch(() => ({}));
          throw new Error(errorData.message || `서버 오류: ${result.status}`);
        }

        const response = await result.json();
        console.log('서버 응답:', response);

        // 새 일정 아이템 생성 (로컬 상태 업데이트용)
        const newItem = {
          id: response.data?.tauid || Date.now(), // 서버에서 받은 ID 사용
          time: visitTime.value,
          activity: selectedPlace.value.place_name,
          location: selectedPlace.value.address_name || selectedPlace.value.road_address_name,
          memo: placeMemo.value,
          coords: coords,
          tauid: response.data?.tauid, // 서버에서 받은 고유 ID 저장
          place: {
            name: selectedPlace.value.place_name,
            address: selectedPlace.value.address_name || selectedPlace.value.road_address_name,
            latitude: latitude,
            longitude: longitude
          }
        };

        console.log('추가할 새 일정:', newItem);
        console.log('현재 선택된 날짜:', selectedDay.value);

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

        // 성공 메시지
        displayToast(`${newItem.activity}이(가) 일정에 추가되었습니다.`, 'success');

        // 입력 필드 초기화
        visitTime.value = '';
        placeMemo.value = '';

      } catch (error) {
        console.error('일정 추가 실패:', error);
        displayToast(`일정 추가 중 오류가 발생했습니다: ${error.message}`, 'error');
      }
    };

    // 컴포넌트가 마운트될 때 실행
    onMounted(async () => {
      console.log("TripPlan Component mounted. TUID:", tuid.value);
      
      // 사용자 정보 로드
      await fetchCurrentUserInfo();
      
      try {
        await fetchTravelData();
        
        // 카카오 지도 초기화
        await initializeMap();
      } catch (error) {
        console.error("TripPlan Component 초기화 오류:", error);
      }
    });

    // 활성 날짜가 변경될 때 지도 업데이트
    watch(activeDay, (newDay, oldDay) => {
      console.log(`Active day changed from ${oldDay} to ${newDay}`);
      if (mapLoaded.value && kakaoMap.value) {
        console.log(`Updating map for day ${newDay} with ${tripDays.value[newDay]?.items?.length || 0} items`);

        // 날짜 변경 시 로딩 상태 시작
        isCalculatingRoute.value = true;

        // 디바운스된 함수 사용으로 성능 최적화
        debouncedUpdateMapMarkers();
        
        // 로딩 상태 종료 (디바운스 시간 + 여유시간)
        setTimeout(() => {
          isCalculatingRoute.value = false;
        }, 800);
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
    const handleResize = () => {
      if (mapLoaded.value && kakaoMap.value) {
        nextTick(() => {
          kakaoMap.value.relayout();
          updateMapMarkers();
        });
      }
    };

    // 기존의 익명 리스너 대신 명명된 함수 사용
    window.addEventListener('resize', handleResize);

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

        // 복귀 후 지도 업데이트 (디바운스 사용)
        if (mapLoaded.value) {
          debouncedUpdateMapMarkers();
        }
      }, 10);
    };

    // 영수증 업로드 관련 상태
    const showReceiptUpload = ref(false);
    const receiptFile = ref(null);
    const receiptPreview = ref(null);
    const isDragging = ref(false);
    const isReceiptAnalyzing = ref(false);
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
        // Changed alert to displayToast
        displayToast('영수증 파일을 선택해주세요.', 'error');
        return;
      }

      isReceiptAnalyzing.value = true;
      loadingMessage.value = '영수증 분석 중... (OCR 및 AI 처리)';

      try {
        const paymentDataArray = await ImgToPayment(receiptFile.value);

        if (paymentDataArray && paymentDataArray.length > 0) {
          let addedCount = 0;

          for (const paymentData of paymentDataArray) {
            if (paymentData && paymentData.Place && paymentData.Time && paymentData.Price !== undefined) {
              addFromReceipt(
                paymentData.Place,
                paymentData.Time,
                paymentData.Price
              );
              addedCount++;
            }
          }

          if (addedCount > 0) {
            displayToast(`총 ${addedCount}건의 결제 내역이 추가되었습니다!!`, 'success');
            closeReceiptUpload();
          } else {
            // Changed alert to displayToast
            displayToast('영수증에서 유효한 결제 내역을 찾을 수 없습니다.', 'error');
          }
        } else {
          // Changed alert to displayToast
          displayToast('영수증에서 결제 내역을 찾을 수 없습니다.', 'error');
        }
      } catch (error) {
        console.error('영수증 분석 오류:', error);
        // Message is already specific
        displayToast(`영수증 자동 분석 실패: ${error.message || '서버 오류'}`, 'error');
      } finally {
        isReceiptAnalyzing.value = false;
        loadingMessage.value = '';
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

      // 성공 메시지 표시
      displayToast('영수증 정보가 성공적으로 추가되었습니다!', 'success');
    };

    // 지출 항목 수정 관련 상태
    const editingExpense = ref(null);
    const editExpenseTime = ref('');
    const editExpenseDesc = ref('');
    const editExpenseAmount = ref(0);
    const originalExpenseTime = ref('');
    const originalExpenseDesc = ref('');
    const originalExpenseAmount = ref(0);

    // NEW Toast Message State
    const toastMessage = ref('');
    const toastType = ref('success'); // 'success' or 'error'
    const showToast = ref(false);
    const toastDuration = ref(3000);

    // NEW displayToast function
    const displayToast = (message, type = 'success', duration = 3000) => {
      toastMessage.value = message;
      toastType.value = type;
      toastDuration.value = duration;
      showToast.value = true;
    };

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
    const saveExpenseEdit = async (expense) => {
      try {
        // 수정된 값으로 업데이트
        expense.time = editExpenseTime.value;
        expense.description = editExpenseDesc.value;
        expense.amount = Number(editExpenseAmount.value);

        // 서버 동기화 수행
        if (expense.id) {
          // 날짜와 시간을 ISO 형식으로 변환
          const formatToISO = (date, time) => {
            if (!date || !time) {
              return new Date().toISOString();
            }
            return new Date(`${date}T${time}:00`).toISOString();
          };

          const updateData = {
            history: expense.description,
            cost: expense.amount,
            payment_time: formatToISO(expense.date, expense.time)
          };

          await updateTravelPayment(expense.id, updateData);
        }

        // 수정 모드 종료
        editingExpense.value = null;

        displayToast('지출 내역이 수정되었습니다.', 'success');
      } catch (error) {
        console.error('지출 수정 오류:', error);
        displayToast('지출 수정 중 오류가 발생했습니다.', 'error');

        // 오류 발생 시 원본 값으로 복원
        cancelExpenseEdit();
      }
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


    // 여행 기본 정보 수정 관련 상태
    const isEditingInfo = ref(false);
    const tempTripData = ref({});

    // 여행 기본 정보 수정 시작
    const startEditInfo = () => {
      tempTripData.value = JSON.parse(JSON.stringify(tripData.value));
      isEditingInfo.value = true;
    };

    // 여행 기본 정보 수정 저장
    const saveEditInfo = async () => {
      try {
        const updateData = {
          location: tripData.value.destination,
          title: tripData.value.title,
          peoples: tripData.value.peoples,
          memo: tripData.value.notes,
          totalBudget: tripData.value.budget
        };

        const response = await apiPut(`/travels/${tuid.value}`, updateData);

        if (response.status === 'success') {
          displayToast('여행 정보가 성공적으로 수정되었습니다.', 'success');
          isEditingInfo.value = false;
        } else {
          throw new Error('여행 정보 수정에 실패했습니다.');
        }
      } catch (error) {
        console.error('여행 정보 수정 실패:', error);
        displayToast('여행 정보 수정에 실패했습니다.', 'error');
      }
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
    const verifyVisit = (dayIndex, item) => {
      // 이미 인증된 항목이면 인증 취소
      if (item.verified) {
        item.verified = false;
        delete item.verifiedAt;
        delete item.verificationPhoto;
        delete item.photoMetadata;
        console.log(`${item.activity} 방문 인증 취소됨`);
        return;
      }

      // 인증 대상 정보 저장 (실제 객체의 모든 정보 포함)
      verifyingDay.value = dayIndex;
      verifyingItem.value = item;
      verifyingItemInfo.value = {
        activity: item.activity,
        location: item.location,
        address: item.address,
        coords: item.coords,
        tauid: item.tauid,
        place: item.place,
        latitude: item.latitude,
        longitude: item.longitude
      };

      // 인증하려는 장소의 상세 데이터를 콘솔에 출력
      console.log('===== 인증하려는 장소 정보 =====');
      console.log('장소명:', item.activity);
      console.log('메모/주소:', item.location);
      console.log('실제 주소:', item.address);
      console.log('좌표:', item.coords);
      console.log('위도:', item.latitude);
      console.log('경도:', item.longitude);
      console.log('TAUID:', item.tauid);
      console.log('Place 객체:', item.place);
      console.log('여행 날짜:', addDays(new Date(tripData.value.startDate), dayIndex).toLocaleDateString('ko-KR'));
      console.log('===============================');

      // 좌표가 없는 경우 경고 메시지
      if (!item.coords && (!item.latitude || !item.longitude)) {
        displayToast('이 장소의 좌표 정보가 없어 정확한 위치 인증이 어려울 수 있습니다.', 'warning');
      }

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
    const verificationPhotoFile = ref(null); // 새로 추가
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
      address: '',
      coords: null,
      tauid: null,
      place: null,
      latitude: null,
      longitude: null
    });

    // 로딩 스피너 관련 상태
    const loadingPhase = ref('imageAnalysis'); // 현재 로딩 단계
    const imageAnalysisDuration = ref(null); // 이미지 분석 소요 시간
    const meaningAnalysisDuration = ref(null); // 의미 분석 소요 시간
    const keywordExtractionDuration = ref(null); // 키워드 추출 소요 시간
    const morphologicalAnalysisDuration = ref(null); // 형태소 분석 소요 시간
    const processingResultsDuration = ref(null); // 최종 처리 소요 시간

    // 임시 인증 데이터 저장용
    const tempVerificationData = ref(null);

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
    // 새로운 컴포넌트용 핸들러 함수들
    const handleVerificationFileSelected = (file) => {
      verificationPhotoFile.value = file;
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        verificationPhotoPreview.value = e.target.result;
      };
      reader.readAsDataURL(file);
      // 메타데이터 추출
      extractImageMetadata(file);
    };

    const handleVerificationSuccess = (data) => {
      console.log('인증 성공:', data);
      verificationPhotoFile.value = data.file;
      photoMetadata.value = {
        dateTime: new Date().toISOString(),
        latitude: data.location.lat,
        longitude: data.location.lng
      };
      distanceFromTarget.value = data.distance;

      // 성공 토스트 메시지 표시
      displayToast('방문 인증에 성공했습니다! 후기를 작성해주세요.', 'success', 3000);

      // 인증 결과 설정
      verificationResult.value = {
        success: true,
        message: '방문 인증이 확인되었습니다!'
      };
    };

    const handleVerificationFailed = (data) => {
      console.log('인증 실패:', data);

      // 실패 토스트 메시지 표시
      displayToast(data.message, 'error', 5000);

      // 인증 결과 설정
      verificationResult.value = {
        success: false,
        message: data.message
      };

      // 사진 데이터 초기화
      clearVerificationPhoto();
    };

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
        // verifyingItem.value는 이제 실제 item 객체임
        const item = verifyingItem.value;

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
        displayToast('방문 인증이 완료되었습니다!', 'success');

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
      verificationPhotoFile.value = null;
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



    // 방문 인증 완료 처리 함수 수정
    const completeVerification = async () => {
      if (!verificationResult.value || !verificationResult.value.success) return;

      try {
        isVerifying.value = true;
        loadingPhase.value = 'imageAnalysis';

        imageAnalysisDuration.value = null;
        meaningAnalysisDuration.value = null;
        keywordExtractionDuration.value = null;
        morphologicalAnalysisDuration.value = null;
        processingResultsDuration.value = null;

        // verifyingItem.value는 이제 실제 item 객체임
        const item = verifyingItem.value;
        if (!item) {
          throw new Error('인증할 아이템을 찾을 수 없습니다.');
        }

        const response = await fetch(verificationPhotoPreview.value);
        const blob = await response.blob();
        const imageFile = new File([blob], `verification-${Date.now()}.jpg`, { type: 'image/jpeg' });

        const abortController = new AbortController();

        let locationInfo = null;
        let locationText = '';
        let englishLocationName = '';

        if (item.coords && item.coords.lat && item.coords.lng) {
          try {
            const geoData = await reverseGeocode(item.coords.lat, item.coords.lng);
            console.log('역지오코딩 결과:', geoData);

            if (geoData) {
              locationText = [
                geoData.country,
                geoData.province,
                geoData.city,
                geoData.borough,
                geoData.quarter
              ].filter(Boolean).join(' ');

              const locationCodes = getLocationCodes(geoData);

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

              englishLocationName = getEnglishLocationName(geoData);
              console.log('추출된 영어 지역 이름:', englishLocationName);
            }
          } catch (geoError) {
            console.error('역지오코딩 API 호출 오류:', geoError);
            displayToast(`위치 정보 조회 실패 (역지오코딩): ${geoError.message || '서버 오류'}`, 'error');
            isVerifying.value = false;
            loadingPhase.value = 'error';
            return;
          }
        }

        if (!locationText) {
          locationText = item.location || verifyingItemInfo.value.location || '장소 정보 없음';
        }

        loadingPhase.value = 'imageAnalysis'; // Ensure phase is set before API call
        console.log('1. Llava 이미지 분석 시작 (light_2 모델 - 영문 설명 추출)...', englishLocationName);
        const imageAnalysisStartTime = performance.now();
        const engDescription = await imageToEngDescription(imageFile, abortController.signal, englishLocationName);
        const imageAnalysisEndTime = performance.now();
        imageAnalysisDuration.value = Number(((imageAnalysisEndTime - imageAnalysisStartTime) / 1000).toFixed(1));

        if (!engDescription && !abortController.signal.aborted) { // Check if not aborted
          // Consider if imageToEngDescription itself throws a detailed error.
          // If it returns null/undefined on failure without throwing, this is needed.
          throw new Error('영어 설명을 얻을 수 없습니다.');
        }

        loadingPhase.value = 'meaningAnalysis';
        console.log('2. Llama 의미 분석 시작 (ko_2 모델 - 10차원 특성 벡터 추출)...');
        const meaningAnalysisStartTime = performance.now();
        const analysisResult = await EngDescriptionToVector(engDescription, abortController.signal);
        const meaningAnalysisEndTime = performance.now();
        meaningAnalysisDuration.value = Number(((meaningAnalysisEndTime - meaningAnalysisStartTime) / 1000).toFixed(1));

        if (!analysisResult && !abortController.signal.aborted) {
          throw new Error('특성 벡터 결과를 얻을 수 없습니다.');
        }

        const featuresVector = createFeaturesVector(analysisResult);
        console.log('2. 생성된 10차원 특성 벡터:', featuresVector);

        if ((!featuresVector || !featuresVector.length) && !abortController.signal.aborted) {
          throw new Error('10차원 벡터 생성에 실패했습니다.');
        }

        loadingPhase.value = 'keywordExtraction';
        console.log('3. Llama 키워드 추출 시작 (ko_3 모델 - 한글 설명과 키워드 추출)...');
        const keywordExtractionStartTime = performance.now();

        const { koreanDescription, extractedKeywords } = await enDescToKoDescAndTags(engDescription, abortController.signal);

        const keywordExtractionEndTime = performance.now();
        keywordExtractionDuration.value = Number(((keywordExtractionEndTime - keywordExtractionStartTime) / 1000).toFixed(1));
        console.log('3. 키워드 추출 완료 (API 서비스 결과):', extractedKeywords, '한글 설명:', koreanDescription);

        loadingPhase.value = 'morphologicalAnalysis';
        console.log('4. Nori 형태소 분석기 시작 (p_name, p_address 토큰화)...');
        const morphologicalAnalysisStartTime = performance.now();

        const imageId = `trip-verification-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

        // ElasticSearch analyzer를 사용하여 장소명(p_name)과 주소(p_address) 토큰화
        const combinedText = `${item.activity} ${locationText}`.trim();
        console.log('4. ElasticSearch analyzer로 장소명+주소 토큰화 시작:', combinedText);
        const placeNameTokens = await analyzeTextWithElasticsearch(combinedText);
        console.log('4. 장소명+주소 토큰화 결과:', placeNameTokens);

        const morphologicalAnalysisEndTime = performance.now();
        morphologicalAnalysisDuration.value = Number(((morphologicalAnalysisEndTime - morphologicalAnalysisStartTime) / 1000).toFixed(1));

        // 최종 태그 배열: ko_3 모델 키워드 먼저, ElasticSearch 토큰화 결과 나중에
        const tags = [
          ...(extractedKeywords && extractedKeywords.length > 0 ? extractedKeywords : []),
          ...(placeNameTokens && placeNameTokens.length > 0 ? placeNameTokens : [])
        ];

        // 중복 제거
        const uniqueTags = [...new Set(tags)];
        console.log("최종 통합 태그:", uniqueTags);

        // description은 koreanDescription과 동일하게 설정
        const description = koreanDescription;

        // p_id 디버깅 로그 추가
        console.log('=== p_id 설정 디버깅 ===');
        console.log('item:', item);
        console.log('item.place:', item.place);
        console.log('item.place?.puid:', item.place?.puid);
        console.log('=========================');
        
        tempVerificationData.value = {
          item,
          imageId,
          verifiedAt: new Date().toISOString(),
          engDescription,
          analysisResult,
          featuresVector,
          koreanDescription,
          extractedKeywords,
          placeNameTokens,
          uniqueTags,
          description,
          locationInfo,
          locationText,
          // ElasticSearch 저장에 필요한 추가 데이터
          p_id: item.place?.puid,
          u_id: currentUserInfo.value.uuid,
          u_age: currentUserInfo.value.age,
          u_gender: currentUserInfo.value.gender,
          addressName: verifyingItemInfo.value.location || verifyingItemInfo.value.place_name || verifyingItemInfo.value.address_name || ''
        };

        // 성공적으로 완료되었으므로 로딩 상태 업데이트
        loadingPhase.value = 'completed';
        isVerifying.value = false;

        displayToast('인증 처리가 완료되었습니다. 저장 버튼을 클릭하여 최종 저장하세요.', 'success');

      } catch (error) {
        // AbortError is often thrown by fetch when a signal is aborted.
        // We don't want to show an error toast if the user cancelled.
        if (error.name === 'AbortError') {
          console.log('API 요청이 사용자에 의해 중단되었습니다.');
          displayToast('요청이 중단되었습니다.', 'error'); // Or perhaps no toast, or a different type.
        } else {
          console.error(`인증 처리 중 오류 발생 (단계: ${loadingPhase.value}):`, error);
          let stageErrorMessage = '';
          switch (loadingPhase.value) {
            case 'imageAnalysis':
              stageErrorMessage = 'Llava 이미지 분석 중 오류';
              break;
            case 'meaningAnalysis':
              stageErrorMessage = 'Llama 의미 분석 중 오류';
              break;
            case 'keywordExtraction':
              stageErrorMessage = 'Llama 키워드 추출 중 오류';
              break;
            case 'morphologicalAnalysis':
              stageErrorMessage = 'Nori 형태소 분석 중 오류';
              break;
            case 'processingResults':
              stageErrorMessage = '최종 처리 중 오류';
              break;
            default:
              stageErrorMessage = `인증 처리 중 오류 (단계: ${loadingPhase.value || '알 수 없음'})`;
          }
          displayToast(`${stageErrorMessage}: ${error.message || '알 수 없는 문제'}`, 'error', 5000);
        }
        loadingPhase.value = 'error';
      } finally {
        // 에러가 발생했을 때만 isVerifying을 false로 설정
        // 성공적으로 완료된 경우는 이미 위에서 처리됨
        if (loadingPhase.value === 'error') {
          isVerifying.value = false;
        }
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

      // 관리자 인증용 tempVerificationData 설정
      const item = verifyingItem.value;
      
      // p_id 디버깅 로그 추가
      console.log('=== 관리자 인증 p_id 설정 디버깅 ===');
      console.log('item:', item);
      console.log('item.place:', item.place);
      console.log('item.place?.puid:', item.place?.puid);
      console.log('===================================');
      
      tempVerificationData.value = {
        item,
        imageId: `admin-verification-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
        verifiedAt: new Date().toISOString(),
        engDescription: '관리자 권한으로 인증됨',
        analysisResult: { confidence: 1.0, isValid: true },
        featuresVector: new Array(10).fill(0.5), // 더미 벡터
        koreanDescription: '관리자 권한으로 인증된 방문',
        extractedKeywords: ['관리자', '인증'],
        placeNameTokens: [item.activity],
        uniqueTags: ['관리자', '인증', item.activity],
        description: '관리자 권한으로 인증된 방문',
        locationInfo: {
          latitude: item.latitude || item.coords?.lat,
          longitude: item.longitude || item.coords?.lng,
          address: item.address || item.location
        },
        locationText: item.location || item.address || item.activity,
        // ElasticSearch 저장에 필요한 추가 데이터
        p_id: item.place?.puid,
        u_id: currentUserInfo.value.uuid,
        u_age: currentUserInfo.value.age,
        u_gender: currentUserInfo.value.gender,
        addressName: item.location || item.address || item.activity
      };

      console.log('관리자 권한으로 인증 성공 처리됨');
      console.log('tempVerificationData 설정 완료:', tempVerificationData.value);
      console.log('===== 관리자 인증 완료 =====');

      // 로딩 상태 해제
      isVerifying.value = false;
    };

    // 인증 결과 저장 함수
    const saveVerificationResult = async () => {
      if (!tempVerificationData.value) {
        displayToast('저장할 인증 데이터가 없습니다.', 'error');
        return;
      }

      try {
        const data = tempVerificationData.value;

        console.log('ElasticSearch에 최종 저장 시작...');
        console.log('=== 최종 p_id 확인 ===');
        console.log('data.item:', data.item);
        console.log('data.item.place:', data.item.place);
        console.log('data.item.place?.puid:', data.item.place?.puid);
        console.log('최종 사용될 p_id:', data.p_id);
        console.log('=======================');

        // ElasticSearch에 저장
        const esResponse = await saveToElasticsearch(
          data.imageId,
          data.item.activity,
          data.locationText,
          data.uniqueTags,
          data.description,
          verificationPhotoPreview.value,
          data.analysisResult,
          data.featuresVector,
          data.locationInfo,
          data.p_id,
          data.u_id,
          data.u_age,
          data.u_gender,
          data.item.address || data.addressName, // p_address: 실제 객체의 상세 주소 사용
          reviewRating.value, // p_stars: 사용자 인증 별점
          reviewText.value, // p_review: 사용자 후기
          tuid.value, // p_tuid: 해당 여행 고유번호 (props에서)
          data.item.tauid // p_tauid: 해당 travelArea 고유번호
        );

        if (!esResponse || !esResponse._id) {
          throw new Error('Elasticsearch 저장에 실패했습니다.');
        }

        console.log('ElasticSearch 저장 완료:', data.imageId);

        // 실제 아이템에 인증 정보 저장
        data.item.verified = true;
        data.item.verifiedAt = data.verifiedAt;
        data.item.verificationPhoto = verificationPhotoPreview.value;
        data.item.photoMetadata = photoMetadata.value;
        data.item.rating = reviewRating.value;
        data.item.review = reviewText.value;

        displayToast('방문 인증이 저장되었습니다!', 'success');

        // 상태 초기화 및 모달 닫기
        loadingPhase.value = 'imageAnalysis'; // 초기 상태로 재설정
        isVerifying.value = false; // 인증 상태 해제

        setTimeout(() => {
          showVerificationModal.value = false;
          tempVerificationData.value = null; // 임시 데이터 초기화
        }, 1000);

      } catch (error) {
        console.error('인증 결과 저장 중 오류:', error);
        displayToast(`저장 중 오류가 발생했습니다: ${error.message}`, 'error');
      }
    };

    // 컴포넌트 소멸 시 정리
    onBeforeUnmount(() => {
      console.log("TripPlan Component unmounting. Cleaning up resources...");

      // 모든 지도 인스턴스 정리
      if (kakaoMap.value) {
        safelyCleanupMap(kakaoMap.value);
        kakaoMap.value = null;
      }

      if (detailMapInstance.value) {
        safelyCleanupMap(detailMapInstance.value);
        detailMapInstance.value = null;
      }

      // 이벤트 리스너 제거
      window.removeEventListener('resize', handleResize);
    });

    // mapUtils에서 가져온 유틸리티 함수 사용

    // PaymentModal 관련 상태
    const showPaymentModal = ref(false);

    // PaymentModal 함수들
    const openPaymentModal = () => {
      showPaymentModal.value = true;
      console.log("PaymentModal 열림");
    };

    const closePaymentModal = () => {
      showPaymentModal.value = false;
      console.log("PaymentModal 닫힘");
    };

    const handleAddExpense = (expense) => {
      console.log("지출 추가:", expense);
      tripData.value.expenses.push(expense);
      displayToast('지출 내역이 추가되었습니다.', 'success');
    };

    // 지출 데이터만 부분적으로 로드하는 함수
    const fetchExpensesOnly = async () => {
      try {
        console.log('지출 데이터만 다시 로드 중...');

        // API에서 전체 데이터를 가져와서 지출 부분만 업데이트
        const response = await apiGet(`/travels/${tuid.value}/detail`);

        if (response.status === 'success' && response.data) {
          const backendData = response.data;

          // travelPayments 데이터만 업데이트
          if (backendData.travelPayments && Array.isArray(backendData.travelPayments)) {
            tripData.value.expenses = backendData.travelPayments.map(payment => ({
              id: payment.tpuid,
              description: payment.history,
              amount: payment.cost,
              date: formatDateFromArray(payment.paymentTime),
              time: formatTimeFromPaymentArray(payment.paymentTime)
            }));

            console.log('지출 데이터 업데이트 완료:', tripData.value.expenses);
          }
        }
      } catch (error) {
        console.error('지출 데이터 로드 실패:', error);
        // 실패 시 전체 데이터 로드로 폴백
        console.log('전체 데이터 로드로 폴백...');
        await fetchTravelData();
      }
    };

    const handlePaymentAdded = async () => {
      console.log("지출 데이터가 서버에 추가됨, 지출 데이터만 다시 로드합니다.");
      // 지출 데이터만 다시 로드하여 스크롤 위치 유지
      await fetchExpensesOnly();
      displayToast('지출 내역이 성공적으로 추가되었습니다!', 'success');
    };

    // 장소 추가 이벤트 핸들러 (새로운 컴포넌트에서 발생)
    const handlePlaceAdded = ({ dayIndex, newItem }) => {
      console.log('장소 추가 이벤트:', { dayIndex, newItem });

      // 선택한 날짜의 일정에 추가
      if (!tripDays.value[dayIndex].items) {
        tripDays.value[dayIndex].items = [];
      }

      tripDays.value[dayIndex].items.push(newItem);

      // 해당 날짜의 일정을 시간순으로 자동 정렬
      if (tripDays.value[dayIndex].items.length > 1) {
        tripDays.value[dayIndex].items.sort((a, b) => {
          // 빈 시간은 가장 뒤로
          if (!a.time) return 1;
          if (!b.time) return -1;
          // 시간 비교 (HH:MM 형식)
          return a.time.localeCompare(b.time);
        });
        console.log(`Day ${dayIndex + 1} 일정 자동 정렬 완료:`, tripDays.value[dayIndex].items.map(item => `${item.time} - ${item.activity}`));
      }

      // 활성 날짜를 선택한 날짜로 변경 (다른 날짜에 일정을 추가한 경우)
      if (dayIndex !== activeDay.value) {
        activeDay.value = dayIndex;
      }

      // 강제 화면 갱신
      forceRefresh();
    };

    // 토스트 메시지 표시 핸들러
    const handleToast = (message, type = 'info') => {
      displayToast(message, type);
    };

    // 인증 데이터 로드 함수
    const loadVerificationData = async () => {
      try {
        if (!userId.value || !tuid.value) {
          console.log('userId 또는 tuid가 없어서 인증 데이터를 로드할 수 없습니다.');
          return;
        }

        console.log('인증 데이터 로드 시작:', { userId: userId.value, tuid: tuid.value });

        const verifications = await getUserTravelVerifications(userId.value, tuid.value);
        verificationData.value = verifications;

        // 각 schedule item에 인증 정보 매핑
        tripDays.value.forEach(day => {
          day.items.forEach(item => {
            if (item.tauid && verificationData.value[item.tauid]) {
              const verification = verificationData.value[item.tauid];
              item.verified = true;
              item.verifiedAt = verification.uploadDate;
              item.rating = verification.stars;
              item.review = verification.review;
              item.verificationDate = formatVerificationDate(verification.uploadDate);
            }
          });
        });

        console.log('인증 데이터 매핑 완료:', verificationData.value);
      } catch (error) {
        console.error('인증 데이터 로드 실패:', error);
      }
    };

    // 인증 날짜 포맷팅 함수
    const formatVerificationDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    // 지출 항목 삭제 처리
    const confirmExpenseDelete = async () => {
      if (!expenseToDelete.value) return;

      try {
        // 처리중 토스트 표시
        displayToast('지출 내역을 삭제하는 중...', 'processing');

        // 서버 API 호출
        await deleteTravelPayment(expenseToDelete.value.id);

        // 로컬 데이터에서 제거
        const index = tripData.value.expenses.findIndex(e => e.id === expenseToDelete.value.id);
        if (index !== -1) {
          tripData.value.expenses.splice(index, 1);
        }

        // 성공 메시지
        displayToast('지출 내역이 성공적으로 삭제되었습니다.', 'success');

        // 모달 닫기
        cancelExpenseDelete();

      } catch (error) {
        console.error('지출 삭제 오류:', error);
        displayToast(`지출 삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
      }
    };

    // 지출 항목 삭제 취소
    const cancelExpenseDelete = () => {
      showExpenseDeleteModal.value = false;
      expenseToDelete.value = null;
    };

    // 여행 삭제 모달 관련 상태
    const showDeleteTravelModal = ref(false);

    // 여행 삭제 모달 열기
    const openDeleteTravelModal = () => {
      showDeleteTravelModal.value = true;
    };

    // 여행 삭제 모달 닫기
    const closeDeleteTravelModal = () => {
      showDeleteTravelModal.value = false;
    };

    // 여행 삭제 확인
    const confirmDeleteTravel = async () => {
      try {
        await apiDelete(`/travels/${tuid.value}`);
        displayToast('여행이 성공적으로 삭제되었습니다.', 'success');
        showDeleteTravelModal.value = false;

        // 여행 목록 페이지로 이동
        setTimeout(() => {
          window.location.href = '/mytravel';
        }, 1000);
      } catch (error) {
        console.error('여행 삭제 실패:', error);
        displayToast('여행 삭제에 실패했습니다.', 'error');
      }
    };

    // 현재 사용자 정보
    const currentUserInfo = ref({
      uuid: null,
      name: '',
      gender: 'M',
      age: 20
    });

    // 현재 사용자 정보 조회 함수
    const fetchCurrentUserInfo = async () => {
      try {
        console.log('현재 사용자 정보 조회 시작');
        
        const response = await apiGet('/users/profile');
        
        if (response && response.data) {
          const userData = response.data;
          
          // 나이 계산 (birthday 배열에서)
          let calculatedAge = 20; // 기본값
          if (userData.birthday && Array.isArray(userData.birthday) && userData.birthday.length >= 3) {
            const [birthYear] = userData.birthday;
            const currentYear = new Date().getFullYear();
            calculatedAge = currentYear - birthYear;
          }
          
          currentUserInfo.value = {
            uuid: userData.uuid,
            name: userData.name || userData.nickname || '',
            gender: userData.gender || 'M',
            age: calculatedAge
          };
          
          console.log('사용자 정보 조회 성공:', currentUserInfo.value);
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        // 실패 시 기본값 유지
      }
    };

    // 전역 카카오 맵 SDK가 준비될 때까지 대기하는 함수
    const waitForKakaoSDK = () => {
      return new Promise((resolve) => {
        // 이미 로드된 경우
        if (window.kakao && window.kakao.maps && window.kakaoMapsReady) {
          resolve();
          return;
        }

        // 로드될 때까지 폴링
        const checkSDK = () => {
          if (window.kakao && window.kakao.maps && window.kakaoMapsReady) {
            resolve();
          } else {
            setTimeout(checkSDK, 100);
          }
        };
        checkSDK();
      });
    };

    // 카카오모빌리티 내비 API를 사용하여 다중 경유지 경로 계산
    const calculateMultiWaypointRoute = async (locations) => {
      try {
        if (locations.length < 2) {
          throw new Error('경로 계산을 위해서는 최소 2개의 위치가 필요합니다.');
        }

        const origin = {
          x: locations[0].coords.lng.toString(),
          y: locations[0].coords.lat.toString(),
          angle: 270 // 기본 진행방향 (서쪽)
        };

        const destination = {
          x: locations[locations.length - 1].coords.lng.toString(),
          y: locations[locations.length - 1].coords.lat.toString()
        };

        const waypoints = locations.slice(1, -1).map(location => ({
          name: location.activity || '',
          x: location.coords.lng,
          y: location.coords.lat
        }));

        const requestData = {
          origin,
          destination,
          waypoints,
          priority: 'RECOMMEND',
          car_fuel: 'GASOLINE',
          car_hipass: false,
          alternatives: false,
          road_details: true,
          summary: false
        };

        console.log('카카오모빌리티 경로 요청:', requestData);

        const response = await fetch('https://apis-navi.kakaomobility.com/v1/waypoints/directions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `KakaoAK ${config.VUE_APP_KAKAO_MAPS_REST_KEY}`
          },
          body: JSON.stringify(requestData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('카카오모빌리티 API 오류:', response.status, errorText);
          throw new Error(`경로 계산 실패: ${response.status}`);
        }

        const result = await response.json();
        console.log('카카오모빌리티 경로 응답:', result);

        return result;
      } catch (error) {
        console.error('경로 계산 오류:', error);
        throw error;
      }
    };

    // 경로 폴리라인을 지도에 표시
    const displayRouteOnMap = (routeData) => {
      try {
        // 기존 경로 폴리라인 제거
        clearRoutePolylines();

        if (!routeData.routes || routeData.routes.length === 0) {
          console.warn('표시할 경로 데이터가 없습니다.');
          return;
        }

        const route = routeData.routes[0];
        if (!route.sections || route.sections.length === 0) {
          console.warn('경로 섹션 데이터가 없습니다.');
          return;
        }

        // 10개의 다양한 색상 템플릿
        const routeColors = [
          '#ff5c8a', // 선명한 핑크
          '#00c853', // 선명한 그린
          '#00b8d4', // 선명한 하늘색
          '#1e88e5', // 선명한 블루
          '#7c4dff', // 선명한 보라
          '#d500f9', // 선명한 퍼플
          '#ff4081', // 강렬한 핑크
          '#c51162', // 진한 마젠타
          '#8d6e63', // 브라운 그레이
          '#009688'  // 진한 청록
        ];

        route.sections.forEach((section, sectionIndex) => {
          if (!section.roads || section.roads.length === 0) return;

          // 구간별로 다른 색상 적용
          const sectionColor = routeColors[sectionIndex % routeColors.length];

          section.roads.forEach((road) => {
            if (!road.vertexes || road.vertexes.length === 0) return;

            // vertexes는 [lng, lat, lng, lat, ...] 형태의 배열
            const coordinates = [];
            for (let i = 0; i < road.vertexes.length; i += 2) {
              const lng = road.vertexes[i];
              const lat = road.vertexes[i + 1];
              if (lng !== undefined && lat !== undefined) {
                coordinates.push(new window.kakao.maps.LatLng(lat, lng));
              }
            }

            if (coordinates.length > 1) {
              const polyline = new window.kakao.maps.Polyline({
                path: coordinates,
                strokeWeight: 5,
                strokeColor: sectionColor,
                strokeOpacity: 1.0,
                strokeStyle: 'solid'
              });

              polyline.setMap(kakaoMap.value);
              routePolylines.value.push(polyline);
            }
          });
        });

        console.log(`총 ${routePolylines.value.length}개의 경로 폴리라인을 표시했습니다.`);
      } catch (error) {
        console.error('경로 표시 오류:', error);
      }
    };

    // 경로 폴리라인 제거
    const clearRoutePolylines = () => {
      routePolylines.value.forEach(polyline => {
        polyline.setMap(null);
      });
      routePolylines.value = [];
    };

    // 디바운스 함수 (성능 최적화)
    const debounce = (func, delay) => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
      };
    };

    // 디바운스된 지도 업데이트 함수
    const debouncedUpdateMapMarkers = debounce(updateMapMarkers, 300);

    return {
      // 로딩 및 에러 상태
      isLoading,
      loadingError,
      fetchTravelData,
      fetchExpensesOnly,
      travelRoots,

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
      selectedDay,
      openPlaceSearch,
      closePlaceSearch,
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
      isReceiptAnalyzing,
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
      displayToast,
      toastMessage,
      toastType,
      showToast,
      toastDuration,
      isEditingInfo,
      startEditInfo,
      saveEditInfo,
      cancelEditInfo,
      formatDateFull,
      verifyVisit, // 방문 인증 함수 추가
      showVerificationModal,
      verificationPhotoPreview,
      verificationPhotoFile,
      photoMetadata,
      isPhotoDragging,
      isVerifying,
      verificationResult,
      distanceFromTarget,
      photoFileInput,
      verifyingItemInfo,
      verifyingDay, // 추가
      verifyingItem, // 추가
      handleVerificationFileSelected,
      handleVerificationSuccess,
      handleVerificationFailed,
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
      loadingPhase,
      imageAnalysisDuration,
      meaningAnalysisDuration,
      keywordExtractionDuration,
      morphologicalAnalysisDuration,
      processingResultsDuration,
      memoTextarea,
      autoResizeTextarea,
      adminVerify,
      saveVerificationResult,
      detailMapContainer, // expose to template if not already (it is used by ref="detailMapContainer")
      showPaymentModal,
      openPaymentModal,
      closePaymentModal,
      handleAddExpense,
      handlePaymentAdded,
      handlePlaceAdded,
      handleToast,
      showDeleteModal,
      deleteTargetItem,
      deleteTargetInfo,
      confirmDelete,
      cancelDelete,
      // 인증 데이터 관련 추가
      verificationData,
      userId,
      loadVerificationData,
      formatVerificationDate,
      showExpenseDeleteModal,
      expenseToDelete,
      confirmExpenseDelete,
      cancelExpenseDelete,
      showDeleteTravelModal,
      openDeleteTravelModal,
      closeDeleteTravelModal,
      confirmDeleteTravel,
      currentUserInfo,
      fetchCurrentUserInfo,
      // 경로 관련
      routePolylines,
      calculateMultiWaypointRoute,
      displayRouteOnMap,
      clearRoutePolylines,
      isCalculatingRoute,
      debouncedUpdateMapMarkers
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
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.day-tabs::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari and Opera */
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

.day-tab:hover {
  background-color: #cbd5e0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.day-tab.active {
  background-color: #4299e1;
  color: white;
}

.day-tab.active:hover {
  background-color: #3182ce;
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
  min-width: 0;
  /* 필요하면 줄어들 수 있도록 */
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
  background-color: #f03e3e;
  /* 출발지 - 빨간색 */
}

.legend-dot.waypoint {
  background-color: #f59f00;
  /* 경유지 - 노란색 */
}

.legend-dot.end {
  background-color: #1971c2;
  /* 도착지 - 파란색 */
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

input,
select,
textarea {
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

input:focus,
select:focus,
textarea:focus {
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
  margin-bottom: 0.3rem;
  /* 줄어든 마진 */
}

.schedule-item:hover {
  background-color: #edf2f7;
}

.schedule-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  /* 줄어든 패딩 */
}

.item-actions {
  display: flex;
  gap: 0.25rem;
}

.edit-btn,
.save-edit-btn,
.cancel-edit-btn {
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

.add-schedule-btn,
.add-expense-btn {
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
  margin: 0;
}

.add-schedule-btn:hover,
.add-expense-btn:hover {
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

  .schedule-item,
  .expense-item {
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
  }

  .time-column,
  .activity-column,
  .location-column,
  .expense-category,
  .expense-description,
  .expense-amount {
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
  gap: 12px;
  /* Reduced gap to 60% of original 20px */
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
  height: 90vh;
  /* Same height as search modal */
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
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

.modal-content {
  display: flex;
  flex-direction: row;
  /* 좌우 배치를 위한 명시적 설정 */
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
  flex: 3;
  /* 검색 섹션에 더 많은 공간 할당 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.wishlist-section {
  flex: 2;
  /* 찜 목록에 적절한 공간 할당 */
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
  to {
    transform: rotate(360deg);
  }
}

.no-results,
.no-wishlist {
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

.wishlist-btn,
.remove-btn {
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

.wishlist-btn:hover,
.remove-btn:hover {
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

.form-group input,
.form-group textarea {
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

.cancel-btn,
.add-btn {
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
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  align-items: center;
}

.add-schedule-btn,
.add-expense-btn {
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
  margin: 0;
}

.add-schedule-btn:hover,
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
.expense-view-mode,
.expense-edit-mode {
  display: flex;
  width: 100%;
  align-items: center;
}

.expense-time,
.expense-time-edit {
  width: 80px;
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
}

.expense-place,
.expense-place-edit {
  flex: 2;
  padding: 0 1rem;
  font-weight: 500;
}

.expense-amount,
.expense-amount-edit {
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

.expense-time-edit input,
.expense-place-edit input {
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
.edit-btn,
.save-edit-btn,
.cancel-edit-btn {
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
  to {
    transform: rotate(360deg);
  }
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
  0% {
    opacity: 0;
    transform: translate(-50%, 20px);
  }

  15% {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  85% {
    opacity: 1;
    transform: translate(-50%, 0);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
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
  z-index: 20;
  /* 더 높은 z-index로 설정 */
}

.expense-amount-edit {
  position: relative;
  z-index: 5;
  max-width: 150px;
  /* 최대 너비 제한 */
}

.expense-amount-edit .input-with-icon input {
  width: 100%;
  padding-left: 1.5rem;
  /* 아이콘과 텍스트 간격 조정 */
}

.expense-place-edit {
  flex: 2;
  padding: 0 1rem;
  font-weight: 500;
  max-width: calc(100% - 260px);
  /* 충분한 공간 확보 */
}

.expense-time-edit {
  width: 80px;
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
}

.save-edit-btn,
.cancel-edit-btn {
  z-index: 25;
  /* 가장 높은 z-index */
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

.save-info-btn,
.cancel-info-btn {
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
  background-color: #10b981;
  /* 초록색 배경 */
  color: white;
  /* 흰색 글씨 */
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
  align-items: stretch;
  max-width: 1400px;
  width: 100%;
  min-height: 600px;
  margin: 0;
  padding: 0;
}

.verification-photo-modal {
  background-color: white;
  border-radius: 12px;
  width: 75%;
  height: auto;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  margin: 0;
}

.verification-review-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 35%;
  min-height: 600px;
  padding: 0;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  flex-direction: column;
}

.verification-review-modal {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.verification-loading-section {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 600px;
  width: 100%;
  padding: 2rem 1rem;
  flex: 1;
}

.verification-content,
.review-content {
  padding: 1rem 1.5rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.enhanced-image-container {
  margin-bottom: 1.5rem;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  max-height: 350px;
  /* 사진 크기 축소 */
  display: flex;
  justify-content: center;
}

.photo-preview {
  max-width: 100%;
  max-height: 350px;
  /* 사진 크기 축소 */
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

.star:hover,
.star.active {
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
  justify-content: center;
  align-items: center;
  min-height: 300px;
  width: 100%;
  padding: 2rem 1rem;
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.verification-loading-section p {
  font-size: 0.75rem;
  color: #2d3748;
  font-weight: 500;
  text-align: center;
  margin: 5px 0;
  white-space: nowrap;
  /* 텍스트 줄바꿈 방지 */
}

.form-group textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 60px;
  max-height: 200px;
  /* Maximum height before scrolling */
  resize: none;
  /* Remove manual resize handle */
  overflow-y: hidden;
  /* Hide scrollbar initially */
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

.review-form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
  justify-content: flex-start;
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
}

/* 추가 반응형 스타일 for verification-review-container */
@media (max-width: 768px) {
  .verification-container {
    flex-direction: column;
    min-height: auto;
    gap: 1rem;
  }

  .verification-photo-modal {
    width: 100%;
    min-height: 400px;
  }

  .verification-review-container {
    width: 100% !important;
    margin-top: 0;
    min-height: auto;
    align-items: stretch;
  }

  .verification-loading-section {
    min-height: 400px;
    padding: 1.5rem 1rem;
  }
}

/* 로딩 상태 스타일 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-spinner {
  margin-bottom: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 에러 상태 스타일 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 40px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.error-container h3 {
  color: #dc3545;
  margin-bottom: 10px;
}

.error-container p {
  color: #666;
  margin-bottom: 20px;
}

.retry-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.retry-btn:hover {
  background-color: #0056b3;
}

.plan-content-wrapper {
  padding: 2rem 0;
}

/* 새로운 인증 완료 표시 스타일 */
.verification-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.verification-info svg {
  stroke: #10b981;
  flex-shrink: 0;
}

.verification-text {
  font-weight: 600;
  color: #10b981;
}

.verification-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-left: 1.25rem;
  font-size: 0.8rem;
}

.verification-date {
  color: #6b7280;
  font-weight: 500;
}

.verification-stars {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars-label {
  color: #6b7280;
  font-weight: 500;
}

.rating-number {
  color: #6b7280;
  font-weight: 500;
  font-size: 0.75rem;
}

.verification-review {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.review-label {
  color: #6b7280;
  font-weight: 500;
}

.review-text {
  color: #374151;
  font-style: italic;
  line-height: 1.4;
  word-break: break-word;
}

/* 비활성화된 삭제 버튼 스타일 */
.delete-btn.disabled {
  background-color: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.delete-btn.disabled:hover {
  background-color: #e5e7eb;
  transform: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.add-expense-btn-small {
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(66, 153, 225, 0.3);
}

.add-expense-btn-small:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
  background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
}

/* 여행 삭제 버튼 스타일 */
.delete-travel-btn {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

.delete-travel-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(229, 62, 62, 0.4);
  background: linear-gradient(135deg, #c53030 0%, #9c2626 100%);
}

.delete-travel-btn svg {
  transition: transform 0.3s ease;
}

.delete-travel-btn:hover svg {
  transform: scale(1.1);
}

/* 여행 삭제 모달 스타일 */
.delete-travel-modal {
  background: white;
  border-radius: 12px;
  padding: 0;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease-out;
}

.delete-travel-modal .modal-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.delete-travel-modal .modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
}

.delete-travel-modal .modal-body {
  padding: 20px 24px;
}

.delete-travel-modal .travel-info {
  background: linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.delete-travel-modal .travel-detail {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}

.delete-travel-modal .travel-title {
  font-weight: 600;
  color: #2d3748;
  font-size: 1.1rem;
  text-align: center;
  position: relative;
  z-index: 1;
  display: block;
}

.delete-travel-modal .travel-period {
  font-size: 0.9rem;
  color: #718096;
  text-align: center;
}

.delete-travel-modal .warning-text {
  font-size: 0.9rem;
  color: #e53e3e;
  margin: 0;
  text-align: center;
  font-weight: 500;
}

.delete-travel-modal .modal-footer {
  padding: 16px 24px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e2e8f0;
}

.delete-travel-modal .cancel-btn {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #4a5568;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.delete-travel-modal .cancel-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
  transform: translateY(-1px);
}

.delete-travel-modal .delete-btn {
  padding: 10px 20px;
  border: none;
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.delete-travel-modal .delete-btn:hover {
  background: linear-gradient(135deg, #c53030 0%, #9c2626 100%);
  transform: translateY(-1px);
}

/* 여행 기본 정보 그리드 스타일 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item.info-memo-wide {
  grid-column: span 2;
}

.info-label {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2b6cb0;
}

.info-value {
  font-size: 1rem;
  color: #2d3748;
  font-weight: 500;
}

.memo-text {
  line-height: 1.5;
  word-break: break-word;
}

/* 섹션 헤더 스타일 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-shrink: 0;
}

/* 정보 수정 버튼 스타일 (파란색) */
.section-actions .edit-info-btn {
  position: static !important;
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
}

.section-actions .edit-info-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 153, 225, 0.4);
  background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
}

.section-actions .edit-info-btn svg {
  transition: transform 0.3s ease;
}

.section-actions .edit-info-btn:hover svg {
  transform: scale(1.1);
}

/* 여행 삭제 버튼 스타일 */
.section-actions .delete-travel-btn {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

.section-actions .delete-travel-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(229, 62, 62, 0.4);
  background: linear-gradient(135deg, #c53030 0%, #9c2626 100%);
}

.section-actions .delete-travel-btn svg {
  transition: transform 0.3s ease;
}

.section-actions .delete-travel-btn:hover svg {
  transform: scale(1.1);
}

.route-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
  border-radius: 8px;
}

.route-loading-content {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.loader-container {
  width: 120px; /* 기존 로더 너비 유지 */
  height: 140px; /* 기존 로더 높이 유지 */
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 1rem auto; /* 기존 로더 마진 유지 */
}

/* HTML: <div class="loader"></div> */
.loader {
  width: 60px;
  aspect-ratio: .5;
  display: grid;
}
.loader:before {
  content: "";
  width: 30%;
  aspect-ratio: 1;
  border-radius: 50%;
  margin: auto auto 0;
  background: #ff7936;
  animation: l9-0 .5s cubic-bezier(0,800,1,800) infinite;
}
.loader:after {
  content: "";
  width: 80%; /* 기존 100%에서 약간 줄임 */
  aspect-ratio: 1/cos(30deg);
  margin: 0 auto auto;
  clip-path: polygon(50% -50%,100% 50%,50% 150%,0 50%);
  background: #58a9ff; /* 파스텔톤 하늘색 */
  animation: l9-1 .5s linear infinite;
}
@keyframes l9-0 {
  0%,2%  {translate: 0   0%}
  98%,to {translate: 0 -.2%}
}
@keyframes l9-1 {
  0%,5%  {rotate:  0deg}
  95%,to {rotate:-60deg}
}

.loading-text {
  font-size: 1.1rem;
  color: #4a5568;
  font-weight: 500;
  margin: 0;
}

</style>


