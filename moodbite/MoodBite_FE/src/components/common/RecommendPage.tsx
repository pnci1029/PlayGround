import React from 'react';
import { ArrowLeft } from 'lucide-react';
import style from "../../style/recommend.module.scss";

interface Args{
    onBack: any
}
export function RecommendPage({onBack}:Args) {
    return (
        <div className={style.container}>
            {/* 상단 헤더 */}
            <header className={style.header}>
                <div className={style.headerContent}>
                    <button
                        className={style.backButton}
                        onClick={onBack}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className={style.pageTitle}>음식 추천</h1>
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <main className={style.mainContent}>
                {/* 기분 선택 섹션 */}
                <section className={style.moodSection}>
                    <h2 className={style.sectionTitle}>지금 당신의 기분은?</h2>
                    <div className={style.moodGrid}>
                        <button className={style.moodButton}>😊 행복해요</button>
                        <button className={style.moodButton}>😔 우울해요</button>
                        <button className={style.moodButton}>😫 피곤해요</button>
                        <button className={style.moodButton}>😡 화나요</button>
                        <button className={style.moodButton}>🤔 고민중이에요</button>
                        <button className={style.moodButton}>🥳 신나요</button>
                    </div>
                </section>

                {/* 추천 음식 섹션 */}
                <section className={style.foodSection}>
                    <h2 className={style.sectionTitle}>이런 음식은 어떠세요?</h2>
                    <div className={style.foodCards}>
                        <div className={style.foodCard}>
                            <div className={style.foodImage}></div>
                            <div className={style.foodInfo}>
                                <h3>따뜻한 국밥</h3>
                                <p>피곤한 당신을 위한 든든한 한 끼</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}