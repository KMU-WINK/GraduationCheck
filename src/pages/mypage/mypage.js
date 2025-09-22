import React from 'react';
import styles from './mypage.module.css';

const h = React.createElement;

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
}
function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function MyPage({ onEdit, onClose }) {
  const { useEffect, useState } = React;

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState({
    studentId: '', name: '',
    department: '', admissionYear: '', averageGrade: null,
    progressText: '' // 예: "80%"
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/users/me', { method: 'GET', headers: { ...authHeaders() } });
        if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
        if (!res.ok) throw new Error('FETCH_FAILED');
        const data = await res.json();
        setInfo({
          studentId: data.studentId ?? '',
          name: data.name ?? '',
          department: data.department ?? '',
          admissionYear:
            (typeof data.admissionYear === 'number' || typeof data.admissionYear === 'string')
              ? String(data.admissionYear).replace(/^Y/, '')
              : '',
          averageGrade: data.averageGrade ?? null,
          progressText : (data.progressText ?? '') // 없으면 빈칸
        });
      } catch (e) {
        setError(e.message === 'UNAUTHORIZED' ? '로그인이 필요합니다.' : '내 정보를 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const goEdit = () => (typeof onEdit === 'function') ? onEdit() : null;

  return h('div', { className: styles.div },
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

error && h('div', {
  key: 'error',
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

  h('div', { className: styles['my-page'] }, 'My Page'),

  h('div', { className: styles.div2 }, '학과 :'),
  h('div', { className: styles.div3 }, '학번 :'),
  h('div', { className: styles.div4 }, '이름 :'),
  h('div', { className: styles.div5 }, '평균학점 :'),
  h('div', { className: styles.div6 }, '진행률 :'),
  h('div', { className: styles.div7 }, '전공'),
  h('div', { className: styles.div8 }, '전체'),

  h('div', { className: styles['rectangle-8']  },  info.department || ''),
  h('div', { className: styles['rectangle-11'] },  info.studentId || ''),
  h('div', { className: styles['rectangle-14'] },  info.admissionYear || ''),
  h('div', { className: styles['rectangle-12'] },  info.name || ''),
  h('div', { className: styles['rectangle-15'] },  (info.averageGrade ?? '-') + '' ),
  h('div', { className: styles['rectangle-16'] },  ''),

  h('div', { className: styles['rectangle-13'] }, info.progressText || ''),

  h('div', {
    className: styles['rectangle-112'],
    role: 'button',
    tabIndex: 0,
    onClick: goEdit,
    onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && goEdit()
  }),
  h('div', {
    className: styles.div9,
    role: 'button',
    tabIndex: 0,
    onClick: goEdit,
    onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && goEdit()
  }, '수정하기'),

  h('div', {
    className: styles.div10,
    role: 'button',
    tabIndex: 0,
    onClick: typeof onClose === 'function' ? onClose : undefined,
    onKeyDown: (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && typeof onClose === 'function') onClose();
    }
  }, '×'),
);
}