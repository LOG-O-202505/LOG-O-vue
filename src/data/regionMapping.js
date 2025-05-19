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
      { code: "11110", name: "종로구", engName: "Jongno-gu" },
      { code: "11140", name: "중구", engName: "Jung-gu" },
      { code: "11170", name: "용산구", engName: "Yongsan-gu" },
      { code: "11200", name: "성동구", engName: "Seongdong-gu" },
      { code: "11215", name: "광진구", engName: "Gwangjin-gu" },
      { code: "11230", name: "동대문구", engName: "Dongdaemun-gu" },
      { code: "11260", name: "중랑구", engName: "Jungnang-gu" },
      { code: "11290", name: "성북구", engName: "Seongbuk-gu" },
      { code: "11305", name: "강북구", engName: "Gangbuk-gu" },
      { code: "11320", name: "도봉구", engName: "Dobong-gu" },
      { code: "11350", name: "노원구", engName: "Nowon-gu" },
      { code: "11380", name: "은평구", engName: "Eunpyeong-gu" },
      { code: "11410", name: "서대문구", engName: "Seodaemun-gu" },
      { code: "11440", name: "마포구", engName: "Mapo-gu" },
      { code: "11470", name: "양천구", engName: "Yangcheon-gu" },
      { code: "11500", name: "강서구", engName: "Gangseo-gu" },
      { code: "11530", name: "구로구", engName: "Guro-gu" },
      { code: "11545", name: "금천구", engName: "Geumcheon-gu" },
      { code: "11560", name: "영등포구", engName: "Yeongdeungpo-gu" },
      { code: "11590", name: "동작구", engName: "Dongjak-gu" },
      { code: "11620", name: "관악구", engName: "Gwanak-gu" },
      { code: "11650", name: "서초구", engName: "Seocho-gu" },
      { code: "11680", name: "강남구", engName: "Gangnam-gu" },
      { code: "11710", name: "송파구", engName: "Songpa-gu" },
      { code: "11740", name: "강동구", engName: "Gangdong-gu" }
    ]
  },

  // 부산광역시
  "26": {
    name: "부산광역시",
    engName: "Busan",
    code: "26",
    children: [
      { code: "26110", name: "중구", engName: "Jung-gu" },
      { code: "26140", name: "서구", engName: "Seo-gu" },
      { code: "26170", name: "동구", engName: "Dong-gu" },
      { code: "26200", name: "영도구", engName: "Yeongdo-gu" },
      { code: "26230", name: "부산진구", engName: "Busanjin-gu" },
      { code: "26260", name: "동래구", engName: "Dongnae-gu" },
      { code: "26290", name: "남구", engName: "Nam-gu" },
      { code: "26320", name: "북구", engName: "Buk-gu" },
      { code: "26350", name: "해운대구", engName: "Haeundae-gu" },
      { code: "26380", name: "사하구", engName: "Saha-gu" },
      { code: "26410", name: "금정구", engName: "Geumjeong-gu" },
      { code: "26440", name: "강서구", engName: "Gangseo-gu" },
      { code: "26470", name: "연제구", engName: "Yeonje-gu" },
      { code: "26500", name: "수영구", engName: "Suyeong-gu" },
      { code: "26530", name: "사상구", engName: "Sasang-gu" },
      { code: "26710", name: "기장군", engName: "Gijang-gun" }
    ]
  },

  // 대구광역시
  "27": {
    name: "대구광역시",
    engName: "Daegu",
    code: "27",
    children: [
      { code: "27110", name: "중구", engName: "Jung-gu" },
      { code: "27140", name: "동구", engName: "Dong-gu" },
      { code: "27170", name: "서구", engName: "Seo-gu" },
      { code: "27200", name: "남구", engName: "Nam-gu" },
      { code: "27230", name: "북구", engName: "Buk-gu" },
      { code: "27260", name: "수성구", engName: "Suseong-gu" },
      { code: "27290", name: "달서구", engName: "Dalseo-gu" },
      { code: "27710", name: "달성군", engName: "Dalseong-gun" }
    ]
  },

  // 인천광역시
  "28": {
    name: "인천광역시",
    engName: "Incheon",
    code: "28",
    children: [
      { code: "28110", name: "중구", engName: "Jung-gu" },
      { code: "28140", name: "동구", engName: "Dong-gu" },
      { code: "28177", name: "미추홀구", engName: "Michuhol-gu" },
      { code: "28185", name: "연수구", engName: "Yeonsu-gu" },
      { code: "28200", name: "남동구", engName: "Namdong-gu" },
      { code: "28237", name: "부평구", engName: "Bupyeong-gu" },
      { code: "28245", name: "계양구", engName: "Gyeyang-gu" },
      { code: "28260", name: "서구", engName: "Seo-gu" },
      { code: "28710", name: "강화군", engName: "Ganghwa-gun" },
      { code: "28720", name: "옹진군", engName: "Ongjin-gun" }
    ]
  },

  // 광주광역시
  "29": {
    name: "광주광역시",
    engName: "Gwangju",
    code: "29",
    children: [
      { code: "29110", name: "동구", engName: "Dong-gu" },
      { code: "29140", name: "서구", engName: "Seo-gu" },
      { code: "29155", name: "남구", engName: "Nam-gu" },
      { code: "29170", name: "북구", engName: "Buk-gu" },
      { code: "29200", name: "광산구", engName: "Gwangsan-gu" }
    ]
  },

  // 대전광역시
  "30": {
    name: "대전광역시",
    engName: "Daejeon",
    code: "30",
    children: [
      { code: "30110", name: "동구", engName: "Dong-gu" },
      { code: "30140", name: "중구", engName: "Jung-gu" },
      { code: "30170", name: "서구", engName: "Seo-gu" },
      { code: "30200", name: "유성구", engName: "Yuseong-gu" },
      { code: "30230", name: "대덕구", engName: "Daedeok-gu" }
    ]
  },

  // 울산광역시
  "31": {
    name: "울산광역시",
    engName: "Ulsan",
    code: "31",
    children: [
      { code: "31110", name: "중구", engName: "Jung-gu" },
      { code: "31140", name: "남구", engName: "Nam-gu" },
      { code: "31170", name: "동구", engName: "Dong-gu" },
      { code: "31200", name: "북구", engName: "Buk-gu" },
      { code: "31710", name: "울주군", engName: "Ulju-gun" }
    ]
  },

  // 세종특별자치시
  "36": {
    name: "세종특별자치시",
    engName: "Sejong-si",
    code: "36",
    children: [
      { code: "36110", name: "세종시", engName: "Sejong-si" }
    ]
  },

  // 경기도
  "41": {
    name: "경기도",
    engName: "Gyeonggi-do",
    code: "41",
    children: [
      { code: "41110", name: "수원시", engName: "Suwon-si" },
      { code: "41111", name: "수원시 장안구", engName: "Jangan-gu, Suwon-si" },
      { code: "41113", name: "수원시 팔달구", engName: "Paldal-gu, Suwon-si" },
      { code: "41115", name: "수원시 영통구", engName: "Yeongtong-gu, Suwon-si" },
      { code: "41117", name: "수원시 권선구", engName: "Gwonseon-gu, Suwon-si" },
      { code: "41130", name: "성남시", engName: "Seongnam-si" },
      { code: "41131", name: "성남시 수정구", engName: "Sujeong-gu, Seongnam-si" },
      { code: "41133", name: "성남시 중원구", engName: "Jungwon-gu, Seongnam-si" },
      { code: "41135", name: "성남시 분당구", engName: "Bundang-gu, Seongnam-si" },
      { code: "41150", name: "의정부시", engName: "Uijeongbu-si" },
      { code: "41170", name: "안양시", engName: "Anyang-si" },
      { code: "41171", name: "안양시 만안구", engName: "Manan-gu, Anyang-si" },
      { code: "41173", name: "안양시 동안구", engName: "Dongan-gu, Anyang-si" },
      { code: "41190", name: "부천시", engName: "Bucheon-si" },
      { code: "41210", name: "광명시", engName: "Gwangmyeong-si" },
      { code: "41220", name: "평택시", engName: "Pyeongtaek-si" },
      { code: "41250", name: "동두천시", engName: "Dongducheon-si" },
      { code: "41270", name: "안산시", engName: "Ansan-si" },
      { code: "41271", name: "안산시 상록구", engName: "Sangnok-gu, Ansan-si" },
      { code: "41273", name: "안산시 단원구", engName: "Danwon-gu, Ansan-si" },
      { code: "41280", name: "고양시", engName: "Goyang-si" },
      { code: "41281", name: "고양시 덕양구", engName: "Deokyang-gu, Goyang-si" },
      { code: "41285", name: "고양시 일산동구", engName: "Ilsandong-gu, Goyang-si" },
      { code: "41287", name: "고양시 일산서구", engName: "Ilsanseo-gu, Goyang-si" },
      { code: "41290", name: "과천시", engName: "Gwacheon-si" },
      { code: "41310", name: "구리시", engName: "Guri-si" },
      { code: "41360", name: "남양주시", engName: "Namyangju-si" },
      { code: "41370", name: "오산시", engName: "Osan-si" },
      { code: "41390", name: "시흥시", engName: "Siheung-si" },
      { code: "41410", name: "군포시", engName: "Gunpo-si" },
      { code: "41430", name: "의왕시", engName: "Uiwang-si" },
      { code: "41450", name: "하남시", engName: "Hanam-si" },
      { code: "41460", name: "용인시", engName: "Yongin-si" },
      { code: "41461", name: "용인시 처인구", engName: "Cheoin-gu, Yongin-si" },
      { code: "41463", name: "용인시 기흥구", engName: "Giheung-gu, Yongin-si" },
      { code: "41465", name: "용인시 수지구", engName: "Suji-gu, Yongin-si" },
      { code: "41480", name: "파주시", engName: "Paju-si" },
      { code: "41500", name: "이천시", engName: "Icheon-si" },
      { code: "41550", name: "안성시", engName: "Anseong-si" },
      { code: "41570", name: "김포시", engName: "Gimpo-si" },
      { code: "41590", name: "화성시", engName: "Hwaseong-si" },
      { code: "41610", name: "광주시", engName: "Gwangju-si" },
      { code: "41630", name: "양주시", engName: "Yangju-si" },
      { code: "41650", name: "포천시", engName: "Pocheon-si" },
      { code: "41670", name: "여주시", engName: "Yeoju-si" },
      { code: "41800", name: "연천군", engName: "Yeoncheon-gun" },
      { code: "41820", name: "가평군", engName: "Gapyeong-gun" },
      { code: "41830", name: "양평군", engName: "Yangpyeong-gun" }
    ]
  },

  // 충청북도
  "43": {
    name: "충청북도",
    engName: "Chungcheongbuk-do",
    code: "43",
    children: [
      { code: "43110", name: "청주시", engName: "Cheongju-si" },
      { code: "43111", name: "청주시 상당구", engName: "Sangdang-gu, Cheongju-si" },
      { code: "43112", name: "청주시 서원구", engName: "Seowon-gu, Cheongju-si" },
      { code: "43113", name: "청주시 흥덕구", engName: "Heungdeok-gu, Cheongju-si" },
      { code: "43114", name: "청주시 청원구", engName: "Cheongwon-gu, Cheongju-si" },
      { code: "43130", name: "충주시", engName: "Chungju-si" },
      { code: "43150", name: "제천시", engName: "Jecheon-si" },
      { code: "43720", name: "보은군", engName: "Boeun-gun" },
      { code: "43730", name: "옥천군", engName: "Okcheon-gun" },
      { code: "43740", name: "영동군", engName: "Yeongdong-gun" },
      { code: "43745", name: "증평군", engName: "Jeungpyeong-gun" },
      { code: "43750", name: "진천군", engName: "Jincheon-gun" },
      { code: "43760", name: "괴산군", engName: "Goesan-gun" },
      { code: "43770", name: "음성군", engName: "Eumseong-gun" },
      { code: "43800", name: "단양군", engName: "Danyang-gun" }
    ]
  },

  // 충청남도
  "44": {
    name: "충청남도",
    engName: "Chungcheongnam-do",
    code: "44",
    children: [
      { code: "44130", name: "천안시", engName: "Cheonan-si" },
      { code: "44131", name: "천안시 동남구", engName: "Dongnam-gu, Cheonan-si" },
      { code: "44133", name: "천안시 서북구", engName: "Seobuk-gu, Cheonan-si" },
      { code: "44150", name: "공주시", engName: "Gongju-si" },
      { code: "44180", name: "보령시", engName: "Boryeong-si" },
      { code: "44200", name: "아산시", engName: "Asan-si" },
      { code: "44210", name: "서산시", engName: "Seosan-si" },
      { code: "44230", name: "논산시", engName: "Nonsan-si" },
      { code: "44250", name: "계룡시", engName: "Gyeryong-si" },
      { code: "44270", name: "당진시", engName: "Dangjin-si" },
      { code: "44710", name: "금산군", engName: "Geumsan-gun" },
      { code: "44760", name: "부여군", engName: "Buyeo-gun" },
      { code: "44770", name: "서천군", engName: "Seocheon-gun" },
      { code: "44790", name: "청양군", engName: "Cheongyang-gun" },
      { code: "44800", name: "홍성군", engName: "Hongseong-gun" },
      { code: "44810", name: "예산군", engName: "Yesan-gun" },
      { code: "44825", name: "태안군", engName: "Taean-gun" }
    ]
  },

  // 전라북도
  "45": {
    name: "전라북도",
    engName: "Jeollabuk-do",
    code: "45",
    children: [
      { code: "45110", name: "전주시", engName: "Jeonju-si" },
      { code: "45111", name: "전주시 완산구", engName: "Wansan-gu, Jeonju-si" },
      { code: "45113", name: "전주시 덕진구", engName: "Deokjin-gu, Jeonju-si" },
      { code: "45130", name: "군산시", engName: "Gunsan-si" },
      { code: "45140", name: "익산시", engName: "Iksan-si" },
      { code: "45180", name: "정읍시", engName: "Jeongeup-si" },
      { code: "45190", name: "남원시", engName: "Namwon-si" },
      { code: "45210", name: "김제시", engName: "Gimje-si" },
      { code: "45710", name: "완주군", engName: "Wanju-gun" },
      { code: "45720", name: "진안군", engName: "Jinan-gun" },
      { code: "45730", name: "무주군", engName: "Muju-gun" },
      { code: "45740", name: "장수군", engName: "Jangsu-gun" },
      { code: "45750", name: "임실군", engName: "Imsil-gun" },
      { code: "45770", name: "순창군", engName: "Sunchang-gun" },
      { code: "45790", name: "고창군", engName: "Gochang-gun" },
      { code: "45800", name: "부안군", engName: "Buan-gun" }
    ]
  },

  // 전라남도
  "46": {
    name: "전라남도",
    engName: "Jeollanam-do",
    code: "46",
    children: [
      { code: "46110", name: "목포시", engName: "Mokpo-si" },
      { code: "46130", name: "여수시", engName: "Yeosu-si" },
      { code: "46150", name: "순천시", engName: "Suncheon-si" },
      { code: "46170", name: "나주시", engName: "Naju-si" },
      { code: "46230", name: "광양시", engName: "Gwangyang-si" },
      { code: "46710", name: "담양군", engName: "Damyang-gun" },
      { code: "46720", name: "곡성군", engName: "Gokseong-gun" },
      { code: "46730", name: "구례군", engName: "Gurye-gun" },
      { code: "46770", name: "고흥군", engName: "Goheung-gun" },
      { code: "46780", name: "보성군", engName: "Boseong-gun" },
      { code: "46790", name: "화순군", engName: "Hwasun-gun" },
      { code: "46800", name: "장흥군", engName: "Jangheung-gun" },
      { code: "46810", name: "강진군", engName: "Gangjin-gun" },
      { code: "46820", name: "해남군", engName: "Haenam-gun" },
      { code: "46830", name: "영암군", engName: "Yeongam-gun" },
      { code: "46840", name: "무안군", engName: "Muan-gun" },
      { code: "46860", name: "함평군", engName: "Hampyeong-gun" },
      { code: "46870", name: "영광군", engName: "Yeonggwang-gun" },
      { code: "46880", name: "장성군", engName: "Jangseong-gun" },
      { code: "46890", name: "완도군", engName: "Wando-gun" },
      { code: "46900", name: "진도군", engName: "Jindo-gun" },
      { code: "46910", name: "신안군", engName: "Shinan-gun" }
    ]
  },

  // 경상북도
  "47": {
    name: "경상북도",
    engName: "Gyeongsangbuk-do",
    code: "47",
    children: [
      { code: "47110", name: "포항시", engName: "Pohang-si" },
      { code: "47111", name: "포항시 남구", engName: "Nam-gu, Pohang-si" },
      { code: "47113", name: "포항시 북구", engName: "Buk-gu, Pohang-si" },
      { code: "47130", name: "경주시", engName: "Gyeongju-si" },
      { code: "47150", name: "김천시", engName: "Gimcheon-si" },
      { code: "47170", name: "안동시", engName: "Andong-si" },
      { code: "47190", name: "구미시", engName: "Gumi-si" },
      { code: "47210", name: "영주시", engName: "Yeongju-si" },
      { code: "47230", name: "영천시", engName: "Yeongcheon-si" },
      { code: "47250", name: "상주시", engName: "Sangju-si" },
      { code: "47280", name: "문경시", engName: "Mungyeong-si" },
      { code: "47290", name: "경산시", engName: "Gyeongsan-si" },
      { code: "47720", name: "군위군", engName: "Gunwi-gun" },
      { code: "47730", name: "의성군", engName: "Uiseong-gun" },
      { code: "47750", name: "청송군", engName: "Cheongsong-gun" },
      { code: "47760", name: "영양군", engName: "Yeongyang-gun" },
      { code: "47770", name: "영덕군", engName: "Yeongdeok-gun" },
      { code: "47820", name: "청도군", engName: "Cheongdo-gun" },
      { code: "47830", name: "고령군", engName: "Goryeong-gun" },
      { code: "47840", name: "성주군", engName: "Seongju-gun" },
      { code: "47850", name: "칠곡군", engName: "Chilgok-gun" },
      { code: "47900", name: "예천군", engName: "Yecheon-gun" },
      { code: "47920", name: "봉화군", engName: "Bonghwa-gun" },
      { code: "47930", name: "울진군", engName: "Uljin-gun" },
      { code: "47940", name: "울릉군", engName: "Ulleung-gun" }
    ]
  },

  // 경상남도
  "48": {
    name: "경상남도",
    engName: "Gyeongsangnam-do",
    code: "48",
    children: [
      { code: "48120", name: "창원시", engName: "Changwon-si" },
      { code: "48121", name: "창원시 의창구", engName: "Uichang-gu, Changwon-si" },
      { code: "48123", name: "창원시 성산구", engName: "Seongsan-gu, Changwon-si" },
      { code: "48125", name: "창원시 마산합포구", engName: "Masan Happo-gu, Changwon-si" },
      { code: "48127", name: "창원시 마산회원구", engName: "Masan Hoewon-gu, Changwon-si" },
      { code: "48129", name: "창원시 진해구", engName: "Jinhae-gu, Changwon-si" },
      { code: "48170", name: "진주시", engName: "Jinju-si" },
      { code: "48220", name: "통영시", engName: "Tongyeong-si" },
      { code: "48240", name: "사천시", engName: "Sacheon-si" },
      { code: "48250", name: "김해시", engName: "Gimhae-si" },
      { code: "48270", name: "밀양시", engName: "Miryang-si" },
      { code: "48310", name: "거제시", engName: "Geoje-si" },
      { code: "48330", name: "양산시", engName: "Yangsan-si" },
      { code: "48720", name: "의령군", engName: "Uiryeong-gun" },
      { code: "48730", name: "함안군", engName: "Haman-gun" },
      { code: "48740", name: "창녕군", engName: "Changnyeong-gun" },
      { code: "48820", name: "고성군", engName: "Goseong-gun" },
      { code: "48840", name: "남해군", engName: "Namhae-gun" },
      { code: "48850", name: "하동군", engName: "Hadong-gun" },
      { code: "48860", name: "산청군", engName: "Sancheong-gun" },
      { code: "48870", name: "함양군", engName: "Hamyang-gun" },
      { code: "48880", name: "거창군", engName: "Geochang-gun" },
      { code: "48890", name: "합천군", engName: "Hapcheon-gun" }
    ]
  },

  // 제주특별자치도
  "50": {
    name: "제주특별자치도",
    engName: "Jeju-do",
    code: "50",
    children: [
      { code: "50110", name: "제주시", engName: "Jeju-si" },
      { code: "50130", name: "서귀포시", engName: "Seogwipo-si" }
    ]
  }
};

export default regionMapping;
