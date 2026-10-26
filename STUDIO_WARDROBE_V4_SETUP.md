# 마감의 숲 | 공동 작업실 V4 옷장 시험

## 안전 범위
- **운영 중인 `studio.html`, `studio_v2.html`, `index.html`은 변경하지 않습니다.**
- 기존 `studio_live_*` 함수, 5개 고정 좌석, 8.5초 갱신, 코인·60일 미접속 판정은 그대로 유지합니다.
- `studio_v4_wardrobe.html`은 별도 시험 페이지입니다. 운영 배포 전 검증을 위한 PR입니다.
- SQL은 GitHub 파일을 추가해도 자동으로 실행되지 않습니다.

## 현재 구현
- 480×620 파츠 고정 좌표 / 앞머리·뒷머리·몸체·옷·얼굴 5개 레이어
- 서기·앉기 버전 분리, PNG 검사, 염색 마스크 기반 색상 변경
- 작가별 착용 설정을 디스코드 인증 기반 서버 RPC로 저장하고, 작업실 접속자 명단과 함께 표시
- 서버 SQL, 파일 또는 파츠 누락 시 **기존 완성형 캐릭터를 유지**
- 추가 의상은 같은 파일명 규칙으로 등록 가능
- PNG 로컬 불러오기는 임시 검수용, 타 이용자에게 표시하려면 GitHub 에셋 업로드 필요

## 적용 전 필요한 에셋
아래 파일들은 **본 PR에 이미지로 포함되어 있지 않습니다.** 첫 의상 ZIP 파일을 풀어서
`studio/assets/wardrobe/`에 이미지 6장과 염색 마스크 6장을 별도로 업로드하세요.
`manifest.json`은 이 경로에 같이 보관할 수 있습니다.

기존 옷장 ZIP에서 확인된 이름:
`hair_bob_back_standing.png`, `hair_bob_front_standing.png`,
`hair_bob_back_seated.png`, `hair_bob_front_seated.png`,
`outfit_pajamas_standing.png`, `outfit_pajamas_seated.png`,
`dye_masks/*_dye_mask.png` (각 파츠와 동일한 이름)

**추가로 필요한 공식 파츠**
- `body_base_standing.png` 및 `body_base_seated.png`
- `face_round_standing.png` 및 `face_round_seated.png`

몸체 두 장은 **공식 마스터 원본**이어야 합니다. 옷장 검수실 HTML의 디버그용
`FOREST_DEBUG_SPRITES` 테스트 이미지를 정식 몸체로 간주하거나 대체하지 마세요.

## 배포 전 순서
1. 별도 테스트 브랜치/미리보기로 `studio_v4_wardrobe.html`과 의상 PNG를 배포합니다.
2. Supabase Auth Redirect URLs에 **새 시험 페이지 주소**를 등록합니다.
3. `sql/studio_wardrobe_v4.sql`을 SQL Editor에서 수동 실행합니다.
4. 서로 다른 Discord 계정 두 개로 서기/앉기 외형, 착용 저장·재접속, 타인 표시·염색을 검증합니다.
5. 몸체/얼굴/의상이 모두 올바르게 합성되는지 미술 검수를 통과한 후 운영 페이지 적용을 결정합니다.

## 구현 검증 현황
- V4 전용 HTML 페이지와 기존 실시간 코드 연동 훅을 별도로 작성했습니다.
- 누락 파일은 기존 캐릭터 fallback 경로로 동작하도록 구현했습니다.
- 실 Supabase 데이터, Discord OAuth, 실시간 멀티유저 및 모든 조합의 시각 품질은 **미검증**입니다.
- SQL은 기존 공용 API의 반환에 대한 가정(`studio_live_me()` JSON의 `id`)에 기반하므로 테스트 DB에서 먼저 검증하세요.
