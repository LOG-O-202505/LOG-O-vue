// 광역시/도 코드와 해당 지역에 포함된 시군구 매핑
// 이 매핑은 ctprvn.json(광역시도)과 sig.json(시군구) 간의 연결을 제공합니다.
// 시군구 코드의 앞 2자리가 광역시/도 코드와 일치합니다.

const regionMapping = {
  // 서울특별시
  "11": {
    name: "서울특별시",
    engName: "Seoul",
    code: "11",
    children: [
      { code: "11110", name: "종로구" },
      { code: "11140", name: "중구" },
      { code: "11170", name: "용산구" },
      { code: "11200", name: "성동구" },
      { code: "11215", name: "광진구" },
      { code: "11230", name: "동대문구" },
      { code: "11260", name: "중랑구" },
      { code: "11290", name: "성북구" },
      { code: "11305", name: "강북구" },
      { code: "11320", name: "도봉구" },
      { code: "11350", name: "노원구" },
      { code: "11380", name: "은평구" },
      { code: "11410", name: "서대문구" },
      { code: "11440", name: "마포구" },
      { code: "11470", name: "양천구" },
      { code: "11500", name: "강서구" },
      { code: "11530", name: "구로구" },
      { code: "11545", name: "금천구" },
      { code: "11560", name: "영등포구" },
      { code: "11590", name: "동작구" },
      { code: "11620", name: "관악구" },
      { code: "11650", name: "서초구" },
      { code: "11680", name: "강남구" },
      { code: "11710", name: "송파구" },
      { code: "11740", name: "강동구" }
    ]
  },
  
  // 부산광역시
  "26": {
    name: "부산광역시",
    engName: "Busan",
    code: "26",
    children: [
      { code: "26110", name: "중구" },
      { code: "26140", name: "서구" },
      { code: "26170", name: "동구" },
      { code: "26200", name: "영도구" },
      { code: "26230", name: "부산진구" },
      { code: "26260", name: "동래구" },
      { code: "26290", name: "남구" },
      { code: "26320", name: "북구" },
      { code: "26350", name: "해운대구" },
      { code: "26380", name: "사하구" },
      { code: "26410", name: "금정구" },
      { code: "26440", name: "강서구" },
      { code: "26470", name: "연제구" },
      { code: "26500", name: "수영구" },
      { code: "26530", name: "사상구" },
      { code: "26710", name: "기장군" }
    ]
  },
  
  // 대구광역시
  "27": {
    name: "대구광역시",
    engName: "Daegu",
    code: "27",
    children: [
      { code: "27110", name: "중구" },
      { code: "27140", name: "동구" },
      { code: "27170", name: "서구" },
      { code: "27200", name: "남구" },
      { code: "27230", name: "북구" },
      { code: "27260", name: "수성구" },
      { code: "27290", name: "달서구" },
      { code: "27710", name: "달성군" }
    ]
  },
  
  // 인천광역시
  "28": {
    name: "인천광역시",
    engName: "Incheon",
    code: "28",
    children: [
      { code: "28110", name: "중구" },
      { code: "28140", name: "동구" },
      { code: "28177", name: "미추홀구" },
      { code: "28185", name: "연수구" },
      { code: "28200", name: "남동구" },
      { code: "28237", name: "부평구" },
      { code: "28245", name: "계양구" },
      { code: "28260", name: "서구" },
      { code: "28710", name: "강화군" },
      { code: "28720", name: "옹진군" }
    ]
  },
  
  // 광주광역시
  "29": {
    name: "광주광역시",
    engName: "Gwangju",
    code: "29",
    children: [
      { code: "29110", name: "동구" },
      { code: "29140", name: "서구" },
      { code: "29155", name: "남구" },
      { code: "29170", name: "북구" },
      { code: "29200", name: "광산구" }
    ]
  },
  
  // 대전광역시
  "30": {
    name: "대전광역시",
    engName: "Daejeon",
    code: "30",
    children: [
      { code: "30110", name: "동구" },
      { code: "30140", name: "중구" },
      { code: "30170", name: "서구" },
      { code: "30200", name: "유성구" },
      { code: "30230", name: "대덕구" }
    ]
  },
  
  // 울산광역시
  "31": {
    name: "울산광역시",
    engName: "Ulsan",
    code: "31",
    children: [
      { code: "31110", name: "중구" },
      { code: "31140", name: "남구" },
      { code: "31170", name: "동구" },
      { code: "31200", name: "북구" },
      { code: "31710", name: "울주군" }
    ]
  },
  
  // 세종특별자치시
  "36": {
    name: "세종특별자치시",
    engName: "Sejong-si",
    code: "36",
    children: [
      { code: "36110", name: "세종시" }
    ]
  },
  
  // 경기도
  "41": {
    name: "경기도",
    engName: "Gyeonggi-do",
    code: "41",
    children: [
      { code: "41110", name: "수원시" },
      { code: "41111", name: "수원시 장안구" },
      { code: "41113", name: "수원시 팔달구" },
      { code: "41115", name: "수원시 영통구" },
      { code: "41117", name: "수원시 권선구" },
      { code: "41130", name: "성남시" },
      { code: "41131", name: "성남시 수정구" },
      { code: "41133", name: "성남시 중원구" },
      { code: "41135", name: "성남시 분당구" },
      { code: "41150", name: "의정부시" },
      { code: "41170", name: "안양시" },
      { code: "41171", name: "안양시 만안구" },
      { code: "41173", name: "안양시 동안구" },
      { code: "41190", name: "부천시" },
      { code: "41210", name: "광명시" },
      { code: "41220", name: "평택시" },
      { code: "41250", name: "동두천시" },
      { code: "41270", name: "안산시" },
      { code: "41271", name: "안산시 상록구" },
      { code: "41273", name: "안산시 단원구" },
      { code: "41280", name: "고양시" },
      { code: "41281", name: "고양시 덕양구" },
      { code: "41285", name: "고양시 일산동구" },
      { code: "41287", name: "고양시 일산서구" },
      { code: "41290", name: "과천시" },
      { code: "41310", name: "구리시" },
      { code: "41360", name: "남양주시" },
      { code: "41370", name: "오산시" },
      { code: "41390", name: "시흥시" },
      { code: "41410", name: "군포시" },
      { code: "41430", name: "의왕시" },
      { code: "41450", name: "하남시" },
      { code: "41460", name: "용인시" },
      { code: "41461", name: "용인시 처인구" },
      { code: "41463", name: "용인시 기흥구" },
      { code: "41465", name: "용인시 수지구" },
      { code: "41480", name: "파주시" },
      { code: "41500", name: "이천시" },
      { code: "41550", name: "안성시" },
      { code: "41570", name: "김포시" },
      { code: "41590", name: "화성시" },
      { code: "41610", name: "광주시" },
      { code: "41630", name: "양주시" },
      { code: "41650", name: "포천시" },
      { code: "41670", name: "여주시" },
      { code: "41800", name: "연천군" },
      { code: "41820", name: "가평군" },
      { code: "41830", name: "양평군" }
    ]
  },

  // 충청북도
  "43": {
    name: "충청북도",
    engName: "Chungcheongbuk-do",
    code: "43",
    children: [
      { code: "43110", name: "청주시" },
      { code: "43111", name: "청주시 상당구" },
      { code: "43112", name: "청주시 서원구" },
      { code: "43113", name: "청주시 흥덕구" },
      { code: "43114", name: "청주시 청원구" },
      { code: "43130", name: "충주시" },
      { code: "43150", name: "제천시" },
      { code: "43720", name: "보은군" },
      { code: "43730", name: "옥천군" },
      { code: "43740", name: "영동군" },
      { code: "43745", name: "증평군" },
      { code: "43750", name: "진천군" },
      { code: "43760", name: "괴산군" },
      { code: "43770", name: "음성군" },
      { code: "43800", name: "단양군" }
    ]
  },

  // 충청남도
  "44": {
    name: "충청남도",
    engName: "Chungcheongnam-do",
    code: "44",
    children: [
      { code: "44130", name: "천안시" },
      { code: "44131", name: "천안시 동남구" },
      { code: "44133", name: "천안시 서북구" },
      { code: "44150", name: "공주시" },
      { code: "44180", name: "보령시" },
      { code: "44200", name: "아산시" },
      { code: "44210", name: "서산시" },
      { code: "44230", name: "논산시" },
      { code: "44250", name: "계룡시" },
      { code: "44270", name: "당진시" },
      { code: "44710", name: "금산군" },
      { code: "44760", name: "부여군" },
      { code: "44770", name: "서천군" },
      { code: "44790", name: "청양군" },
      { code: "44800", name: "홍성군" },
      { code: "44810", name: "예산군" },
      { code: "44825", name: "태안군" }
    ]
  },

  // 전라북도
  "45": {
    name: "전라북도",
    engName: "Jeollabuk-do",
    code: "45",
    children: [
      { code: "45110", name: "전주시" },
      { code: "45111", name: "전주시 완산구" },
      { code: "45113", name: "전주시 덕진구" },
      { code: "45130", name: "군산시" },
      { code: "45140", name: "익산시" },
      { code: "45180", name: "정읍시" },
      { code: "45190", name: "남원시" },
      { code: "45210", name: "김제시" },
      { code: "45710", name: "완주군" },
      { code: "45720", name: "진안군" },
      { code: "45730", name: "무주군" },
      { code: "45740", name: "장수군" },
      { code: "45750", name: "임실군" },
      { code: "45770", name: "순창군" },
      { code: "45790", name: "고창군" },
      { code: "45800", name: "부안군" }
    ]
  },

  // 전라남도
  "46": {
    name: "전라남도",
    engName: "Jeollanam-do",
    code: "46",
    children: [
      { code: "46110", name: "목포시" },
      { code: "46130", name: "여수시" },
      { code: "46150", name: "순천시" },
      { code: "46170", name: "나주시" },
      { code: "46230", name: "광양시" },
      { code: "46710", name: "담양군" },
      { code: "46720", name: "곡성군" },
      { code: "46730", name: "구례군" },
      { code: "46770", name: "고흥군" },
      { code: "46780", name: "보성군" },
      { code: "46790", name: "화순군" },
      { code: "46800", name: "장흥군" },
      { code: "46810", name: "강진군" },
      { code: "46820", name: "해남군" },
      { code: "46830", name: "영암군" },
      { code: "46840", name: "무안군" },
      { code: "46860", name: "함평군" },
      { code: "46870", name: "영광군" },
      { code: "46880", name: "장성군" },
      { code: "46890", name: "완도군" },
      { code: "46900", name: "진도군" },
      { code: "46910", name: "신안군" }
    ]
  },

  // 경상북도
  "47": {
    name: "경상북도",
    engName: "Gyeongsangbuk-do",
    code: "47",
    children: [
      { code: "47110", name: "포항시" },
      { code: "47111", name: "포항시 남구" },
      { code: "47113", name: "포항시 북구" },
      { code: "47130", name: "경주시" },
      { code: "47150", name: "김천시" },
      { code: "47170", name: "안동시" },
      { code: "47190", name: "구미시" },
      { code: "47210", name: "영주시" },
      { code: "47230", name: "영천시" },
      { code: "47250", name: "상주시" },
      { code: "47280", name: "문경시" },
      { code: "47290", name: "경산시" },
      { code: "47720", name: "군위군" },
      { code: "47730", name: "의성군" },
      { code: "47750", name: "청송군" },
      { code: "47760", name: "영양군" },
      { code: "47770", name: "영덕군" },
      { code: "47820", name: "청도군" },
      { code: "47830", name: "고령군" },
      { code: "47840", name: "성주군" },
      { code: "47850", name: "칠곡군" },
      { code: "47900", name: "예천군" },
      { code: "47920", name: "봉화군" },
      { code: "47930", name: "울진군" },
      { code: "47940", name: "울릉군" }
    ]
  },

  // 경상남도
  "48": {
    name: "경상남도",
    engName: "Gyeongsangnam-do",
    code: "48",
    children: [
      { code: "48120", name: "창원시" },
      { code: "48121", name: "창원시 의창구" },
      { code: "48123", name: "창원시 성산구" },
      { code: "48125", name: "창원시 마산합포구" },
      { code: "48127", name: "창원시 마산회원구" },
      { code: "48129", name: "창원시 진해구" },
      { code: "48170", name: "진주시" },
      { code: "48220", name: "통영시" },
      { code: "48240", name: "사천시" },
      { code: "48250", name: "김해시" },
      { code: "48270", name: "밀양시" },
      { code: "48310", name: "거제시" },
      { code: "48330", name: "양산시" },
      { code: "48720", name: "의령군" },
      { code: "48730", name: "함안군" },
      { code: "48740", name: "창녕군" },
      { code: "48820", name: "고성군" },
      { code: "48840", name: "남해군" },
      { code: "48850", name: "하동군" },
      { code: "48860", name: "산청군" },
      { code: "48870", name: "함양군" },
      { code: "48880", name: "거창군" },
      { code: "48890", name: "합천군" }
    ]
  },

  // 제주특별자치도
  "50": {
    name: "제주특별자치도",
    engName: "Jeju-do",
    code: "50",
    children: [
      { code: "50110", name: "제주시" },
      { code: "50130", name: "서귀포시" }
    ]
  }
};

export default regionMapping; 