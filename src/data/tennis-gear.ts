/**
 * Editorial directory of official Korean-market collections, not SKU inventory.
 * Coverage checked on the linked official pages on 2026-09-13 (KST).
 * No listed brand has an advertising, affiliate, or supply agreement for these links.
 */
export const GEAR_VERIFIED_ON = "2026-09-13";

export const GEAR_CATEGORIES = [
  { id: "apparel", label: "의류", description: "코트에서 입는 옷" },
  { id: "balls", label: "공", description: "게임과 연습의 기본" },
  { id: "accessories", label: "액세서리", description: "작지만 필요한 것들" },
  { id: "gear", label: "기타 용품", description: "가방부터 준비하는 운동" },
] as const;

export const GEAR_BRANDS = [
  { id: "nike", label: "나이키", name: "NIKE" },
  { id: "adidas", label: "아디다스", name: "ADIDAS" },
  { id: "yonex", label: "요넥스", name: "YONEX" },
  { id: "wilson", label: "윌슨", name: "WILSON" },
  { id: "head", label: "헤드", name: "HEAD" },
  { id: "fila", label: "휠라", name: "FILA" },
  { id: "lacoste", label: "라코스테", name: "LACOSTE" },
] as const;

export const APPAREL_SUBCATEGORIES = [
  { id: "tops", label: "상의" },
  { id: "bottoms", label: "팬츠·쇼츠" },
  { id: "skirts_dresses", label: "스커트·원피스" },
  { id: "outerwear", label: "아우터" },
] as const;

export type GearCategory = typeof GEAR_CATEGORIES[number]["id"];
export type GearBrand = typeof GEAR_BRANDS[number]["id"];
export type ApparelSubcategory = typeof APPAREL_SUBCATEGORIES[number]["id"];

export interface TennisGearCollection {
  id: string;
  brand: GearBrand;
  title: string;
  description: string;
  categories: readonly GearCategory[];
  apparelSubcategories: readonly ApparelSubcategory[];
  coverage: readonly string[];
  url: string;
  verifiedOn: string;
  commercialRelationship: "none";
}

