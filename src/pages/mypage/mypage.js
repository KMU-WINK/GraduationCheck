import React from 'react';
import './mypage.css';

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

const FieldRow = ({ label, value }) =>
  h('div', { className: 'gc-item-row' }, [
    h('span', { className: 'gc-text-muted' }, label),
    h('span', null, value ?? '-')
  ]);

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function MyPage({ onEdit }) {
  const { useEffect, useState } = React;

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState({
    studentId: '', name: '',
    department: '', admissionYear: '', averageGrade: null
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/users/me', {
          method: 'GET',
          headers: { ...authHeaders() }
        });
        if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
        if (!res.ok) throw new Error('FETCH_FAILED');
        const data = await res.json();
        setInfo({
          studentId: data.studentId ?? '',
          name: data.name ?? '',
          department: data.department ?? '',
          admissionYear: (typeof data.admissionYear === 'number' || typeof data.admissionYear === 'string')
            ? String(data.admissionYear).replace(/^Y/, '')
            : '',
          averageGrade: data.averageGrade ?? null
        });
      } catch (e) {
        setError(e.message === 'UNAUTHORIZED' ? '로그인이 필요합니다.' : '내 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const goEdit = () => (typeof onEdit === 'function') ? onEdit() : null;

  return h('div', { className: 'gc-page' },
    h('div', { className: 'gc-container' },
      h(Card, null, [
        h(CardHeader, null, h(CardTitle, null, '내 정보')),
        h(CardContent, { className: 'gc-space-y-8' }, [
          loading && h('div', { className: 'gc-text-muted' }, '불러오는 중...'),
          error   && h('div', { className: 'gc-text-muted' }, error),
          (!loading && !error) && [
            h(FieldRow, { key: 'sid',   label: '학번',     value: info.studentId }),
            h(FieldRow, { key: 'name',  label: '이름',     value: info.name }),
            h(FieldRow, { key: 'dept',  label: '학과',     value: info.department }),
            h(FieldRow, { key: 'year',  label: '입학년도', value: info.admissionYear }),
            h(FieldRow, { key: 'avg',   label: '평균학점', value: info.averageGrade ?? '-' })
          ],
          h('div', null, h(Button, { variant: 'primary', onClick: goEdit }, '수정하기'))
        ])
      ])
    )
  );
}
