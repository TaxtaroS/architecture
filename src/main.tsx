import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

type NodeId =
  | 'start'
  | 'user'
  | 'web'
  | 'route'
  | 'nginx'
  | 'vercel'
  | 'was'
  | 'db'
  | 'ops'
  | 'pipeline'
  | 'llm'
  | 'ai'
  | 'fallback'
  | 'grounding'
  | 'answer'
  | 'end';

interface Detail {
  title: string;
  summary: string;
  servicePoint: string;
  bullets: string[];
  code?: string;
  image?: string;
  imageCaption?: string;
}

const details: Record<NodeId, Detail> = {
  start: {
    title: '서비스 접속',
    summary:
      '사용자가 PaperMate 웹 주소에 접속하면서 서비스 흐름이 시작됩니다. 접속 환경에 따라 Vercel 프론트 또는 Docker nginx가 첫 진입점이 됩니다.',
    servicePoint:
      '시작 지점을 명확히 두면 "사용자가 어디서 들어오고 어떤 서버를 먼저 만나는지"가 보입니다.',
    bullets: [
      '브라우저에서 PaperMate 접속',
      '프론트엔드 정적 파일 로드',
      '이후 문서 업로드와 질문 입력으로 분석 흐름 시작',
    ],
  },
  user: {
    title: '사용자 흐름',
    summary:
      '사용자는 브라우저에서 문서를 올리고 질문을 입력합니다. React 화면은 파일과 질문을 FormData로 묶어 FastAPI API로 전송합니다.',
    servicePoint:
      '이 흐름은 PaperMate가 단순 문서 뷰어가 아니라, 업로드한 자료를 분석하고 결과를 저장하는 작업형 웹 서비스라는 점을 보여줍니다.',
    bullets: [
      '지원 문서: PDF, HWPX, DOCX, 이미지, TXT',
      '사용자 행동: 문서 업로드, 질문 입력, 표/그래프 생성, 프로젝트 저장',
      '프론트 요청: /api/analysis/chat, /api/visuals, /api/projects 등',
    ],
    image: asset('/screens/upload-flow.jpg'),
    imageCaption: '실제 시연 화면: 문서 업로드 후 분석 Q&A로 연결되는 흐름',
  },
  web: {
    title: 'React Web',
    summary:
      'Web은 사용자가 직접 보는 프론트엔드입니다. PaperMate에서는 React + Vite가 화면과 라우팅, API 호출을 담당합니다.',
    servicePoint:
      '우리 서비스에서 Web은 사용자가 보는 화면 전체입니다. 실제 구현은 frontend 폴더의 React 코드와 Vite 설정으로 구성되어 있습니다.',
    bullets: [
      '주요 화면: Home, Analysis, Project, Share, Mypage, FAQ',
      'API 클라이언트: frontend/src/services/api.ts',
      '환경변수: VITE_API_BASE_URL로 백엔드 주소를 지정',
    ],
    code: `const apiClient = axios.create({
  baseURL: VITE_API_BASE_URL
});

apiClient.post('/api/analysis/chat', formData);`,
    image: asset('/screens/analysis-result.jpg'),
    imageCaption: '실제 시연 화면: 분석 결과와 표 시각화가 프론트 화면에 표시됨',
  },
  route: {
    title: '배포 방식 분기',
    summary:
      '프론트가 어디에서 제공되는지에 따라 API 요청 전달 경로가 나뉩니다. 로컬 Docker 통합 실행이면 nginx 프록시를 타고, Vercel 배포면 vercel.json rewrite를 통해 EC2 백엔드로 갑니다.',
    servicePoint:
      '분기 노드는 같은 서비스라도 실행 환경에 따라 요청 경로가 달라진다는 점을 보여줍니다.',
    bullets: [
      '개발/도커 통합 실행: frontend 컨테이너 nginx -> backend:8000',
      'Vercel 배포: /api rewrite -> EC2 FastAPI :8000',
      'EC2 80/443 nginx 설정은 서버에 있을 수 있지만 현재 로컬 저장소에는 직접 포함되어 있지 않음',
    ],
    code: `Docker 경로:
브라우저 -> nginx :80 -> backend:8000

Vercel 경로:
브라우저 -> Vercel -> /api rewrite -> EC2:8000`,
  },
  nginx: {
    title: 'Nginx (Docker)',
    summary:
      'Docker 통합 실행에서는 frontend 컨테이너의 nginx가 React 빌드 파일을 서빙하면서, /api 요청을 backend:8000으로 프록시합니다.',
    servicePoint:
      '이 구조를 쓰면 사용자는 하나의 웹 주소로 접속하고, nginx가 화면 요청과 API 요청을 내부에서 나누어 처리합니다.',
    bullets: [
      'Docker nginx: React 빌드 파일을 /usr/share/nginx/html에서 제공',
      'Docker nginx: /api/* 요청은 backend:8000으로 proxy_pass',
      'client_max_body_size로 업로드 용량 제한을 설정',
    ],
    code: `location /api/ {
  proxy_pass http://backend:8000/api/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_read_timeout 300s;
}`,
  },
  vercel: {
    title: 'Vercel rewrite',
    summary:
      'Vercel 배포에서는 vercel.json의 rewrite 설정으로 /api 요청을 EC2에서 실행 중인 FastAPI 백엔드(포트 8000)로 전달합니다.',
    servicePoint:
      'EC2에서 80/443 nginx를 직접 띄웠다면 그 설정은 서버 내부 nginx 설정 파일에 있고, 현재 로컬 프로젝트에는 Vercel rewrite 설정이 남아 있습니다.',
    bullets: [
      'frontend/vercel.json: /api 요청을 http://15.164.250.172:8000/api로 rewrite',
      'EC2 80/443 리버스 프록시는 서버 설정으로 운영했을 수 있지만, 현재 저장소에는 직접적인 443 인증서/nginx site 설정은 없음',
    ],
    code: `// frontend/vercel.json
"/api/:path*" -> "http://15.164.250.172:8000/api/:path*"`,
  },
  was: {
    title: 'FastAPI WAS',
    summary:
      'WAS는 Web Application Server입니다. 쉽게 말하면 화면 뒤에서 실제 일을 처리하는 백엔드 서버이고, 우리 프로젝트에서는 FastAPI가 WAS입니다.',
    servicePoint:
      'React가 화면을 담당한다면 FastAPI WAS는 실제 기능 실행을 담당합니다. 문서 처리, 인증, 저장, 공유 기능이 이 서버를 통해 동작합니다.',
    bullets: [
      '인증: 회원가입, 로그인, Google OAuth, JWT 검증',
      '분석: 문서 업로드, 문서 미리보기, Q&A, 시각화 생성',
      '협업: 프로젝트 저장, 공유방, 댓글, 파일 관리',
      '공통 처리: CORS, 요청 ID, 처리 시간 헤더, 예외 응답',
    ],
    code: `app.include_router(auth_router)
app.include_router(analysis_router)
app.include_router(projects_router)

@app.get('/api/health')
async def health_check(): ...`,
  },
  db: {
    title: 'MongoDB 저장소',
    summary:
      'MongoDB는 서비스 데이터 저장소입니다. 사용자, 프로젝트, 공유방, 분석 결과 메타데이터를 저장해 사용자가 작업을 이어갈 수 있게 합니다.',
    servicePoint:
      '사용자가 분석한 결과를 프로젝트로 남기고 다시 열어볼 수 있으려면 저장소가 필요합니다. MongoDB는 이 작업 데이터를 유지합니다.',
    bullets: [
      '프로젝트 저장 및 복원',
      '공유방, 댓글, 프로젝트 파일 관리',
      'MongoDB healthcheck로 컨테이너 상태 확인',
    ],
    code: `MONGO_URL=mongodb://mongo:27017

depends_on:
  mongo:
    condition: service_healthy`,
  },
  ops: {
    title: '운영 대응과 증빙 포인트',
    summary:
      '서비스 운영 중 문제가 생기면 서버 상태 확인, DB 연결 확인, 요청 추적, 응답 시간 확인이 필요합니다. PaperMate 백엔드는 이를 위한 기본 장치를 갖고 있습니다.',
    servicePoint:
      '운영 대응은 실제 서비스에서 장애를 확인하고 원인을 좁히기 위한 구조입니다. health, ready, request id, process time이 그 역할을 합니다.',
    bullets: [
      '/api/health: 서버 프로세스 생존 확인',
      '/api/ready: DB 연결까지 포함한 준비 상태 확인',
      'X-Request-ID: 장애 요청 추적',
      'X-Process-Time-MS: 응답 시간 확인',
    ],
    code: `response.headers['X-Request-ID'] = request_id
response.headers['X-Process-Time-MS'] = elapsed_ms

GET /api/health
GET /api/ready`,
  },
  pipeline: {
    title: 'AI 문서 분석 파이프라인',
    summary:
      '단순히 LLM에 질문만 던지는 구조가 아닙니다. 먼저 문서에서 근거를 추출하고, 로컬 분석을 수행한 뒤, LLM 응답을 문서 근거로 검증합니다.',
    servicePoint:
      'PaperMate의 AI 분석은 단순 API 호출이 아니라, 문서 근거를 먼저 만들고 LLM 답변을 검증하는 방식으로 신뢰도를 높입니다.',
    bullets: [
      '문서 추출: PDF/HWPX/DOCX/이미지/TXT 텍스트 추출',
      'HWPX/OWPML 처리: ZIP 패키지 내부의 XML 파일을 열어 본문 텍스트와 이미지 자산을 파싱',
      '로컬 분석: 키워드, 수치 후보, 주제 후보, 관련 문서 구간 추출',
      'LLM 호출: OpenAI 또는 Gemini를 환경과 요청에 맞게 선택',
      'Grounding 검증: 업로드 문서에 없는 수치나 표현을 탐지',
      'Fallback: API 키가 없거나 LLM 실패 시 문서 기반 답변 제공',
    ],
    code: `문서 추출
  -> HWPX/OWPML: ZIP 내부 XML 파싱
  -> 로컬 분석
  -> LLM 응답 생성
  -> grounding 검증
  -> 통과: 근거 포함 답변
  -> 실패: fallback 답변`,
  },
  llm: {
    title: 'LLM 사용 가능 여부',
    summary:
      '백엔드는 요청 또는 환경변수에서 OpenAI/Gemini API 키를 확인합니다. 키가 있으면 LLM 분석으로 진행하고, 없거나 실패하면 문서 추출 결과 기반 fallback 답변을 만듭니다.',
    servicePoint:
      '이 분기 덕분에 외부 AI API가 항상 성공해야만 서비스가 동작하는 구조가 아니게 됩니다.',
    bullets: [
      'API 키 있음: OpenAI 또는 Gemini 호출',
      'API 키 없음: 로컬 추출/분석 기반 답변 생성',
      'LLM 실패: fallback 답변으로 사용자에게 결과 제공',
    ],
  },
  ai: {
    title: 'OpenAI / Gemini',
    summary:
      '외부 AI API는 문서 기반 답변을 생성하는 데 사용됩니다. 단, 답변은 그대로 믿지 않고 grounding 검증을 거칩니다.',
    servicePoint:
      '외부 AI API는 답변 생성 능력을 제공하고, PaperMate 백엔드는 그 답변이 업로드 문서와 맞는지 한 번 더 점검합니다.',
    bullets: [
      'OpenAI 또는 Gemini 중 사용 가능한 provider 선택',
      '질문 의도에 따라 웹 검색 보강 가능',
      '문서에 없는 수치가 발견되면 fallback으로 전환',
    ],
  },
  fallback: {
    title: 'Fallback 답변 생성',
    summary:
      'LLM을 사용할 수 없거나 grounding 검증에 실패한 경우, 문서에서 추출한 키워드, 수치, 관련 구간을 바탕으로 직접 답변을 구성합니다.',
    servicePoint:
      '외부 API 장애 시에도 서비스가 완전히 멈추지 않고 최소한의 답변을 제공할 수 있게 하는 안전장치입니다.',
    bullets: [
      '문서 추출 결과 기반 답변 생성',
      'API 키 없음 / LLM 실패 / grounding 불일치 시 진입',
      '관련 문서 구간을 함께 표시',
    ],
  },
  grounding: {
    title: 'Grounding 검증',
    summary:
      'LLM이 만든 답변이 업로드 문서의 내용과 맞는지 확인합니다. 문서에 없는 수치나 표현이 발견되면 답변을 제한하거나 fallback으로 전환합니다.',
    servicePoint:
      '이 분기는 AI 답변을 그대로 내보내지 않고 문서 근거와 맞춰보는 안전장치입니다.',
    bullets: [
      '문서 근거와 일치: 근거 포함 답변 반환',
      '단어 일치도 낮음: 관련 문서 구간을 함께 표시',
      '문서에 없는 수치 감지: fallback 답변으로 재검토',
    ],
  },
  answer: {
    title: '분석 답변 반환',
    summary:
      '백엔드는 분석 답변, 키워드, 수치 후보, 관련 문서 구간, 추천 질문, 시각화 설정을 프론트엔드로 반환합니다.',
    servicePoint:
      '질문으로 시작한 흐름은 답변 표시로 닫혀야 합니다. 사용자가 실제로 보는 결과 화면이 이 단계입니다.',
    bullets: [
      'AI 분석 Q&A 답변 표시',
      '문서 근거 구간과 수치 후보 제공',
      '표/그래프/시각화 결과 표시',
      '프로젝트 저장과 공유 흐름으로 연결',
    ],
    image: asset('/screens/analysis-result.jpg'),
    imageCaption: '실제 시연 화면: 질문에 대한 답변과 표 시각화가 표시됨',
  },
  end: {
    title: '사용자 답변 확인',
    summary:
      '사용자는 분석 답변을 확인하고, 필요한 경우 프로젝트로 저장하거나 공유방에서 협업하고, 후속 질문을 이어갑니다.',
    servicePoint:
      '종료 지점은 단순히 서버 응답이 끝나는 곳이 아니라, 사용자가 결과를 확인하고 다음 행동을 선택하는 지점입니다.',
    bullets: [
      '답변 확인',
      '프로젝트 저장',
      '공유 및 협업',
      '후속 질문 입력',
    ],
  },
};

