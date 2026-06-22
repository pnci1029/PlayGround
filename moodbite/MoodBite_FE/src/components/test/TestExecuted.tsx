import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, MapPin, Heart } from 'lucide-react';
import style from '../../style/testExecuted.module.scss';
import { TestResultPostDTO } from '../../types/test';
import NoRecommendations from '../ui/NoRecommendations';
import { LocationPermission } from '../location/LocationPermission';
import { RestaurantRecommendations } from '../location/RestaurantRecommendations';
import { foodEmoji } from './foodVisuals';
import { useFavorites } from '../../hooks/useFavorites';
import { useSettings } from '../../hooks/useSettings';

interface FoodRecommendation {
    primaryFood: string | null;
    alternativefoods: string[];
    reason: string;
}

interface TestExecutedProps {
    onBack: () => void;
    testResult: TestResultPostDTO;
    aiRecommendation?: string;
    onRetryTest?: () => void;
}

const DINING_TEXT: Record<string, string> = {
    ALONE: '혼자', FRIENDS: '친구들과', FAMILY: '가족과',
    DATE: '연인과', COWORKERS: '동료들과', ETC: '기타',
};
const MEALTIME_TEXT: Record<string, string> = {
    MORNING: '아침', LUNCH: '점심', DINNER: '저녁', MIDNIGHT_SNACK: '야식',
};

