/**
 * MockDataService
 * Implements MovieDataProvider interface.
 * Provides static movie data to test UI flows (discovery, analysis, motif generation)
 * without requiring live external API keys.
 */

import { MovieDataProvider, MovieItem, MovieAnalysis, StoryMotif } from '../types';

export class MockDataService implements MovieDataProvider {
  private static instance: MockDataService;

  private movies: MovieItem[] = [
    {
      id: 'movie-parasite-2019',
      title: '기생충',
      originalTitle: 'Parasite',
      year: 2019,
      country: '대한민국',
      director: '봉준호',
      genre: ['드라마', '블랙코미디', '스릴러'],
      cast: ['송강호', '이선균', '조여정', '최우식', '박소담'],
      synopsis: '전원 백수로 살길이 막막하지만 사이는 좋은 기택 가족. 장남 기우에게 명문대생 친구가 박 사장네 고액 과외 자리를 소개하면서, 두 가족의 걷잡을 수 없는 만남이 시작된다.',
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      source: 'curated',
      notes: '칸 영화제 황금종려상 및 아카데미 4관왕 수상작. 계급 갈등과 선을 넘는 행위에 대한 날카로운 통찰.'
    },
    {
      id: 'movie-interstellar-2014',
      title: '인터스텔라',
      originalTitle: 'Interstellar',
      year: 2014,
      country: '미국',
      director: '크리스토퍼 놀란',
      genre: ['SF', '드라마', '모험', '스릴러'],
      cast: ['매튜 맥커너히', '앤 해서웨이', '제시카 차스테인', '마이클 케인'],
      synopsis: '식량 부족과 환경 파괴로 인류의 멸망이 다가온 시기, 전직 NASA 조종사 쿠퍼는 인류의 새 보금자리를 찾기 위해 사랑하는 자녀들을 지구에 남겨둔 채 웜홀을 통과하는 위험한 우주 탐사에 나선다.',
      posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
      source: 'curated',
      notes: '시공간과 차원을 초월하는 부모와 자식 간의 사랑의 중력을 과학적 경이로움과 융합한 수작.'
    },
    {
      id: 'movie-decision-to-leave-2022',
      title: '헤어질 결심',
      originalTitle: 'Decision to Leave',
      year: 2022,
      country: '대한민국',
      director: '박찬욱',
      genre: ['로맨스', '미스터리', '드라마'],
      cast: ['박해일', '탕웨이', '이정현', '고경표'],
      synopsis: '산 정상에서 추락한 한 남자의 변사 사건을 수사하게 된 형사 해준은 사망자의 아내 서래를 조사하면서 의심과 함께 알 수 없는 끌림을 느끼게 된다. 진실을 파헤칠수록 두 사람의 거리는 좁혀지지만, 결국 헤어질 결심에 이른다.',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      source: 'curated',
      notes: '칸 영화제 감독상 수상작. 사랑한다는 말 대신 붕괴와 미결로 완성되는 슬프고 매혹적인 심리극.'
    },
    {
      id: 'movie-cinema-paradiso-1988',
      title: '시네마 천국',
      originalTitle: 'Nuovo Cinema Paradiso',
      year: 1988,
      country: '이탈리아',
      director: '주세페 토르나토레',
      genre: ['드라마', '성장', '로맨스'],
      cast: ['필립 누아레', '살바토레 카시오', '마르코 레오나르디'],
      synopsis: '유명 영화감독으로 성공한 토토는 고향 시칠리아 마을의 늙은 영사기사 알프레도의 부고 소식을 듣고 30년 만에 고향으로 향한다. 어린 시절 영사실에서 필름을 만지며 알프레도와 나누었던 사랑과 우정, 그리고 꿈의 기억이 파노라마처럼 펼쳐진다.',
      posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80',
      source: 'curated',
      notes: '영화에 대한 헌사이자 인생의 성장, 떠남과 그리움의 미학을 전하는 세계적 클래식.'
    },
    {
      id: 'movie-titanic-1997',
      title: '타이타닉',
      originalTitle: 'Titanic',
      year: 1997,
      country: '미국',
      director: '제임스 카메론',
      genre: ['역사', '로맨스', '재난'],
      cast: ['레오나르도 디카프리오', '케이트 윈슬렛', '빌리 제인'],
      synopsis: '1912년 침몰하지 않는 배라 불리던 초호화 유람선 타이타닉호에서 가난한 떠돌이 화가 잭과 엄격한 상류층 약혼에 얽매여 있던 로즈가 운명적으로 만나 단 며칠 만에 영원한 사랑을 맹세하지만, 거대한 빙산과의 충돌로 운명의 밤을 맞이한다.',
      posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1498084393753-b411b2d26b34?auto=format&fit=crop&w=1200&q=80',
      source: 'curated',
      notes: '극한의 재난 속에서 발현되는 인간의 존엄성과 약속, 그리고 시간의 무게를 이겨낸 사랑의 서사.'
    }
  ];

