import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderWithBack } from '../common/HeaderWithBack';
import style from '../../style/page.module.scss';

interface Notice {
    id: number;
    title: string;
    date: string;
    body: string;
}

// 정적 공지 데이터. 추후 백엔드 공지 API가 생기면 fetch로 교체한다.
const NOTICES: Notice[] = [
    {
        id: 3,
        title: '추천 음식 데이터 확대 안내',
        date: '2026-06-20',
        body: '한식 위주였던 추천 메뉴에 일식·중식·이탈리아·멕시코·태국 등 다양한 국제 요리를 추가했어요. 이제 기분에 따라 더 폭넓은 추천을 받아보실 수 있습니다.',
    },
    {
        id: 2,
        title: '찜 목록 기능 추가',
        date: '2026-06-15',
        body: '마음에 든 추천 음식을 하트 버튼으로 저장하고, 마이 > 찜 목록에서 다시 확인할 수 있어요.',
    },
    {
        id: 1,
        title: 'MoodBite 정식 오픈 🎉',
        date: '2026-06-01',
        body: '기분과 상황에 맞는 음식을 추천하는 MoodBite가 정식 오픈했습니다. 많은 이용 부탁드려요!',
    },
];

export function NoticesPage() {
    const navigate = useNavigate();

    return (
        <div className={style.container}>
            <HeaderWithBack onBack={() => navigate(-1)} title="공지사항" />
            <main className={style.content}>
                <ul className={style.list}>
                    {NOTICES.map((n) => (
                        <li key={n.id} className={style.listItem}>
                            <p className={style.itemTitle}>{n.title}</p>
                            <span className={style.itemMeta}>{n.date}</span>
                            <p className={style.itemBody}>{n.body}</p>
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );
}
