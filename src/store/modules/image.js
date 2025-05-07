// 이미지 관련 상태 관리 모듈
const imageModule = {
    namespaced: true,
    
    state: () => ({
      file: null,          // 선택된 이미지 파일
      preview: null,       // 이미지 미리보기 URL
      info: {              // 이미지 정보
        name: '',          // 이미지 이름
        location: '',      // 위치 정보
        tags: '',          // 태그 (쉼표로 구분)
        description: ''    // 이미지 설명
      }
    }),
    
    mutations: {
      // 이미지 파일 설정
      setFile(state, file) {
        state.file = file
        
        // 미리보기 URL 생성
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            state.preview = e.target.result
          }
          reader.readAsDataURL(file)
        } else {
          state.preview = null
        }
      },
      
      // 이미지 정보 설정
      setInfo(state, info) {
        state.info = { ...state.info, ...info }
      },
      
      // 초기화
      reset(state) {
        state.file = null
        state.preview = null
        state.info = {
          name: '',
          location: '',
          tags: '',
          description: ''
        }
      }
    },
    
    actions: {
      // 비동기 액션이 필요한 경우 여기에 구현
    },
    
    getters: {
      // 파일이 선택되었는지 여부
      hasFile: (state) => !!state.file,
      
      // 정보가 입력되었는지 여부
      hasInfo: (state) => !!(state.info.name || state.info.location || 
                            state.info.tags || state.info.description)
    }
  }
  
  export default imageModule