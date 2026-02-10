import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, MapPin, Clock, DollarSign, Users } from 'lucide-react';
import style from '../../style/testExecuted.module.scss';
import { TestResultPostDTO } from '../../types/test';

interface TestExecutedProps {
    onBack: () => void;
    testResult: TestResultPostDTO;
    aiRecommendation?: string;
}

export function TestExecuted({ onBack, testResult, aiRecommendation }: TestExecutedProps) {
    const [isLoading, setIsLoading] = useState(!aiRecommendation);
    const [recommendation, setRecommendation] = useState(aiRecommendation || '');

    useEffect(() => {
        if (aiRecommendation) {
            setIsLoading(false);
            setRecommendation(aiRecommendation);
        }
    }, [aiRecommendation]);

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

    const parseRecommendation = (text: string) => {
        if (!text) return { restaurants: [], summary: '' };
        
        const lines = text.split('\n').filter(line => line.trim());
        const restaurants = [];
        let summary = '';
        let currentRestaurant: any = {};
        
        for (let line of lines) {
            line = line.trim();
            if (line.includes('**') || line.includes('##')) {
                if (currentRestaurant.name) {
                    restaurants.push(currentRestaurant);
                    currentRestaurant = {};
                }
                currentRestaurant.name = line.replace(/[*#]/g, '').trim();
            } else if (line.includes('가격') || line.includes('예상 가격') || line.includes('₩')) {
                currentRestaurant.price = line;
            } else if (line.includes('주소') || line.includes('위치')) {
                currentRestaurant.location = line;
            } else if (line.includes('추천 이유') || line.includes('특징')) {
                currentRestaurant.reason = line;
            } else if (line.length > 20 && !currentRestaurant.description) {
                currentRestaurant.description = line;
            } else if (line.length > 50 && !summary) {
                summary = line;
            }
        }
        
        if (currentRestaurant.name) {
            restaurants.push(currentRestaurant);
        }
        
        return { restaurants, summary };
    };

    const { restaurants, summary } = parseRecommendation(recommendation);

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

                {/* AI 추천 결과 */}
                <section className={style.recommendationSection}>
                    <h2 className={style.sectionTitle}>AI 추천 결과</h2>
                    
                    {isLoading ? (
                        <div className={style.loadingContainer}>
                            <RefreshCw className={style.spinner} size={32} />
                            <p>당신의 상태를 분석하여 최적의 음식을 추천하고 있습니다...</p>
                        </div>
                    ) : (
                        <>
                            {summary && (
                                <div className={style.summaryCard}>
                                    <p>{summary}</p>
                                </div>
                            )}
                            
                            {restaurants.length > 0 ? (
                                <div className={style.restaurantList}>
                                    {restaurants.map((restaurant, index) => (
                                        <div key={index} className={style.restaurantCard}>
                                            <div className={style.restaurantHeader}>
                                                <h3 className={style.restaurantName}>{restaurant.name}</h3>
                                            </div>
                                            
                                            {restaurant.description && (
                                                <p className={style.restaurantDescription}>
                                                    {restaurant.description}
                                                </p>
                                            )}
                                            
                                            <div className={style.restaurantDetails}>
                                                {restaurant.price && (
                                                    <div className={style.detailItem}>
                                                        <DollarSign size={16} />
                                                        <span>{restaurant.price}</span>
                                                    </div>
                                                )}
                                                {restaurant.location && (
                                                    <div className={style.detailItem}>
                                                        <MapPin size={16} />
                                                        <span>{restaurant.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {restaurant.reason && (
                                                <div className={style.recommendReason}>
                                                    {restaurant.reason}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className={style.fullTextRecommendation}>
                                    <pre className={style.recommendationText}>{recommendation}</pre>
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* 액션 버튼 */}
                <section className={style.actionSection}>
                    <button className={style.retryButton} onClick={() => window.location.reload()}>
                        <RefreshCw size={18} />
                        다시 추천받기
                    </button>
                </section>
            </main>
        </div>
    );
}