export function TestExecuted({ onBack, testResult, aiRecommendation, onRetryTest }: TestExecutedProps) {
    const [recommendation, setRecommendation] = useState(aiRecommendation || '');
    const [showLocationPermission, setShowLocationPermission] = useState(false);
    const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
    const [showRestaurants, setShowRestaurants] = useState(false);
    const { isFavorite, toggle } = useFavorites();
    const { settings } = useSettings();

    useEffect(() => {
        setRecommendation(aiRecommendation || '');
        // 설정에서 '위치 자동 요청'이 켜져 있을 때만 자동으로 권한을 묻는다.
        if (aiRecommendation && settings.autoLocation) {
            const timer = setTimeout(() => setShowLocationPermission(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [aiRecommendation, settings.autoLocation]);

    const handleLocationGranted = (location: GeolocationPosition) => {
        setUserLocation(location);
        setShowLocationPermission(false);
        setShowRestaurants(true);
    };
    const handleLocationDenied = () => setShowLocationPermission(false);
    const handleCloseRestaurants = () => {
        setShowRestaurants(false);
        setUserLocation(null);
    };

    const parseRecommendation = (text: string): FoodRecommendation | null => {
        if (!text) return null;
        try {
            const parsed = JSON.parse(text);
            return {
                primaryFood: parsed.primaryFood,
                alternativefoods: parsed.alternativefoods || [],
                reason: parsed.reason || '',
            };
        } catch {
            return { primaryFood: null, alternativefoods: [], reason: text };
        }
    };

    const food = parseRecommendation(recommendation);
    const primaryFood = food?.primaryFood ?? '';
    const reason = food?.reason ?? '';
    const alternatives = food?.alternativefoods ?? [];

    const isEmpty =
        !recommendation || !food ||
        (!food.primaryFood && food.alternativefoods.length === 0 &&
            (!food.reason ||
                food.reason.includes('추천을 찾지 못했습니다') ||
                food.reason.includes('적합한 추천을 찾지 못했습니다')));

    // 기분/상황 칩
    const s = testResult.scores;
    const chips: Array<{ emoji: string; label: string }> = [];
    if (s.tired >= 65) chips.push({ emoji: '😩', label: '지친 하루' });
    else if (s.tired <= 30) chips.push({ emoji: '💪', label: '쌩쌩' });
    if (s.stress >= 65) chips.push({ emoji: '🤯', label: '스트레스' });
    if (s.anger >= 65) chips.push({ emoji: '😤', label: '예민' });
    if (s.appetite >= 70) chips.push({ emoji: '🤤', label: '배고픔' });
    else if (s.appetite <= 30) chips.push({ emoji: '🤏', label: '입맛 없음' });
    chips.push({ emoji: '👥', label: DINING_TEXT[testResult.dining] || testResult.dining });
    if (testResult.mealTime) chips.push({ emoji: '🕐', label: MEALTIME_TEXT[testResult.mealTime] || testResult.mealTime });

    const heroTie = (() => {
        if (s.stress >= 65 || s.anger >= 65) return '스트레스엔 이런 게 땡기죠 🌶️';
        if (s.tired >= 65) return '지친 하루, 이걸로 충전해요 🔋';
        if (s.appetite <= 30) return '입맛 없을 땐 부담 없이 🍃';
        return '지금 당신에게 딱 맞는 한 끼 ✨';
    })();

    return (
        <div className={style.container}>
            <header className={style.header}>
                <button className={style.backButton} onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className={style.title}>당신을 위한 추천</h1>
            </header>

            <main className={style.mainContent}>
                {isEmpty ? (
                    <NoRecommendations onRetry={onRetryTest || onBack} />
                ) : (
                    <>
                        {/* 기분/상황 칩 */}
                        <div className={style.chipsRow}>
                            {chips.map((c, i) => (
                                <span key={i} className={style.chip}>
                                    <span aria-hidden="true">{c.emoji}</span>{c.label}
                                </span>
                            ))}
                        </div>

                        {/* 메인 추천 (음식 hero) */}
                        {primaryFood && (
                            <div className={style.heroCard}>
                                <div className={style.heroEmoji} aria-hidden="true">{foodEmoji(primaryFood)}</div>
                                <div className={style.heroLabel}>오늘의 추천</div>
                                <div className={style.heroName}>{primaryFood}</div>
                                <div className={style.heroTie}>{heroTie}</div>
                                <button
                                    type="button"
                                    aria-pressed={isFavorite(primaryFood)}
                                    aria-label={isFavorite(primaryFood) ? '찜 해제' : '찜하기'}
                                    onClick={() => toggle(primaryFood)}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                        marginTop: '1rem', padding: '0.5rem 1.1rem',
                                        borderRadius: '9999px', cursor: 'pointer',
                                        border: isFavorite(primaryFood) ? 'none' : '1px solid rgba(0,0,0,0.12)',
                                        background: isFavorite(primaryFood) ? 'var(--color-secondary-500)' : '#fff',
                                        color: isFavorite(primaryFood) ? '#fff' : 'var(--text-secondary)',
                                        fontWeight: 600, fontSize: 'var(--text-sm)',
                                        transition: 'all var(--transition-fast)',
                                    }}
                                >
                                    <Heart size={16} fill={isFavorite(primaryFood) ? '#fff' : 'none'} />
                                    {isFavorite(primaryFood) ? '찜 완료' : '찜하기'}
                                </button>
                            </div>
                        )}

                        {/* 추천 이유 */}
                        {reason && settings.showScientificReason && (
                            <div className={style.reasonCard}>
                                <h3 className={style.reasonTitle}>왜 이 음식이냐면</h3>
                                <p className={style.reasonText}>{reason}</p>
                            </div>
                        )}

                        {/* 대안 음식 */}
                        {alternatives.length > 0 && (
                            <div className={style.alternativesSection}>
                                <h3 className={style.alternativesTitle}>다른 추천</h3>
                                <div className={style.altGrid}>
                                    {alternatives.map((f, i) => (
                                        <div key={i} className={style.altCardNew}>
                                            <span className={style.altEmoji} aria-hidden="true">{foodEmoji(f)}</span>
                                            <span className={style.altName}>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* 위치 권한 요청 */}
                {showLocationPermission && !showRestaurants && primaryFood && (
                    <LocationPermission
                        primaryFood={primaryFood}
                        onLocationGranted={handleLocationGranted}
                        onLocationDenied={handleLocationDenied}
                    />
                )}

                {/* 음식점 추천 */}
                {showRestaurants && userLocation && primaryFood && (
                    <RestaurantRecommendations
                        location={userLocation}
                        primaryFood={primaryFood}
                        onClose={handleCloseRestaurants}
                    />
                )}

                {/* 액션 버튼 */}
                <section className={style.actionSection}>
                    <button className={style.retryButton} onClick={onRetryTest || onBack}>
                        <RefreshCw size={18} />
                        다른 추천 받기
                    </button>

                    {!showLocationPermission && !showRestaurants && primaryFood && (
                        <button
                            className={style.findRestaurantsButton}
                            onClick={() => setShowLocationPermission(true)}
                        >
                            <MapPin size={18} />
                            주변 맛집 찾기
                        </button>
                    )}
                </section>
            </main>
        </div>
    );
}
