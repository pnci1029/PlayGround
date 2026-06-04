import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import style from '../../style/test.module.scss';

const MESSAGES = [
    '당신의 기분을 살펴보고 있어요',
    '상황에 어울리는 음식을 고르는 중',
    '최적의 메뉴를 추천하고 있어요',
];

export function AnalyzingScreen() {
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIdx((i) => (i + 1) % MESSAGES.length);
        }, 1500);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={style.analyzing}>
            <RefreshCw size={40} className={style.analyzingSpinner} />
            <h2 className={style.analyzingTitle}>{MESSAGES[idx]}…</h2>
            <p className={style.analyzingSub}>잠시만 기다려 주세요 🍳</p>
        </div>
    );
}