  // Pre-calculated deep intelligence analysis for curated movies
  private analysisMap: Record<string, MovieAnalysis> = {
    'movie-parasite-2019': {
      id: 'analysis-parasite',
      movieId: 'movie-parasite-2019',
      movieTitle: '기생충',
      theme: {
        core: '공존을 꿈꾸는 두 계급 사이의 보이지 않는 선과 사회적 박탈감',
        humanInsight: '누구나 선량해지고 싶어 하지만, 경제적 여유와 환경이 그 도덕성을 좌우한다.',
        lifeMeaning: '인간의 존엄은 냄새나 옷차림 같은 사소한 선에서 지켜지거나 파괴된다.',
        socialMessage: '공생을 원하지만 결국 기생할 수밖에 없는 현대 자본주의 구조의 비극'
      },
      emotions: {
        primary: ['욕망', '불안', '수치심', '절망', '가족애'],
        intensity: 9,
        emotionalArc: '가벼운 유쾌함과 희망 → 숨 막히는 긴장과 비밀 → 수치심 폭발과 충격적 파국'
      },
      conflicts: {
        inner: '가난에 대한 콤플렉스와 부유층 행세를 하며 느끼는 자괴감',
        interpersonal: '비밀을 지키려는 침입자 가족과 기존 거주자 간의 생존 경쟁',
        societal: '수직적으로 격리된 주거 환경과 넘을 수 없는 계급의 보이지 않는 선',
        moralChoice: '자신의 가족을 구하기 위해 다른 약자의 자리를 빼앗는 행위의 정당화'
      },
      relationships: [
        { type: '가족 결속', characters: '기택과 기우, 기정, 충숙', dynamic: '극한의 결핍 속에서 서로를 속이지 않고 의지하는 끈끈한 생존 공동체' },
        { type: '고용인과 피고용인', characters: '기택과 박 사장', dynamic: '친절해 보이지만 끊임없이 \'선을 지킬 것\'을 요구하는 무언의 위계' },
        { type: '약자 간의 적대', characters: '기택 가족과 문광 부부', dynamic: '지하와 반지하에서 더 좁은 자리를 차지하기 위해 벌이는 처절한 진흙탕 싸움' }
      ],
      narrativeElements: {
        exposition: '반지하 방에서 와이파이를 잡으려 애쓰는 기택 일가의 일상과 과외 기회 포착',
        incitingIncident: '기우를 시작으로 온 가족이 신분을 위조해 박 사장 저택에 차례로 잠입',
        risingAction: '박 사장 가족이 캠핑을 떠난 밤, 지하실의 은밀한 비밀과 문광의 귀환으로 균열 시작',
        climax: '폭우로 반지하 집이 침수된 다음 날, 햇살 눈부신 정원 생일파티에서 벌어진 유혈 사태',
        resolution: '다시 지하로 숨어든 아버지 기택과, 그 집을 사겠다는 기우의 비현실적인 편지'
      },
      lifeLessons: [
        '가장 무서운 계획은 "무계획"이 아니라, 삶이 계획대로 되지 않는다는 사실을 인정하는 것이다.',
        '인간에 대한 진정한 예의는 상대의 보이지 않는 결핍을 냄새 맡지 않는 척해주는 배려다.',
        '약자들끼리의 연대가 무너질 때 가장 큰 비극이 발생한다.'
      ],
      confidence: 'high',
      evidenceSources: '칸 황금종려상 공식 심사평, 시나리오 분석, 감독 공식 인터뷰 기반',
      creativeDirections: [
        '우주 정거장의 상층 구역과 하층 폐기물 관리 구역 간의 기술 잠입 SF 스릴러',
        '명문 오케스트라의 수석 연주자 자리를 노리는 무명 연주자 가족의 음악 드라마',
        '조선 시대 양반가에 노비 신분을 속이고 서당 훈장으로 들어간 실학자 일가의 미스터리'
      ]
    },
    'movie-interstellar-2014': {
      id: 'analysis-interstellar',
      movieId: 'movie-interstellar-2014',
      movieTitle: '인터스텔라',
      theme: {
        core: '시간과 공간, 차원의 한계를 뛰어넘어 전달되는 부모 자식 간 사랑의 힘',
        humanInsight: '인간은 생존을 위해 이성을 따르지만, 위대한 기적은 비논리적인 사랑의 확신에서 비롯된다.',
        lifeMeaning: '약속을 지키려는 개인의 절박한 의지가 때로는 온 인류의 구원으로 확장된다.',
        socialMessage: '현재의 안락함에 안주해 미래를 포기한 문명은 결국 스스로 멸망에 이른다.'
      },
      emotions: {
        primary: ['그리움', '후회', '경외감', '희생', '희망'],
        intensity: 10,
        emotionalArc: '이별의 아픔과 결의 → 광활한 우주에서의 고독과 시간 상실의 오열 → 5차원 교감과 구원의 재회'
      },
      conflicts: {
        inner: '인류를 구해야 하는 대의와 내 아이의 곁을 지키고 싶은 부성애 사이의 분열',
        interpersonal: '살아남기 위해 동료를 배신하는 만 박사와 인류를 믿으려는 탐사대원 간의 충돌',
        societal: '진실을 숨긴 채 희생을 강요한 나사 지도부(브랜드 교수)와 속아온 파일럿들',
        moralChoice: '자신의 귀환 확률을 0으로 만들면서 지구의 딸에게 데이터를 송신하는 희생'
      },
      relationships: [
        { type: '부녀 간의 영적 약속', characters: '쿠퍼와 머피', dynamic: '수십 년의 시차가 벌어져도 결코 끊어지지 않는 손목시계의 신호와 신뢰' },
        { type: '과학적 스승과 제자', characters: '브랜드 교수와 아멜리아', dynamic: '인류 구원이라는 거대한 거짓말 속에서 서로 다른 방식으로 희망을 품음' },
        { type: '이간질된 동료', characters: '쿠퍼와 만 박사', dynamic: '인간성의 밑바닥(외로움에 굴복한 비겁함)과 마주하는 극한의 생존 대립' }
      ],
      narrativeElements: {
        exposition: '모래바람 부는 지구의 옥수수 농장에서 시들어가는 지구와 이상 중력 현상 관측',
        incitingIncident: '숨겨진 NASA 기지 발견 및 인류를 위한 라자로 프로젝트 탐사대 파일럿 차출',
        risingAction: '밀러 행성에서의 시간 지연으로 잃어버린 23년, 만 박사의 배신과 인듀어런스호의 폭발',
        climax: '블랙홀 가르강튀아의 사상의 지평선 너머 5차원 테서랙트 공간에서 딸의 방과 연결',
        resolution: '노인이 된 딸 머피와의 짧은 재회와, 또 다른 개척자 아멜리아를 향한 새로운 여정'
      },
      lifeLessons: [
        '사랑은 우리가 발명한 것이 아니며, 시간과 공간을 초월할 수 있는 유일하게 감지 가능한 증거다.',
        '순순히 어두운 밤을 받아들이지 마라. 꺼져가는 빛에 분노하고 또 분노하라.',
        '약속은 지켜질 때 비로소 시간을 이긴다.'
      ],
      confidence: 'high',
      evidenceSources: '킵 손 교수의 이론 물리학 감수서 및 크리스토퍼 놀란 각본 분석',
      creativeDirections: [
        '치매로 과거의 기억에 갇힌 어머니와, 어머니의 일기장을 통해 과거로 교감하는 딸의 휴먼 드라마',
        '멸망 직전의 잠수 도시에서 심해 바닥의 신호를 해독해 지상으로 아이를 탈출시키는 해양 스릴러',
        '편지를 보내면 30년 후에 도착하는 마법 우체통을 통해 마을을 구하는 판타지 서사'
      ]
    },
    'movie-decision-to-leave-2022': {
      id: 'analysis-decision-to-leave',
      movieId: 'movie-decision-to-leave-2022',
      movieTitle: '헤어질 결심',
      theme: {
        core: '마침내 사랑이 시작되는 순간 도달하게 되는 영원한 미결과 헤어질 결심',
        humanInsight: '어떤 사람은 비밀을 간직함으로써만 상대방의 마음속에 영원한 흔적으로 남고자 한다.',
        lifeMeaning: '인간의 마음은 바다의 안개처럼 모호하여, 의심과 매혹은 한 몸으로 얽힌다.',
        socialMessage: '엄격한 법과 도덕적 규칙도 인간의 깊은 고독과 갈망 앞에서는 무력하게 허물어진다.'
      },
      emotions: {
        primary: ['매혹', '의심', '비애', '갈망', '공허'],
        intensity: 8,
        emotionalArc: '호기심과 잠복 수사 → 서로의 결핍을 채우는 은밀한 호흡 → 붕괴된 자존심과 안개 속 실종'
      },
      conflicts: {
        inner: '품위 있는 형사로서의 직업 윤리와 용의자 여인에게 홀려버린 통제 불능의 마음',
        interpersonal: '단서를 쫓는 수사관과 취조실을 연애의 공간으로 바꾸어 버리는 신비로운 용의자',
        societal: '이민자이자 타자로서 사회의 편견에 맞서야 했던 한 여성의 처절한 생존',
        moralChoice: '사랑하는 사람의 범죄 증거(휴대폰)를 깊은 바다에 던져버리라고 말하는 파멸적 선택'
      },
      relationships: [
        { type: '취조와 교감의 이중주', characters: '장해준과 송서래', dynamic: '서로의 언어와 눈빛, 불면증을 공유하며 가장 깊은 이해자가 되는 아이러니' },
        { type: '일상의 건조한 계약', characters: '장해준과 아내 정안', dynamic: '주말 부부로서 의무와 건강식을 챙기지만 영혼의 온기가 사라진 관계' },
        { type: '추적자와 수수께끼', characters: '해준과 서래의 두 번째 남편 사건', dynamic: '다시 해준 앞에 피의자로 나타나 자신의 미결 사건이 되기를 자청하는 서래' }
      ],
      narrativeElements: {
        exposition: '불면증에 시달리는 베테랑 형사 해준, 산악 변사 사건으로 사망한 남자의 아내 서래를 대면',
        incitingIncident: '서래를 잠복 관찰하며 그녀의 외로움과 상처에 점점 깊이 동화되어 가는 해준',
        risingAction: '사건이 종결된 후 서래의 알리바이 조작을 알아채고 "나는 완전히 붕괴되었습니다" 선언',
        climax: '이포 바닷가에서 밀려오는 만조의 모래사장에 스스로 구덩이를 파고 들어가는 서래',
        resolution: '안개 자욱한 해변에서 파도 소리를 들으며 영원히 찾지 못할 서래의 이름을 부르는 해준'
      },
      lifeLessons: [
        '당신이 나를 사랑한다고 말한 순간 당신의 사랑은 끝났고, 그 순간 내 사랑은 시작되었습니다.',
        '인생에서 가장 영원한 것은 완결된 답이 아니라 결코 해결되지 않는 미결의 그리움이다.',
        '자신의 품위를 잃을 각오를 하지 않는다면 진정한 열정은 경험할 수 없다.'
      ],
      confidence: 'high',
      evidenceSources: '박찬욱 감독 정서경 작가 인터뷰 및 칸 영화제 비평 자료',
      creativeDirections: [
        '위작 감정사와 천재 위작 화가 사이의 예술적 매혹과 미술관 밀실 미스터리',
        '적국의 암호 해독관과 체포된 스파이 사이의 무언의 신호와 탈출 멜로드라마',
        '인공지능 상담사와 사용자 사이에서 발생하는 감정의 미결과 삭제된 데이터의 비밀'
      ]
    },
    'movie-cinema-paradiso-1988': {
      id: 'analysis-cinema-paradiso',
      movieId: 'movie-cinema-paradiso-1988',
      movieTitle: '시네마 천국',
      theme: {
        core: '인생의 꿈을 위해 치러야 하는 상실의 대가와 스승의 무조건적 사랑',
        humanInsight: '진정으로 누군가를 사랑한다면 그 사람이 더 넓은 세상으로 날아갈 수 있도록 밀어내야 한다.',
        lifeMeaning: '지나간 추억은 잘려나간 필름처럼 기억 속에 남아 삶의 가장 따뜻한 등불이 된다.',
        socialMessage: '전후 시골 마을 사람들을 하나로 묶어주었던 영화관이라는 문화적 유대의 소중함'
      },
      emotions: {
        primary: ['노스탤지어', '스승에 대한 그리움', '첫사랑의 아련함', '성장의 쓸쓸함'],
        intensity: 8,
        emotionalArc: '천진난만한 영사실의 추억 → 가슴 아픈 첫사랑과 마을을 떠남 → 검열 필름 릴의 선물과 오열'
      },
      conflicts: {
        inner: '고향에 남아 사랑과 안식을 찾고 싶은 마음과 대도시로 나가 예술가가 되고픈 야망',
        interpersonal: '토토의 앞날을 위해 독하게 "돌아보지 마라"고 떠미는 늙은 알프레도와 소년의 서운함',
        societal: '성당 신부의 엄격한 검열(키스신 삭제)과 억압된 시골 마을 사람들의 자유에 대한 갈망',
        moralChoice: '자신의 청춘을 뒤흔든 첫사랑의 엇갈림을 뒤로하고 미래를 선택한 방랑'
      },
      relationships: [
        { type: '아버지 이상의 스승', characters: '알프레도와 토토', dynamic: '눈을 잃은 영사기사와 눈부신 세상을 보게 해 준 소년의 피를 나눈 것보다 진한 사제 관계' },
        { type: '이루어지지 않은 첫사랑', characters: '토토와 엘레나', dynamic: '비 오는 날 창밖에서 기다리던 소년의 순정과 엇갈린 운명의 편지' }
      ],
      narrativeElements: {
        exposition: '시칠리아 소도시 잔칼도의 유일한 오락 공간인 시네마 천국 극장과 호기심 많은 토토',
        incitingIncident: '화재로 시력을 잃은 알프레도를 대신해 어린 토토가 마을의 새로운 영사기사가 됨',
        risingAction: '엘레나와의 슬픈 사랑과 군 복무, 그리고 "고향을 떠나 성공하기 전엔 오지 말라"는 알프레도의 명령',
        climax: '시네마 천국 극장이 철거되는 폐허 속에서 알프레도가 남긴 비밀 유품 필름 캔을 건네받음',
        resolution: '영사실에서 잘라 모아둔 수십 편의 영화 키스신 몽타주를 보며 눈물 흘리는 중년의 토토'
      },
      lifeLessons: [
        '삶은 네가 영화에서 보았던 것보다 훨씬 힘들고 잔인하다.',
        '무언가를 얻기 위해서는 반드시 소중한 무언가를 버릴 용기가 있어야 한다.',
        '시간이 흘러도 가슴에 남은 따뜻한 기억은 인간을 끝까지 지켜준다.'
      ],
      confidence: 'high',
      evidenceSources: '엔니오 모리코네 음악 분석 및 주세페 토르나토레 자전적 회고록',
      creativeDirections: [
        '사라져가는 동네 헌책방 할아버지와 그곳에서 글을 배운 소년이 베스트셀러 작가가 되어 돌아오는 드라마',
        '인공지능 요리 로봇에게 마지막 인간의 맛을 가르치고 떠나는 늙은 주방장의 성장 SF',
        '시골 아마추어 라디오 방송국을 지키던 엔지니어의 유산을 이어받는 손녀의 이야기'
      ]
    },
    'movie-titanic-1997': {
      id: 'analysis-titanic',
      movieId: 'movie-titanic-1997',
      movieTitle: '타이타닉',
      theme: {
        core: '자유를 향한 영혼의 해방과 생사의 기로에서 증명되는 인간 존엄의 약속',
        humanInsight: '인간의 가치는 그가 가진 보석이나 지위가 아니라 타인을 위해 자신을 내어주는 태도에 있다.',
        lifeMeaning: '단 며칠의 순수한 만남이 한 사람의 80년 인생 전체를 구원하고 변화시킬 수 있다.',
        socialMessage: '자연을 통제할 수 있다는 문명의 오만함이 부른 비극과 침몰선 앞의 평등성'
      },
      emotions: {
        primary: ['환희', '자유', '전율', '공포', '숭고한 헌신'],
        intensity: 9,
        emotionalArc: '구속된 새장의 절망 → 배의 뱃머리에서 만끽한 비상 → 침몰하는 선체 속 절규와 영원한 생존 약속'
      },
      conflicts: {
        inner: '정략결혼에 숨 막혀 투신하려던 상류층 여성의 내적 절망과 자유에 대한 동경',
        interpersonal: '자유로운 영혼의 잭과 로즈의 부유한 약혼자 칼의 계급적 증오와 집착',
        societal: '구명보트의 수가 1등석 승객 위주로 제한된 계급 차별적 선박 안전 체계',
        moralChoice: '차디찬 바닷속에서 나무 문짝 위에 로즈를 올려두고 자신은 얼어붙어 가는 잭의 희생'
      },
      relationships: [
        { type: '구원과 해방의 연인', characters: '잭 도슨과 로즈', dynamic: '세상의 시선을 벗어나 서로의 진정한 영혼을 비춰준 운명적 사랑' },
        { type: '지배와 소유의 약혼', characters: '칼 호클리와 로즈', dynamic: '다이아몬드로 환심을 사려 하지만 로즈의 자아를 인정하지 않는 억압적 지배' },
        { type: '침몰하는 배의 악단', characters: '월리스 하틀리와 음악가들', dynamic: '아비규환 속에서도 승객들의 안식을 위해 끝까지 악기를 놓지 않은 예술적 품위' }
      ],
      narrativeElements: {
        exposition: '바다 밑 타이타닉 잔해에서 발견된 나체 스케치와 101세 할머니 로즈의 회상 시작',
        incitingIncident: '배 뒤편에서 뛰어내리려던 로즈를 구해준 삼등석 승객 잭과의 만남',
        risingAction: '선미에서의 자유로운 비행, 차고지에서의 밀회, 그리고 자정을 넘긴 시간 빙산 충돌',
        climax: '두 동강 나는 거대한 타이타닉호의 꽁무니에 매달린 두 연인과 영하의 바다로의 추락',
        resolution: '잭의 손을 놓으며 "절대 포기하지 않겠다"고 맹세한 로즈가 훗날 당당한 여성으로 삶을 완주함'
      },
      lifeLessons: [
        '당신을 구원해 준 사람은 당신이 충만하게 살아가는 것을 볼 때 영원히 살아 숨 쉰다.',
        '인생은 한 장의 행운의 티켓과 같아서, 어떤 날을 살게 될지 결코 알 수 없다.',
        '모든 것이 가라앉을 때에도 끝까지 품위를 지키는 영혼들이 존재한다.'
      ],
      confidence: 'high',
      evidenceSources: '아카데미 11관왕 기록 및 제임스 카메론 제작 다큐멘터리',
      creativeDirections: [
        '초호화 성간 우주선이 블랙홀로 끌려들어 가는 순간 하층 정비공과 선장의 딸 사이의 탈출 서사',
        '화산 폭발 직전의 고대 도시 폼페이에서 신분을 뛰어넘어 서로를 구한 두 조각가의 하루',
        '무인도에 고립된 생존자 캠프에서 펼쳐지는 인간 본성과 약속에 관한 심리 스릴러'
      ]
    }
  };

