export type PropertyKind = "토지" | "전원주택" | "농지";

export type Property = {
  id: string;
  kind: PropertyKind;
  title: string;
  location: string;
  detail: string;
  size: string;
  price: string;
  image?: string;
  tint: "clay" | "pine" | "cream";
};

export type JournalEntry = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
};

export type SiteContent = {
  officeName: string;
  phone: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  properties: Property[];
  journal: JournalEntry[];
};

/** 청양 부동산 디자인용 콘텐츠 데이터. 실제 운영 전 대표번호·매물·글만 이 파일 또는 CMS에서 교체합니다. */
export const defaultContent: SiteContent = {
  officeName: "청양 부동산",
  phone: "041-000-0000",
  heroEyebrow: "CHEONGYANG · FIELD NOTE 01",
  heroTitle: "청양에서,\n오래 머물 땅을 찾습니다.",
  heroDescription:
    "토지부터 전원주택까지. 생활의 조건을 먼저 듣고, 현장에서 답을 확인합니다.",
  properties: [
    {
      id: "demo-land",
      kind: "토지",
      title: "칠갑산 자락의 완만한 남향 토지",
      location: "청양군 대치면 · DEMO LISTING",
      detail: "답사·건축 가능 여부를 함께 확인하는 필드 노트형 매물입니다.",
      size: "약 1,420㎡",
      price: "가격 상담",
      image: "/manus-storage/cheongyang-farmland_67451da2.jpg",
      tint: "cream",
    },
    {
      id: "demo-home",
      kind: "전원주택",
      title: "숲과 마을 사이, 작은 정원을 둔 집",
      location: "청양군 정산면 · DEMO LISTING",
      detail: "주말 체류와 귀촌 생활을 함께 검토할 수 있는 주거 제안입니다.",
      size: "대지 약 460㎡",
      price: "가격 상담",
      image: "/manus-storage/cheongyang-country-home_30661454.jpg",
      tint: "pine",
    },
    {
      id: "demo-farm",
      kind: "농지",
      title: "생활권 가까이, 관리가 편한 농지",
      location: "청양군 운곡면 · DEMO LISTING",
      detail: "진입·경사·용도 등 현장 확인이 중요한 조건을 우선 살핍니다.",
      size: "약 2,060㎡",
      price: "가격 상담",
      tint: "clay",
    },
  ],
  journal: [
    {
      id: "note-01",
      category: "답사 노트",
      title: "토지를 볼 때, 지목보다 먼저 확인할 세 가지",
      excerpt: "도로와 방향, 그리고 실제 생활권까지. 현장에서 질문해야 할 기준을 정리합니다.",
      date: "2026. 08. 12",
      readTime: "3분 읽기",
    },
    {
      id: "note-02",
      category: "청양 생활",
      title: "정산면에서 시작하는 주말의 느린 동선",
      excerpt: "카페와 장보기, 산책을 한 번에 연결하는 청양의 생활 반경을 살펴봅니다.",
      date: "2026. 08. 05",
      readTime: "4분 읽기",
    },
    {
      id: "note-03",
      category: "상담 가이드",
      title: "처음 문의할 때 남기면 좋은 조건들",
      excerpt: "예산, 방문 가능일, 원하는 생활의 모습만 알려 주셔도 상담이 훨씬 정확해집니다.",
      date: "2026. 07. 28",
      readTime: "2분 읽기",
    },
  ],
};

export const CONTENT_STORAGE_KEY = "cheongyang-real-estate-content-preview";
