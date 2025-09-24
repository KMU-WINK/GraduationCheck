import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './editpage.module.css';

const h = React.createElement;

/* === 토큰 === */
function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
}
function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* === 상수 === */
const DEPARTMENTS = ['SOFTWARE','AI'];
const YEARS = ['2023', '2024', '2025']; // 입학년도 선택 옵션

/* === 유틸 === */
// admissionYear를 숫자로 변환(명세 준수)
function toApiAdmissionYearNumber(val) {
  const y = String(val || '').replace(/[^0-9]/g, '');
  return y ? Number(y) : null;
}
// 점수 입력 정리 (0~4.5)
function sanitizeGradeInput(v) {
  const cleaned = String(v ?? '').replace(/[^0-9.]/g, '');
  const oneDot = cleaned.replace(/\.(?=.*\.)/g, '');
  if (oneDot === '') return '';
  let num = parseFloat(oneDot);
  if (Number.isNaN(num)) return '';
  if (num < 0) num = 0;
  if (num > 4.5) num = 4.5;
  return String(Math.round(num * 100) / 100);
}
// 진행률 정규화: '80' -> '80%', 0~100
function normalizeProgressText(v) {
  const digits = String(v ?? '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  let n = parseInt(digits, 10);
  if (Number.isNaN(n)) return '';
  if (n < 0) n = 0;
  if (n > 100) n = 100;
  return `${n}%`;
}

/* === sessionStorage 키 === */
const SS_KEYS = {
  major: 'mp_majorAverageGrade',
  subject: 'mp_subjectAverageGrade',
  progress: 'mp_progressText',
};

export default function EditPage(props) {
  const { useEffect, useState } = React;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:'',
    department:'',
    admissionYear:'',   // select(2023/2024/2025)
    studentSuffix:'',   // 뒤 4자리
    majorAverageGrade:'',    // 로컬 임시 저장
    subjectAverageGrade:'',  // 로컬 임시 저장
    progressText:'',         // 로컬 임시 저장
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/users/me', { headers: { ...authHeaders() } });
        if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
        if (!res.ok) throw new Error('FETCH_FAILED');
        const data = await res.json();

        // admissionYear 숫자/문자 모두 허용 → 숫자만 추출
        const admissionYear =
          (typeof data.admissionYear === 'number' || typeof data.admissionYear === 'string')
            ? String(data.admissionYear).replace(/[^0-9]/g, '')
            : '';

        // studentId 분해: 앞 4자리/뒤 4자리
        let yearPart = admissionYear || '';
        let suffixPart = '';
        if (data.studentId) {
          const sid = String(data.studentId);
          if (/^\d{8,}$/.test(sid)) {
            yearPart = sid.slice(0, 4);
            suffixPart = sid.slice(-4);
          }
        }

        // 로컬 임시값 로드(없으면 빈칸)
        const majorSS   = sessionStorage.getItem(SS_KEYS.major)    || '';
        const subjectSS = sessionStorage.getItem(SS_KEYS.subject)  || '';
        const progSS    = sessionStorage.getItem(SS_KEYS.progress) || '';

        setForm({
          name: data.name ?? '',
          department: data.department ?? '',
          admissionYear: yearPart,
          studentSuffix: suffixPart,
          majorAverageGrade: sanitizeGradeInput(majorSS),
          subjectAverageGrade: sanitizeGradeInput(subjectSS),
          progressText: progSS,
        });
      } catch (e) {
        setError(e.message === 'UNAUTHORIZED' ? '로그인이 필요합니다.' : '기본 정보를 불러오지 못했습니다.');
      }
    })();
  }, []);

  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const goMyPage = () => navigate('/mypage');
  const handleCancel = () => {
    if (typeof props?.onCancel === 'function') props.onCancel();
    else goMyPage();
  };

  const submit = async () => {
    setError('');
    if (!form.name.trim()) { setError('이름을 입력해주세요.'); return; }
    if (!form.department)  { setError('학과를 선택해주세요.'); return; }
    if (!YEARS.includes(form.admissionYear)) { setError('입학년도는 2023, 2024, 2025 중 하나여야 합니다.'); return; }
    if (!/^[0-9]{4}$/.test(form.studentSuffix)) { setError('학번 뒤 4자리는 숫자 4자리여야 합니다.'); return; }

    // 평균/진행률 정규화
    const majorAvgClean   = sanitizeGradeInput(form.majorAverageGrade);
    const subjectAvgClean = sanitizeGradeInput(form.subjectAverageGrade);
    const progressClean   = normalizeProgressText(form.progressText);

    // 임시 저장 (브라우저 닫으면 사라짐)
    if (majorAvgClean)   sessionStorage.setItem(SS_KEYS.major, majorAvgClean);   else sessionStorage.removeItem(SS_KEYS.major);
    if (subjectAvgClean) sessionStorage.setItem(SS_KEYS.subject, subjectAvgClean); else sessionStorage.removeItem(SS_KEYS.subject);
    if (progressClean)   sessionStorage.setItem(SS_KEYS.progress, progressClean); else sessionStorage.removeItem(SS_KEYS.progress);

    // 서버로 보낼 averageGrade 병합 규칙
    const toNum = (s) => (s === '' ? null : Number(s));
    const majorNum = toNum(majorAvgClean);
    const subjNum  = toNum(subjectAvgClean);
    let mergedAvg = null;
    if (subjNum != null && majorNum != null) mergedAvg = (subjNum + majorNum) / 2;
    else if (subjNum != null) mergedAvg = subjNum;
    else if (majorNum != null) mergedAvg = majorNum;

    const fullStudentId = form.admissionYear + form.studentSuffix;

    setSubmitting(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          name: form.name.trim(),
          department: form.department,
          admissionYear: toApiAdmissionYearNumber(form.admissionYear), // 숫자 전송
          studentId: fullStudentId,
          averageGrade: mergedAvg, // 명세 준수(단일 필드)
        })
      });
      if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
      if (!res.ok) throw new Error('SAVE_FAILED');

      if (typeof props?.onSaved === 'function') props.onSaved();
      else goMyPage();
    } catch (e) {
      setError(e.message === 'UNAUTHORIZED' ? '로그인이 필요합니다.' : '저장 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  };

  return h('div', { className: styles.div },
    h('div', { className: styles.title }, '정보 수정'),

    /* 라벨 */
    h('div', { className: styles.labelDept }, '학과 :'),
    h('div', { className: styles.labelSid  }, '학번 :'),
    h('div', { className: styles.labelName }, '이름 :'),
    h('div', { className: styles.labelMajorAvg }, '전공 평균'),
    h('div', { className: styles.labelSubjectAvg }, '과목 평균'),
    h('div', { className: styles.labelAvg }, '평균 :'),
    h('div', { className: styles.labelProgress }, '진행률 :'),

    /* 학과 */
    h('div', { className: `${styles.box} ${styles.boxDept}` },
      h('select', { className: styles.select, value: form.department, onChange: set('department') },
        [
          h('option', { key: 'none', value: '' }, '학과 선택'),
          ...DEPARTMENTS.map(d => h('option', { key: d, value: d }, d))
        ]
      )
    ),

    /* 학번: 앞(입학년도) + 뒤(4자리) */
    h('div', { className: `${styles.box} ${styles.boxSid}` },
      h('select', {
        className: styles.select,
        value: form.admissionYear,
        onChange: set('admissionYear')
      }, [
        h('option', { key: 'none', value: '' }, '입학년도 선택'),
        ...YEARS.map(y => h('option', { key: y, value: y }, y))
      ])
    ),
    h('div', { className: `${styles.box} ${styles.boxSidSuffix}` },
      h('input', {
        className: styles.input,
        value: form.studentSuffix,
        onChange: (e) => {
          const v = e.target.value.replace(/[^0-9]/g, '').slice(0,4);
          setForm((prev) => ({ ...prev, studentSuffix: v }));
        },
        placeholder: '뒤 4자리',
        inputMode: 'numeric',
        maxLength: 4
      })
    ),

    /* 이름 */
    h('div', { className: `${styles.box} ${styles.boxName}` },
      h('input', {
        className: styles.input,
        value: form.name,
        onChange: set('name'),
        placeholder: '이름'
      })
    ),

    /* 전공 평균 */
    h('div', { className: `${styles.box} ${styles.boxMajorAvg}` },
      h('input', {
        className: styles.input,
        value: form.majorAverageGrade,
        onChange: (e) => setForm((p) => ({ ...p, majorAverageGrade: sanitizeGradeInput(e.target.value) })),
        placeholder: '예: 4.3',
        inputMode: 'decimal'
      })
    ),

    /* 과목 평균 */
    h('div', { className: `${styles.box} ${styles.boxSubjectAvg}` },
      h('input', {
        className: styles.input,
        value: form.subjectAverageGrade,
        onChange: (e) => setForm((p) => ({ ...p, subjectAverageGrade: sanitizeGradeInput(e.target.value) })),
        placeholder: '예: 4.1',
        inputMode: 'decimal'
      })
    ),

    /* 진행률 (로컬 임시 저장 전용) */
    h('div', { className: `${styles.box} ${styles.boxProgress}` },
      h('input', {
        className: styles.input,
        value: form.progressText,
        onChange: (e) => setForm((p) => ({ ...p, progressText: e.target.value })),
        placeholder: '예: 80 또는 80%'
      })
    ),

    /* 에러 */
    error && h('div', { key: 'error', className: styles.error, role: 'alert' }, String(error)),

    /* 버튼 */
    h('button', { className: `${styles.editBtn} ${styles.btnCancel}`, type: 'button', onClick: handleCancel }, '취소'),
    h('button', { className: `${styles.editBtn} ${styles.btnSave}`,   type: 'button', onClick: submit, disabled: submitting },
      submitting ? '저장 중...' : '저장'
    ),
  );
}
