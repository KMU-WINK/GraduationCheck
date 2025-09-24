import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './mypage.module.css';

const h = React.createElement;

/* === 토큰 === */
function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
}
function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* === sessionStorage 키 === */
const SS_KEYS = {
  major: 'mp_majorAverageGrade',
  subject: 'mp_subjectAverageGrade',
  progress: 'mp_progressText',
};

export default function MyPage() {
  const { useEffect, useState } = React;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState({
    department: '',
    name: '',
    // 학번 분해
    yearPart: '',        // 입학년도(앞 4자리)
    studentSuffix: '',   // 뒤 4자리
    // 평균/진행률(로컬 우선)
    majorAverageGrade: '',
    subjectAverageGrade: '',
    progressText: '',
    // 서버 평군 (fallback용으로만 사용 가능)
    averageGrade: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/users/me', { method: 'GET', headers: { ...authHeaders() } });
        if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
        if (!res.ok) throw new Error('FETCH_FAILED');
        const data = await res.json();

        // admissionYear 숫자/문자 모두 처리
        const admissionYearClean =
          (typeof data.admissionYear === 'number' || typeof data.admissionYear === 'string')
            ? String(data.admissionYear).replace(/[^0-9]/g, '')
            : '';

        // studentId에서 앞/뒤 분리 (없으면 admissionYear 사용)
        let yearPart = admissionYearClean || '';
        let suffixPart = '';
        if (data.studentId) {
          const sid = String(data.studentId).replace(/\s+/g, '');
          if (/^\d{8,}$/.test(sid)) {
            yearPart = sid.slice(0, 4);
            suffixPart = sid.slice(-4);
          }
        }

        // 로컬 임시값 불러오기
        const majorSS   = sessionStorage.getItem(SS_KEYS.major)    || '';
        const subjectSS = sessionStorage.getItem(SS_KEYS.subject)  || '';
        const progSS    = sessionStorage.getItem(SS_KEYS.progress) || '';

        setInfo({
          department: data.department ?? '',
          name: data.name ?? '',
          yearPart,
          studentSuffix: suffixPart,
          majorAverageGrade: majorSS,            // 로컬 우선
          subjectAverageGrade: subjectSS,        // 로컬 우선
          progressText: progSS,                  // 로컬 우선
          averageGrade: data.averageGrade ?? null,
        });
      } catch (e) {
        setError(e.message === 'UNAUTHORIZED' ? '로그인이 필요합니다.' : '내 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const goEdit = () => navigate('/MypageEdit');
  const goChecklist = () => navigate('/checklist');

  // 진행률 % 계산 (로컬 progressText 기준)
  const progressNumber = (() => {
    const digits = String(info.progressText || '').replace(/[^0-9]/g, '');
    let n = digits ? parseInt(digits, 10) : NaN;
    if (Number.isNaN(n)) return 0;
    if (n < 0) n = 0;
    if (n > 100) n = 100;
    return n;
  })();

  // 공통 표시 헬퍼
  const show = (v) => (v === null || v === undefined || v === '' ? '없음' : String(v));

  return h('div', { className: styles.div },

    /* 로딩 오버레이 */
    loading && h('div', {
      key: 'loading',
      style: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.6)',
        zIndex: 10,
        fontSize: 18
      }
    }, '불러오는 중...'),

    /* 에러 오버레이 */
    error && h('div', {
      key: 'error',
      role: 'alert',
      style: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.8)',
        zIndex: 10,
        fontSize: 16
      }
    }, String(error)),

    /* 타이틀 */
    h('div', { className: styles['my-page'] }, 'My Page'),

    /* 라벨들 */
    h('div', { className: styles.div2 }, '학과 :'),
    h('div', { className: styles.div3 }, '학번 :'),
    h('div', { className: styles.div4 }, '이름 :'),
    h('div', { className: styles.div5 }, '평균 :'),
    h('div', { className: styles.div7 }, '전공평균'),
    h('div', { className: styles.div8 }, '과목평균'),
    h('div', { className: styles.div6 }, '진행률 :'),

    /* 값 박스들 */
    h('div', { className: styles['rectangle-8']  },  show(info.department)),
    // 학번: 왼쪽=입학년도, 오른쪽=뒤 4자리 (최근 CSS 기준)
    h('div', { className: styles['rectangle-14'] },  show(info.yearPart)),
    h('div', { className: styles['rectangle-11'] },  show(info.studentSuffix)),
    // 이름
    h('div', { className: styles['rectangle-12'] },  show(info.name)),
    // 평균학점 두 칸: 로컬 세션 우선, 없으면 '없음'
    h('div', { className: styles['rectangle-15'] },  show(info.majorAverageGrade)),
    h('div', { className: styles['rectangle-16'] },  show(info.subjectAverageGrade)),

    // 진행률: 텍스트 + 게이지
    h('div', { className: styles['rectangle-13'] },
      h('span', { className: styles.progressLabel }, show(info.progressText)),
      h('div', { className: styles.progressBar },
        h('div', { className: styles.progressFill, style: { width: `${progressNumber}%` } })
      )
    ),

    /* (투명 클릭영역이 필요하면 유지) */
    h('div', {
      className: styles['rectangle-112'],
      role: 'button',
      tabIndex: 0,
      onClick: goEdit,
      onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && goEdit()
    }),
    /* 수정하기 버튼 텍스트 */
    h('div', {
      className: styles.div9,
      role: 'button',
      tabIndex: 0,
      onClick: goEdit,
      onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && goEdit()
    }, '수정하기'),

    /* X 버튼 → 체크리스트 이동 */
    h('div', {
      className: styles.div10,
      role: 'button',
      tabIndex: 0,
      'aria-label': '체크리스트로 이동',
      onClick: goChecklist,
      onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && goChecklist()
    }, '×'),
  );
}
