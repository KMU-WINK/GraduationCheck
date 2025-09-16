import React from "react";

const h = React.createElement;

/* ---------- 공통 UI ---------- */
const Progress = ({ value, small }) =>
    h('div', { className: 'progress' + (small ? ' progress-sm' : '') },
        h('div', {
            className: 'progress-bar',
            style: { width: `${Math.max(0, Math.min(100, Math.round(value)))}%` }
        })
    );

const Button = ({ children, variant = 'primary', size, onClick }) =>
    h('button', {
        className: `btn ${variant === 'outline' ? 'btn-outline' : variant === 'ghost' ? 'btn-ghost' : 'btn-primary'} ${size === 'sm' ? 'btn-sm' : ''}`,
        onClick
    }, children);

const Card = ({ children }) => h('div', { className: 'card' }, children);
const CardHeader = ({ children }) => h('div', { className: 'card-header' }, children);
const CardTitle = ({ children }) => h('div', { className: 'card-title' }, children);
const CardContent = ({ children, className }) =>
    h('div', { className: `card-content${className ? ' ' + className : ''}` }, children);

const SectionHeader = ({ title, right }) =>
    h('div', { className: 'gc-flex gc-justify-between gc-items-center gc-mt-24 gc-mb-8' }, [
        h('h2', { className: 'gc-section-title' }, title),
        h('span', { className: 'gc-text-muted' }, right)
    ]);

const SearchIcon = () => h('span', { className: 'gc-search-icon' }, '🔍');
const CodeIcon   = () => h('span', { className: 'gc-icon' }, '💻');

