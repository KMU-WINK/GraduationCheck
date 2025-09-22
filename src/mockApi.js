// src/mockApi.js
export function enableMockApi(options = {}) {
  const {
    requireAuth = false,      // true면 Authorization 꼭 필요
    autoInjectToken = true,   // true면 dev용 토큰을 자동으로 localStorage에 넣음
    tokenValue = 'mock-dev-token',
    latencyMs = 150           // 응답 지연 (시뮬레이션)
  } = options;

  const realFetch = window.fetch.bind(window);

  // 개발 편의를 위해 토큰 자동 주입
  if (autoInjectToken) {
    const has = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!has) localStorage.setItem('token', tokenValue);
  }

  // 더미 유저
  let user = {
    studentId: '20251234',
    name: '이종윤',
    department: 'SOFTWARE',
    admissionYear: 2025,
    averageGrade: 4.49,
    progressText: '80%',
  };

  // helpers
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  const json = (data, status = 200, headers = { 'Content-Type': 'application/json' }) =>
    new Response(JSON.stringify(data), { status, headers });
  const unauthorized = () => json({ message: 'UNAUTHORIZED' }, 401);
  const notFound = () => json({ message: 'Not Found (mock)' }, 404);

  const isAuthorized = (init = {}) => {
    if (!requireAuth) return true;
    const h = init.headers || {};
    const auth = h.Authorization || h.authorization || '';
    return typeof auth === 'string' && new RegExp(`^Bearer\\s+${tokenValue}$`, 'i').test(auth);
  };

  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = (init.method || 'GET').toUpperCase();

    // API만 인터셉트 (/api/ 접두)
    if (url.startsWith('/api/')) {
      await delay(latencyMs);

      // 로그인: 토큰 발급
      if (url.endsWith('/api/auth/login') && method === 'POST') {
        // 실제로는 body 검증 등을 하겠지만, 여기선 토큰만 발급
        if (autoInjectToken) localStorage.setItem('token', tokenValue);
        return json({ token: tokenValue });
      }

      // 로그아웃: 토큰 제거
      if (url.endsWith('/api/auth/logout') && method === 'POST') {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        return json({ success: true });
      }

      // 내 정보 조회/수정
      if (url.endsWith('/api/users/me') && method === 'GET') {
        if (!isAuthorized(init)) return unauthorized();
        return json(user);
      }
      if (url.endsWith('/api/users/me') && method === 'PUT') {
        if (!isAuthorized(init)) return unauthorized();
        const body = JSON.parse(init.body || '{}');
        user = { ...user, ...body };
        return json({ success: true, user });
      }

      // 과목 목록 (원래 /subjects였다면 호출부를 /api/subjects로 바꾸는 걸 추천)
      if (url.endsWith('/api/subjects') && method === 'GET') {
        if (!isAuthorized(init)) return unauthorized();
        return json([
          { subjectId: 1, subjectName: '과목3', credit: 3, semester: '1-1' },
          { subjectId: 2, subjectName: '과목2', credit: 2, semester: '1-1' },
          { subjectId: 3, subjectName: '과목1', credit: 2, semester: '1-2' },
        ]);
      }

      return notFound();
    }

    // API가 아니면 원래 fetch로
    return realFetch(input, init);
  };
}
