import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, Settings, Info } from 'lucide-react';
import { HeaderWithBack } from '../common/HeaderWithBack';
import { useProfile } from '../../hooks/useProfile';
import { useFavorites } from '../../hooks/useFavorites';
import { Toast } from '../common/Toast';
import style from '../../style/page.module.scss';

export function ProfilePage() {
    const navigate = useNavigate();
    const { profile, setNickname } = useProfile();
    const { favorites } = useFavorites();
    const [draft, setDraft] = useState(profile.nickname);
    const [toast, setToast] = useState<string | null>(null);

    const displayName = profile.nickname.trim() || '게스트';

    const handleSave = () => {
        setNickname(draft.trim());
        setToast('저장했어요');
        setTimeout(() => setToast(null), 1500);
    };

    const dirty = draft.trim() !== profile.nickname.trim();

    return (
        <div className={style.container}>
            <HeaderWithBack onBack={() => navigate(-1)} title="마이" />
            <main className={style.content}>
                <div className={style.card} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem' }} aria-hidden="true">🙂</div>
                    <h2 className={style.sectionTitle} style={{ marginTop: '0.5rem' }}>{displayName}</h2>
                    <p className={style.intro} style={{ marginBottom: 0 }}>
                        기분에 맞는 한 끼, MoodBite와 함께해요
                    </p>
                </div>

                <div className={style.statRow}>
                    <div className={style.statCard}>
                        <div className={style.statValue}>{favorites.length}</div>
                        <div className={style.statLabel}>찜한 음식</div>
                    </div>
                </div>

                <h3 className={style.sectionTitle}>닉네임</h3>
                <div className={style.card}>
                    <div className={style.field}>
                        <input
                            className={style.input}
                            value={draft}
                            maxLength={20}
                            placeholder="닉네임을 입력하세요"
                            onChange={(e) => setDraft(e.target.value)}
                        />
                        <button
                            className={style.primaryButton}
                            style={{ marginTop: '0.5rem', opacity: dirty ? 1 : 0.5 }}
                            disabled={!dirty}
                            onClick={handleSave}
                        >
                            저장
                        </button>
                    </div>
                </div>

                <h3 className={style.sectionTitle}>바로가기</h3>
                <button className={style.linkRow} onClick={() => navigate('/favorites')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Heart size={18} /> 찜 목록
                    </span>
                    <ChevronRight size={18} />
                </button>
                <button className={style.linkRow} onClick={() => navigate('/settings')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Settings size={18} /> 설정
                    </span>
                    <ChevronRight size={18} />
                </button>
                <button className={style.linkRow} onClick={() => navigate('/about')}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                        <Info size={18} /> 앱 정보
                    </span>
                    <ChevronRight size={18} />
                </button>
            </main>
            <Toast message={toast} />
        </div>
    );
}
