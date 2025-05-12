<template>
  <div class="trip-plan">
    <!-- 헤더 -->
    <Header 
      :showHero="true"
      heroImageSrc="https://images.unsplash.com/photo-1503221043305-f7498f8b7888?q=80&w=1470"
      heroTitle="새로운 여행 계획하기"
      heroSubtitle="다음 여행을 준비하고 설렘을 기록하세요"
      heroHeight="320px"
    />

    <!-- 메인 콘텐츠 -->
    <div class="plan-content-wrapper">
      <div class="plan-container">
        <!-- 여행 기본 정보 폼 -->
        <div class="plan-section">
          <h2 class="section-title">여행 기본 정보</h2>
          <div class="plan-form">
            <div class="form-group">
              <label for="tripTitle">여행 제목</label>
              <input type="text" id="tripTitle" v-model="tripData.title" placeholder="여행 제목을 입력하세요">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="startDate">출발일</label>
                <input type="date" id="startDate" v-model="tripData.startDate">
              </div>
              <div class="form-group">
                <label for="endDate">도착일</label>
                <input type="date" id="endDate" v-model="tripData.endDate">
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
          </div>
        </div>

        <!-- 일정 계획 -->
        <div class="plan-section">
          <h2 class="section-title">일정 계획</h2>
          <div class="itinerary-list">
            <div v-for="(day, index) in tripDays" :key="index" class="itinerary-day">
              <div class="day-header">
                <h3>Day {{ index + 1 }}</h3>
                <span class="day-date">{{ formatDate(addDays(new Date(tripData.startDate), index)) }}</span>
              </div>
              
              <div class="schedule-items">
                <div v-for="(item, itemIndex) in day.items" :key="itemIndex" class="schedule-item">
                  <div class="time-column">
                    <input type="time" v-model="item.time">
                  </div>
                  <div class="activity-column">
                    <input type="text" v-model="item.activity" placeholder="활동 내용">
                  </div>
                  <div class="location-column">
                    <input type="text" v-model="item.location" placeholder="장소">
                  </div>
                  <div class="action-column">
                    <button class="delete-btn" @click="removeScheduleItem(index, itemIndex)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <button class="add-schedule-btn" @click="addScheduleItem(index)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  일정 추가
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 예산 계획 -->
        <div class="plan-section">
          <h2 class="section-title">예산 계획</h2>
          <div class="budget-container">
            <div class="budget-summary">
              <div class="budget-card">
                <div class="budget-label">총 예산</div>
                <div class="budget-amount">₩{{ formatNumber(totalBudget) }}</div>
              </div>
              <div class="budget-card">
                <div class="budget-label">계획된 지출</div>
                <div class="budget-amount">₩{{ formatNumber(calculatedExpenses) }}</div>
              </div>
              <div class="budget-card">
                <div class="budget-label">잔액</div>
                <div class="budget-amount" :class="{ 'negative': remainingBudget < 0 }">
                  ₩{{ formatNumber(remainingBudget) }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="totalBudget">총 예산 설정</label>
              <div class="input-with-icon">
                <span class="input-icon">₩</span>
                <input type="number" id="totalBudget" v-model="tripData.budget" placeholder="0">
              </div>
            </div>

            <div class="expenses-list">
              <div v-for="(expense, index) in tripData.expenses" :key="index" class="expense-item">
                <div class="expense-category">
                  <select v-model="expense.category">
                    <option value="accommodation">숙박</option>
                    <option value="transportation">교통</option>
                    <option value="food">식비</option>
                    <option value="activities">액티비티</option>
                    <option value="shopping">쇼핑</option>
                    <option value="other">기타</option>
                  </select>
                </div>
                <div class="expense-description">
                  <input type="text" v-model="expense.description" placeholder="항목 설명">
                </div>
                <div class="expense-amount">
                  <div class="input-with-icon">
                    <span class="input-icon">₩</span>
                    <input type="number" v-model="expense.amount" placeholder="0">
                  </div>
                </div>
                <div class="action-column">
                  <button class="delete-btn" @click="removeExpense(index)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
              
              <button class="add-expense-btn" @click="addExpense">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                지출 항목 추가
              </button>
            </div>
          </div>
        </div>

        <!-- 저장 버튼 -->
        <div class="save-section">
          <button class="save-plan-btn" @click="saveTripPlan">여행 계획 저장하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue';
import { ref, computed } from 'vue';

export default {
  name: 'TripPlan',
  components: {
    Header
  },
  setup() {
    // 여행 데이터
    const tripData = ref({
      title: '',
      startDate: '',
      endDate: '',
      destination: '',
      notes: '',
      budget: 0,
      expenses: []
    });

    // 여행 일수 계산
    const tripDays = computed(() => {
      if (!tripData.value.startDate || !tripData.value.endDate) {
        return [{ items: [] }]; // 기본값: 1일
      }

      const start = new Date(tripData.value.startDate);
      const end = new Date(tripData.value.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      // 이미 존재하는 일정 유지하면서 필요한 일수만큼 배열 생성
      const days = [];
      for (let i = 0; i < diffDays; i++) {
        days.push({ items: [] });
      }
      
      return days;
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

    // 일정 항목 추가
    const addScheduleItem = (dayIndex) => {
      if (!tripDays.value[dayIndex].items) {
        tripDays.value[dayIndex].items = [];
      }
      
      tripDays.value[dayIndex].items.push({
        time: '09:00',
        activity: '',
        location: ''
      });
    };

    // 일정 항목 삭제
    const removeScheduleItem = (dayIndex, itemIndex) => {
      tripDays.value[dayIndex].items.splice(itemIndex, 1);
    };

    // 지출 항목 추가
    const addExpense = () => {
      tripData.value.expenses.push({
        category: 'food',
        description: '',
        amount: 0
      });
    };

    // 지출 항목 삭제
    const removeExpense = (index) => {
      tripData.value.expenses.splice(index, 1);
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
      alert('여행 계획이 저장되었습니다.');
    };

    return {
      tripData,
      tripDays,
      totalBudget,
      calculatedExpenses,
      remainingBudget,
      addScheduleItem,
      removeScheduleItem,
      addExpense,
      removeExpense,
      formatDate,
      addDays,
      formatNumber,
      saveTripPlan
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.plan-section {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #2d3748;
  border-bottom: 2px solid #4299e1;
  padding-bottom: 0.75rem;
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
.itinerary-day {
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #4299e1;
  color: white;
}

.day-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.day-date {
  font-size: 0.9rem;
}

.schedule-items {
  padding: 1rem;
}

.schedule-item {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  align-items: center;
}

.time-column {
  width: 110px;
}

.activity-column {
  flex: 2;
}

.location-column {
  flex: 1;
}

.action-column {
  width: 40px;
  display: flex;
  justify-content: center;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
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
  padding-left: 2rem;
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
    background-color: #f7fafc;
    border-radius: 6px;
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
</style> 