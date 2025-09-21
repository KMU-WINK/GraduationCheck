// src/mockApi.js
export function enableMockApi() {
  const realFetch = window.fetch.bind(window);

  // 더미 유저 데이터
  let user = {
    studentId: "20251234",
    name: "이종윤",
    department: "SOFTWARE",
    admissionYear: 2025,
    averageGrade: 4.49
  };

  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;
    const method = (init.method || "GET").toUpperCase();

    // 유저 정보 조회
    if (url.endsWith("/api/users/me") && method === "GET") {
      return new Response(JSON.stringify(user), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 유저 정보 수정
    if (url.endsWith("/api/users/me") && method === "PUT") {
      const body = JSON.parse(init.body || "{}");
      user = { ...user, ...body };
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 과목 전체 조회
    if (url.endsWith("/subjects") && method === "GET") {
      return new Response(JSON.stringify([
        { subjectId: 1, subjectName: "과목3", credit: 3, semester: "1-1" },
        { subjectId: 2, subjectName: "과목2", credit: 2, semester: "1-1" },
        { subjectId: 3, subjectName: "과목1", credit: 2, semester: "1-2" },
      ]), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 기본은 실제 fetch 실행
    return realFetch(input, init);
  };
}
