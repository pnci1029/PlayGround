import React, { useState, useEffect, useRef, useCallback } from "react";
import { TestStep } from "../../types/test";
import style from "../../style/common/sliderQuestion.module.scss";

interface Args {
    title: string;
    value: number;
    onChange: (value: number) => void;
    testStep: TestStep;
    labels: { min: string; mid: string; max: string };
}

export function SliderQuestion({ title, value, onChange, testStep, labels }: Args) {
    const [isDragging, setIsDragging] = useState(false);
    const [animateValue, setAnimateValue] = useState(false);
    const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);
    const sliderRef = useRef<HTMLInputElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    // 예산 단계 여부 확인
    const isBudgetStep = testStep === TestStep.STEP6_BUDGET;
    const minValue = isBudgetStep ? 1000 : 0;
    const maxValue = isBudgetStep ? 40000 : 100;

    // 슬라이더 값이 변경될 때 애니메이션 효과
    useEffect(() => {
        if (isDragging) {
            setAnimateValue(true);
        } else {
            const timer = setTimeout(() => {
                setAnimateValue(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [value, isDragging]);

    // 값 표시 형식 설정
    const getDisplayValue = (value: number) => {
        if (isBudgetStep) {
            return `${value.toLocaleString()}원`;
        }
        return value;
    };

    // 지표 텍스트 설정
    const getIndicatorText = (value: number) => {
        if (isBudgetStep) {
            if (value < 10000) return "저예산";
            if (value < 25000) return "보통";
            return "고예산";
        }

        if (value < 30) return "낮음";
        if (value < 70) return "보통";
        return "높음";
    };

    // 지표 클래스 설정
    const getIndicatorClass = () => {
        if (!isBudgetStep) return "";

        if (value < 10000) return style.lowBudget;
        if (value < 25000) return style.mediumBudget;
        return style.highBudget;
    };

    // 슬라이더 배경 스타일 계산 (진행 바 효과)
    const getSliderStyle = () => {
        const percentage = isBudgetStep
            ? ((value - minValue) / (maxValue - minValue)) * 100
            : value;

        return {
            background: `linear-gradient(to right, 
                #4ECDC4 0%, 
                #2bb5ac ${percentage}%, 
                #e0e0e0 ${percentage}%, 
                #e0e0e0 100%)`
        };
    };

    // 트랙 클릭으로 값 설정
    const handleTrackClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (!trackRef.current || isDragging) return;
        
        const rect = trackRef.current.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
        
        const newValue = isBudgetStep
            ? Math.round(minValue + (percentage / 100) * (maxValue - minValue))
            : Math.round(percentage);
            
        onChange(newValue);
        setAnimateValue(true);
    }, [isDragging, isBudgetStep, minValue, maxValue, onChange]);

    // 키보드 접근성 개선
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        const step = isBudgetStep ? 1000 : 5;
        let newValue = value;
        
        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowDown':
                event.preventDefault();
                newValue = Math.max(minValue, value - step);
                break;
            case 'ArrowRight':
            case 'ArrowUp':
                event.preventDefault();
                newValue = Math.min(maxValue, value + step);
                break;
            case 'Home':
                event.preventDefault();
                newValue = minValue;
                break;
            case 'End':
                event.preventDefault();
                newValue = maxValue;
                break;
            default:
                return;
        }
        
        onChange(newValue);
        setAnimateValue(true);
    }, [value, minValue, maxValue, isBudgetStep, onChange]);

    // 터치 접근성 개선
    const handleTouchStart = useCallback(() => {
        setIsDragging(true);
        setIsKeyboardFocused(false);
    }, []);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // 마우스 접근성 개선
    const handleMouseDown = useCallback(() => {
        setIsDragging(true);
        setIsKeyboardFocused(false);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // 포커스 관리
    const handleFocus = useCallback(() => {
        setIsKeyboardFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
        setIsKeyboardFocused(false);
    }, []);

    return (
        <section className={style.testSection}>
            <h2 className={style.questionTitle}>{title}</h2>

            <div className={`${style.sliderContainer} ${isBudgetStep ? style.budgetSlider : ''}`}>
                <div className={style.sliderWrapper}>
                    {/* 클릭 가능한 트랙 영역 */}
                    <div 
                        ref={trackRef}
                        className={style.sliderTrack}
                        onClick={handleTrackClick}
                        role="presentation"
                        aria-hidden="true"
                    >
                        <div 
                            className={style.sliderProgress} 
                            style={{
                                width: `${isBudgetStep ? ((value - minValue) / (maxValue - minValue)) * 100 : value}%`
                            }}
                        />
                    </div>
                    
                    <input
                        ref={sliderRef}
                        type="range"
                        min={minValue}
                        max={maxValue}
                        value={value}
                        step={isBudgetStep ? 100 : 1}
                        onChange={(e) => onChange(Number(e.target.value))}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className={`${style.slider} ${isKeyboardFocused ? style.keyboardFocused : ''}`}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        aria-label={title}
                        aria-valuemin={minValue}
                        aria-valuemax={maxValue}
                        aria-valuenow={value}
                        aria-valuetext={getDisplayValue(value).toString()}
                        role="slider"
                    />

                    <div className={style.sliderLabels}>
                        <span className={style.minLabel}>
                            {isBudgetStep ? "1,000원" : labels.min}
                        </span>
                        <span className={style.midLabel}>
                            {isBudgetStep ? "20,000원" : labels.mid}
                        </span>
                        <span className={style.maxLabel}>
                            {isBudgetStep ? "40,000원" : labels.max}
                        </span>
                    </div>
                </div>

                <div 
                    className={`${style.scoreDisplay} ${(isDragging || animateValue || isKeyboardFocused) ? style.active : ''}`}
                    role="status"
                    aria-live="polite"
                >
                    {getDisplayValue(value)}
                </div>

                <div className={style.scoreIndicator}>
                    <span className={`${style.indicatorText} ${getIndicatorClass()}`}>
                        {getIndicatorText(value)}
                    </span>
                </div>
            </div>
        </section>
    );
}