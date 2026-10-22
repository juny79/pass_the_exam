# PassForge (PassTheExam) - 국가기술자격증 합격 전략 지능형 학습 플랫폼

> **PassForge**는 **정보보안기사** 및 **산업안전기사** 등 국가기술자격증 수험생을 위한 **세부 카테고리 기출 족보(3계층 아코디언), 유튜브 명강의 요약 핵심 요약, CBT 모의고사, AI 서술형 채점 엔진, 과락 방지 합격 예측 시뮬레이터**를 제공하는 차세대 수험 전략 플랫폼입니다.

---

## 📌 주요 특징 및 기능

### 1. 3계층 아코디언 세부 카테고리 기출 족보
- **[1단계 과목] ➔ [2단계 세부 카테고리] ➔ [3단계 빈출 주제 및 핵심 요약]** 구조로 방대한 수험 범위를 빈틈없이 탐색.
- 출제 빈도 80~90% 초고빈출뿐만 아니라 **출제 확률 30% 이상의 주요 기출 및 신유형 토픽까지 전수 커버**.
- **유튜브 명강의 요약 & 두음 암기 비법**: 핵심 개념별 유튜브 인기 강의 요약 및 현업/수험생 검증 암기 팁 탑재.
- 실기 시험(필답형/작업형/서술형) 대비 핵심 포인트 및 연관 키워드 태그 연동.

### 2. 다중 자격증 완벽 지원 (Multi-Certification Architecture)
- **정보보안기사 (`is_engineer`)**: 5개 과목, 50개 카테고리, 250개 기출 토픽.
- **산업안전기사 (`ind_safety_engineer`)**: 6개 과목, 60개 카테고리, 300개 기출 토픽.
- 상단 원클릭 드롭다운을 통해 자격증별 데이터(과목, 문제, 족보, 점수 시뮬레이터)를 즉시 전환.

### 3. 필기 CBT 모의고사 & 즉시 지식 연계 분석
- 실제 시험과 동일한 배점과 시간 기준의 객관식 풀이 환경.
- 답안 제출 즉시 정오답 판정 및 해설뿐 아니라, 해당 문제가 포함된 **과목, 세부 카테고리, 출제 빈도, 예상 출제 확률, 관련 핵심 이론, 유튜브 요약**을 카드 형태로 연계 제공.

### 4. 실기 AI 주관식/서술형 정밀 채점 엔진
- 정보보안기사 단답/서술/실무형 및 산업안전기사 복합형(필답형 + 작업형 동영상) 문항 지원.
- 필수 키워드(`mandatory_keywords`), 유의어/동의어(`synonyms`), 배점 비중을 반영한 정밀 루브릭 자동 채점.

### 5. 합격 / 과락 예측 시뮬레이터
- 자격증별 과목 수(5과목 또는 6과목)에 맞춰 동적 렌더링되는 점수 입력 대시보드.
- 과목별 40점 미만 과락 즉시 탐지, 전과목 평균 60점 기준 합격 확률(%) 계산 및 취약 과목 맞춤형 피드백 리포트 생성.

---

## 📊 자격증별 구축 스펙

| 구분 | 정보보안기사 (`is_engineer`) | 산업안전기사 (`ind_safety_engineer`) |
| :--- | :--- | :--- |
| **주관 기관** | 한국방송통신전파진흥원 (KCA) | 한국산업인력공단 (Q-Net) |
| **과목 체계** | **5개 과목** (100문항 / 150분) | **6개 과목** (120문항 / 180분) |
| **세부 카테고리** | **50개 카테고리** (과목당 10개) | **60개 카테고리** (과목당 10개) |
| **기출 토픽** | **250개 토픽** (카테고리당 5개) | **300개 토픽** (카테고리당 5개) |
| **실기 시험 형태** | 단답형(10문항) + 서술형(3문항) + 실무형(3문항) | 복합형 (필답형 55점 14문항 + 작업형 동영상 45점 9문항) |
| **포함 과목** | 1. 시스템 보안<br>2. 네트워크 보안<br>3. 애플리케이션 보안<br>4. 정보보안 일반<br>5. 정보보안 관리 및 법규 | 1. 산업재해 예방 및 안전보건교육<br>2. 인간공학 및 위험성 평가·관리<br>3. 기계·기구 및 설비 안전 관리<br>4. 전기설비 안전관리<br>5. 화학설비 안전관리<br>6. 건설공사 안전 관리 |

---

## 🛠️ 시스템 아키텍처 및 기술 스택

```
pass_the_exam/
├── backend/                  # FastAPI 기반 RESTful API 서버
│   ├── main.py               # 엔드포인트 라우팅 (자격증, 과목, 문제, 채점, 예측)
│   ├── schemas.py            # Pydantic v2 데이터 검증 모델
│   └── services.py           # 자동 채점 및 과락/합격 진단 엔진
├── frontend/                 # Next.js 16 (App Router) + Tailwind CSS + Lucide Icons
│   └── src/
│       ├── app/page.tsx      # 반응형 멀티 자격증 대시보드 (아코디언 토글, CBT, 시뮬레이터)
│       └── types/exam.ts     # 타입스크립트 인터페이스 정의
├── data/                     # 표준 정규화 JSON 데이터셋
│   ├── seed_data.json        # 2대 자격증 마스터 지식베이스 (11과목 110카테고리 550토픽)
│   └── processed_exam_data.json # 파이프라인 검증 완료 데이터
└── scripts/                  # 데이터 수집, 가공 및 파이프라인 검증 스크립트
    ├── expand_seed_data.py   # 정보보안기사 대규모 족보 생성기
    ├── build_industrial_safety_data.py # 산업안전기사 60개 카테고리 300개 토픽 생성기
    └── pipeline_validator.py # ETL 데이터 정합성 검증 도구
```

- **Frontend**: Next.js 16.4 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS, Lucide React
- **Backend**: FastAPI, Uvicorn, Pydantic v2
- **Data Pipeline**: Python 3.13, JSON Schema Validator (ETL)

---

## 🚀 실행 가이드

### 1. 레포지토리 클론
```bash
git clone https://github.com/juny79/pass_the_exam.git
cd pass_the_exam
```

### 2. 백엔드 실행 (FastAPI)
```bash
cd backend
pip install fastapi uvicorn pydantic
python -m uvicorn main:app --host 127.0.0.1 --port 8081 --reload
```
- API 서버: `http://127.0.0.1:8081`
- Swagger 문서: `http://127.0.0.1:8081/docs`

### 3. 프론트엔드 실행 (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- 브라우저 접속: `http://localhost:3000`

---

## 🔗 주요 API 엔드포인트

| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| `GET` | `/api/certifications` | 등록된 전체 자격증 메타데이터 목록 조회 |
| `GET` | `/api/subjects?cert_id={id}` | 특정 자격증의 전 과목 및 세부 카테고리/토픽 족보 조회 |
| `GET` | `/api/questions?cert_id={id}&exam_type={type}` | 필기(WRITTEN) 또는 실기(PRACTICAL) 문항 조회 |
| `POST` | `/api/grade` | 객관식/주관식 답안 자동 채점 및 연계 지식 분석 카드 반환 |
| `POST` | `/api/predict` | 과목별 점수 기반 과락 여부 및 최종 합격 확률 예측 |

---

## 📄 라이선스
MIT License