  // Pre-calculated rich creative motifs (8-10 per curated movie)
  private motifsMap: Record<string, StoryMotif[]> = {
    'movie-parasite-2019': [
      {
        id: 'motif-para-1',
        movieId: 'movie-parasite-2019',
        title: '지워지지 않는 냄새의 기억',
        coreEmotion: ['수치심', '자각', '분노'],
        lifeTheme: '아무리 겉모습을 꾸며도 지울 수 없는 삶의 출신과 계급의 낙인',
        conflictStructure: '완벽하게 신분을 위장했으나, 아주 사소하고 원초적인 감각 하나로 정체가 탄로 날 위기',
        audienceResonance: '자신의 취약한 배경이나 숨기고 싶은 과거가 타인에게 들킬까 두려웠던 모든 현대인의 공감대',
        creativeDirection: '최고급 AI 기술 스타트업에 가짜 학력으로 입사한 주인공이 고향의 투박한 언어 습관 때문에 고위직들에게 의심받는 오피스 심리전',
        recommendedGenre: '현대 드라마 / 심리 스릴러',
        recommendedFormat: '60초 쇼츠 시리즈 (3부작)',
        originalityReview: {
          abstractionLevel: '감각적 낙인과 위장이라는 추상 모티브만 추출',
          separationTip: '반지하와 운전기사 설정을 벗어나 테크 기업과 언어 데이터 분석이라는 현대적 무대로 전환',
          isSafe: true
        }
      },
      {
        id: 'motif-para-2',
        movieId: 'movie-parasite-2019',
        title: '지하 계단 밑에 숨겨진 또 다른 입주자',
        coreEmotion: ['공포', '충격', '동질감'],
        lifeTheme: '내가 차지한 안락함 밑바닥에 나보다 더 절박한 자가 숨죽여 살고 있다는 자각',
        conflictStructure: '주인의 공간을 점유한 줄 알았으나, 벽장 뒤에 먼저 자리를 잡고 살아가던 선행자의 비밀을 맞닥뜨림',
        audienceResonance: '약자 위에 또 다른 약자가 층층이 포개져 있는 현대 피라미드 사회의 씁쓸한 현실',
        creativeDirection: '화려한 명품 백화점의 폐쇄된 구역에서 밤마다 살아가는 노숙자들의 자치 구역을 발견한 신입 보안요원의 딜레마',
        recommendedGenre: '도시 미스터리 / 서스펜스',
        recommendedFormat: '단편 영화형 시나리오',
        originalityReview: {
          abstractionLevel: '은밀한 공생과 중첩 공간 모티브 추출',
          separationTip: '박 사장의 집이나 문광 부부의 구체적 서사를 완전히 배제하고 백화점 폐쇄 구역이라는 새로운 공간 창작',
          isSafe: true
        }
      },
      {
        id: 'motif-para-3',
        movieId: 'movie-parasite-2019',
        title: '폭우가 내리던 밤의 침수와 정원의 햇살',
        coreEmotion: ['박탈감', '아이러니', '체념'],
        lifeTheme: '누군가에게는 낭만적인 캠핑의 취소일 뿐인 비가, 다른 이에겐 전 재산을 앗아가는 재앙이 되는 불평등',
        conflictStructure: '재난으로 모든 것을 잃은 이튿날 아침, 가해자 혹은 무관심한 자들의 파티에 강제로 웃으며 참석해야 하는 상황',
        audienceResonance: '기후 위기와 경제적 재난이 취약 계층에게만 가혹하게 전가되는 현실에 대한 묵직한 공감',
        creativeDirection: '대홍수로 농장을 잃은 청년 농부가, 같은 날 밤 최고급 샴페인 시음회를 연 와이너리 대지주의 집사로 일하며 느끼는 감정의 붕괴',
        recommendedGenre: '휴먼 드라마',
        recommendedFormat: '1~3분 시네마틱 숏폼',
        originalityReview: {
          abstractionLevel: '자연현상의 계급적 불균형이라는 사회적 테마 추출',
          separationTip: '생일파티 칼부림 대신, 조용하지만 뼈아픈 침묵의 대사로 감정의 극단을 표현',
          isSafe: true
        }
      },
      {
        id: 'motif-para-4',
        movieId: 'movie-parasite-2019',
        title: '절대 실패하지 않는 가장 완벽한 계획',
        coreEmotion: ['허탈함', '자기방어', '부성애'],
        lifeTheme: '계획을 세우면 반드시 어긋나기에, 애초에 계획이 없어야 상처받지 않는다는 방어기제',
        conflictStructure: '철저한 인생 계획을 신봉하는 자식과, 수많은 실패 끝에 체념을 배운 부모 간의 철학적 충돌',
        audienceResonance: '노력해도 계층 이동이 어려운 청년 세대의 N포 세대적 공허감과 기성세대의 무력감',
        creativeDirection: '수능을 망치고 방황하는 딸과, 평생 계획 없이 살아온 이동식 푸드트럭 아버지가 함께 전국을 누비며 부딪치는 로드 무비',
        recommendedGenre: '성장 / 힐링 코미디 드라마',
        recommendedFormat: '연속 에피소드 웹드라마',
        originalityReview: {
          abstractionLevel: '무계획 철학과 부자 간의 가치관 대립 모티브만 차용',
          separationTip: '비극적 결말 대신 따뜻한 부녀 간의 화해와 자기 긍정으로 재해석',
          isSafe: true
        }
      },
      {
        id: 'motif-para-5',
        movieId: 'movie-parasite-2019',
        title: '선을 넘지 말라는 무언의 경고',
        coreEmotion: ['모욕감', '긴장', '폭발 직전의 분노'],
        lifeTheme: '겉으로는 매너를 지키지만 자신의 안전거리를 침범당했을 때 드러나는 기득권의 차가운 냉소',
        conflictStructure: '서로를 아끼는 듯 보이던 멘토와 멘티 사이, 넘지 말아야 할 개인적 선이 시험대에 오름',
        audienceResonance: '직장이나 사회적 관계에서 무례함을 우아하게 포장하는 갑질에 상처받은 사람들의 깊은 울림',
        creativeDirection: '유명 스타 셰프의 주방에서 일하는 막내 요리사가 스승의 사적인 레시피 노트에 손을 대며 벌어지는 감정의 파동',
        recommendedGenre: '요리 / 미스터리 드라마',
        recommendedFormat: '3분 숏폼 시네마',
        originalityReview: {
          abstractionLevel: '인간관계의 보이지 않는 선이라는 심리적 갈등 추출',
          separationTip: '가정부/운전기사 구도를 주방의 도제 시스템으로 치환',
          isSafe: true
        }
      },
      {
        id: 'motif-para-6',
        movieId: 'movie-parasite-2019',
        title: '신분을 속여 잡은 기회와 꼬리를 무는 거짓말',
        coreEmotion: ['스릴', '도덕적 혼란', '위태로움'],
        lifeTheme: '작은 거짓말로 시작된 성공이 걷잡을 수 없이 커져 진짜 자아를 집어삼키는 과정',
        conflictStructure: '가짜 명함 하나로 상류 사교계의 총아가 되었으나, 진짜 신분을 아는 유일한 고향 친구의 등장',
        audienceResonance: 'SNS와 스펙 경쟁 속에서 과장된 가면을 쓰고 살아가는 현대인들의 가면증후군',
        creativeDirection: '동명의 유명 미술 큐레이터로 오해받은 갤러리 청소부가 첫 전시회를 성공시키기 위해 벌이는 서스펜스 사기극',
        recommendedGenre: '케이퍼 / 블랙 코미디',
        recommendedFormat: '쇼츠 5부작',
        originalityReview: {
          abstractionLevel: '신분 상승을 위한 거짓말의 연쇄 작용 추출',
          separationTip: '가족 전체의 공모가 아닌 개인의 예술적 재능과 허영의 충돌로 재구성',
          isSafe: true
        }
      },
      {
        id: 'motif-para-7',
        movieId: 'movie-parasite-2019',
        title: '약자들의 진흙탕 파이 싸움',
        coreEmotion: ['비애', '안타까움', '격렬함'],
        lifeTheme: '거대한 권력자에게 대항하지 못하고, 오직 한정된 빵 조각을 두고 서로를 찌르는 슬픈 연대 실패',
        conflictStructure: '재계약 직전의 기간제 교사 둘이 서로의 흠결을 폭로하며 마지막 1자리를 두고 벌이는 사투',
        audienceResonance: '각자도생의 사회에서 타인의 불행을 딛고 올라서야만 하는 잔혹한 서바이벌의 고통',
        creativeDirection: '폐선박 해체 작업장에서 단 한 명만 육지 정규직으로 복귀할 수 있다는 통보를 받은 두 이주 노동자의 우정과 갈등',
        recommendedGenre: '사회파 휴먼 드라마',
        recommendedFormat: '단편 영화',
        originalityReview: {
          abstractionLevel: '약자 간의 배타적 생존 경쟁 모티브 추출',
          separationTip: '원작의 지하실 혈투와 전혀 다른 산업 현장 배경과 도덕적 결단 도입',
          isSafe: true
        }
      },
      {
        id: 'motif-para-8',
        movieId: 'movie-parasite-2019',
        title: '그 집을 사겠다는 불가능한 약속',
        coreEmotion: ['애틋함', '환상', '의지'],
        lifeTheme: '현실적으로 이룰 수 없는 거대한 목표를 가슴에 품음으로써 오늘을 견디는 인간의 슬픈 생명력',
        conflictStructure: '감옥 같은 공간에 갇힌 이를 구하기 위해, 평생을 바쳐도 불가능한 천문학적 금액을 벌겠다고 맹세하는 주인공',
        audienceResonance: '불가능해 보이는 꿈이라도 그것을 품고 있을 때만 영혼이 마르지 않는다는 희망의 양면성',
        creativeDirection: '재개발로 헐린 옛 달동네 터에 세워진 초고층 펜트하우스를 사서 치매 걸린 할머니에게 돌려주겠다고 결심한 청년의 분투기',
        recommendedGenre: '청춘 / 드라마',
        recommendedFormat: '연속 숏폼 시리즈',
        originalityReview: {
          abstractionLevel: '상징적 공간을 되찾겠다는 맹세의 서사 모티브 추출',
          separationTip: '원작의 살인범 아버지 은신처 구조를 온화한 가족의 기억 회복으로 치환',
          isSafe: true
        }
      }
    ],
    'movie-interstellar-2014': [
      {
        id: 'motif-inte-1',
        movieId: 'movie-interstellar-2014',
        title: '손목시계의 초침이 보내는 유령의 신호',
        coreEmotion: ['경이', '애틋함', '통한'],
        lifeTheme: '오래된 낡은 물건에 깃든 그리움이 차원을 넘어 누군가의 인생을 구원하는 열쇠가 됨',
        conflictStructure: '가장 소중한 사람에게 닿을 수 없으나, 아주 미세한 사물의 떨림으로 진실을 전달하려 애쓰는 자',
        audienceResonance: '세상을 떠난 부모님이나 소중한 사람이 남긴 유품에서 특별한 온기를 느껴본 경험',
        creativeDirection: '벽시계 장인이었던 아버지가 남긴 수백 개의 시계 중, 단 하나가 불규칙하게 초침을 멈추는 이유를 추적하는 딸의 타임슬립 미스터리',
        recommendedGenre: '감성 미스터리 / 판타지',
        recommendedFormat: '60초 쇼츠 (감성 서사)',
        originalityReview: {
          abstractionLevel: '유품의 신호와 시간을 초월한 교감 모티브 추출',
          separationTip: '블랙홀 테서랙트 대신 아날로그 시계 공방의 서정적인 비밀로 전환',
          isSafe: true
        }
      },
      {
        id: 'motif-inte-2',
        movieId: 'movie-interstellar-2014',
        title: '나의 1시간이 당신에게는 20년의 세월',
        coreEmotion: ['상실감', '비통함', '시간의 잔혹함'],
        lifeTheme: '잠깐의 지체나 선택의 차이로 인해, 사랑하는 사람의 청춘과 생애 전체를 놓쳐버린 비극',
        conflictStructure: '긴급한 임무를 마치고 돌아왔으나 이미 소중한 사람은 노인이 되어 나를 기다리다 지쳐 있음',
        audienceResonance: '일과 성공을 쫓느라 아이가 자라는 모습이나 부모님이 늙어가는 시간을 놓쳐버린 현대인의 죄책감',
        creativeDirection: '장기 해외 파병이나 원양어선 항해에서 돌아왔을 때, 훌쩍 커버려 자신을 낯설어하는 아이를 마주한 아빠의 마음을 그린 가족 드라마',
        recommendedGenre: '휴먼 가족 드라마',
        recommendedFormat: '단편 시나리오',
        originalityReview: {
          abstractionLevel: '상대적 시간 흐름에 따른 상실감이라는 본질적 정서 추출',
          separationTip: '우주 행성의 중력 대신 현실적인 격리 상황과 세월의 단절로 치환',
          isSafe: true
        }
      },
      {
        id: 'motif-inte-3',
        movieId: 'movie-interstellar-2014',
        title: '인류를 위한 거짓말과 희생양들',
        coreEmotion: ['배신감', '도덕적 분노', '책임감'],
        lifeTheme: '거대한 대의를 위해 소수의 헌신자들에게 진실을 숨긴 채 영원한 편도를 강요한 지도자의 위선',
        conflictStructure: '돌아올 방법이 처음부터 없었다는 비밀을 뒤늦게 깨달은 현장 요원들의 분노와 절망',
        audienceResonance: '국가나 조직의 비전을 위해 개인의 청춘을 소모품처럼 쓰이고 버려진 이들의 상처',
        creativeDirection: '방사능 누출 재난 구역에 "곧 교대자가 올 것"이라는 본부의 약속을 믿고 1년간 버틴 엔지니어들이 무전이 끊겼을 때의 결단',
        recommendedGenre: '재난 스릴러',
        recommendedFormat: '3분 숏폼 시네마',
        originalityReview: {
          abstractionLevel: '플랜A와 플랜B의 기만 구조 모티브 추출',
          separationTip: '우주 탐사가 아닌 지상 재난 기지로 무대를 옮겨 긴장감 강화',
          isSafe: true
        }
      },
      {
        id: 'motif-inte-4',
        movieId: 'movie-interstellar-2014',
        title: '가장 훌륭했던 영웅의 비겁한 밑바닥',
        coreEmotion: ['환멸', '인간 본성의 두려움', '생존 집착'],
        lifeTheme: '모두가 존경하던 도덕적 표상이 극한의 고독과 죽음의 공포 앞에서 가장 추악하게 무너지는 순간',
        conflictStructure: '구조대를 유인하기 위해 거짓 신호를 보낸 전설적인 탐험가와 그를 구하러 온 후배 간의 피할 수 없는 결투',
        audienceResonance: '신뢰하던 지도자나 멘토의 이기적인 민낯을 보았을 때 찾아오는 깊은 배신감',
        creativeDirection: '히말라야 조난 사고에서 전설적인 산악인이 동료의 산소통을 훔쳐 혼자 하산했다는 사실을 밝혀내려는 다큐멘터리 PD의 추적극',
        recommendedGenre: '산악 스릴러 / 탐사 심리극',
        recommendedFormat: '영화형 시나리오',
        originalityReview: {
          abstractionLevel: '고독에 굴복한 영웅의 타락 모티브 추출',
          separationTip: '얼음 행성의 만 박사 설정 대신 현실 산악 조난 서사로 재구성',
          isSafe: true
        }
      },
      {
        id: 'motif-inte-5',
        movieId: 'movie-interstellar-2014',
        title: '사랑은 차원을 초월하는 유일한 중력이다',
        coreEmotion: ['신념', '숭고함', '사랑의 힘'],
        lifeTheme: '수학적 계산이나 이성으로는 설명할 수 없는 감정의 이끌림이 결국 올바른 답으로 인도함',
        conflictStructure: '확률 99%의 안전한 길 대신, 오직 직관과 사랑하는 이를 만나겠다는 일념으로 미지의 길을 택하는 승부수',
        audienceResonance: '세상이 모두 무모하다고 말리는 선택 속에서도 내면의 목소리를 따라 기적을 이뤄낸 경험',
        creativeDirection: '모든 생존 확률 계산기가 ‘포기하라’고 경고하는 인공지능 자율운항 잠수함에서 조난된 탐사선원을 구하러 직접 수심으로 뛰어드는 항해사의 이야기',
        recommendedGenre: 'SF 어드벤처 / 로맨스',
        recommendedFormat: '60초 쇼츠 (희망적 결말)',
        originalityReview: {
          abstractionLevel: '사랑의 초이성적 추진력 테마 추출',
          separationTip: '심해 해양 탐사 배경으로 변경하여 완전히 새로운 시각적 쾌감 창출',
          isSafe: true
        }
      },
      {
        id: 'motif-inte-6',
        movieId: 'movie-interstellar-2014',
        title: '아이의 질문에 답하지 못하고 떠난 부모',
        coreEmotion: ['죄책감', '갈망', '미완의 약속'],
        lifeTheme: '"언제 돌아올 거냐"는 마지막 물음에 "반드시 돌아오겠다"는 말밖에 해줄 수 없었던 이별',
        conflictStructure: '가족을 살리기 위해 가족의 곁을 떠나야만 하는 아이러니한 운명의 기로',
        audienceResonance: '가족을 부양하기 위해 타지로 떠나 오랜 기간 떨어져 지내야 하는 노동자들의 보편적 슬픔',
        creativeDirection: '광산 붕괴 사고에서 매몰된 동료들을 구하기 위해 지하 갱도로 재진입하며 유치원 입학식을 약속하는 아버지의 하루',
        recommendedGenre: '휴먼 드라마',
        recommendedFormat: '단편 드라마',
        originalityReview: {
          abstractionLevel: '귀환 약속과 강제된 이별 모티브 추출',
          separationTip: 'SF 우주선 대신 광산 매몰 현장의 현실적 서스펜스로 탈바꿈',
          isSafe: true
        }
      },
      {
        id: 'motif-inte-7',
        movieId: 'movie-interstellar-2014',
        title: '죽어가는 세계에서 별을 꿈꾸는 자들',
        coreEmotion: ['열정', '저항', '비전'],
        lifeTheme: '모두가 밥벌이와 당장의 생존에 매몰되어 있을 때, 불가능한 하늘을 올려다보는 몽상가의 외로움',
        conflictStructure: '실용적인 농업과 안주를 강요하는 사회 시스템에 맞서 기초 과학과 탐험의 가치를 지키려는 주인공',
        audienceResonance: '꿈을 좇는 것을 사치로 치부하는 삭막한 현실 속에서 나만의 꿈을 간직한 이들의 분투',
        creativeDirection: '전쟁 직후 폐허가 된 도시에서 라디오 부품을 모아 달과의 교신을 시도하는 작은 전파상 소년의 성장기',
        recommendedGenre: '레트로 성장 / 드라마',
        recommendedFormat: '연속 에피소드',
        originalityReview: {
          abstractionLevel: '퇴행하는 사회 속 탐구정신이라는 테마 추출',
          separationTip: '근미래 지구 식량위기 대신 전후 역사적 시대 배경으로 재배치',
          isSafe: true
        }
      },
      {
        id: 'motif-inte-8',
        movieId: 'movie-interstellar-2014',
        title: '자신보다 늙어버린 아이를 마주하는 침묵',
        coreEmotion: ['초월적 슬픔', '안도', '작별'],
        lifeTheme: '시간의 역전을 겪어 마침내 재회했으나, 이제는 아이가 나를 떠나보내 줄 차례가 된 순간',
        conflictStructure: '평생을 바쳐 찾아왔지만, 이미 소중한 사람은 자기만의 삶을 완주하고 생의 마지막 침상에 누워 있음',
        audienceResonance: '생의 끝에서 마침내 응어리진 오해를 풀고 서로를 놓아주는 숭고한 작별의 순간',
        creativeDirection: '냉동 수면에서 50년 만에 깨어난 청년이 호스피스 병동에서 80세의 할머니가 된 옛 첫사랑의 손을 잡아주는 멜로 드라마',
        recommendedGenre: '로맨스 / SF 드라마',
        recommendedFormat: '3분 숏폼 시네마',
        originalityReview: {
          abstractionLevel: '나이를 역전한 혈육/연인의 임종 재회 모티브 추출',
          separationTip: '쿠퍼스테이션 병실 장면의 복제가 아닌 냉동 수면 환자의 정서적 화해로 변형',
          isSafe: true
        }
      }
    ],
    'movie-decision-to-leave-2022': [
      {
        id: 'motif-dec-1',
        movieId: 'movie-decision-to-leave-2022',
        title: '미결(未決)로 남겨둠으로써 영원해지는 사랑',
        coreEmotion: ['애절함', '집착', '품위'],
        lifeTheme: '완결되어 잊혀지는 평범한 관계 대신, 영원히 풀리지 않는 수수께끼로 상대의 마음에 각인되길 택함',
        conflictStructure: '사건을 해결해야 직성이 풀리는 집요한 자와, 영원히 해결되지 않는 단서만 남기고 사라지는 자의 줄다리기',
        audienceResonance: '끝나버린 사랑보다 마침표를 찍지 못해 가슴 한구석에 평생 박혀 있는 기억의 위력',
        creativeDirection: '자신의 도난당한 명화를 평생 추적하던 형사에게, 매년 그 그림의 일부분만을 잘라 우편으로 부치며 숨바꼭질을 이어가는 도둑의 황혼',
        recommendedGenre: '로맨틱 서스펜스 / 하이스트',
        recommendedFormat: '60초 쇼츠 (미스터리 3부작)',
        originalityReview: {
          abstractionLevel: '미결과 영원성에 관한 심리적 구조 추출',
          separationTip: '살인 사건과 수사관 대신 예술품 도난과 은밀한 서신 교환으로 변주',
          isSafe: true
        }
      },
      {
        id: 'motif-dec-2',
        movieId: 'movie-decision-to-leave-2022',
        title: '붕괴를 감수하고 던져버린 증거',
        coreEmotion: ['자멸적 사랑', '수치', '파멸'],
        lifeTheme: '평생을 지켜온 자신의 자부심과 직업적 신념을 한순간에 무너뜨릴 만큼 통제할 수 없는 매혹',
        conflictStructure: '직접 손에 쥔 상대의 유죄 증거를 파기함으로써 자신 역시 범죄의 공범이자 붕괴된 인간이 됨',
        audienceResonance: '이성적으로는 파멸로 가는 길임을 알면서도 온 마음을 내던졌던 격정적인 선택의 기억',
        creativeDirection: '청렴결백으로 명성이 자자한 감사관이 존경하던 여성 연구원의 치명적 연구 조작 데이터를 직접 영구 삭제해주고 사표를 쓰는 학술 스릴러',
        recommendedGenre: '심리 서스펜스',
        recommendedFormat: '단편 시나리오',
        originalityReview: {
          abstractionLevel: '신념의 붕괴와 자기희생적 은폐 모티브 추출',
          separationTip: '휴대폰을 바다에 던지는 구체적 행위 대신 디지털 데이터 삭제와 학계 스캔들로 전환',
          isSafe: true
        }
      },
      {
        id: 'motif-dec-3',
        movieId: 'movie-decision-to-leave-2022',
        title: '취조실의 초밥 도시락과 은밀한 친밀감',
        coreEmotion: ['설렘', '긴장', '기묘한 안도'],
        lifeTheme: '가장 적대적이고 경계해야 할 공적인 자리에서 역설적으로 인생에서 가장 깊은 이해를 경험함',
        conflictStructure: '신문하고 신문당하는 살얼음판 같은 심문실이 두 고독한 영혼이 숨 쉴 수 있는 유일한 은신처가 됨',
        audienceResonance: '차가운 세상의 시선 속에서 뜻밖의 장소와 순간에 나를 온전히 알아봐 주는 사람을 만났을 때의 전율',
        creativeDirection: '국경 검문소에서 위조 여권으로 붙잡힌 난민 여성과 그녀를 심사하는 국경 수비대원이 나누는 밤샘 심문과 마음의 교류',
        recommendedGenre: '밀실 드라마',
        recommendedFormat: '3분 숏폼 시네마',
        originalityReview: {
          abstractionLevel: '심문 공간의 은밀한 안식처화 모티브 추출',
          separationTip: '경찰서 취조실을 국경 검문소 밀실로 변경하고 정치적/인간적 딜레마 부각',
          isSafe: true
        }
      },
      {
        id: 'motif-dec-4',
        movieId: 'movie-decision-to-leave-2022',
        title: '파도가 밀려오는 모래사장 속의 침묵',
        coreEmotion: ['장엄한 슬픔', '체념', '영원성'],
        lifeTheme: '자신의 존재를 지움으로써 상대방의 마음에 지워지지 않는 거대한 바다를 선물함',
        conflictStructure: '밀려드는 만조의 바다를 바라보며 스스로를 감추는 자와, 발자국을 뒤늦게 쫓아 절규하는 자',
        audienceResonance: '아무리 외쳐도 되돌릴 수 없는 상실 앞에서의 무력감과 가슴 먹먹한 여운',
        creativeDirection: '눈 덮인 고요한 시베리아 횡단열차에서 내린 여인이 하얀 설원 속으로 걸어 들어가고, 뒤늦게 정차역을 알아챈 남자의 달음박질',
        recommendedGenre: '시네마틱 로맨스',
        recommendedFormat: '단편 영화',
        originalityReview: {
          abstractionLevel: '자발적 실종과 자연 속 흡수 모티브 추출',
          separationTip: '서해 갯벌 구덩이 대신 설원과 기차역의 시각적 미장센으로 대체',
          isSafe: true
        }
      },
      {
        id: 'motif-dec-5',
        movieId: 'movie-decision-to-leave-2022',
        title: '서로 다른 언어로 속삭이는 가장 정확한 진심',
        coreEmotion: ['이국적 매혹', '소통의 갈망', '단절'],
        lifeTheme: '모국어가 달라 번역기를 거쳐야 하지만, 억양과 눈빛만으로 어떤 유창한 말보다 더 깊이 통하는 역설',
        conflictStructure: '정확한 단어를 찾지 못해 생기는 오해와, 오히려 침묵과 표정으로 완성되는 진실',
        audienceResonance: '말이 통하지 않아도 마음이 먼저 닿았던 사람과의 신비로운 교감의 경험',
        creativeDirection: '국제 우주 정거장에서 통신 장애로 고립된 한국인 우주비행사와 프랑스 엔지니어가 수신호와 기계 도면으로 나누는 동료애와 애틋함',
        recommendedGenre: 'SF 멜로',
        recommendedFormat: '연속 에피소드',
        originalityReview: {
          abstractionLevel: '언어의 장벽을 넘어서는 비언어적 교감 테마 추출',
          separationTip: '중국어 번역기 앱 대신 우주 공간의 기호 소통으로 확장',
          isSafe: true
        }
      },
      {
        id: 'motif-dec-6',
        movieId: 'movie-decision-to-leave-2022',
        title: '불면증을 앓는 자의 잠든 숨소리',
        coreEmotion: ['평온', '신뢰', '치유'],
        lifeTheme: '세상의 그 어떤 약으로도 치료할 수 없던 오랜 불안이 오직 그 사람의 곁에서만 씻은 듯 사라짐',
        conflictStructure: '잠들지 못하는 수사관의 긴장을 무장해제 시키며 그의 수면 호흡을 맞춰주는 용의자의 온기',
        audienceResonance: '극도의 만성 스트레스 속에서 누군가의 존재만으로 온전한 쉼을 얻어본 경험',
        creativeDirection: '소음 공포증으로 방음벽에 갇혀 지내던 음향 전문가가 아래층에서 들려오는 투박한 첼로 연습 소리에 비로소 깊은 잠에 빠져드는 힐링 서사',
        recommendedGenre: '사운드 힐링 드라마',
        recommendedFormat: '60초 쇼츠',
        originalityReview: {
          abstractionLevel: '불면과 심리적 무장해제 모티브 추출',
          separationTip: '호흡 동기화 장면을 첼로 음악과 청각적 안정으로 재해석',
          isSafe: true
        }
      },
      {
        id: 'motif-dec-7',
        movieId: 'movie-decision-to-leave-2022',
        title: '산(山)을 좋아하는 사람과 바다(海)를 좋아하는 사람',
        coreEmotion: ['대비', '운명적 불일치', '이끌림'],
        lifeTheme: '한 사람은 단단하고 변함없는 산을 닮았고 다른 사람은 끊임없이 일렁이는 바다를 닮아 만날 수 없는 운명',
        conflictStructure: '원칙과 질서를 추구하는 자와 흔들림과 유연함을 살아가는 자의 서로를 향한 자석 같은 인력',
        audienceResonance: '나와 정반대의 성향을 가진 사람에게 걷잡을 수 없이 매료되어 본 사람들의 깊은 탄식',
        creativeDirection: '보수적인 지질학 연구원과 방랑하는 해양 생태 다큐멘터리 수중 촬영 감독의 섬 탐사 프로젝트 이야기',
        recommendedGenre: '로맨스 드라마',
        recommendedFormat: '단편 영화형 시나리오',
        originalityReview: {
          abstractionLevel: '자연 상징물의 인물 대비 구조 추출',
          separationTip: '산악 추락사와 익사 대신 지질 조사와 해양 보존이라는 새로운 서사적 목표 부여',
          isSafe: true
        }
      },
      {
        id: 'motif-dec-8',
        movieId: 'movie-decision-to-leave-2022',
        title: '벽면에 빼곡히 붙여둔 미해결 사진들',
        coreEmotion: ['강박', '외로움', '비밀'],
        lifeTheme: '해결하지 못한 과거의 상처와 얼굴들을 벽에 걸어두고 매일 밤 그 고통과 대화하는 인간의 숙명',
        conflictStructure: '일상으로 돌아가라는 가족의 권유와, 벽면의 사진들을 떼어내지 못하는 집착 사이의 갈등',
        audienceResonance: '잊어야 마땅하지만 잊을 수 없는 후회스러운 사건을 가슴에 매달고 살아가는 이들의 독백',
        creativeDirection: '미제 실종 사건 전담반에서 은퇴한 형사가 서재 가득 모아둔 실종 아동들의 사진을 정리하던 중 발견한 마지막 단서',
        recommendedGenre: '휴먼 미스터리',
        recommendedFormat: '연속 숏폼 시리즈',
        originalityReview: {
          abstractionLevel: '미제 사건 벽면과 강박적 시선 모티브 추출',
          separationTip: '로맨스 수사극 대신 실종 아동 찾기라는 사회적 구원의 서사로 승화',
          isSafe: true
        }
      }
    ],
    'movie-cinema-paradiso-1988': [
      {
        id: 'motif-cine-1',
        movieId: 'movie-cinema-paradiso-1988',
        title: '신부가 검열하여 잘라낸 수백 편의 키스신 필름',
        coreEmotion: ['사랑의 기억', '해방감', '벅찬 감동'],
        lifeTheme: '세상이 금지하고 삭제했던 가장 아름다운 순간들이 모여 삶의 가장 위대한 유산이 됨',
        conflictStructure: '당대에는 가려지고 잘려나갔던 파편들을 평생 비밀리에 모아온 늙은 스승의 마지막 선물',
        audienceResonance: '지나간 사랑의 찰나들이 지금의 나를 지탱하고 있다는 인생의 아련한 깨달음',
        creativeDirection: '엄격한 기숙학교에서 압수당했던 학생들의 연애편지를 40년 동안 보관해 온 사감 선생님의 장례식에서 펼쳐지는 편지 낭독회',
        recommendedGenre: '노스탤지어 휴먼 드라마',
        recommendedFormat: '60초 감성 쇼츠',
        originalityReview: {
          abstractionLevel: '검열된 사랑의 파편 수집과 사후 선물 모티브 추출',
          separationTip: '필름 키스신 대신 학교의 압수 편지함이라는 따뜻한 학창 시절 무대로 전환',
          isSafe: true
        }
      },
      {
        id: 'motif-cine-2',
        movieId: 'movie-cinema-paradiso-1988',
        title: '돌아보지 마라, 절대로 고향에 오지 마라',
        coreEmotion: ['비장함', '애착과 결별', '성장의 아픔'],
        lifeTheme: '자식 같은 제자의 날개가 꺾이지 않도록 스스로 냉정하고 모진 악역을 자처하는 참된 사랑',
        conflictStructure: '고향의 따뜻한 품에 주저앉고 싶은 청년과, 성공하기 전엔 돌아오지 말라며 문을 닫아거는 스승',
        audienceResonance: '꿈을 위해 고향과 가족의 품을 떠나 타지에서 홀로 서야 했던 모든 청춘의 눈물',
        creativeDirection: '시골 작은 복싱 도장의 관장이 천재적 재능을 가진 제자를 중앙 리그로 보내기 위해 일부러 모질게 파문하는 스포츠 드라마',
        recommendedGenre: '스포츠 휴먼 드라마',
        recommendedFormat: '3분 숏폼 시네마',
        originalityReview: {
          abstractionLevel: '성장을 위한 매정한 방출 모티브 추출',
          separationTip: '영화 영사기 대신 권투 도장의 땀과 눈물로 배경 전환',
          isSafe: true
        }
      },
      {
        id: 'motif-cine-3',
        movieId: 'movie-cinema-paradiso-1988',
        title: '공주를 위해 99일을 서 있던 병사의 비밀',
        coreEmotion: ['순정', '존엄', '자존심'],
        lifeTheme: '사랑을 완성하기 직전 마지막 하루를 남겨두고 돌아선 사람의 진짜 속마음',
        conflictStructure: '약속된 날까지 단 하루만 채우면 되는데, 스스로 발길을 돌려 전설이 되기를 택한 자의 고뇌',
        audienceResonance: '사랑을 갈망하면서도 상대의 동정과 내 영혼의 자존감 사이에서 고민해 본 경험',
        creativeDirection: '오디션 최종 합격을 눈앞에 둔 무명 배우가 자신의 존엄성을 지키기 위해 기획사의 부당한 조건을 거절하고 떠나는 이야기',
        recommendedGenre: '청춘 드라마',
        recommendedFormat: '단편 시나리오',
        originalityReview: {
          abstractionLevel: '알프레도의 99일 병사 우화 구조 차용',
          separationTip: '우화를 현대 연예계/취업 준비생의 자존감 이야기로 치환',
          isSafe: true
        }
      }
    ],
    'movie-titanic-1997': [
      {
        id: 'motif-tit-1',
        movieId: 'movie-titanic-1997',
        title: '침몰하는 배 위에서 멈추지 않는 바이올린',
        coreEmotion: ['숭고함', '평온', '예술혼'],
        lifeTheme: '세상이 아비규환의 파멸로 치달을 때에도 인간의 품위와 위로를 지켜내는 태도',
        conflictStructure: '살기 위해 도망치는 군중 속에서, 남겨진 사람들의 마지막 공포를 덜어주기 위해 활을 켜는 음악가들',
        audienceResonance: '절망적인 상황에서도 자신의 소명과 친절을 끝까지 잃지 않는 인간성에 대한 경외',
        creativeDirection: '폐업을 앞두고 정전된 병원에서 중환자실 환자들을 위해 마지막 순간까지 손전등을 켜고 손을 잡아주는 야간 간호사들의 하룻밤',
        recommendedGenre: '휴먼 감동 드라마',
        recommendedFormat: '60초 쇼츠',
        originalityReview: {
          abstractionLevel: '재난 속 예술적/직업적 숭고함 모티브 추출',
          separationTip: '타이타닉 악단 대신 현대 응급 병원의 의료진 헌신으로 치환',
          isSafe: true
        }
      },
      {
        id: 'motif-tit-2',
        movieId: 'movie-titanic-1997',
        title: '단 한 사람만 올라갈 수 있는 나무 문짝',
        coreEmotion: ['자기희생', '절절함', '생존의 무게'],
        lifeTheme: '생사의 기로에서 내가 살아남는 것보다 소중한 사람을 살려내는 사랑의 극한 증명',
        conflictStructure: '두 사람 모두를 지탱할 수 없는 부유물 앞에서, 한 사람이 기꺼이 차가운 물속으로 물러나는 결단',
        audienceResonance: '누군가의 눈물겨운 양보와 희생 위에 지금 나의 삶이 지탱되고 있다는 부채감과 감사',
        creativeDirection: '동굴 탐사 중 산소통의 잔량이 1인분밖에 남지 않았을 때, 후배를 지상으로 올려보내고 무전을 지키는 선임 탐험가의 독백',
        recommendedGenre: '생존 어드벤처 / 휴먼',
        recommendedFormat: '3분 숏폼 시네마',
        originalityReview: {
          abstractionLevel: '제로섬 생존 상황에서의 희생적 결단 모티브 추출',
          separationTip: '바다 문짝 대신 동굴의 잔여 산소통으로 배경과 도구 변경',
          isSafe: true
        }
      },
      {
        id: 'motif-tit-3',
        movieId: 'movie-titanic-1997',
        title: '당신 덕분에 살아낸 80년의 모험',
        coreEmotion: ['찬란함', '약속의 이행', '자유로운 삶'],
        lifeTheme: '젊은 날의 짧은 만남에서 얻은 용기로 평생을 당당하고 주체적인 모험가로 살아간 삶',
        conflictStructure: '과거의 슬픔에 파묻혀 평생을 우울하게 사는 대신, 그 사람과의 약속을 지키기 위해 온 세상을 누빈 영혼',
        audienceResonance: '소중한 사람을 먼저 떠나보낸 후 그 사람 몫까지 치열하고 찬란하게 살아가려는 굳은 결의',
        creativeDirection: '비행기 조종사였던 연인의 전사 후, 파일럿 자격증을 따고 평생 세계의 하늘을 누빈 90세 할머니의 마지막 비행 일기',
        recommendedGenre: '휴먼 전기 로맨스',
        recommendedFormat: '연속 에피소드',
        originalityReview: {
          abstractionLevel: '약속의 충실한 이행과 헌정적 생애 모티브 추출',
          separationTip: '로즈의 사진 액자 모티브를 여성 파일럿의 비행 일기로 발전',
          isSafe: true
        }
      }
    ]
  };