export const tennisGearCollections: readonly TennisGearCollection[] = [
  {
    id: "nike-tennis-apparel",
    brand: "nike",
    title: "테니스 의류",
    description: "남녀 테니스 의류를 폴로, 쇼츠, 스커트와 원피스까지 살펴보세요.",
    categories: ["apparel"],
    apparelSubcategories: ["tops", "bottoms", "skirts_dresses", "outerwear"],
    coverage: ["폴로·탑", "쇼츠", "스커트·원피스", "재킷·베스트"],
    url: "https://www.nike.com/kr/w/tennis-apparel-6ymx6zed1q",
    verifiedOn: GEAR_VERIFIED_ON,
    commercialRelationship: "none",
  },
  {
    id: "adidas-tennis",
    brand: "adidas",
    title: "테니스 컬렉션",
    description: "테니스 의류와 신발을 함께 다루는 컬렉션입니다. 공식몰에서 의류를 선택하세요.",
    categories: ["apparel"],
    apparelSubcategories: ["tops", "bottoms", "skirts_dresses", "outerwear"],
    coverage: ["폴로·탑", "팬츠·쇼츠", "스커트", "재킷"],
    url: "https://www.adidas.co.kr/tennis",
    verifiedOn: GEAR_VERIFIED_ON,
    commercialRelationship: "none",
  },
  {
    id: "lacoste-women-tennis",
    brand: "lacoste",
    title: "여성 테니스",
    description: "테니스용 상의와 하의, 스커트와 원피스를 모은 여성 컬렉션입니다.",
    categories: ["apparel"],
    apparelSubcategories: ["tops", "bottoms", "skirts_dresses", "outerwear"],
    coverage: ["상의", "쇼츠", "스커트·원피스", "재킷"],
    url: "https://www.lacoste.com/kr/lacoste/women/스포츠/테니스/",
    verifiedOn: GEAR_VERIFIED_ON,
    commercialRelationship: "none",
  },
  {
    id: "lacoste-men-tennis",
    brand: "lacoste",
    title: "남성 테니스",
    description: "폴로부터 팬츠와 재킷까지 살펴볼 수 있는 남성 테니스 컬렉션입니다.",
    categories: ["apparel"],
    apparelSubcategories: ["tops", "bottoms", "outerwear"],
    coverage: ["폴로·상의", "팬츠·쇼츠", "재킷"],
    url: "https://www.lacoste.com/kr/lacoste/men/스포츠/테니스/",
    verifiedOn: GEAR_VERIFIED_ON,
    commercialRelationship: "none",
  },
  {
    id: "yonex-tennis-collection",
    brand: "yonex",
    title: "테니스 컬렉션",
    description: "요넥스몰의 테니스 라이프스타일 컬렉션입니다. 세부 품목은 공식몰에서 확인하세요.",
    categories: ["apparel"],
    apparelSubcategories: [],
    coverage: ["테니스 라이프스타일"],
    url: "https://www.yonexmall.com/m2/goods/list.php?category=024002",
    verifiedOn: GEAR_VERIFIED_ON,
    commercialRelationship: "none",
  },
  {
    id: "wilson-korea-collection",
    brand: "wilson",
    title: "국내 스포츠 의류 컬렉션",
    description: "여러 스포츠 의류가 함께 있습니다. 공식몰의 SPORTS 필터에서 테니스를 선택하세요.",
    categories: ["apparel"],
    apparelSubcategories: [],
    coverage: ["멀티스포츠 의류", "테니스 필터 제공"],
    url: "https://kr.wilson.com/collections/wil-kr-all",
    verifiedOn: GEAR_VERIFIED_ON,
    commercialRelationship: "none",
  },
  {
    id: "nike-tennis-accessories",
    brand: "nike",
    title: "테니스 액세서리",
    description: "테니스 카테고리의 모자와 헤드밴드를 살펴볼 수 있습니다.",
    categories: ["accessories"],
    apparelSubcategories: [],
    coverage: ["모자", "헤드밴드"],
    url: "https://www.nike.com/kr/w/tennis-accessories-equipment-awwpwzed1q",
    verifiedOn: GEAR_VERIFIED_ON,
    commercialRelationship: "none",
  },
  {
    id: "adidas-tennis-accessories",
    brand: "adidas",
    title: "테니스 액세서리",
    description: "양말, 캡, 손목밴드와 헤드밴드를 모은 테니스 액세서리 컬렉션입니다.",
    categories: ["accessories"],
    apparelSubcategories: [],
    coverage: ["양말", "모자", "손목·헤드밴드"],
    url: "https://www.adidas.co.kr/tennis-accessories",
    verifiedOn: GEAR_VERIFIED_ON,
    commercialRelationship: "none",
  },
  {
    id: "yonex-bags-accessories",
    brand: "yonex",
    title: "가방·액세서리",
    description: "여러 라켓 스포츠의 용품을 함께 다룹니다. 용도와 수납 크기는 공식몰에서 확인하세요.",
    categories: ["gear", "accessories"],
    apparelSubcategories: [],
    coverage: ["가방", "그립", "양말·모자", "밴드·타월"],
    url: "https://www.yonexmall.com/m2/goods/list.php?category=023",
    verifiedOn: GEAR_VERIFIED_ON,
    commercialRelationship: "none",
  },
  {
    id: "wilson-tennis-equipment",
    brand: "wilson",
    title: "테니스 공·가방·소모품",
    description: "라켓과 함께 공, 그립, 진동 방지용품과 가방을 다루는 테니스 컬렉션입니다.",
    categories: ["balls", "accessories", "gear"],
    apparelSubcategories: [],
    coverage: ["공", "가방", "그립", "진동 방지용품"],
    url: "https://kr.wilson.com/collections/tennis",
    verifiedOn: GEAR_VERIFIED_ON,
    commercialRelationship: "none",
  },
  {
    id: "head-tennis-balls",
    brand: "head",
    title: "테니스 공",
    description: "헤드 코리아의 테니스 공 카테고리입니다. 판매 중인 구성과 수량은 공식몰에서 확인하세요.",
    categories: ["balls"],
    apparelSubcategories: [],
    coverage: ["테니스 공"],
    url: "https://headkorea.kr/category/볼/77/",
    verifiedOn: GEAR_VERIFIED_ON,
    commercialRelationship: "none",
  },
  {
    id: "fila-tennis-accessories",
    brand: "fila",
    title: "테니스 아이템",
    description: "테니스 모자, 손목밴드와 양말을 살펴볼 수 있는 컬렉션입니다. 신발도 함께 표시됩니다.",
    categories: ["accessories"],
    apparelSubcategories: [],
    coverage: ["선캡·모자", "손목밴드", "양말"],
    url: "https://www.fila.co.kr/pages/wos-fila-tennis-item",
    verifiedOn: GEAR_VERIFIED_ON,
    commercialRelationship: "none",
  },
];