function App() {
  const [activeId, setActiveId] = useState<NodeId>('route');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const active = details[activeId];

  const selectNode = (id: NodeId) => {
    setActiveId(id);
    setIsDrawerOpen(true);
  };

  const click = (id: NodeId) => ({
    onClick: () => selectNode(id),
    onKeyDown: (event: React.KeyboardEvent<SVGGElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectNode(id);
      }
    },
    role: 'button',
    tabIndex: 0,
    'aria-label': `${details[id].title} 설명 보기`,
    'data-node-id': id,
    className: `flow-node-svg ${activeId === id ? 'active' : ''}`,
    style: { cursor: 'pointer' },
  });

  return (
    <main className="app-shell">
      <section
        className="hero-panel"
        style={{ '--hero-image': `url("${asset('/screens/service-collage.jpg')}")` } as React.CSSProperties}
      >
        <nav className="topbar">
          <img src={asset('/assets/papermate-logo.png')} alt="PaperMate" />
          <div>
            <span>Architecture Viewer</span>
            <strong>PaperMate 서비스 구조 인터랙티브 설명</strong>
          </div>
        </nav>

        <div className="hero-copy">
          <p className="eyebrow">백문이 불여일견</p>
          <h1>PaperMate의 클릭 아키텍처</h1>
          <p>
            각 블록을 누르면 Web, WAS, nginx, 배포 프록시, AI 파이프라인, 운영 구조를 실제
            프로젝트 파일 기준으로 설명합니다.
          </p>
        </div>

        <div className="proof-strip">
          <span>실제 웹 화면 포함</span>
          <span>nginx proxy_pass 근거 포함</span>
          <span>Vercel rewrite + EC2 구조 설명 포함</span>
        </div>
      </section>

      <section className="workspace">
        <div className="flow-card">
          <div className="flow-header">
            <div>
              <p className="eyebrow">Main Flowchart</p>
              <h2>서비스 작동 원리</h2>
            </div>
            <p>노드를 클릭하면 오른쪽 패널의 설명이 바뀝니다.</p>
          </div>

          <div className="flow-stage" aria-label="PaperMate 아키텍처 분기형 플로우차트">
            <svg width="100%" viewBox="0 0 680 980" role="img">
              <title>PaperMate 서비스 분기형 플로우차트</title>
              <desc>
                사용자 접속부터 답변 반환까지, 배포 방식 분기, LLM 사용 가능 분기, 문서 근거
                검증 분기와 재검토 루프를 포함한 좌우 분기형 플로우차트입니다.
              </desc>
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path
                    d="M2 1L8 5L2 9"
                    fill="none"
                    stroke="context-stroke"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </marker>
              </defs>

              {/* START */}
              <g {...click('start')}>
                <rect className="c-gray" x="260" y="20" width="160" height="44" rx="22" strokeWidth="0.5" />
                <text className="th" x="340" y="42" textAnchor="middle" dominantBaseline="central">
                  서비스 접속
                </text>
              </g>
              <line x1="340" y1="64" x2="340" y2="100" className="arr" markerEnd="url(#arrow)" />

              {/* USER */}
              <g {...click('user')}>
                <rect className="c-blue" x="240" y="100" width="200" height="56" rx="8" strokeWidth="0.5" />
                <text className="th" x="340" y="118" textAnchor="middle" dominantBaseline="central">
                  문서 업로드 / 질문
                </text>
                <text className="ts" x="340" y="138" textAnchor="middle" dominantBaseline="central">
                  React 화면에서 입력
                </text>
              </g>
              <line x1="340" y1="156" x2="340" y2="192" className="arr" markerEnd="url(#arrow)" />

              {/* WEB */}
              <g {...click('web')}>
                <rect className="c-purple" x="240" y="192" width="200" height="56" rx="8" strokeWidth="0.5" />
                <text className="th" x="340" y="210" textAnchor="middle" dominantBaseline="central">
                  React 화면
                </text>
                <text className="ts" x="340" y="230" textAnchor="middle" dominantBaseline="central">
                  API 요청 생성
                </text>
              </g>
              <line x1="340" y1="248" x2="340" y2="284" className="arr" markerEnd="url(#arrow)" />

              {/* ROUTE (decision diamond) */}
              <g {...click('route')}>
                <path
                  d="M340 264 L420 314 L340 364 L260 314 Z"
                  className="c-green"
                  strokeWidth="0.5"
                />
                <text className="th" x="340" y="306" textAnchor="middle" dominantBaseline="central">
                  배포 방식은?
                </text>
                <text className="ts" x="340" y="324" textAnchor="middle" dominantBaseline="central">
                  Vercel / Docker
                </text>
              </g>

              {/* branch labels */}
              <text className="ts" x="430" y="300" textAnchor="start">
                Docker
              </text>
              <line x1="420" y1="314" x2="460" y2="314" className="arr" markerEnd="url(#arrow)" />

              <text className="ts" x="250" y="300" textAnchor="end">
                Vercel
              </text>
              <line x1="260" y1="314" x2="220" y2="314" className="arr" markerEnd="url(#arrow)" />

              {/* NGINX (docker) */}
              <g {...click('nginx')}>
                <rect className="c-green" x="460" y="286" width="180" height="56" rx="8" strokeWidth="0.5" />
                <text className="th" x="550" y="304" textAnchor="middle" dominantBaseline="central">
                  Nginx 프록시
                </text>
                <text className="ts" x="550" y="324" textAnchor="middle" dominantBaseline="central">
                  /api {'->'} backend:8000
                </text>
              </g>

              {/* VERCEL */}
              <g {...click('vercel')}>
                <rect className="c-gray" x="40" y="286" width="180" height="56" rx="8" strokeWidth="0.5" />
                <text className="th" x="130" y="304" textAnchor="middle" dominantBaseline="central">
                  Vercel rewrite
                </text>
                <text className="ts" x="130" y="324" textAnchor="middle" dominantBaseline="central">
                  /api {'->'} EC2:8000
                </text>
              </g>

              {/* merge into WAS */}
              <path
                d="M550 342 L550 380 L340 380 L340 400"
                fill="none"
                stroke="var(--t)"
                strokeWidth="0.5"
                className="arr"
                markerEnd="url(#arrow)"
              />
              <path d="M130 342 L130 380 L340 380" fill="none" stroke="var(--t)" strokeWidth="0.5" />

              {/* WAS */}
              <g {...click('was')}>
                <rect className="c-coral" x="240" y="400" width="200" height="56" rx="8" strokeWidth="0.5" />
                <text className="th" x="340" y="418" textAnchor="middle" dominantBaseline="central">
                  FastAPI 백엔드
                </text>
                <text className="ts" x="340" y="438" textAnchor="middle" dominantBaseline="central">
                  인증, 파일, 분석 API
                </text>
              </g>

              {/* DB side branch */}
              <text className="ts" x="450" y="412" textAnchor="start">
                저장/조회
              </text>
              <line x1="440" y1="420" x2="500" y2="420" className="arr" markerEnd="url(#arrow)" />
              <g {...click('db')}>
                <rect className="c-teal" x="500" y="396" width="140" height="48" rx="8" strokeWidth="0.5" />
                <text className="th" x="570" y="412" textAnchor="middle" dominantBaseline="central">
                  MongoDB
                </text>
                <text className="ts" x="570" y="430" textAnchor="middle" dominantBaseline="central">
                  프로젝트 저장
                </text>
              </g>

              {/* OPS side branch */}
              <text className="ts" x="450" y="460" textAnchor="start">
                상태 확인
              </text>
              <line x1="440" y1="448" x2="500" y2="468" className="arr" markerEnd="url(#arrow)" />
              <g {...click('ops')}>
                <rect className="c-gray" x="500" y="466" width="140" height="48" rx="8" strokeWidth="0.5" />
                <text className="th" x="570" y="482" textAnchor="middle" dominantBaseline="central">
                  운영 대응
                </text>
                <text className="ts" x="570" y="500" textAnchor="middle" dominantBaseline="central">
                  health, ready
                </text>
              </g>

              <line x1="340" y1="456" x2="340" y2="492" className="arr" markerEnd="url(#arrow)" />

              {/* PIPELINE */}
              <g {...click('pipeline')}>
                <rect className="c-teal" x="240" y="492" width="200" height="56" rx="8" strokeWidth="0.5" />
                <text className="th" x="340" y="510" textAnchor="middle" dominantBaseline="central">
                  문서 분석 파이프라인
                </text>
                <text className="ts" x="340" y="530" textAnchor="middle" dominantBaseline="central">
                  추출(owpml), 로컬 분석
                </text>
              </g>
              <line x1="340" y1="548" x2="340" y2="584" className="arr" markerEnd="url(#arrow)" />

              {/* LLM decision */}
              <g {...click('llm')}>
                <path
                  d="M340 564 L420 614 L340 664 L260 614 Z"
                  className="c-pink"
                  strokeWidth="0.5"
                />
                <text className="th" x="340" y="606" textAnchor="middle" dominantBaseline="central">
                  LLM 사용
                </text>
                <text className="ts" x="340" y="624" textAnchor="middle" dominantBaseline="central">
                  가능?
                </text>
              </g>

              <text className="ts" x="430" y="600" textAnchor="start">
                예
              </text>
              <line x1="420" y1="614" x2="460" y2="614" className="arr" markerEnd="url(#arrow)" />

              <text className="ts" x="250" y="600" textAnchor="end">
                아니오
              </text>
              <path
                d="M260 614 L150 614 L150 700 L240 700"
                fill="none"
                stroke="var(--t)"
                strokeWidth="0.5"
                className="arr"
                markerEnd="url(#arrow)"
              />

              {/* AI */}
              <g {...click('ai')}>
                <rect className="c-pink" x="460" y="586" width="180" height="56" rx="8" strokeWidth="0.5" />
                <text className="th" x="550" y="604" textAnchor="middle" dominantBaseline="central">
                  OpenAI / Gemini
                </text>
                <text className="ts" x="550" y="624" textAnchor="middle" dominantBaseline="central">
                  문서 근거 기반 답변
                </text>
              </g>

              {/* FALLBACK */}
              <g {...click('fallback')}>
                <rect className="c-blue" x="240" y="672" width="200" height="56" rx="8" strokeWidth="0.5" />
                <text className="th" x="340" y="690" textAnchor="middle" dominantBaseline="central">
                  fallback 답변 생성
                </text>
                <text className="ts" x="340" y="710" textAnchor="middle" dominantBaseline="central">
                  문서 추출 결과 기반
                </text>
              </g>

              <line x1="550" y1="642" x2="550" y2="700" className="arr" markerEnd="url(#arrow)" />

              {/* GROUNDING decision */}
              <g {...click('grounding')}>
                <path
                  d="M550 660 L640 700 L550 740 L460 700 Z"
                  className="c-teal"
                  strokeWidth="0.5"
                />
                <text className="th" x="550" y="692" textAnchor="middle" dominantBaseline="central">
                  문서 근거
                </text>
                <text className="ts" x="550" y="710" textAnchor="middle" dominantBaseline="central">
                  와 일치?
                </text>
              </g>

              <text className="ts" x="455" y="688" textAnchor="end">
                불일치
              </text>
              <path
                d="M460 700 L40 700 L40 614 L260 614"
                fill="none"
                stroke="var(--t)"
                strokeWidth="0.5"
                strokeDasharray="4 3"
                className="arr"
                markerEnd="url(#arrow)"
              />
              <text className="ts" x="60" y="630" textAnchor="start">
                재검토 (LLM 분기로)
              </text>

              <text className="ts" x="555" y="752" textAnchor="middle">
                일치
              </text>
              <line x1="550" y1="740" x2="550" y2="800" className="arr" markerEnd="url(#arrow)" />

              <path d="M340 728 L340 800" fill="none" stroke="var(--t)" strokeWidth="0.5" className="arr" markerEnd="url(#arrow)" />

              {/* ANSWER */}
              <g {...click('answer')}>
                <rect className="c-blue" x="240" y="800" width="200" height="56" rx="8" strokeWidth="0.5" />
                <text className="th" x="340" y="818" textAnchor="middle" dominantBaseline="central">
                  분석 답변 반환
                </text>
                <text className="ts" x="340" y="838" textAnchor="middle" dominantBaseline="central">
                  근거, 표, 추천 질문
                </text>
              </g>
              <path
                d="M550 800 L550 828 L440 828"
                fill="none"
                stroke="var(--t)"
                strokeWidth="0.5"
                className="arr"
                markerEnd="url(#arrow)"
              />

              <line x1="340" y1="856" x2="340" y2="892" className="arr" markerEnd="url(#arrow)" />

              {/* END */}
              <g {...click('end')}>
                <rect className="c-gray" x="260" y="892" width="160" height="44" rx="22" strokeWidth="0.5" />
                <text className="th" x="340" y="914" textAnchor="middle" dominantBaseline="central">
                  사용자 답변 확인
                </text>
              </g>
            </svg>
          </div>
        </div>

        <button
          className={`detail-backdrop ${isDrawerOpen ? 'open' : ''}`}
          aria-label="설명 패널 닫기"
          onClick={() => setIsDrawerOpen(false)}
        />

        <aside className={`detail-panel ${isDrawerOpen ? 'open' : ''}`} aria-live="polite">
          <button className="drawer-close" type="button" onClick={() => setIsDrawerOpen(false)}>
            닫기
          </button>
          <p className="eyebrow">Service Detail</p>
          <h2>{active.title}</h2>
          <p className="summary">{active.summary}</p>

          <div className="service-box">
            <strong>우리 웹에서의 역할</strong>
            <p>{active.servicePoint}</p>
          </div>

          <ul className="detail-list">
            {active.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>

          {active.code && <pre className="code-block">{active.code}</pre>}

          {active.image && (
            <figure className="service-shot">
              <img src={active.image} alt={active.imageCaption || active.title} />
              <figcaption>{active.imageCaption}</figcaption>
            </figure>
          )}
        </aside>
      </section>

      <section className="service-summary">
        <p className="eyebrow">Service Summary</p>
        <h2>PaperMate 서비스 구조 요약</h2>
        <p>
          PaperMate에서 Web은 React 프론트엔드이고 WAS는 FastAPI 백엔드입니다. Docker 환경에서는
          nginx가 React 정적 파일을 제공하면서 /api 요청을 FastAPI로 프록시하고, Vercel 배포에서는
          /api rewrite로 EC2 백엔드를 호출합니다. AI 분석은 문서 추출, 로컬 분석, LLM 호출, grounding
          검증, fallback 응답으로 구성됩니다.
        </p>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
