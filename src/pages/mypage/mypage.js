import React from 'react';
import './mypage.css';

const h = React.createElement;

/* gc-style primitives (페이지 로컬) */
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
    h('span', null, value || '-')
  ]);

export default function MyPage({ onEdit }) {
  const { useEffect, useState } = React;
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState({
    department: '', major: '', name: '', year: '',
    studentId: '', gpa: '', progress: ''
  });

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch('/api/user-info', { credentials: 'include' });
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        setInfo({
          department: data.department || '',
          major     : data.major      || '',
          name      : data.name       || '',
          year      : data.year       || '',
          studentId : data.studentId  || '',
          gpa       : data.gpa ?? '',
          progress  : data.progress ?? ''
        });
      } catch (e) {
        setError('내 정보를 불러오는 데 실패했습니다.');
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
            h(FieldRow, { key: 'dep',   label: '학과',     value: info.department }),
            h(FieldRow, { key: 'major', label: '전공',     value: info.major }),
            h(FieldRow, { key: 'name',  label: '이름',     value: info.name }),
            h(FieldRow, { key: 'year',  label: '입학년도', value: info.year }),
            h(FieldRow, { key: 'sid',   label: '학번',     value: info.studentId }),
            h(FieldRow, { key: 'gpa',   label: '평균학점', value: info.gpa }),
            h(FieldRow, { key: 'prog',  label: '졸업요건 진행률', value: info.progress })
          ],
          h('div', null, h(Button, { variant: 'primary', onClick: goEdit }, '수정하기'))
        ])
      ])
    )
  );
}
