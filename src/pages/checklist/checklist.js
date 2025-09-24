import React, { useEffect, useState } from "react";
import axios from "axios";
import "./checklist.css";
import {useNavigate} from "react-router-dom";

const h = React.createElement;

const token = localStorage.getItem('token');

if (token) {
    axios.defaults.headers.common["Authorization"] = 'Bearer ' + token;
} else {
    console.error("인증 토큰이 없습니다. 로그인이 필요합니다.");
}


/* ================== axios 전역 설정 ================== */
axios.defaults.baseURL = "https://api.graduation-check.wink.io.kr";
axios.defaults.withCredentials = true; // 세션/쿠키 필요 시 필수

/* ================== 설정 ================== */
const USER_ID = "20241234"; // 필요 시 실제 사용자 ID로 교체

/* ================== 전공필수: 고정 목록(서버가 주면 대체) ================== */
const REQUIRED_COURSES = [
    { id: 1, name: "소프트웨어학개론", code: "1-1", credits: 3, completed: false, category: "major", subcategory: "required" },
    { id: 2, name: "프로그래밍기초",   code: "1-1", credits: 3, completed: false, category: "major", subcategory: "required" },
    { id: 3, name: "자료구조",         code: "1-2", credits: 3, completed: false, category: "major", subcategory: "required" },
    { id: 4, name: "알고리즘",         code: "2-1", credits: 3, completed: false, category: "major", subcategory: "required" },
    { id: 5, name: "데이터베이스",     code: "2-2", credits: 3, completed: false, category: "major", subcategory: "required" },
    { id: 6, name: "운영체제",         code: "3-1", credits: 3, completed: false, category: "major", subcategory: "required" },
];

/* ================== 공용 UI ================== */
const Progress = ({ value, small }) =>
    h("div", { className: "progress" + (small ? " progress-sm" : "") },
        h("div", { className: "progress-bar", style: { width: `${Math.max(0, Math.min(100, Math.round(value)))}%` } })
    );

const Button = ({ children, variant = "primary", size, onClick }) =>
    h("button", {
        className: `btn ${variant === "outline" ? "btn-outline" : variant === "ghost" ? "btn-ghost" : "btn-primary"} ${size === "sm" ? "btn-sm" : ""}`,
        onClick
    }, children);

const Card = ({ children }) => h("div", { className: "card" }, children);
const CardHeader = ({ children }) => h("div", { className: "card-header" }, children);
const CardTitle = ({ children }) => h("div", { className: "card-title" }, children);
const CardContent = ({ children, className }) =>
    h("div", { className: `card-content${className ? " " + className : ""}` }, children);

const SectionHeader = ({ title, right }) =>
    h("div", { className: "gc-flex gc-justify-between gc-items-center gc-mt-24 gc-mb-8" }, [
        h("h2", { className: "gc-section-title" }, title),
        h("span", { className: "gc-text-muted" }, right)
    ]);

const SearchIcon = () => h("span", { className: "gc-search-icon" }, "🔍");

