// src/data/regionData.js
export default {
    'seoul': {
        id: 'seoul',
        name: '서울특별시',
        color: '#ffffff',
        description: '서울은 대한민국의 수도이며, 600년 이상의 역사를 가진 도시로 전통과 현대가 공존하는 역동적인 도시입니다.',
        destinations: [
            {
                id: 'seoul-1',
                name: '경복궁',
                location: '서울 종로구',
                description: '조선 왕조의 법궁으로, 웅장한 건축물과 아름다운 정원이 특징입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1598258710957-65212bd19773?q=80&w=600'
            },
            {
                id: 'seoul-2',
                name: '남산서울타워',
                location: '서울 용산구',
                description: '서울의 중심에 위치한 랜드마크로, 도시의 환상적인 전망을 감상할 수 있습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1546874177-9e664107314e?q=80&w=600'
            },
            {
                id: 'seoul-3',
                name: '북촌 한옥마을',
                location: '서울 종로구',
                description: '전통 한옥이 밀집한 지역으로, 옛 서울의 모습을 간직한 문화 명소입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1602486243493-5848d76c6e5e?q=80&w=600'
            }
        ]
    },
    'gyeonggi': {
        id: 'gyeonggi',
        name: '경기도',
        color: '#ffffff',
        description: '경기도는 서울을 둘러싸고 있는 수도권 지역으로, 현대적인 도시와 풍부한 자연환경, 역사적 명소가 공존하는 다양한 매력을 가진 지역입니다.',
        destinations: [
            {
                id: 'gyeonggi-1',
                name: '수원화성',
                location: '경기도 수원시',
                description: '조선 후기에 축조된 성곽으로, 유네스코 세계문화유산으로 지정되었습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1597117641416-4eb2c16e79a0?q=80&w=600'
            },
            {
                id: 'gyeonggi-2',
                name: '에버랜드',
                location: '경기도 용인시',
                description: '한국 최대의 테마파크로, 다양한 놀이기구와 계절별 축제가 열립니다.',
                imageUrl: 'https://images.unsplash.com/photo-1670214993562-bbc30095bc6a?q=80&w=600'
            },
            {
                id: 'gyeonggi-3',
                name: '한탄강 지질공원',
                location: '경기도 포천시',
                description: '화산 활동으로 형성된 독특한 지형과 절경을 감상할 수 있는 국가지질공원입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?q=80&w=600'
            }
        ]
    },
    'incheon': {
        id: 'incheon',
        name: '인천광역시',
        color: '#ffffff',
        description: '인천은 서해안에 위치한 대한민국의 주요 항구도시로, 국제공항과 섬, 해안, 현대적인 도시 경관이 어우러진 매력적인 도시입니다.',
        destinations: [
            {
                id: 'incheon-1',
                name: '송도 센트럴파크',
                location: '인천광역시 연수구',
                description: '도심 속 녹지공간으로, 수로와 녹지가 조화를 이루는 현대적인 공원입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1626160705762-1a6be36bbf5f?q=80&w=600'
            },
            {
                id: 'incheon-2',
                name: '인천 차이나타운',
                location: '인천광역시 중구',
                description: '한국 최초의 차이나타운으로, 중국 음식과 문화를 체험할 수 있는 곳입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1584651766658-1b7a9e19ffb7?q=80&w=600'
            },
            {
                id: 'incheon-3',
                name: '월미도',
                location: '인천광역시 중구',
                description: '인천 앞바다에 위치한 섬으로, 놀이공원과 해변이 있는 인기 관광지입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1589536672709-28c4725eebc2?q=80&w=600'
            }
        ]
    },
    'daejeon': {
        id: 'daejeon',
        name: '대전광역시',
        color: '#ffffff',
        description: '대전은 한국의 중앙에 위치한 과학 기술의 중심지로, 국립중앙과학관과 대덕연구단지가 있으며, 도시와 자연이 조화롭게 어우러진 도시입니다.',
        destinations: [
            {
                id: 'daejeon-1',
                name: '국립중앙과학관',
                location: '대전광역시 유성구',
                description: '한국 최대 규모의 과학관으로, 다양한 과학 전시와 체험을 제공합니다.',
                imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=600'
            },
            {
                id: 'daejeon-2',
                name: '대전 엑스포 과학공원',
                location: '대전광역시 유성구',
                description: '1993년 대전 엑스포가 열렸던 곳으로, 한빛탑 등 다양한 볼거리가 있습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1507668339897-8a035aa9527d?q=80&w=600'
            },
            {
                id: 'daejeon-3',
                name: '장태산 자연휴양림',
                location: '대전광역시 서구',
                description: '울창한 메타세쿼이아 숲이 인상적인 도심 속 자연휴양지입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600'
            }
        ]
    },
    'gangwon': {
        id: 'gangwon',
        name: '강원도',
        color: '#ffffff',
        description: '한국의 대표적인 산악 지역인 강원도는 설악산과 오대산 등 아름다운 자연 경관으로 유명합니다. 겨울에는 스키장, 여름에는 해변이 인기 있는 사계절 관광지입니다.',
        destinations: [
            {
                id: 'gangwon-1',
                name: '설악산 국립공원',
                location: '강원도 속초시',
                description: '웅장한 바위 봉우리와 계곡이 있는 한국의 대표적인 국립공원입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1598030304671-5aa1d6f13fde?q=80&w=600'
            },
            {
                id: 'gangwon-2',
                name: '강릉 경포대',
                location: '강원도 강릉시',
                description: '아름다운 경포호수와 동해가 만나는 경포대는 일출 명소로 유명합니다.',
                imageUrl: 'https://images.unsplash.com/photo-1610011224685-92d8aac2752b?q=80&w=600'
            },
            {
                id: 'gangwon-3',
                name: '평창 용평리조트',
                location: '강원도 평창군',
                description: '2018 동계올림픽이 개최된 곳으로, 최고의 스키 리조트 중 하나입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=600'
            }
        ]
    },
    'chungbuk': {
        id: 'chungbuk',
        name: '충청북도',
        color: '#ffffff',
        description: '충청북도는 내륙에 위치한 지역으로, 충주호와 단양의 절경, 그리고 역사적인 유적지가 많이 있습니다.',
        destinations: [
            {
                id: 'chungbuk-1',
                name: '단양 도담삼봉',
                location: '충청북도 단양군',
                description: '남한강 물줄기 가운데 우뚝 솟은 세 개의 봉우리로 유명한 명승지입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1592471047092-39223dd80995?q=80&w=600'
            },
            {
                id: 'chungbuk-2',
                name: '청남대',
                location: '충청북도 청주시',
                description: '이전 대통령의 휴양지로 사용되었던 곳으로 지금은 관광지로 개방되었습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1591208333284-4f1185a1c087?q=80&w=600'
            },
            {
                id: 'chungbuk-3',
                name: '수안보온천',
                location: '충청북도 충주시',
                description: '한국의 대표적인 온천 중 하나로, 라듐 성분을 함유한 온천수로 유명합니다.',
                imageUrl: 'https://images.unsplash.com/photo-1581154306224-8449efd38f31?q=80&w=600'
            }
        ]
    },
    'chungnam': {
        id: 'chungnam',
        name: '충청남도',
        color: '#ffffff',
        description: '충청남도는 서해안을 끼고 있으며 산과 바다가 어우러진 자연 경관이 아름다운 지역입니다.',
        destinations: [
            {
                id: 'chungnam-1',
                name: '태안 해안국립공원',
                location: '충청남도 태안군',
                description: '아름다운 해변과 소나무 숲이 어우러진 해안 국립공원입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600'
            },
            {
                id: 'chungnam-2',
                name: '공주 공산성',
                location: '충청남도 공주시',
                description: '백제 시대의 왕성으로, 유네스코 세계문화유산으로 등재되었습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1582450871972-ab5ca641643d?q=80&w=600'
            },
            {
                id: 'chungnam-3',
                name: '부여 궁남지',
                location: '충청남도 부여군',
                description: '백제 시대의 궁궐 연못으로, 아름다운 풍경과 함께 역사적 의미가 있는 곳입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1591289009723-somefakeurl?q=80&w=600'
            }
        ]
    },
    'jeonbuk': {
        id: 'jeonbuk',
        name: '전라북도',
        color: '#ffffff',
        description: '전라북도는 한반도 남서부에 위치하며, 전통문화와 자연환경이 잘 보존된 곳입니다.',
        destinations: [
            {
                id: 'jeonbuk-1',
                name: '전주 한옥마을',
                location: '전라북도 전주시',
                description: '700여 채의 한옥이 모여 있는 전통마을로, 한국 전통 문화를 체험할 수 있습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1604382574483-86981b92fc57?q=80&w=600'
            },
            {
                id: 'jeonbuk-2',
                name: '내장산 국립공원',
                location: '전라북도 정읍시',
                description: '가을 단풍으로 유명한 국립공원으로, 아름다운 산과 계곡이 있습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?q=80&w=600'
            },
            {
                id: 'jeonbuk-3',
                name: '무주 리조트',
                location: '전라북도 무주군',
                description: '사계절 종합 리조트로, 특히 겨울 스키장으로 인기가 많습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1551698618-8d7bfef448c7?q=80&w=600'
            }
        ]
    },
    'jeonnam': {
        id: 'jeonnam',
        name: '전라남도',
        color: '#ffffff',
        description: '전라남도는 한반도 남서쪽 끝에 위치하며, 아름다운 해안선과 섬, 그리고 풍부한 문화유산을 자랑합니다.',
        destinations: [
            {
                id: 'jeonnam-1',
                name: '순천만 국가정원',
                location: '전라남도 순천시',
                description: '대한민국 최초의 국가정원으로, 다양한 테마 정원과 생태 습지가 있습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=600'
            },
            {
                id: 'jeonnam-2',
                name: '여수 해상케이블카',
                location: '전라남도 여수시',
                description: '바다 위를 지나는 케이블카로, 아름다운 여수 앞바다와 오동도를 감상할 수 있습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1544958360-d7e4c057c64d?q=80&w=600'
            },
            {
                id: 'jeonnam-3',
                name: '보성 녹차밭',
                location: '전라남도 보성군',
                description: '아름다운 경관을 자랑하는 한국 최대의 녹차 재배지입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1528826013548-0428496b8c7d?q=80&w=600'
            }
        ]
    },
    'gwangju': {
        id: 'gwangju',
        name: '광주광역시',
        color: '#ffffff',
        description: '광주는 전라남도의 중심 도시로, 풍부한 문화와 역사를 지닌 도시입니다.',
        destinations: [
            {
                id: 'gwangju-1',
                name: '광주 비엔날레',
                location: '광주광역시 북구',
                description: '아시아 최대의 현대미술 축제 중 하나로, 전 세계의 현대 예술작품이 전시됩니다.',
                imageUrl: 'https://images.unsplash.com/photo-1594536837057-52c3138d5280?q=80&w=600'
            },
            {
                id: 'gwangju-2',
                name: '국립 아시아문화전당',
                location: '광주광역시 동구',
                description: '아시아의 문화 교류와 창조적 활동의 중심지입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1530099486328-e021101a494a?q=80&w=600'
            },
            {
                id: 'gwangju-3',
                name: '무등산 국립공원',
                location: '광주광역시 북구',
                description: '광주의 상징인 무등산을 중심으로 한 국립공원으로, 아름다운 자연 경관을 자랑합니다.',
                imageUrl: 'https://images.unsplash.com/photo-1526675849333-ced0472c062b?q=80&w=600'
            }
        ]
    },
    'gyeongbuk': {
        id: 'gyeongbuk',
        name: '경상북도',
        color: '#ffffff',
        description: '경상북도는 한국 동북부에 위치한 지역으로, 신라의 고도 경주를 비롯한 풍부한 역사 유적이 있습니다.',
        destinations: [
            {
                id: 'gyeongbuk-1',
                name: '경주 불국사',
                location: '경상북도 경주시',
                description: '신라 시대의 대표적인 사찰로, 유네스코 세계문화유산으로 등재되었습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1597117641416-4eb2c16e79a0?q=80&w=600'
            },
            {
                id: 'gyeongbuk-2',
                name: '안동 하회마을',
                location: '경상북도 안동시',
                description: '조선 시대의 양반 마을로, 전통 가옥과 문화가 잘 보존되어 있습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1564295644023-16f14ac50b93?q=80&w=600'
            },
            {
                id: 'gyeongbuk-3',
                name: '독도',
                location: '경상북도 울릉군',
                description: '한국 동해에 위치한 섬으로, 아름다운 자연 경관을 자랑합니다.',
                imageUrl: 'https://images.unsplash.com/photo-1596097155664-4f5c49ba1b69?q=80&w=600'
            }
        ]
    },
    'daegu': {
        id: 'daegu',
        name: '대구광역시',
        color: '#ffffff',
        description: '대구는 경상북도 중심부에 위치한 대한민국의 광역시입니다. 다양한 문화와 역사적 명소가 있습니다.',
        destinations: [
            {
                id: 'daegu-1',
                name: '동성로',
                location: '대구광역시 중구',
                description: '대구의 대표적인 쇼핑 거리로, 다양한 상점과 음식점이 있습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1509839862600-309617c3201e?q=80&w=600'
            },
            {
                id: 'daegu-2',
                name: '팔공산',
                location: '대구광역시 동구',
                description: '대구를 상징하는 산으로, 아름다운 자연 경관과 함께 불교 문화의 중심지입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1549736285-1460aad0043f?q=80&w=600'
            },
            {
                id: 'daegu-3',
                name: '근대골목',
                location: '대구광역시 중구',
                description: '대구의 근대 역사를 엿볼 수 있는 곳으로, 다양한 문화 유산이 보존되어 있습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1518260243939-713511b3502b?q=80&w=600'
            }
        ]
    },
    'gyeongnam': {
        id: 'gyeongnam',
        name: '경상남도',
        color: '#ffffff',
        description: '경상남도는 한국 남동부에 위치한, 산과 바다가 공존하는 지역입니다.',
        destinations: [
            {
                id: 'gyeongnam-1',
                name: '통영',
                location: '경상남도 통영시',
                description: '아름다운 항구도시로, 한려해상국립공원과 케이블카가 유명합니다.',
                imageUrl: 'https://images.unsplash.com/photo-1587472164775-5b8bf4d11f9e?q=80&w=600'
            },
            {
                id: 'gyeongnam-2',
                name: '지리산 국립공원',
                location: '경상남도 하동군',
                description: '한국에서 가장 큰 국립공원 중 하나로, 아름다운 자연 경관을 자랑합니다.',
                imageUrl: 'https://images.unsplash.com/photo-1506260408121-e353d10b87c7?q=80&w=600'
            },
            {
                id: 'gyeongnam-3',
                name: '남해 독일마을',
                location: '경상남도 남해군',
                description: '독일식 건축양식의 마을로, 아름다운 풍경을 자랑합니다.',
                imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=600'
            }
        ]
    },
    'busan': {
        id: 'busan',
        name: '부산광역시',
        color: '#ffffff',
        description: '부산은 한국 제2의 도시로, 아름다운 해변과 항구, 그리고 다양한 문화를 자랑합니다.',
        destinations: [
            {
                id: 'busan-1',
                name: '해운대 해수욕장',
                location: '부산광역시 해운대구',
                description: '한국에서 가장 유명한 해변 중 하나로, 아름다운 백사장과 다양한 축제가 열립니다.',
                imageUrl: 'https://images.unsplash.com/photo-1578037571214-25e17ce0661f?q=80&w=600'
            },
            {
                id: 'busan-2',
                name: '감천문화마을',
                location: '부산광역시 사하구',
                description: '계단식 주택이 늘어선 독특한 풍경의 마을로, 다양한 예술 작품과 골목길이 인상적입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1525154661711-9daf8d0a3871?q=80&w=600'
            },
            {
                id: 'busan-3',
                name: '부산국제영화제',
                location: '부산광역시 해운대구',
                description: '아시아 최대 규모의 영화제 중 하나로, 매년 가을에 개최됩니다.',
                imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=600'
            }
        ]
    },
    'ulsan': {
        id: 'ulsan',
        name: '울산광역시',
        color: '#ffffff',
        description: '울산은 한국의 중요한 산업 도시로, 아름다운 자연과 산업 시설이 공존하는 곳입니다.',
        destinations: [
            {
                id: 'ulsan-1',
                name: '대왕암공원',
                location: '울산광역시 동구',
                description: '바다와 접한 공원으로, 아름다운 소나무 숲과 바다 경관을 즐길 수 있습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1599009944997-3544e319d206?q=80&w=600'
            },
            {
                id: 'ulsan-2',
                name: '태화강 국가정원',
                location: '울산광역시 중구',
                description: '도심을 가로지르는 태화강을 중심으로 조성된 아름다운 정원입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1556712356-8101753a16af?q=80&w=600'
            },
            {
                id: 'ulsan-3',
                name: '간절곶',
                location: '울산광역시 울주군',
                description: '한반도에서 가장 먼저 해가 뜨는 곳으로 알려진 해안 명소입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1560945665-76c2227fcf12?q=80&w=600'
            }
        ]
    },
    'jeju': {
        id: 'jeju',
        name: '제주특별자치도',
        color: '#ffffff',
        description: '한국의 남쪽에 위치한 화산섬으로, 아름다운 자연 경관과 독특한 문화가 특징입니다. 한라산, 폭포, 용암 동굴, 그리고 아름다운 해변으로 유명한 인기 관광지입니다.',
        destinations: [
            {
                id: 'jeju-1',
                name: '성산일출봉',
                location: '제주도 서귀포시',
                description: '화산 활동으로 만들어진 봉우리로, 유네스코 세계자연유산으로 등재되었습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1596450614279-fca86a7cd432?q=80&w=600'
            },
            {
                id: 'jeju-2',
                name: '한라산',
                location: '제주도 중앙',
                description: '한국에서 가장 높은 산으로, 다양한 등산로와 아름다운 경관을 자랑합니다.',
                imageUrl: 'https://images.unsplash.com/photo-1612734347103-12ca000be14c?q=80&w=600'
            },
            {
                id: 'jeju-3',
                name: '협재 해수욕장',
                location: '제주도 제주시',
                description: '에메랄드빛 바다와 하얀 모래사장이 아름다운 제주의 대표적인 해변입니다.',
                imageUrl: 'https://images.unsplash.com/photo-1540710920692-856f0e858e96?q=80&w=600'
            }
        ]
    },
    'sejong': {
        id: 'sejong',
        name: '세종특별자치시',
        color: '#ffffff',
        description: '세종특별자치시는 한국의 행정 중심 복합도시로, 주요 정부 부처와 기관이 위치해 있습니다.',
        destinations: [
            {
                id: 'sejong-1',
                name: '세종호수공원',
                location: '세종특별자치시',
                description: '세종시의 중심부에 위치한 넓은 호수공원으로, 다양한 레저 활동을 즐길 수 있습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?q=80&w=600'
            },
            {
                id: 'sejong-2',
                name: '국립세종도서관',
                location: '세종특별자치시',
                description: '현대적인 디자인의 도서관으로, 다양한 자료와 문화 프로그램을 제공합니다.',
                imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=600'
            },
            {
                id: 'sejong-3',
                name: '베어트리파크',
                location: '세종특별자치시',
                description: '다양한 테마 정원과 조형물이 있는 공원으로, 사계절 아름다운 풍경을 감상할 수 있습니다.',
                imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=600'
            }
        ]
    }
};