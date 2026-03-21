import React, { useCallback } from "react";
import { MealTime } from "../../types/test";
import style from "../../style/common/questionOption.module.scss";

interface Args {
    selectedTime: MealTime | null;
    onTimeSelect: (time: MealTime) => void;
}

export function MealTimeQuestion({ selectedTime, onTimeSelect }: Args) {
    const mealTimes = [
        { id: 'MORNING', label: '아침', emoji: '🌅', description: '하루의 시작' },
        { id: 'LUNCH', label: '점심', emoji: '☀️', description: '에너지 충전' },
        { id: 'DINNER', label: '저녁', emoji: '🌆', description: '하루 마무리' },
        { id: 'MIDNIGHT_SNACK', label: '야식', emoji: '🌙', description: '늦은 시간' }
    ];

    const handleTimeSelect = useCallback((time: MealTime) => {
        onTimeSelect(time);
    }, [onTimeSelect]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent, time: MealTime) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleTimeSelect(time);
        }
    }, [handleTimeSelect]);

    return (
        <section className={style.testSection}>
            <h2 className={style.questionTitle}>
                언제 드실 예정인가요?
            </h2>

            <div 
                className={style.mealTimeContainer} 
                role="radiogroup" 
                aria-labelledby="meal-time-question"
            >
                <div id="meal-time-question" className="sr-only">식사 시간을 선택해주세요</div>
                {mealTimes.map((time) => (
                    <button
                        key={time.id}
                        className={`${style.mealTimeButton} ${selectedTime === time.id ? style.selected : ''}`}
                        onClick={() => handleTimeSelect(time.id as MealTime)}
                        onKeyDown={(e) => handleKeyDown(e, time.id as MealTime)}
                        aria-checked={selectedTime === time.id}
                        aria-label={`${time.label} - ${time.description}`}
                        role="radio"
                        tabIndex={0}
                    >
                        <span className={style.mealTimeContent}>
                            <span className={style.mealTimeEmoji} aria-hidden="true">{time.emoji}</span>
                            <div className={style.mealTimeText}>
                                <span className={style.mealTimeLabel}>{time.label}</span>
                                <span className={style.mealTimeDescription}>{time.description}</span>
                            </div>
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
}