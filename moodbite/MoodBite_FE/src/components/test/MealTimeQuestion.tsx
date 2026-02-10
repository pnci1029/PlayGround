import React from "react";
import { MealTime } from "../../types/test";
import style from "../../style/common/questionOption.module.scss";

interface Args {
    selectedTime: MealTime | null;
    onTimeSelect: (time: MealTime) => void;
}

export function MealTimeQuestion({ selectedTime, onTimeSelect }: Args) {
    const mealTimes = [
        { id: 'MORNING', label: '아침', emoji: '🌅' },
        { id: 'LUNCH', label: '점심', emoji: '☀️' },
        { id: 'DINNER', label: '저녁', emoji: '🌙' },
        { id: 'MIDNIGHT_SNACK', label: '야식', emoji: '🌃' }
    ];

    return (
        <section className={style.testSection}>
            <h2 className={style.questionTitle}>
                언제 드실 예정인가요?
            </h2>

            <div className={style.mealTimeContainer}>
                {mealTimes.map((time) => (
                    <button
                        key={time.id}
                        className={`${style.mealTimeButton} ${selectedTime === time.id ? style.selected : ''}`}
                        onClick={() => onTimeSelect(time.id as MealTime)}
                        aria-selected={selectedTime === time.id}
                    >
                        <span className={style.mealTimeContent}>
                            <span className={style.mealTimeEmoji}>{time.emoji}</span>
                            <span className={style.mealTimeLabel}>{time.label}</span>
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
}