/* ---------- 메인 컴포넌트 ---------- */
function Checklist() {
    const { useState } = React;

    const [courses, setCourses] = useState([
        // 전공필수
        { id: 1, name: "소프트웨어학개론", code: "1-1", credits: 3, completed: true, category: "major", subcategory: "required" },
        { id: 2, name: "프로그래밍기초",   code: "1-1", credits: 3, completed: true, category: "major", subcategory: "required" },
        { id: 3, name: "자료구조",         code: "1-2", credits: 3, completed: true, category: "major", subcategory: "required" },
        { id: 4, name: "알고리즘",         code: "2-1", credits: 3, completed: true, category: "major", subcategory: "required" },
        { id: 5, name: "데이터베이스",     code: "2-2", credits: 3, completed: true, category: "major", subcategory: "required" },
        { id: 6, name: "운영체제",         code: "3-1", credits: 3, completed: true, category: "major", subcategory: "required" },

        // 전공선택
        { id: 7,  name: "웹프로그래밍",     code: "2-1", credits: 3, completed: true, category: "major", subcategory: "elective" },
        { id: 8,  name: "모바일프로그래밍", code: "2-2", credits: 3, completed: true, category: "major", subcategory: "elective" },
        { id: 9,  name: "인공지능",         code: "3-1", credits: 3, completed: true, category: "major", subcategory: "elective" },
        { id: 10, name: "머신러닝",         code: "3-2", credits: 3, completed: true, category: "major", subcategory: "elective" },
        { id: 11, name: "소프트웨어공학",   code: "4-1", credits: 3, completed: true, category: "major", subcategory: "elective" },
        { id: 12, name: "네트워크보안",     code: "4-2", credits: 3, completed: true, category: "major", subcategory: "elective" },

        // 기초교양
        { id: 13, name: "대학수학", code: "1-1", credits: 3, completed: true,  category: "liberal", subcategory: "basic" },
        { id: 14, name: "대학물리", code: "1-2", credits: 3, completed: true,  category: "liberal", subcategory: "basic" },
        { id: 15, name: "통계학",   code: "2-1", credits: 3, completed: true,  category: "liberal", subcategory: "basic" },
        { id: 16, name: "선형대수", code: "2-2", credits: 3, completed: true,  category: "liberal", subcategory: "basic" },
        { id: 17, name: "이산수학", code: "3-1", credits: 3, completed: true,  category: "liberal", subcategory: "basic" },
        { id: 18, name: "확률론",   code: "3-2", credits: 3, completed: false, category: "liberal", subcategory: "basic" },

        // 핵심교양
        { id: 19, name: "철학개론",   code: "1-1", credits: 3, completed: true,  category: "liberal", subcategory: "core" },
        { id: 20, name: "한국사",     code: "1-2", credits: 3, completed: true,  category: "liberal", subcategory: "core" },
        { id: 21, name: "영어회화",   code: "2-1", credits: 3, completed: true,  category: "liberal", subcategory: "core" },
        { id: 22, name: "경제학원론", code: "2-2", credits: 3, completed: true,  category: "liberal", subcategory: "core" },
        { id: 23, name: "심리학개론", code: "3-1", credits: 3, completed: true,  category: "liberal", subcategory: "core" },
        { id: 24, name: "사회학개론", code: "3-2", credits: 3, completed: false, category: "liberal", subcategory: "core" },

        // 자유교양
        { id: 25, name: "음악감상", code: "1-1", credits: 3, completed: true,  category: "liberal", subcategory: "free" },
        { id: 26, name: "미술사",   code: "1-2", credits: 3, completed: true,  category: "liberal", subcategory: "free" },
        { id: 27, name: "체육",     code: "2-1", credits: 3, completed: true,  category: "liberal", subcategory: "free" },
        { id: 28, name: "문학개론", code: "2-2", credits: 3, completed: true,  category: "liberal", subcategory: "free" },
        { id: 29, name: "창의적사고", code: "3-1", credits: 3, completed: true,  category: "liberal", subcategory: "free" },
        { id: 30, name: "리더십",   code: "3-2", credits: 3, completed: false, category: "liberal", subcategory: "free" },

        // 일반선택
        { id: 31, name: "교육학개론", code: "1-1", credits: 3, completed: true, category: "general" },
        { id: 32, name: "국제관계론", code: "1-2", credits: 3, completed: true, category: "general" },
        { id: 33, name: "환경과학",   code: "2-1", credits: 3, completed: true, category: "general" },
        { id: 34, name: "생명과학",   code: "2-2", credits: 3, completed: true, category: "general" },
        { id: 35, name: "지구과학",   code: "3-1", credits: 3, completed: true, category: "general" },
    ]);

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
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    const availableCourses = [
        { id: 101, name: "과목1", type: "글로벌", credits: 3 },
        { id: 102, name: "과목2", type: "글로벌", credits: 3 },
        { id: 103, name: "과목3", type: "1 ~ 4", credits: 3 },
    ];

    const handleSearch = (q) => {
        setSearchQuery(q);
        if (q.trim()) {
            const filtered = availableCourses.filter(c => c.name.toLowerCase().includes(q.toLowerCase()));
            setSearchResults(filtered);
            setShowSearchResults(true);
        } else {
            setShowSearchResults(false);
        }
    };

    const addCourse = (r) => {
        const newCourse = { id: Date.now(), name: r.name, code: "1-1", credits: r.credits, completed: false, category: "general" };
        setCourses(prev => [...prev, newCourse]);
        setShowSearchResults(false);
        setSearchQuery("");
    };

    const toggleCourse = (id) => setCourses(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
    const removeCourse = (id) => setCourses(prev => prev.filter(c => c.id !== id));

    const toggleRequirement = (id) => setGraduationRequirements(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
    const toggleThesis = (id) => setGraduationThesis(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));

    // 그룹
    const majorRequired = courses.filter(c => c.category === "major" && c.subcategory === "required");
    const majorElective = courses.filter(c => c.category === "major" && c.subcategory === "elective");
    const liberalBasic  = courses.filter(c => c.category === "liberal" && c.subcategory === "basic");
    const liberalCore   = courses.filter(c => c.category === "liberal" && c.subcategory === "core");
    const liberalFree   = courses.filter(c => c.category === "liberal" && c.subcategory === "free");
    const generalCourses= courses.filter(c => c.category === "general");

    const sumCredits = (arr) => arr.filter(c => c.completed).reduce((s, c) => s + c.credits, 0);
    const totalOf    = (arr) => arr.reduce((s, c) => s + c.credits, 0);

    const majorRequiredCompleted = sumCredits(majorRequired);
    const majorElectiveCompleted = sumCredits(majorElective);
    const liberalBasicCompleted  = sumCredits(liberalBasic);
    const liberalCoreCompleted   = sumCredits(liberalCore);
    const liberalFreeCompleted   = sumCredits(liberalFree);
    const generalCompleted       = sumCredits(generalCourses);

    const majorRequiredTotal = totalOf(majorRequired);
    const majorElectiveTotal = totalOf(majorElective);
    const liberalBasicTotal  = totalOf(liberalBasic);
    const liberalCoreTotal   = totalOf(liberalCore);
    const liberalFreeTotal   = totalOf(liberalFree);

    const majorElectiveExcess   = Math.max(0, majorElectiveCompleted - 25);
    const liberalTotalCompleted = liberalBasicCompleted + liberalCoreCompleted + liberalFreeCompleted;
    const liberalExcess         = Math.max(0, liberalTotalCompleted - 25);

    const totalCompleted  = majorRequiredCompleted + majorElectiveCompleted + liberalTotalCompleted + generalCompleted;
    const totalRequired   = 130;
    const overallProgress = Math.round((totalCompleted / totalRequired) * 100);

    const graduationReqCompleted = graduationRequirements.filter(r => r.completed).length;
    const thesisCompleted        = graduationThesis.filter(t => t.completed).length;

    const CourseRow = (course) =>
        h('div', { key: course.id, className: 'gc-item-row' }, [
            h('div', { className: 'gc-flex gc-items-center gc-gap-12' }, [
                h('input', { type: 'checkbox', checked: !!course.completed, onChange: () => toggleCourse(course.id) }),
                h('span', { className: course.completed ? 'gc-completed' : '' }, course.name)
            ]),
            h('div', { className: 'gc-flex gc-items-center gc-gap-16' }, [
                h('span', { className: 'gc-small gc-text-muted' }, course.code),
                h('span', { className: 'gc-small' }, String(course.credits)),
                h(Button, { variant: 'ghost', size: 'sm', onClick: () => removeCourse(course.id) }, '×')
            ])
        ]);

    const CardList = ({ title, completed, total, courses, minTotalForProgress }) => {
        const denominator = Math.max(total || 0, minTotalForProgress || 0.0001);
        const percent = (completed / denominator) * 100;
        return h(Card, null, [
            h(CardHeader, null, [
                h('div', { className: 'gc-flex gc-justify-between gc-items-center' }, [
                    h(CardTitle, null, title),
                    h('span', { className: 'gc-small gc-text-muted' }, `${completed} / ${total}`)
                ]),
                h(Progress, { value: percent, small: true })
            ]),
            h(CardContent, { className: 'gc-space-y-8' }, courses.map(CourseRow))
        ]);
    };

    const SimpleListCard = ({ title, list }) =>
        h(Card, null, [
            h(CardHeader, null, h(CardTitle, null, title)),
            h(CardContent, { className: 'gc-space-y-8' }, list.map(CourseRow))
        ]);

    return h('div', { className: 'gc-page' },
        h('div', { className: 'gc-container' }, [


            // Student Info + Progress
            h(Card, null,
                h(CardContent, null, [
                    h('div', { className: 'gc-flex gc-justify-between gc-items-center gc-mb-16' }, [
                        h('h2', { className: 'gc-h2' }, '소프트웨어학부 20241234'),
                        h(Button, { variant: 'primary' }, '로그아웃')
                    ]),
                    h('div', { className: 'gc-flex gc-items-center gc-gap-16' }, [
                        h('span', { className: 'gc-text-muted' }, '진행률'),
                        h('div', { className: 'gc-progress-wrap' }, h(Progress, { value: overallProgress })),
                        h('span', { className: 'gc-bold' }, `${overallProgress}%`)
                    ])
                ])
            ),

            // Search
            h(Card, null,
                h(CardContent, null, [
                    h('div', { className: 'gc-search' }, [
                        h(SearchIcon),
                        h('input', {
                            className: 'input gc-text-lg gc-py-12',
                            placeholder: '과목명을 입력하세요',
                            value: searchQuery,
                            onChange: (e) => handleSearch(e.target.value)
                        })
                    ]),
                    showSearchResults && h('div', { className: 'gc-result' },
                        searchResults.map((r) =>
                            h('div', { key: r.id, className: 'gc-result-row' }, [
                                h('div', { className: 'gc-flex gc-items-center gc-gap-16' }, [
                                    h('span', { className: 'gc-font-medium' }, r.name),
                                    h('span', { className: 'gc-text-muted' }, r.type),
                                    h('span', { className: 'gc-text-muted' }, String(r.credits)),
                                ]),
                                h(Button, { variant: 'outline', size: 'sm', onClick: () => addCourse(r) }, '추가')
                            ])
                        )
                    )
                ])
            ),

            // 전공
            h(SectionHeader, { title: '전공', right: `${majorRequiredCompleted + majorElectiveCompleted} / ${majorRequiredTotal + majorElectiveTotal}` }),
            h(CardList, { title: '전공필수', completed: majorRequiredCompleted, total: majorRequiredTotal, courses: majorRequired }),
            h(CardList, { title: '전공선택', completed: majorElectiveCompleted, total: majorElectiveTotal, minTotalForProgress: 25, courses: majorElective }),

            // 교양
            h(SectionHeader, { title: '교양', right: `${liberalTotalCompleted} / 25` }),
            h(CardList, { title: '기초교양', completed: liberalBasicCompleted, total: liberalBasicTotal, courses: liberalBasic }),
            h(CardList, { title: '핵심교양', completed: liberalCoreCompleted, total: liberalCoreTotal, courses: liberalCore }),
            h(CardList, { title: '자유교양', completed: liberalFreeCompleted, total: liberalFreeTotal, courses: liberalFree }),

            // 일반선택
            h(SectionHeader, { title: '일반선택', right: `${generalCompleted + majorElectiveExcess + liberalExcess} / 45` }),
            h('div', { className: 'gc-grid-2' }, [
                h(Card, null, h(CardContent, { className: 'gc-pt-12' },
                    h('div', { className: 'gc-flex gc-justify-between gc-items-center' }, [
                        h('span', null, '초과된 전공 학점 (일반선택으로 이월)'),
                        h('span', { className: 'gc-number-blue' }, String(majorElectiveExcess))
                    ])
                )),
                h(Card, null, h(CardContent, { className: 'gc-pt-12' },
                    h('div', { className: 'gc-flex gc-justify-between gc-items-center' }, [
                        h('span', null, '초과된 교양 학점 (일반선택으로 이월)'),
                        h('span', { className: 'gc-number-blue' }, String(liberalExcess))
                    ])
                ))
            ]),

            h(Card, null, [
                h(CardHeader, null, h(CardTitle, null, '일반선택')),
                h(CardContent, { className: 'gc-space-y-8' }, generalCourses.map(course => (
                    h('div', { key: course.id, className: 'gc-item-row' }, [
                        h('div', { className: 'gc-flex gc-items-center gc-gap-12' }, [
                            h('input', { type: 'checkbox', checked: !!course.completed, onChange: () => toggleCourse(course.id) }),
                            h('span', { className: course.completed ? 'gc-completed' : '' }, course.name)
                        ]),
                        h('div', { className: 'gc-flex gc-items-center gc-gap-16' }, [
                            h('span', { className: 'gc-small gc-text-muted' }, course.code),
                            h('span', { className: 'gc-small' }, String(course.credits)),
                            h(Button, { variant: 'ghost', size: 'sm', onClick: () => removeCourse(course.id) }, '×')
                        ])
                    ])
                )))
            ]),

            // 졸업인증요건
            h(SectionHeader, { title: '졸업인증요건', right: `${graduationReqCompleted} / 1` }),
            h(Card, null, h(CardContent, { className: 'gc-pt-24' },
                graduationRequirements.map((req) =>
                    h('div', { key: req.id, className: 'gc-row' }, [
                        h('input', { type: 'checkbox', checked: !!req.completed, onChange: () => toggleRequirement(req.id) }),
                        h('span', { className: req.completed ? 'gc-completed' : '' }, req.text)
                    ])
                )
            )),

            // 졸업논문
            h(SectionHeader, { title: '졸업논문', right: `${thesisCompleted} / ${graduationThesis.length}` }),
            h(Card, null, h(CardContent, { className: 'gc-pt-24' },
                graduationThesis.map((t) =>
                    h('div', { key: t.id, className: 'gc-row' }, [
                        h('input', { type: 'checkbox', checked: !!t.completed, onChange: () => toggleThesis(t.id) }),
                        h('span', { className: t.completed ? 'gc-completed' : '' }, t.text)
                    ])
                )
            ))
        ])
    );
}

export default Checklist;
