import React from 'react';
import style from "../../style/main.module.scss";
import homeStyle from "../../style/home.module.scss";

interface HomeContentProps {
    onStartTest: () => void;
}

export function HomeContent({ onStartTest }: HomeContentProps) {
    return (
        <main className={style.mainContent}>
            <div className={style.homeContent}>
                <h2 className={style.mainTitle}>오늘 뭐먹지?</h2>
                <p className={homeStyle.subtitle}>
                    상황에 맞는<br />
                    음식 추천
                </p>
                <button
                    className={style.recommendButton}
                    onClick={onStartTest}
                >
                    음식 추천하기
                </button>
                
                {/* 추가 기능들을 위한 공간 */}
                <div className={homeStyle.quickActions}>
                    <div className={homeStyle.actionCard}>
                        <h3>빠른 추천</h3>
                        <p>질문 기반 추천</p>
                    </div>
                    <div className={homeStyle.actionCard}>
                        <h3>내 기록</h3>
                        <p>지난 추천 기록 보기</p>
                    </div>
                </div>
            </div>
        </main>
    );
}