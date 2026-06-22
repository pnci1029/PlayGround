import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { HeaderWithBack } from '../common/HeaderWithBack';
import { useFavorites } from '../../hooks/useFavorites';
import { foodEmoji } from '../test/foodVisuals';
import style from '../../style/page.module.scss';

function formatDate(ms: number): string {
    try {
        return new Date(ms).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return '';
    }
}

export function FavoritesPage() {
    const navigate = useNavigate();
    const { favorites, remove } = useFavorites();

    return (
        <div className={style.container}>
            <HeaderWithBack onBack={() => navigate(-1)} title="찜 목록" />
            <main className={style.content}>
                {favorites.length === 0 ? (
                    <div className={style.empty}>
                        <div className={style.emptyEmoji} aria-hidden="true">💛</div>
                        <p className={style.emptyText}>
                            아직 찜한 음식이 없어요.<br />
                            추천 결과에서 하트를 눌러 저장해 보세요.
                        </p>
                        <button className={style.emptyButton} onClick={() => navigate('/test')}>
                            음식 추천받기
                        </button>
                    </div>
                ) : (
                    <>
                        <p className={style.intro}>찜한 음식 {favorites.length}개</p>
                        {favorites.map((fav) => (
                            <div key={fav.name} className={style.favCard}>
                                <span className={style.favEmoji} aria-hidden="true">{foodEmoji(fav.name)}</span>
                                <div className={style.favInfo}>
                                    <div className={style.favName}>{fav.name}</div>
                                    <div className={style.favMeta}>{formatDate(fav.addedAt)} 저장</div>
                                </div>
                                <button
                                    className={style.removeButton}
                                    aria-label={`${fav.name} 찜 해제`}
                                    onClick={() => remove(fav.name)}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </>
                )}
            </main>
        </div>
    );
}
