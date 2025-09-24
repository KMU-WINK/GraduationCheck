import React from 'react';
import styles from './editpage.module.css';

const h = React.createElement;

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
}
function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const DEPARTMENTS = ['SOFTWARE','AI'];

function toApiAdmissionYear(val) {
  const y = String(val || '').replace(/[^0-9]/g, '');
  return y ? `Y${y}` : '';
}

export default function EditPage({ onCancel, onSaved }) {
  const { useEffect, useState } = React;

  const [form, setForm] = useState({
    studentId:'', name:'', department:'', admissionYear:'', averageGrade:''
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
        setForm({
          studentId: data.studentId ?? '',
          name: data.name ?? '',
          department: data.department ?? '',
          admissionYear:
            (typeof data.admissionYear === 'number' || typeof data.admissionYear === 'string')
              ? String(data.admissionYear).replace(/^Y/, '')
              : '',
          averageGrade: data.averageGrade ?? ''
        });
      } catch (e) {
        setError(e.message === 'UNAUTHORIZED' ? '로그인이 필요합니다.' : '기본 정보를 불러오지 못했습니다.');
      }
    })();
  }, []);

  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const submit = async () => {
    setError('');
    if (!form.name.trim()) { setError('이름을 입력해주세요.'); return; }
    if (!form.department)  { setError('학과를 선택해주세요.'); return; }
    if (!/^[0-9]{4}$/.test(String(form.admissionYear))) { setError('입학년도는 4자리 숫자여야 합니다.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          name: form.name.trim(),
          department: form.department,
          admissionYear: toApiAdmissionYear(form.admissionYear),
          averageGrade: form.averageGrade === '' ? null : String(form.averageGrade)
        })
      });
      if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
      if (!res.ok) throw new Error('SAVE_FAILED');
      if (typeof onSaved === 'function') onSaved();
    } catch (e) {
      setError(e.message === 'UNAUTHORIZED' ? '로그인이 필요합니다.' : '저장 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  };

  const cancel = () => (typeof onCancel === 'function') ? onCancel() : null;

  return h('div', { className: styles.div },
    h('div', { className: styles.title }, '정보 수정'),

    /* 라벨 */
    h('div', { className: styles.labelDept }, '학과 :'),
    h('div', { className: styles.labelSid  }, '학번 :'),
    h('div', { className: styles.labelName }, '이름 :'),
    h('div', { className: styles.labelAvg  }, '평균학점 :'),

    /* 입력 박스 (⭐ 반드시 styles.box + 위치 클래스 동시 적용) */
    h('div', { className: `${styles.box} ${styles.boxDept}` },
      h('select', { className: styles.select, value: form.department, onChange: set('department') },
        [
          h('option', { key: 'none', value: '' }, '학과 선택'),
          ...DEPARTMENTS.map(d => h('option', { key: d, value: d }, d))
        ]
      )
    ),
    h('div', { className: `${styles.box} ${styles.boxSid}` },
      h('input', {
        className: styles.input,
        value: form.studentId || '',
        readOnly: true,
        disabled: true,
        'aria-label': '학번'
      })
    ),
    h('div', { className: `${styles.box} ${styles.boxYear}` },
      h('input', {
        className: styles.input,
        value: form.admissionYear,
        onChange: set('admissionYear'),
        placeholder: '입학년도 (예: 2025)',
        inputMode: 'numeric'
      })
    ),
    h('div', { className: `${styles.box} ${styles.boxName}` },
      h('input', {
        className: styles.input,
        value: form.name,
        onChange: set('name'),
        placeholder: '이름'
      })
    ),
    h('div', { className: `${styles.box} ${styles.boxAvg}` },
      h('input', {
        className: styles.input,
        value: form.averageGrade ?? '',
        onChange: set('averageGrade'),
        placeholder: '평균학점 (예: 4.0)'
      })
    ),

    /* 에러 */
    error && h('div', { key: 'error', className: styles.error }, String(error)),

    /* 버튼 */
    h('button', { className: `${styles.editBtn} ${styles.btnCancel}`, type: 'button', onClick: cancel }, '취소'),
    h('button', { className: `${styles.editBtn} ${styles.btnSave}`,   type: 'button', onClick: submit, disabled: submitting },
      submitting ? '저장 중...' : '저장'
    ),
  );
}
