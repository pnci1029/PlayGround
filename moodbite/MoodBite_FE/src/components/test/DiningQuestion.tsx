import React from 'react';
import style from "../../style/common/questionOption.module.scss";
import {DiningOption} from "../../types/test";

interface DiningQuestionProps {
    selectedOption: DiningOption | null;
    onOptionSelect: (option: DiningOption) => void;
}

export function DiningQuestion({selectedOption, onOptionSelect}: DiningQuestionProps) {
    const options: {value: DiningOption; label: string; emoji: string}[] = [
        {value: 'ALONE', label: '혼자', emoji: '🧍'},
        {value: 'FRIENDS', label: '친구와', emoji: '👥'},
        {value: 'FAMILY', label: '가족과', emoji: '👨‍👩‍👧'},
        {value: 'DATE', label: '데이트', emoji: '💑'},
        {value: 'COWORKERS', label: '직장 동료와', emoji: '💼'},
        {value: 'ETC', label: '기타', emoji: '✨'},
    ];

    return (
        <section className={style.testSection}>
            <h2 className={style.questionTitle}>누구와 드시나요?</h2>
            <div className={style.optionsContainer}>
                {options.map(option => (
                    <button
                        key={option.value}
                        className={`${style.optionButton} ${selectedOption === option.value ? style.selected : ''}`}
                        onClick={() => onOptionSelect(option.value)}
                        aria-selected={selectedOption === option.value}
                    >
                        <span className={style.optionEmoji}>{option.emoji}</span>
                        <span className={style.optionLabel}>{option.label}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}