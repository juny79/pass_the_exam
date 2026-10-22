import { KeyTopic } from '../types/exam';

/**
 * 토픽의 핵심 키워드 및 개념을 분석하여 직관적이고 흥미로운 시각 다이어그램(Mermaid)을 자동 생성
 */
export function generateTopicDiagram(topic: KeyTopic): string {
  const title = topic.title.toLowerCase();
  const core = (topic.core_concepts || '').toLowerCase();
  const point = (topic.practical_point || '').toLowerCase();
  const allText = `${title} ${core} ${point}`;

  // 1. 메모리 구조 (스택 / 힙 / 버퍼 오버플로우)
  if (allText.includes('스택') || allText.includes('stack') || allText.includes('메모리') || allText.includes('힙') || allText.includes('heap')) {
    return `graph TD
      subgraph Memory["🖥️ 프로세스 가상 메모리 맵 (Virtual Memory)"]
        High["🔼 높은 주소 (0xFFFFFFFF)"]
        Stack["📦 Stack (지역변수/복귀주소 RET) ⬇️ 아래로 확장"]
        Shared["↕️ 가변 공유 영역 (Shared Library)"]
        Heap["🗄️ Heap (동적 할당 malloc/new) ⬆️ 위로 확장"]
        BSS["📄 BSS Segment (초기화되지 않은 전역변수)"]
        Data["📑 Data Segment (초기화된 전역/정적변수)"]
        Text["⚙️ Text/Code Segment (기계어 코드 - Read Only)"]
        Low["🔽 낮은 주소 (0x00000000)"]
      end
      High --- Stack --- Shared --- Heap --- BSS --- Data --- Text --- Low
      classDef stack fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#c7d2fe;
      classDef heap fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#a7f3d0;
      classDef seg fill:#0f172a,stroke:#334155,color:#94a3b8;
      class Stack stack;
      class Heap heap;
      class Shared,BSS,Data,Text seg;`;
  }

  // 2. 대칭키 / 비대칭키 / 공개키 암호
  if (allText.includes('대칭키') || allText.includes('비대칭키') || allText.includes('rsa') || allText.includes('aes') || allText.includes('암호')) {
    return `flowchart LR
      subgraph Sender["송신자 (Alice)"]
        P1["📄 평문 (Plaintext)"]
        Enc["🔐 암호화 (Encrypt)"]
      end
      subgraph Channel["인터넷 전송로"]
        C["🔒 암호문 (Ciphertext)"]
      end
      subgraph Receiver["수신자 (Bob)"]
        Dec["🔓 복호화 (Decrypt)"]
        P2["📄 복원된 평문"]
      end
      Key(("🔑 비밀키 / 개인키"))
      P1 --> Enc --> C --> Dec --> P2
      Key -.-> Enc
      Key -.-> Dec
      classDef box fill:#1e293b,stroke:#60a5fa,color:#f8fafc;
      classDef key fill:#b45309,stroke:#fbbf24,color:#fef3c7;
      class Sender,Channel,Receiver box;
      class Key key;`;
  }

  // 3. 네트워크 계층 (OSI 7계층 / TCP/IP / 패킷 캡슐화)
  if (allText.includes('osi') || allText.includes('tcp') || allText.includes('ip') || allText.includes('네트워크') || allText.includes('arp')) {
    return `flowchart TD
      L7["7️⃣ 응용 계층 (HTTP, DNS, FTP) ➔ 데이터(Data)"]
      L4["4️⃣ 전송 계층 (TCP, UDP) ➔ 세그먼트(Segment / Port)"]
      L3["3️⃣ 네트워크 계층 (IP, ICMP, ARP) ➔ 패킷(Packet / IP)"]
      L2["2️⃣ 데이터링크 계층 (Ethernet) ➔ 프레임(Frame / MAC)"]
      L1["1️⃣ 물리 계층 (Cable, NIC) ➔ 비트 스트림(Bit 0101)"]
      L7 -->|헤더 부착 캡슐화| L4 --> L3 --> L2 --> L1
      classDef pdu fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#e0e7ff;
      class L7,L4,L3,L2,L1 pdu;`;
  }

  // 4. 인증 / 인가 (OAuth, JWT, 전자서명, Kerberos)
  if (allText.includes('인증') || allText.includes('oauth') || allText.includes('jwt') || allText.includes('서명') || allText.includes('토큰')) {
    return `sequenceDiagram
      autonumber
      actor User as 👤 사용자
      participant Client as 💻 클라이언트 앱
      participant AuthServer as 🛡️ 인증 서버 (Auth Server)
      participant ResourceServer as 🗄️ 자원 서버 (API)
      User->>Client: 로그인 요청
      Client->>AuthServer: 신원 자격 증명 전송
      AuthServer-->>Client: Access Token (JWT 토큰 발급)
      Client->>ResourceServer: API 호출 (Bearer Token 헤더 첨부)
      ResourceServer-->>Client: 토큰 서명 검증 완료 후 데이터 응답`;
  }

  // 5. 침해사고 대응 / 보안관제 (Snort, IDS, IPS, 방화벽)
  if (allText.includes('침해') || allText.includes('ids') || allText.includes('ips') || allText.includes('방화벽') || allText.includes('악성코드')) {
    return `flowchart LR
      Attacker["🥷 외부 공격자/패킷"] --> FW["🔥 방화벽 (Firewall)<br>1차 IP/Port 필터링"]
      FW --> IPS["🛡️ IPS / IDS<br>2차 시그니처 정밀 탐지"]
      IPS --> WAF["🌐 WAF (웹 방화벽)<br>SQLi / XSS 차단"]
      WAF --> Server["🏢 내부 보호 서버 (WAS/DB)"]
      classDef shield fill:#064e3b,stroke:#10b981,color:#ecfdf5;
      classDef target fill:#1e1b4b,stroke:#818cf8,color:#e0e7ff;
      class FW,IPS,WAF shield;
      class Server target;`;
  }

  // 6. 산업안전: 하인리히 / 버드 / 재해 발생 도미노 이론
  if (allText.includes('하인리히') || allText.includes('도미노') || allText.includes('버드') || allText.includes('재해') || allText.includes('안전')) {
    return `flowchart LR
      Step1["1단계<br>사회적 환경과<br>유전적 요소"] --> Step2["2단계<br>개인적 결함<br>(지식/기능 부족)"]
      Step2 --> Step3["3단계 🎯<br>불안전한 행동 및<br>불안전한 상태"]
      Step3 --> Step4["4단계<br>사고 발생<br>(접촉/추락)"]
      Step4 --> Step5["5단계<br>재해(상해)<br>사망/부상/손실"]
      Step3 -.->|"핵심: 3단계 제거 시 사고 예방!"| Block["🛑 안전조치 차단"]
      classDef critical fill:#7f1d1d,stroke:#ef4444,stroke-width:2px,color:#fee2e2;
      classDef normal fill:#1e293b,stroke:#64748b,color:#f8fafc;
      class Step3 critical;
      class Step1,Step2,Step4,Step5 normal;`;
  }

  // 7. 산업안전: 위험성평가 5단계 절차
  if (allText.includes('위험성평가') || allText.includes('위험성') || allText.includes('평가')) {
    return `flowchart TD
      S1["1️⃣ 사전 준비 (평가 대상 확정 및 정보 수집)"]
      S2["2️⃣ 유해·위험요인 파악 (현장 순회 및 체크리스트)"]
      S3["3️⃣ 위험성 추정 (빈도 × 강도 산출)"]
      S4["4️⃣ 위험성 결정 (허용 가능한 위험 수준 여부 판정)"]
      S5["5️⃣ 위험성 감소대책 수립 및 실행 (본질적 안전 조치)"]
      S1 --> S2 --> S3 --> S4 --> S5
      S5 -.->|개선 후 잔여위험 재평가 피드백| S3
      classDef step fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#e0e7ff;
      class S1,S2,S3,S4,S5 step;`;
  }

  // 8. 산업안전: 기계/전기/화학/건설 안전 방호장치 & 안전수칙
  if (allText.includes('크레인') || allText.includes('감전') || allText.includes('보호구') || allText.includes('양중기') || allText.includes('거푸집')) {
    return `flowchart TD
      Risk["⚠️ 잠재적 산업 위험요인"] --> Check{"안전점검 실시"}
      Check -->|정상| Safe["✅ 안전 작업 기준 준수 (보호구 착용)"]
      Check -->|이상 발견| Stop["⛔ 즉시 작업중지 및 비상조치"]
      Stop --> Measure["🛠️ 방호장치 정비 및 재점검 승인"]
      Measure --> Safe
      classDef warn fill:#831843,stroke:#f43f5e,color:#fff1f2;
      classDef ok fill:#064e3b,stroke:#10b981,color:#ecfdf5;
      class Risk,Stop warn;
      class Safe ok;`;
  }

  // 기본 fallback: 개념 핵심 워크플로우 다이어그램
  const subterms = topic.related_terms && topic.related_terms.length > 0 ? topic.related_terms.slice(0, 3) : ['핵심이론', '동작원리', '실기적용'];
  return `flowchart LR
    Start["🎯 ${topic.title}"] --> C1["📘 핵심 개념<br>${subterms[0] || '기본원리'}"]
    C1 --> C2["⚙️ 동작 및 메커니즘<br>${subterms[1] || '절차'}"]
    C2 --> C3["🏆 실기 합격 포인트<br>${subterms[2] || '서술 키워드'}"]
    classDef defaultNode fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;
    class Start,C1,C2,C3 defaultNode;`;
}