/* ================== 메인 컴포넌트 ================== */
function Checklist() {
    /* ---- 상태 ---- */
    const [courses, setCourses] = useState([]);
    const navigate = useNavigate();
    const [requiredFallback] = useState(REQUIRED_COURSES);

    const [graduationRequirements, setGraduationRequirements] = useState([
        { id: 1, text: "단일 융합학기 내(센드위치 학기) 15주 이상 현장실습 이수한 경우", completed: false },
        { id: 2, text: "코딩역량 인증제 레벨1 이상 이수", completed: false },
        { id: 3, text: "총 취득학점 평점 3.5 이상", completed: false },
        { id: 4, text: "7학기 이후 전공과목 학점을 2학점 이상 취득한 경우", completed: false },
        { id: 5, text: "공인영어성적표 제출", completed: false },
        { id: 6, text: "공인된 IT 관련 자격증과 수상자인 경우", completed: false },
        { id: 7, text: "전공계획서 제출", completed: false },
    ]);
    const [graduationThesis, setGraduationThesis] = useState([{ id: 1, text: "캡스톤디자인", completed: false }]);

    // 검색 + 디바운스
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]); // [{subjectId, subjectName, credit, semester}]
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    // 동기화 상태
    const [syncing, setSyncing] = useState(false);

    // 추가 타겟(어느 박스에 넣을지)
    const [addTarget, setAddTarget] = useState({ category: "general", subcategory: null });

    /* ---------- 서버 → 프론트 매핑 ---------- */
    const mapBoxItemToCourse = (item) => {
        const userSubjectId = item.userSubjectId ?? item.user_subject_id ?? item.id;
        const subjectId     = item.subjectId     ?? item.subject_id;
        const subjectName   = item.subjectName   ?? item.subject_name ?? item.name;
        const credit        = item.credit        ?? item.credits ?? 0;
        const semester      = item.semester      ?? item.code ?? "";
        const category      = item.category      ?? "general";
        const subcategory   = item.subcategory   ?? undefined;

        return {
            id: userSubjectId || subjectId || Math.random(),
            name: subjectName || "과목",
            code: semester || "",
            credits: Number(credit) || 0,
            completed: !!item.isTaken,
            category,
            subcategory,
            _backend: { userSubjectId, subjectId, isTaken: !!item.isTaken }
        };
    };

    /* ---------- 박스 불러오기 ---------- */
    const fetchUserBox = () => {
        setSyncing(true);
        axios.get("/user/box")
            .then((res) => {
                const data = res.data;
                const mapped = Array.isArray(data) ? data.map(mapBoxItemToCourse) : [];

                const requiredFromServer = mapped.filter(c => c.category === "major" && c.subcategory === "required");
                const others = mapped.filter(c => !(c.category === "major" && c.subcategory === "required"));

                const required = requiredFromServer.length > 0 ? requiredFromServer : requiredFallback;
                setCourses([...required, ...others]);
            })
            .catch((err) => {
                console.error("GET /user/box 실패:", err);
                // 서버가 막혀도 최소 전공필수 기본값은 보이도록
                if (courses.length === 0) setCourses([...requiredFallback]);
            })
            .finally(() => setSyncing(false));
    };

    useEffect(() => { fetchUserBox(); /* mount 시 1회 */ }, []);

    /* ---------- 검색(디바운스 300ms) ---------- */
    useEffect(() => {
        let timer;
        const q = searchQuery.trim();
        if (!q) {
            setShowSearchResults(false);
            setSearchResults([]);
            return;
        }

        setSearchLoading(true);
        timer = setTimeout(() => {
            axios.get("/subjects", { params: { query: q } })
                .then((res) => {
                    const data = res.data;
                    setSearchResults(Array.isArray(data) ? data : []);
                    setShowSearchResults(true);
                })
                .catch((err) => {
                    console.error("GET /subjects 실패:", err);
                    setShowSearchResults(false);
                })
                .finally(() => setSearchLoading(false));
        }, 300);

        return () => timer && clearTimeout(timer);
    }, [searchQuery]);

    /* ---------- 추가/삭제/체크 ---------- */

    // 검색 결과에서 추가
    const addCourseFromSearch = (result) => {
        const subjectId = result.subjectId ?? result.subject_id ?? result.id;
        if (!subjectId) return;

        const tempId = `temp-${Date.now()}`;
        const tempCourse = {
            id: tempId,
            name: result.subjectName ?? result.name ?? "",
            code: result.semester ?? "",
            credits: Number(result.credit ?? result.credits ?? 0),
            completed: false,
            category: addTarget.category,
            subcategory: addTarget.subcategory ?? undefined,
            _backend: { subjectId }
        };

        // 낙관적 추가
        setCourses(prev => [...prev, tempCourse]);

        axios.post(`/user/box/${subjectId}`)
            .then(() => fetchUserBox())         // 실제 ID 반영 위해 재조회
            .catch((err) => {
                console.error("POST /user/box/{subjectId} 실패:", err);
                // 롤백
                setCourses(prev => prev.filter(c => c.id !== tempId));
            })
            .finally(() => {
                setShowSearchResults(false);
                setSearchQuery("");
            });
    };

    // 삭제(전공필수는 금지)
    const removeCourse = (id) => {
        const target = courses.find(c => c.id === id);
        if (!target) return;
        if (target.category === "major" && target.subcategory === "required") return;

        const userSubjectId = target?._backend?.userSubjectId ?? id;
        const backup = courses;

        // 낙관적 삭제
        setCourses(prev => prev.filter(c => c.id !== id));

        axios.delete(`/user/box/${userSubjectId}`, {
            data: { userId: USER_ID, userSubjectId }
        })
            .catch((err) => {
                console.error("DELETE /user/box/{user_subject_id} 실패:", err);
                // 롤백
                setCourses(backup);
            });
    };

    // 체크 토글(항상 활성). 서버 항목이면 PATCH
    const toggleCourse = (id) => {
        const target = courses.find(c => c.id === id);
        const subjectId = target?._backend?.subjectId;

        // 우선 UI 토글
        setCourses(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));

        if (!subjectId) return; // 서버 항목 아닐 때는 여기까지

        axios.patch(`/user/box/${subjectId}/taken`, { isTaken: !target?.completed })
            .catch((err) => {
                console.error("PATCH /user/box/{subjectId}/taken 실패:", err);
                // 실패 롤백
                setCourses(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
            });
    };

    const toggleRequirement = (id) =>
        setGraduationRequirements(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
    const toggleThesis = (id) =>
        setGraduationThesis(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));

    /* ---------- 분류/합계 ---------- */
    const majorRequired = courses.filter(c => c.category === "major" && c.subcategory === "required");
    const majorElective = courses.filter(c => c.category === "major" && c.subcategory === "elective");
    const liberalBasic  = courses.filter(c => c.category === "liberal" && c.subcategory === "basic");
    const liberalCore   = courses.filter(c => c.category === "liberal" && c.subcategory === "core");
    const liberalFree   = courses.filter(c => c.category === "liberal" && c.subcategory === "free");
    const generalCourses= courses.filter(c => c.category === "general");

    const sum = arr => arr.filter(c => c.completed).reduce((s, c) => s + (c.credits || 0), 0);
    const tot = arr => arr.reduce((s, c) => s + (c.credits || 0), 0);

    const majorRequiredCompleted = sum(majorRequired);
    const majorElectiveCompleted = sum(majorElective);
    const liberalBasicCompleted  = sum(liberalBasic);
    const liberalCoreCompleted   = sum(liberalCore);
    const liberalFreeCompleted   = sum(liberalFree);
    const generalCompleted       = sum(generalCourses);

    const majorRequiredTotal = tot(majorRequired);
    const majorElectiveTotal = tot(majorElective);
    const liberalBasicTotal  = tot(liberalBasic);
    const liberalCoreTotal   = tot(liberalCore);
    const liberalFreeTotal   = tot(liberalFree);

    const majorElectiveExcess   = Math.max(0, majorElectiveCompleted - 25);
    const liberalTotalCompleted = liberalBasicCompleted + liberalCoreCompleted + liberalFreeCompleted;
    const liberalExcess         = Math.max(0, liberalTotalCompleted - 25);

    const totalCompleted  = majorRequiredCompleted + majorElectiveCompleted + liberalTotalCompleted + generalCompleted;
    const totalRequired   = 130;
    const overallProgress = Math.round((totalCompleted / totalRequired) * 100);

    const graduationReqCompleted = graduationRequirements.filter(r => r.completed).length;
    const thesisCompleted        = graduationThesis.filter(t => t.completed).length;

    /* ---------- 공통 렌더 조각 ---------- */
    const CourseRow = (course) =>
        h("div", { key: course.id, className: "gc-item-row" }, [
            h("div", { className: "gc-flex gc-items-center gc-gap-12" }, [
                h("input", { type: "checkbox", checked: !!course.completed, onChange: () => toggleCourse(course.id) }),
                h("span", { className: course.completed ? "gc-completed" : "" }, course.name)
            ]),
            h("div", { className: "gc-flex gc-items-center gc-gap-16" }, [
                h("span", { className: "gc-small gc-text-muted" }, course.code),
                h("span", { className: "gc-small" }, String(course.credits ?? 0)),
                !(course.category === "major" && course.subcategory === "required") &&
                h(Button, { variant: "ghost", size: "sm", onClick: () => removeCourse(course.id) }, "×")
            ])
        ]);

    const CardList = ({ title, completed, total, courses, minTotalForProgress }) => {
        const denominator = Math.max(total || 0, minTotalForProgress || 0.0001);
        const percent = (completed / denominator) * 100;
        return h(Card, null, [
            h(CardHeader, null, [
                h("div", { className: "gc-flex gc-justify-between gc-items-center" }, [
                    h(CardTitle, null, title),
                    h("span", { className: "gc-small gc-text-muted" }, `${completed} / ${total}`)
                ]),
                h(Progress, { value: percent, small: true })
            ]),
            h(CardContent, { className: "gc-space-y-8" }, courses.map(CourseRow))
        ]);
    };

    /* ---------- 렌더 ---------- */
    return h("div", { className: "gc-page" },
        h("div", { className: "gc-container-full" }, [

            // Student Info + Progress
            h(Card, null,
                h(CardContent, null, [
                    h("div", { className: "gc-flex gc-justify-between gc-items-center gc-mb-16" }, [
                        h("h2", {
                                className: "gc-h2 gc-link",
                                role: "button",
                                tabIndex: 0,
                                onClick: () => navigate("/mypage"),
                                onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") navigate("/mypage"); }
                            },
                            "소프트웨어학부 20241234"
                        ),
                        h(Button, { variant: "primary" }, syncing ? "동기화 중..." : "로그아웃")
                    ]),
                    h("div", { className: "gc-flex gc-items-center gc-gap-16" }, [
                        h("span", { className: "gc-text-muted" }, "진행률"),
                        h("div", { className: "gc-progress-wrap" }, h(Progress, { value: overallProgress })),
                        h("span", { className: "gc-bold" }, `${overallProgress}%`)
                    ])
                ])
            ),

            // Search (+ 추가 위치 선택)
            h(Card, null,
                h(CardContent, null, [
                    h("div", { className: "gc-flex gc-items-center gc-gap-12 gc-mb-8" }, [
                        h("select", {
                            className: "input",
                            value: JSON.stringify(addTarget),
                            onChange: (e) => setAddTarget(JSON.parse(e.target.value))
                        }, [
                            h("option", { value: JSON.stringify({ category: "general" }) }, "일반선택"),
                            h("option", { value: JSON.stringify({ category: "major",  subcategory: "elective" }) }, "전공선택"),
                            h("option", { value: JSON.stringify({ category: "liberal", subcategory: "basic" }) }, "기초교양"),
                            h("option", { value: JSON.stringify({ category: "liberal", subcategory: "core"  }) }, "핵심교양"),
                            h("option", { value: JSON.stringify({ category: "liberal", subcategory: "free"  }) }, "자유교양"),
                        ])
                    ]),

                    h("div", { className: "gc-search" }, [
                        h(SearchIcon),
                        h("input", {
                            className: "input gc-text-lg gc-py-12",
                            placeholder: "과목명을 입력하세요",
                            value: searchQuery,
                            onChange: (e) => setSearchQuery(e.target.value)
                        })
                    ]),

                    showSearchResults && h("div", { className: "gc-result" },
                        searchLoading
                            ? h("div", { className: "gc-result-row" }, "검색 중...")
                            : searchResults.map((r) => {
                                const name = r.subjectName ?? r.name ?? "";
                                const type = r.semester ?? "";
                                const credit = r.credit ?? r.credits ?? 0;
                                const key = (r.subjectId ?? r.id ?? name) + "-" + credit;
                                return h("div", { key, className: "gc-result-row" }, [
                                    h("div", { className: "gc-flex gc-items-center gc-gap-16" }, [
                                        h("span", { className: "gc-font-medium" }, name),
                                        h("span", { className: "gc-text-muted" }, type),
                                        h("span", { className: "gc-text-muted" }, String(credit)),
                                    ]),
                                    h(Button, { variant: "outline", size: "sm", onClick: () => addCourseFromSearch(r) }, "추가")
                                ]);
                            })
                    )
                ])
            ),

            // 전공
            h(SectionHeader, { title: "전공", right: `${majorRequiredCompleted + majorElectiveCompleted} / ${majorRequiredTotal + majorElectiveTotal}` }),
            h(CardList, { title: "전공필수", completed: majorRequiredCompleted, total: majorRequiredTotal, courses: majorRequired }),
            h(CardList, { title: "전공선택", completed: majorElectiveCompleted, total: majorElectiveTotal, minTotalForProgress: 25, courses: majorElective }),

            // 교양
            h(SectionHeader, { title: "교양", right: `${liberalTotalCompleted} / 25` }),
            h(CardList, { title: "기초교양", completed: liberalBasicCompleted, total: liberalBasicTotal, courses: liberalBasic }),
            h(CardList, { title: "핵심교양", completed: liberalCoreCompleted, total: liberalCoreTotal, courses: liberalCore }),
            h(CardList, { title: "자유교양", completed: liberalFreeCompleted, total: liberalFreeTotal, courses: liberalFree }),

            // 일반선택
            h(SectionHeader, { title: "일반선택", right: `${generalCompleted + majorElectiveExcess + liberalExcess} / 45` }),
            h("div", { className: "gc-grid-2" }, [
                h(Card, null, h(CardContent, { className: "gc-pt-12" },
                    h("div", { className: "gc-flex gc-justify-between gc-items-center" }, [
                        h("span", null, "초과된 전공 학점 (일반선택으로 이월)"),
                        h("span", { className: "gc-number-blue" }, String(majorElectiveExcess))
                    ])
                )),
                h(Card, null, h(CardContent, { className: "gc-pt-12" },
                    h("div", { className: "gc-flex gc-justify-between gc-items-center" }, [
                        h("span", null, "초과된 교양 학점 (일반선택으로 이월)"),
                        h("span", { className: "gc-number-blue" }, String(liberalExcess))
                    ])
                ))
            ]),

            h(Card, null, [
                h(CardHeader, null, h(CardTitle, null, "일반선택")),
                h(CardContent, { className: "gc-space-y-8" }, generalCourses.map(CourseRow))
            ]),

            // 졸업인증요건
            h(SectionHeader, { title: "졸업인증요건", right: `${graduationReqCompleted} / 1` }),
            h(Card, null, h(CardContent, { className: "gc-pt-24" },
                graduationRequirements.map((req) =>
                    h("div", { key: req.id, className: "gc-row" }, [
                        h("input", { type: "checkbox", checked: !!req.completed, onChange: () => toggleRequirement(req.id) }),
                        h("span", { className: req.completed ? "gc-completed" : "" }, req.text)
                    ])
                )
            )),

            // 졸업논문
            h(SectionHeader, { title: "졸업논문", right: `${thesisCompleted} / ${graduationThesis.length}` }),
            h(Card, null, h(CardContent, { className: "gc-pt-24" },
                graduationThesis.map((t) =>
                    h("div", { key: t.id, className: "gc-row" }, [
                        h("input", { type: "checkbox", checked: !!t.completed, onChange: () => toggleThesis(t.id) }),
                        h("span", { className: t.completed ? "gc-completed" : "" }, t.text)
                    ])
                )
            ))
        ])
    );
}

export default Checklist;
