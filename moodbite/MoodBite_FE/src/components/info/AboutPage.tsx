import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderWithBack } from '../common/HeaderWithBack';
import style from '../../style/page.module.scss';

const APP_VERSION = '1.0.0';

const FEATURES: Array<{ emoji: string; title: string; desc: string }> = [
    { emoji: '🧠', title: '기분 기반 추천', desc: '컨디션·기분·상황을 분석해 지금 당신에게 맞는 음식을 추천해요.' },
    { emoji: '🔬', title: '과학적 분석', desc: '스트레스-코르티솔, 일주기 리듬, 장-뇌 축 등 영양학 연구를 반영했어요.' },
    { emoji: '📍', title: '주변 맛집 연결', desc: '추천 음식을 파는 근처 맛집을 카카오맵으로 바로 찾아드려요.' },
];

export function AboutPage() {
    const navigate = useNavigate();

    return (
        <div className={style.container}>
            <HeaderWithBack onBack={() => navigate(-1)} title="앱 정보" />
            <main className={style.content}>
                <div className={style.card} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem' }} aria-hidden="true">🍽️</div>
                    <h2 className={style.sectionTitle} style={{ marginTop: '0.5rem' }}>MoodBite</h2>
                    <p className={style.intro} style={{ marginBottom: 0 }}>
                        오늘의 기분과 상황에 딱 맞는 한 끼를 추천하는 음식 추천 서비스
                    </p>
                </div>

                <h3 className={style.sectionTitle}>주요 기능</h3>
                {FEATURES.map((f) => (
                    <div key={f.title} className={style.listItem}>
                        <p className={style.itemTitle}>
                            <span aria-hidden="true" style={{ marginRight: '0.5rem' }}>{f.emoji}</span>
                            {f.title}
                        </p>
                        <p className={style.itemBody}>{f.desc}</p>
                    </div>
                ))}

                <p className={style.version}>버전 {APP_VERSION} · © 2026 MoodBite</p>
            </main>
        </div>
    );
}
