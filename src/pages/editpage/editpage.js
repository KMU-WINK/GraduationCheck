import React from 'react';
import './editpage.css';

const h = React.createElement;

const Button = ({ children, variant = 'primary', size, onClick, disabled }) =>
  h('button', {
    className: `btn ${variant === 'outline' ? 'btn-outline' : variant === 'ghost' ? 'btn-ghost' : 'btn-primary'} ${size === 'sm' ? 'btn-sm' : ''}`,
    onClick, disabled
  }, children);

const Card        = ({ children })            => h('div', { className: 'card' }, children);
const CardHeader  = ({ children })            => h('div', { className: 'card-header' }, children);
const CardTitle   = ({ children })            => h('div', { className: 'card-title' }, children);
const CardContent = ({ children, className }) => h('div', { className: `card-content${className ? ' ' + className : ''}` }, children);

const FieldRow = ({ label, right }) =>
  h('div', { className: 'gc-item-row' }, [
    h('span', { className: 'gc-text-muted' }, label),
    right
  ]);

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
}
function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const DEPARTMENTS = [
  'SOFTWARE',
  'AI'
];

function toApiAdmissionYear(val) {
  const y = String(val || '').replace(/[^0-9]/g, '');
  return y ? `Y${y}` : '';
}

export default function EditPage({ onCancel, onSaved }) {
  const { useEffect, useState } = React;

  const [form, setForm]       = useState({ name:'', department:'', admissionYear:'', averageGrade:'' });
  const [error, setError]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/users/me', { headers: { ...authHeaders() } });
        if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
        if (!res.ok) throw new Error('FETCH_FAILED');
        const data = await res.json();
        setForm({
          name: data.name ?? '',
          department: data.department ?? '',
          admissionYear: (typeof data.admissionYear === 'number' || typeof data.admissionYear === 'string')
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

  return h('div', { className: 'gc-page' },
    h('div', { className: 'gc-container' },
      h(Card, null, [
        h(CardHeader, null, h(CardTitle, null, '정보 수정')),
        h(CardContent, { className: 'gc-space-y-8' }, [
          error && h('div', { className: 'gc-text-muted' }, error),

          h(FieldRow, {
            label: '이름',
            right: h('input', { className: 'input', value: form.name, onChange: set('name'), placeholder: '이름' })
          }),
          h(FieldRow, {
            label: '학과',
            right: h('select', { className: 'input', value: form.department, onChange: set('department') }, [
              h('option', { value: '' }, '학과 선택'),
              ...DEPARTMENTS.map((d) => h('option', { key: d, value: d }, d))
            ])
          }),
          h(FieldRow, {
            label: '입학년도',
            right: h('input', { className: 'input', value: form.admissionYear, onChange: set('admissionYear'), placeholder: '예: 2024' })
          }),
          h(FieldRow, {
            label: '평균학점',
            right: h('input', { className: 'input', value: form.averageGrade ?? '', onChange: set('averageGrade'), placeholder: '예: 4.0' })
          }),

          h('div', { className: 'gc-flex gc-gap-16' }, [
            h(Button, { variant: 'outline', onClick: cancel }, '취소'),
            h(Button, { variant: 'primary', onClick: submit, disabled: submitting }, submitting ? '저장 중...' : '저장')
          ])
        ])
      ])
    )
  );
}