  public static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  public async searchMovies(
    query: string,
    filters?: { genre?: string; country?: string; year?: number }
  ): Promise<MovieItem[]> {
    // Artificial brief latency to test loading states cleanly
    await new Promise((resolve) => setTimeout(resolve, 200));

    let results = [...this.movies];

    if (query && query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      results = results.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.originalTitle.toLowerCase().includes(q) ||
          m.director.toLowerCase().includes(q) ||
          m.synopsis.toLowerCase().includes(q) ||
          m.cast.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (filters?.genre && filters.genre !== '전체') {
      results = results.filter((m) => m.genre.includes(filters.genre!));
    }

    if (filters?.country && filters.country !== '전체') {
      results = results.filter((m) => m.country.includes(filters.country!));
    }

    if (filters?.year) {
      results = results.filter((m) => m.year === filters.year);
    }

    return results;
  }

  public async getMovieById(id: string): Promise<MovieItem | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const found = this.movies.find((m) => m.id === id);
    return found || null;
  }

  public async getMovieAnalysis(movie: MovieItem): Promise<MovieAnalysis> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (this.analysisMap[movie.id]) {
      return this.analysisMap[movie.id];
    }

    // Dynamic fallback generation for user-registered movies
    return {
      id: `analysis-custom-${movie.id}`,
      movieId: movie.id,
      movieTitle: movie.title,
      theme: {
        core: `${movie.title} 속에 담긴 인간의 선택과 책임, 그리고 변화에 대한 갈망`,
        humanInsight: '삶의 예측 불가능한 사건들 앞에서 인간의 본성이 가장 적나라하게 드러난다.',
        lifeMeaning: '모든 갈등의 끝에서 남는 것은 화해와 자신에 대한 진실된 발견이다.',
        socialMessage: '사회의 규범과 개인의 자유 사이에서 조화를 찾아가는 끝없는 여정'
      },
      emotions: {
        primary: ['열망', '갈등', '희망', '연대감'],
        intensity: 8,
        emotionalArc: '불안과 탐색의 시작 → 고조되는 오해와 시련 → 진실의 직면과 새로운 길의 발견'
      },
      conflicts: {
        inner: '자신의 본모습을 숨기고 외부의 기대에 맞추려 하는 내적 분열',
        interpersonal: '가까운 동료 혹은 가족과의 가치관 차이에서 오는 깊은 불화',
        societal: '기존의 통념과 관습이 새로운 삶의 방식을 가로막는 장벽',
        moralChoice: '당장의 이익을 취할 것인가, 오랜 신뢰와 양심을 지킬 것인가의 결단'
      },
      relationships: [
        {
          type: '이해와 반목의 공존',
          characters: '주인공과 주요 인물',
          dynamic: '서로를 가장 필요로 하면서도 서로의 가장 아픈 곳을 건드리는 관계'
        }
      ],
      narrativeElements: {
        exposition: `${movie.synopsis.slice(0, 80)}... 배경과 중심 인물의 일상 소개`,
        incitingIncident: '평온을 깨뜨리는 예기치 못한 사건의 발생',
        risingAction: '점점 얽히는 이해관계와 도덕적 딜레마의 누적',
        climax: '모든 비밀과 갈등이 폭발하는 결정적 선택의 순간',
        resolution: '시련을 통과한 인물들이 마주하는 새로운 현실과 여운'
      },
      lifeLessons: [
        '선택의 순간에 진정한 자신의 모습을 마주할 수 있다.',
        '고통을 피하는 것보다 그 고통을 통해 무엇을 배울 것인지가 중요하다.',
        '진정한 변화는 외부의 상황이 아니라 내면의 결단에서 시작된다.'
      ],
      confidence: 'user-assisted',
      evidenceSources: '사용자 제공 영화 정보 및 서사 분석 규칙 기반 생성',
      creativeDirections: [
        '시간적 배경을 200년 전 과거로 옮겨 역사극으로 재해석',
        '인물들의 직업을 예술가 집단으로 변경한 감성 미스터리',
        '원작의 갈등 요소를 사이버 공간의 프라이버시 문제로 치환한 SF 서사'
      ]
    };
  }

  public async getStoryMotifs(movie: MovieItem, analysis?: MovieAnalysis): Promise<StoryMotif[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const rawList = this.motifsMap[movie.id] || [];

    // If curated, enrich with Causal Engine V2 attributes
    if (rawList.length > 0) {
      return rawList.map((m) => ({
        ...m,
        coreTheme: m.coreTheme || m.lifeTheme,
        emotionalCore: m.emotionalCore || m.coreEmotion.join(', '),
        humanQuestion:
          m.humanQuestion ||
          `"${m.title}"의 순간에 인간은 안락한 침묵을 택할 것인가, 고통스러운 진실을 마주할 것인가?`,
        conflictPrinciple: m.conflictPrinciple || m.conflictStructure,
        storySeed: m.storySeed || {
          id: `seed-${m.id}`,
          protagonistHint: `평생 자신의 원칙을 지켜왔다고 믿었으나 감각적 낙인이나 숨겨진 기억을 안고 있는 인물`,
          currentSituation: `안정적이지만 타협적인 환경에서 자신의 비밀을 조용히 지켜내며 살아가던 중`,
          emotionalWound: `과거 자신의 침묵이나 오판으로 인해 소중한 신뢰를 저버렸던 씻을 수 없는 자책감`,
          disruptiveEvent: `과거의 모든 거짓과 은폐를 뒤흔들 수 있는 결정적인 물증이나 기록이 눈앞에 나타남`,
          coreChoice: `자신의 안위와 직업적 지위를 위해 모른 척할 것인가, 파멸을 각오하고 진실을 밝힐 것인가`,
          centralQuestion: `한 번 어긋난 과거의 삶을 마주했을 때 인간은 무엇으로 진정한 구원을 얻을 수 있는가?`,
          oneSentenceSeed: `과거의 상처를 안고 살아가던 인물이 봉인된 진실의 기록을 마주하며, 자신의 모든 것을 걸고 파멸과 대면할지 선택해야 하는 위기에 놓인다.`
        }
      }));
    }

    // Dynamic generation for user-registered movies
    return [
      {
        id: `motif-custom-${movie.id}-1`,
        movieId: movie.id,
        title: `${movie.title}의 감춰진 선택과 잃어버린 시간`,
        coreEmotion: ['후회', '희망', '재도전'],
        lifeTheme: '인생에서 되돌리고 싶은 단 하나의 순간과 그것을 만회하려는 분투',
        conflictStructure: '과거의 실수를 만회할 기회를 얻었으나, 또 다른 희생을 치러야 하는 딜레마',
        audienceResonance: '지나간 선택에 대해 "만약 그때 다른 길을 갔더라면" 하고 곱씹어 본 모든 이의 마음',
        creativeDirection: '원작의 핵심 사건을 전혀 다른 현대 오피스나 예술계 무대로 옮겨와 독립적인 심리 드라마로 창작',
        recommendedGenre: '휴먼 드라마',
        recommendedFormat: '60초 쇼츠 (3부작)',
        originalityReview: {
          abstractionLevel: '후회와 만회라는 보편적 인생 테마 추출',
          separationTip: '원작의 인물명, 고유 대사, 특정 배경을 완전히 배제하고 새로운 캐릭터로 빌드업',
          isSafe: true
        }
      },
      {
        id: `motif-custom-${movie.id}-2`,
        movieId: movie.id,
        title: '신뢰의 균열 속에서 피어난 뜻밖의 동행',
        coreEmotion: ['의심', '연대', '회복'],
        lifeTheme: '가장 믿을 수 없었던 적과 함께 공동의 위기를 헤쳐나가며 생겨나는 유대',
        conflictStructure: '서로를 감시해야 하는 두 인물이 외부의 거대한 부조리에 맞서기 위해 손을 잡음',
        audienceResonance: '편견을 넘어 타인을 이해하게 되는 과정의 따뜻함',
        creativeDirection: '상대방의 약점을 쥐고 흔들던 경쟁 관계가 점차 서로의 결핍을 채워주는 파트너십으로 진화',
        recommendedGenre: '버디 / 어드벤처',
        recommendedFormat: '단편 영화형 시나리오',
        originalityReview: {
          abstractionLevel: '적대적 동행 모티브 추출',
          separationTip: '완전히 새로운 직업군과 목적을 부여하여 독창성 확보',
          isSafe: true
        }
      },
      {
        id: `motif-custom-${movie.id}-3`,
        movieId: movie.id,
        title: '침묵 속에 남겨진 편지의 마지막 문장',
        coreEmotion: ['애틋함', '용서', '마침표'],
        lifeTheme: '말하지 못한 진심이 오랜 세월을 거쳐 비로소 전해지는 순간의 치유',
        conflictStructure: '세상을 떠난 사람이 남긴 수수께끼 같은 기록을 찾아가는 여정',
        audienceResonance: '가족이나 친구에게 끝내 건네지 못한 미안함과 사랑의 고백',
        creativeDirection: '오래된 시골 기차역의 유실물 보관소를 배경으로 펼쳐지는 따뜻한 옴니버스 스토리',
        recommendedGenre: '노스탤지어 / 힐링 드라마',
        recommendedFormat: '3분 숏폼 시네마',
        originalityReview: {
          abstractionLevel: '유언과 화해의 서사 추출',
          separationTip: '배경과 등장인물의 성격을 온화한 일상물로 전환',
          isSafe: true
        }
      }
    ];
  }

  public registerCustomMovie(customMovie: {
    title: string;
    originalTitle?: string;
    year?: number;
    country?: string;
    director?: string;
    genre?: string[];
    synopsis: string;
    notes?: string;
  }): MovieItem {
    const newMovie: MovieItem = {
      id: `movie-user-${Date.now()}`,
      title: customMovie.title,
      originalTitle: customMovie.originalTitle || customMovie.title,
      year: customMovie.year || new Date().getFullYear(),
      country: customMovie.country || '대한민국',
      director: customMovie.director || '사용자 지정',
      genre: customMovie.genre && customMovie.genre.length > 0 ? customMovie.genre : ['드라마'],
      cast: ['사용자 지정 주연'],
      synopsis: customMovie.synopsis || '사용자가 직접 입력한 영화 시놉시스입니다.',
      posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      source: 'user',
      notes: customMovie.notes || '사용자가 직접 등록한 영화'
    };

    this.movies.unshift(newMovie);
    return newMovie;
  }
}
