# Gift Shop

Gift Shop은 누구나 손쉽게 상품을 등록하여 판매자가 될 수 있고, 원하는 선물과 독특한 아이템을 구매할 수 있는 웹 기반 커머스 플랫폼입니다.
사용자 친화적인 인터페이스와 다양한 기능을 통해 판매자와 구매자 모두에게 원활한 거래 경험을 제공하는 것을 목표로 합니다.

## 주요 기능

1. 사용자 등록 및 인증

- 소셜로그인을 통한 간편한 회원가입 및 로그인 기능

2. 판매 기능

- 누구나 자유롭게 상품을 등록하고 판매자로 활동 가능
- 상품관리(등록, 수정, 삭제) 및 재고 관리 기능 제공

3. 구매 기능

- 카테고리와 검색, 필터를 활용해 원하는 아이템 탐색
- 상세한 상품 정보 및 리뷰 확인
- 장바구니와 위시리스트 기능을 통한 편리한 구매 과정

4. 결제 시스템

- 다양한 결제 수단 지원
- 결제 완료, 구매 취소 등 결제 상태 추적 및 관리

    5.리뷰 및 평점 시스템

- 구매자가 상품에 대한 리뷰와 평점을 남길 수 있는 기능
- 판매자 평점 시스템을 통해 신뢰도 기반의 거래 유도

## 기술스택

<img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"> <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black"> <img src="https://img.shields.io/badge/vite-646CFF?style=for-the-badge&logo=vite&logoColor=white">
<img src="https://img.shields.io/badge/tailwind css-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">
<img src="https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white">

<img src="https://img.shields.io/badge/zustand-F3DF49?style=for-the-badge"> <img src="https://img.shields.io/badge/tanstack query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white">

<img src="https://img.shields.io/badge/supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white">


## 트러블 슈팅
* [트러블슈팅](http://localhost:4000).
## 프로젝트 구조

### ERD

![erd](https://github.com/user-attachments/assets/f0efa8b7-a63d-4127-844c-60118d1a6552)

### 폴더 구조

```
📦src
 ┣ 📂components
 ┃ ┣ 📂payments
 ┃ ┣ 📂products
 ┃ ┣ 📂ui
 ┣ 📂pages
 ┣ 📂routes
 ┣ 📂api
 ┣ 📂stores
 ┣ 📂hooks
 ┣ 📂lib
 ┣ 📂types
 ┣ 📂utils

```

| 폴더명       | 설명                                                  |
| ------------ | ----------------------------------------------------- |
| `components` | 재사용 가능한 UI 및 기능성 컴포넌트를 모아놓은 폴더   |
| `pages`      | 컴포넌트 페이지를 모아놓은 폴더 (라우트 단위)         |
| `routes`     | 애플리케이션의 라우트 구성을 관리하는 폴더            |
| `api`        | API 호출 및 클라이언트-서버 통신 로직을 관리하는 폴더 |
| `stores`     | 애플리케이션 상태 관리를 위한 폴더                    |
| `hooks`      | 커스텀 훅스를 모아놓은 폴더                           |
| `lib`        | 외부 라이브러리 또는 유틸리티 로직을 래핑한 폴더      |
| `types`      | TypeScript 타입 정의를 모아놓은 폴더                  |
| `utils`      | 공통 유틸리티 함수들을 모아놓은 폴더                  |

<details><summary>개발기간</summary>

| **주차**    | **개발 목표 및 내용**                                                      |
| ----------- | -------------------------------------------------------------------------- |
| **1주차**   | **초기 세팅 및 인증 구현**                                                 |
|             | - 개발 환경 세팅 및 와이어프레임 작성                                      |
|             | - 사용자 플로우 정의 및 페이지 라우팅 설계                                 |
|             | - Firebase Authentication을 활용한 로그인, 회원가입, 소셜 로그인 기능 구현 |
| **2-3주차** | **상품 탐색 및 데이터 핸들링**                                             |
|             | - 판매자 및 상품 상세 페이지 구현                                          |
|             | - 장바구니 기능 구현 (Zustand 활용)                                        |
| **4주차**   | **결제 및 구매 이력 관리**                                                 |
|             | - 구매 내역 페이지 및 구매 취소 기능 구현                                  |
| **5주차**   | **최적화 및 배포**                                                         |
|             | - 렌더링 최적화 (React.memo, Lazy Loading, Code Splitting)                 |
|             | - SEO 개선 (React Helmet 활용)                                             |
|             | - 이미지/미디어 파일 최적화 (Webpack 이미지 로더, Firebase Storage 사용)   |
|             | - 대규모 데이터셋 렌더링 최적화 (Virtualized List 적용)                    |

</details>

## 시작하기

1. 레포지토리 복제 후 의존성 설치

```bash
git clone https://github.com/yourusername/projectHH.git
cd projectHH
npm install
```

2. 환경 변수 설정

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
# 기타 필요한 환경 변수
```

3. 개발 서버 실행

```bash
npm run dev
```

4. 빌드 및 배포

```bash
npm run build
```
