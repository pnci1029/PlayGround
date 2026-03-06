import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, MapPin, Clock, DollarSign, Users, Utensils } from 'lucide-react';
import style from '../../style/testExecuted.module.scss';
import { TestResultPostDTO } from '../../types/test';
import NoRecommendations from '../ui/NoRecommendations';
import { LocationPermission } from '../location/LocationPermission';
import { RestaurantRecommendations } from '../location/RestaurantRecommendations';

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

export function TestExecuted({ onBack, testResult, aiRecommendation, onRetryTest }: TestExecutedProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [recommendation, setRecommendation] = useState(aiRecommendation || '');
    const [showLocationPermission, setShowLocationPermission] = useState(false);
    const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
    const [showRestaurants, setShowRestaurants] = useState(false);

    useEffect(() => {
        setIsLoading(false);
        setRecommendation(aiRecommendation || '');
        // 추천이 완료되면 자동으로 위치 권한 요청 표시
        if (aiRecommendation && !isLoading) {
            setTimeout(() => {
                setShowLocationPermission(true);
            }, 1500);
        }
    }, [aiRecommendation]);

    const handleLocationGranted = (location: GeolocationPosition) => {
        setUserLocation(location);
        setShowLocationPermission(false);
        setShowRestaurants(true);
    };

    const handleLocationDenied = () => {
        setShowLocationPermission(false);
    };

    const handleCloseRestaurants = () => {
        setShowRestaurants(false);
        setUserLocation(null);
    };

    const getDiningText = (dining: string) => {
        const diningTexts: Record<string, string> = {
            'ALONE': '혼자',
            'FRIENDS': '친구들과',
            'FAMILY': '가족과',
            'DATE': '연인과',
            'COWORKERS': '동료들과',
            'ETC': '기타'
        };
        return diningTexts[dining] || dining;
    };

    const getMealTimeText = (mealTime: string) => {
        const mealTimeTexts: Record<string, string> = {
            'MORNING': '아침',
            'LUNCH': '점심',
            'DINNER': '저녁',
            'MIDNIGHT_SNACK': '야식'
        };
        return mealTimeTexts[mealTime] || mealTime;
    };

    const getScoreColor = (score: number, isReverse = false) => {
        if (isReverse) {
            if (score >= 70) return '#ff6b6b';
            if (score >= 40) return '#feca57';
            return '#4ECDC4';
        } else {
            if (score >= 70) return '#4ECDC4';
            if (score >= 40) return '#feca57';
            return '#ff6b6b';
        }
    };

    const parseRecommendation = (text: string): FoodRecommendation | null => {
        if (!text) return null;
        
        try {
            // JSON 형태로 파싱 시도
            const parsed = JSON.parse(text);
            return {
                primaryFood: parsed.primaryFood,
                alternativefoods: parsed.alternativefoods || [],
                reason: parsed.reason || '추천 이유가 없습니다.'
            };
        } catch (error) {
            // JSON이 아닌 경우 기존 텍스트 방식으로 처리 (호환성을 위해)
            return {
                primaryFood: null,
                alternativefoods: [],
                reason: text
            };
        }
    };

    const foodRecommendation = parseRecommendation(recommendation);

    return (
        <div className={style.container}>
            <header className={style.header}>
                <button className={style.backButton} onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className={style.title}>당신을 위한 추천</h1>
            </header>

            <main className={style.mainContent}>
                {/* 분석 결과 요약 */}
                <section className={style.analysisSection}>
                    <h2 className={style.sectionTitle}>상태 분석</h2>
                    <div className={style.analysisGrid}>
                        <div className={style.analysisItem}>
                            <div className={style.scoreLabel}>피로도</div>
                            <div 
                                className={style.scoreValue}
                                style={{ color: getScoreColor(testResult.scores.tired, true) }}
                            >
                                {testResult.scores.tired}%
                            </div>
                        </div>
                        <div className={style.analysisItem}>
                            <div className={style.scoreLabel}>스트레스</div>
                            <div 
                                className={style.scoreValue}
                                style={{ color: getScoreColor(testResult.scores.stress, true) }}
                            >
                                {testResult.scores.stress}%
                            </div>
                        </div>
                        <div className={style.analysisItem}>
                            <div className={style.scoreLabel}>식욕</div>
                            <div 
                                className={style.scoreValue}
                                style={{ color: getScoreColor(testResult.scores.appetite) }}
                            >
                                {testResult.scores.appetite}%
                            </div>
                        </div>
                        <div className={style.analysisItem}>
                            <div className={style.scoreLabel}>예산</div>
                            <div className={style.scoreValue}>
                                {testResult.scores.budget.toLocaleString()}원
                            </div>
                        </div>
                    </div>
                    
                    <div className={style.contextInfo}>
                        <div className={style.contextItem}>
                            <Users size={16} />
                            <span>{getDiningText(testResult.dining)}</span>
                        </div>
                        <div className={style.contextItem}>
                            <Clock size={16} />
                            <span>{testResult.mealTime ? getMealTimeText(testResult.mealTime) : '시간 미설정'}</span>
                        </div>
                    </div>
                </section>

                {/* 추천 결과 */}
                <section className={style.recommendationSection}>
                    <h2 className={style.sectionTitle}>추천 결과</h2>
                    
                    {isLoading ? (
                        <div className={style.loadingContainer}>
                            <RefreshCw className={style.spinner} size={32} />
                            <p>당신의 상태를 분석하여 최적의 음식을 추천하고 있습니다...</p>
                        </div>
                    ) : (
                        <>
                            {!recommendation || !foodRecommendation || 
                             (!foodRecommendation.primaryFood && 
                              foodRecommendation.alternativefoods.length === 0 && 
                              (!foodRecommendation.reason || 
                               foodRecommendation.reason.includes('추천을 찾지 못했습니다') || 
                               foodRecommendation.reason.includes('적합한 추천을 찾지 못했습니다'))) ? (
                                <NoRecommendations onRetry={onRetryTest || onBack} />
                            ) : (
                                <div className={style.foodRecommendations}>
                                    {/* 추천 이유 */}
                                    {foodRecommendation && foodRecommendation.reason && (
                                        <div className={style.reasonCard}>
                                            <h3 className={style.reasonTitle}>추천 이유</h3>
                                            <p className={style.reasonText}>{foodRecommendation?.reason}</p>
                                        </div>
                                    )}

                                    {/* 메인 추천 음식 */}
                                    {foodRecommendation && foodRecommendation.primaryFood && (
                                        <div className={style.primaryFoodCard}>
                                            <div className={style.primaryHeader}>
                                                <Utensils size={24} className={style.primaryIcon} />
                                                <div>
                                                    <h3 className={style.primaryTitle}>오늘의 추천</h3>
                                                    <p className={style.primarySubtitle}>당신의 상태에 가장 적합한 음식</p>
                                                </div>
                                            </div>
                                            <div className={style.primaryFoodName}>
                                                {foodRecommendation?.primaryFood}
                                            </div>
                                        </div>
                                    )}

                                    {/* 대안 음식들 */}
                                    {foodRecommendation && foodRecommendation.alternativefoods && foodRecommendation.alternativefoods.length > 0 && (
                                        <div className={style.alternativesSection}>
                                            <h3 className={style.alternativesTitle}>다른 추천 음식</h3>
                                            <div className={style.alternativesList}>
                                                {foodRecommendation.alternativefoods.map((food, index) => (
                                                    <div key={index} className={style.alternativeCard}>
                                                        <div className={style.alternativeNumber}>{index + 1}</div>
                                                        <div className={style.alternativeName}>{food}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* 호환성을 위한 텍스트 표시 (JSON이 아닌 경우) */}
                                    {foodRecommendation && !foodRecommendation.primaryFood && foodRecommendation.alternativefoods.length === 0 && foodRecommendation.reason === recommendation && (
                                        <div className={style.fullTextRecommendation}>
                                            <pre className={style.recommendationText}>{recommendation}</pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* 위치 권한 요청 */}
                {showLocationPermission && !showRestaurants && foodRecommendation?.primaryFood && (
                    <LocationPermission
                        primaryFood={foodRecommendation.primaryFood}
                        onLocationGranted={handleLocationGranted}
                        onLocationDenied={handleLocationDenied}
                    />
                )}

                {/* 음식점 추천 */}
                {showRestaurants && userLocation && foodRecommendation?.primaryFood && (
                    <RestaurantRecommendations
                        location={userLocation}
                        primaryFood={foodRecommendation.primaryFood}
                        onClose={handleCloseRestaurants}
                    />
                )}

                {/* 액션 버튼 */}
                <section className={style.actionSection}>
                    <button className={style.retryButton} onClick={onRetryTest || onBack}>
                        <RefreshCw size={18} />
                        다시 추천받기
                    </button>
                    
                    {/* 수동 맛집 찾기 버튼 (위치 권한을 건너뛰었거나 아직 요청하지 않은 경우) */}
                    {!showLocationPermission && !showRestaurants && foodRecommendation?.primaryFood && (
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