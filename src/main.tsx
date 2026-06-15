import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

type NodeId =
  | 'start'
  | 'user'
  | 'web'
  | 'nginx'
  | 'route'
  | 'was'
  | 'pipeline'
  | 'llm'
  | 'db'
  | 'ai'
  | 'grounding'
  | 'answer'
  | 'deploy'
  | 'ops'
  | 'end';

interface FlowNode {
  id: NodeId;
  eyebrow: string;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  tone: string;
  shape?: 'terminator' | 'process' | 'decision' | 'data' | 'document';
}

interface Detail {
  title: string;
  summary: string;
  servicePoint: string;
  bullets: string[];
  code?: string;
  image?: string;
  imageCaption?: string;
}

const nodes: FlowNode[] = [
  {
    id: 'start',
    eyebrow: 'START',
    title: '서비스 접속',
    subtitle: '사용자가 PaperMate에 들어옴',
    x: 0,
    y: 0,
    tone: 'blue',
    shape: 'terminator',
  },
  {
    id: 'user',
    eyebrow: '사용자',
    title: '문서 업로드 / 질문',
    subtitle: '브라우저에서 PaperMate 사용',
    x: 10,
    y: 40,
    tone: 'blue',
    shape: 'data',
  },
  {
    id: 'web',
    eyebrow: 'WEB',
    title: 'React 화면',
    subtitle: '업로드, Q&A, 프로젝트 UI',
    x: 23,
    y: 18,
    tone: 'violet',
    shape: 'process',
  },
  {
    id: 'route',
    eyebrow: '분기',
    title: '배포 방식은?',
    subtitle: 'Vercel rewrite 또는 Docker nginx',
    x: 0,
    y: 0,
    tone: 'green',
    shape: 'decision',
  },
  {
    id: 'nginx',
    eyebrow: 'PROXY',
    title: 'Nginx / Rewrite',
    subtitle: 'API 요청을 백엔드로 전달',
    x: 23,
    y: 61,
    tone: 'green',
    shape: 'process',
  },
  {
    id: 'was',
    eyebrow: 'WAS',
    title: 'FastAPI 백엔드',
    subtitle: '인증, 파일, 분석 API',
    x: 45,
    y: 40,
    tone: 'orange',
    shape: 'process',
  },
  {
    id: 'pipeline',
    eyebrow: 'AI PIPELINE',
    title: '문서 분석 파이프라인',
    subtitle: '추출, 로컬 분석, 근거 검증',
    x: 65,
    y: 18,
    tone: 'teal',
    shape: 'process',
  },
  {
    id: 'llm',
    eyebrow: '분기',
    title: 'LLM 사용 가능?',
    subtitle: 'API Key / 환경변수 확인',
    x: 0,
    y: 0,
    tone: 'pink',
    shape: 'decision',
  },
  {
    id: 'db',
    eyebrow: 'DATA',
    title: 'MongoDB',
    subtitle: '회원, 프로젝트, 공유방 저장',
    x: 66,
    y: 62,
    tone: 'navy',
    shape: 'process',
  },
  {
    id: 'ai',
    eyebrow: 'EXTERNAL',
    title: 'OpenAI / Gemini',
    subtitle: '문서 근거 기반 답변 생성',
    x: 84,
    y: 18,
    tone: 'pink',
    shape: 'process',
  },
  {
    id: 'grounding',
    eyebrow: '분기',
    title: '문서 근거와 일치?',
    subtitle: '없는 수치/표현 탐지',
    x: 0,
    y: 0,
    tone: 'teal',
    shape: 'decision',
  },
  {
    id: 'answer',
    eyebrow: '응답',
    title: '분석 답변 반환',
    subtitle: '근거, 표, 추천 질문 표시',
    x: 0,
    y: 0,
    tone: 'blue',
    shape: 'document',
  },
  {
    id: 'deploy',
    eyebrow: 'DEPLOY',
    title: 'Vercel + EC2',
    subtitle: '실제 배포 구성 설명',
    x: 84,
    y: 62,
    tone: 'gray',
    shape: 'process',
  },
  {
    id: 'ops',
    eyebrow: 'OPS',
    title: '운영 대응',
    subtitle: 'health, ready, 요청 추적',
    x: 45,
    y: 78,
    tone: 'slate',
    shape: 'process',
  },
  {
    id: 'end',
    eyebrow: 'END',
    title: '사용자 답변 확인',
    subtitle: '저장 / 공유 / 후속 질문',
    x: 0,
    y: 0,
    tone: 'blue',
    shape: 'terminator',
  },
];

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
  nginx: {
    title: 'Nginx / Vercel Rewrite',
    summary:
      '배포 방식에 따라 API 요청 전달 방식이 달라집니다. Docker 실행에서는 nginx가 /api 요청을 FastAPI로 프록시하고, Vercel 배포에서는 vercel.json rewrite가 EC2 백엔드로 요청을 넘깁니다.',
    servicePoint:
      '이 구조를 쓰면 사용자는 하나의 웹 주소로 접속하고, nginx가 화면 요청과 API 요청을 내부에서 나누어 처리합니다.',
    bullets: [
      'Docker nginx: React 빌드 파일을 /usr/share/nginx/html에서 제공',
      'Docker nginx: /api/* 요청은 backend:8000으로 proxy_pass',
      'Vercel rewrite: /api/:path* 요청은 EC2 백엔드 IP:8000으로 전달',
      '사용자는 프론트와 백엔드 분리를 의식하지 않고 하나의 서비스처럼 사용',
      'client_max_body_size로 업로드 용량 제한을 설정',
    ],
    code: `location /api/ {
  proxy_pass http://backend:8000/api/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_read_timeout 300s;
}`,
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
  pipeline: {
    title: 'AI 문서 분석 파이프라인',
    summary:
      '단순히 LLM에 질문만 던지는 구조가 아닙니다. 먼저 문서에서 근거를 추출하고, 로컬 분석을 수행한 뒤, LLM 응답을 문서 근거로 검증합니다.',
    servicePoint:
      'PaperMate의 AI 분석은 단순 API 호출이 아니라, 문서 근거를 먼저 만들고 LLM 답변을 검증하는 방식으로 신뢰도를 높입니다.',
    bullets: [
      '문서 추출: PDF/HWPX/DOCX/이미지/TXT 텍스트 추출',
      '로컬 분석: 키워드, 수치 후보, 주제 후보, 관련 문서 구간 추출',
      'LLM 호출: OpenAI 또는 Gemini를 환경과 요청에 맞게 선택',
      'Grounding 검증: 업로드 문서에 없는 수치나 표현을 탐지',
      'Fallback: API 키가 없거나 LLM 실패 시 문서 기반 답변 제공',
    ],
    code: `문서 추출
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
      '검색 속도를 위한 인덱스 준비 로직 포함',
    ],
    code: `MONGO_URL=mongodb://mongo:27017

depends_on:
  mongo:
    condition: service_healthy`,
  },
  ai: {
    title: 'OpenAI / Gemini / Web Search',
    summary:
      '외부 AI API는 문서 기반 답변을 생성하는 데 사용됩니다. 단, 답변은 그대로 믿지 않고 grounding 검증을 거칩니다.',
    servicePoint:
      '외부 AI API는 답변 생성 능력을 제공하고, PaperMate 백엔드는 그 답변이 업로드 문서와 맞는지 한 번 더 점검합니다.',
    bullets: [
      'OpenAI 또는 Gemini 중 사용 가능한 provider 선택',
      '질문 의도에 따라 웹 검색 보강 가능',
      '문서에 없는 수치가 발견되면 fallback으로 전환',
      'API 키가 없어도 기본 문서 분석 답변 제공',
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
      '문서에 없는 수치 감지: fallback 답변 반환',
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
  deploy: {
    title: '배포 구조와 프록시 설정',
    summary:
      '현재 프로젝트에는 두 가지 배포 연결 방식의 흔적이 남아 있습니다. Vercel은 /api 요청을 EC2 백엔드로 rewrite하고, Docker 실행에서는 frontend 컨테이너의 nginx가 /api 요청을 backend:8000으로 프록시합니다.',
    servicePoint:
      'EC2에서 80/443 nginx를 직접 띄웠다면 그 설정은 보통 서버 내부 nginx 설정 파일에 있고, 현재 로컬 프로젝트에는 Docker용 nginx.conf와 Vercel rewrite 설정이 남아 있습니다.',
    bullets: [
      'frontend/vercel.json: /api 요청을 http://15.164.250.172:8000/api로 rewrite',
      'frontend/nginx.conf: Docker 안에서 /api 요청을 http://backend:8000/api로 proxy_pass',
      'frontend/Dockerfile: nginx:1.27-alpine 기반, 컨테이너 내부 80번 포트 사용',
      'docker-compose.yml: 현재 로컬/도커 실행에서는 3000:80으로 프론트 컨테이너 노출',
      'EC2 80/443 리버스 프록시는 서버 설정으로 운영했을 수 있지만, 현재 저장소에는 직접적인 443 인증서/nginx site 설정은 없음',
    ],
    code: `// frontend/vercel.json
"/api/:path*" -> "http://15.164.250.172:8000/api/:path*"

// frontend/nginx.conf
location /api/ {
  proxy_pass http://backend:8000/api/;
}

// docker-compose.yml
frontend: "3000:80"
backend:  "\${BACKEND_PORT:-8000}:8000"`,
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
      '공통 예외 처리: 내부 오류를 사용자 친화 메시지로 반환',
    ],
    code: `response.headers['X-Request-ID'] = request_id
response.headers['X-Process-Time-MS'] = elapsed_ms

GET /api/health
GET /api/ready`,
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

const connections: Array<[NodeId, NodeId, string]> = [
  ['start', 'user', '서비스 시작'],
  ['user', 'web', '파일 + 질문 입력'],
  ['web', 'route', '/api 요청'],
  ['route', 'nginx', '환경별 전달'],
  ['nginx', 'was', '백엔드 API 호출'],
  ['was', 'pipeline', '문서 분석 시작'],
  ['pipeline', 'llm', 'LLM 가능 여부 확인'],
  ['llm', 'ai', '가능'],
  ['ai', 'grounding', '생성 답변 검증'],
  ['llm', 'answer', '불가능: fallback'],
  ['grounding', 'answer', '검증 후 응답'],
  ['was', 'db', '저장/조회'],
  ['was', 'ops', '상태 확인'],
  ['nginx', 'deploy', '배포 근거'],
  ['answer', 'end', '사용자에게 표시'],
];

const verticalFlow: Array<{ id: NodeId; label?: string; side?: NodeId[] }> = [
  { id: 'start', label: '접속' },
  { id: 'user', label: '문서와 질문 입력' },
  { id: 'web', label: '프론트에서 API 요청 생성' },
  { id: 'route', label: '실행 환경에 따라 요청 경로 결정', side: ['deploy'] },
  { id: 'nginx', label: 'API 요청 전달' },
  { id: 'was', label: '백엔드 기능 실행', side: ['db', 'ops'] },
  { id: 'pipeline', label: '문서에서 근거 추출' },
  { id: 'llm', label: 'AI 호출 또는 fallback 선택' },
  { id: 'ai', label: 'LLM 답변 생성' },
  { id: 'grounding', label: '문서 근거 검증' },
  { id: 'answer', label: '결과 응답' },
  { id: 'end' },
];

function nodeCenter(node: FlowNode) {
  return { x: node.x, y: node.y };
}

function FlowLine({ from, to, label }: { from: FlowNode; to: FlowNode; label: string }) {
  const start = nodeCenter(from);
  const end = nodeCenter(to);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  return (
    <>
      <line
        className="flow-line"
        x1={`${start.x}%`}
        y1={`${start.y}%`}
        x2={`${end.x}%`}
        y2={`${end.y}%`}
        markerEnd="url(#arrow)"
      />
      <text className="flow-label" x={`${midX}%`} y={`${midY}%`}>
        {label}
      </text>
    </>
  );
}

function App() {
  const [activeId, setActiveId] = useState<NodeId>('nginx');
  const active = details[activeId];
  const activeNode = nodes.find((node) => node.id === activeId);

  const selectedConnections = useMemo(
    () => connections.filter(([from, to]) => from === activeId || to === activeId),
    [activeId],
  );

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

          <div className="flow-stage" aria-label="PaperMate 아키텍처 플로우차트">
            <div className="vertical-flow">
              {verticalFlow.map((step, index) => {
                const node = nodes.find((item) => item.id === step.id)!;
                return (
                  <div className="flow-step" key={step.id}>
                    <div className="flow-main-row">
                      <div className="side-slot left">
                        {step.side?.map((sideId) => {
                          const sideNode = nodes.find((item) => item.id === sideId)!;
                          return (
                            <button
                              key={sideId}
                              className={`flow-node inline side ${sideNode.shape || 'process'} ${sideNode.tone} ${activeId === sideId ? 'active' : ''}`}
                              onClick={() => setActiveId(sideId)}
                            >
                              <span>{sideNode.eyebrow}</span>
                              <strong>{sideNode.title}</strong>
                              <small>{sideNode.subtitle}</small>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        className={`flow-node inline ${node.shape || 'process'} ${node.tone} ${activeId === node.id ? 'active' : ''}`}
                        onClick={() => setActiveId(node.id)}
                      >
                        <span>{node.eyebrow}</span>
                        <strong>{node.title}</strong>
                        <small>{node.subtitle}</small>
                      </button>

                      <div className="side-slot right">
                        {step.id === 'llm' && (
                          <div className="branch-note">
                            <b>아니오</b>
                            <span>fallback 답변으로 이동</span>
                          </div>
                        )}
                        {step.id === 'grounding' && (
                          <div className="branch-note">
                            <b>불일치</b>
                            <span>근거 기반 답변으로 제한</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {index < verticalFlow.length - 1 && (
                      <div className="flow-connector">
                        <span>{step.label}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="selected-path">
            <strong>{activeNode?.title}</strong>
            <span>
              관련 연결: {selectedConnections.map(([from, to]) => `${details[from].title} -> ${details[to].title}`).join(' / ') || '단독 노드'}
            </span>
          </div>
        </div>

        <aside className="detail-panel">
          <div className={`detail-accent ${activeNode?.tone || ''}`} />
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
