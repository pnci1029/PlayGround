import React, { useCallback } from 'react';
import style from "../../style/common/questionOption.module.scss";
import {DiningOption} from "../../types/test";

interface DiningQuestionProps {
    selectedOption: DiningOption | null;
    onOptionSelect: (option: DiningOption) => void;
}

export function DiningQuestion({selectedOption, onOptionSelect}: DiningQuestionProps) {
    const options: {value: DiningOption; label: string; emoji: string; description: string}[] = [
        {value: 'ALONE', label: '혼자', emoji: '😌', description: '조용한 시간'},
        {value: 'FRIENDS', label: '친구와', emoji: '😄', description: '즐거운 대화'},
        {value: 'FAMILY', label: '가족과', emoji: '😊', description: '따뜻한 식사'},
        {value: 'DATE', label: '데이트', emoji: '😍', description: '로맨틱한 시간'},
        {value: 'COWORKERS', label: '직장 동료와', emoji: '🤝', description: '비즈니스 미팅'},
        {value: 'ETC', label: '기타', emoji: '🤔', description: '다른 상황'},
    ];
    
    const handleOptionSelect = useCallback((option: DiningOption) => {
        onOptionSelect(option);
    }, [onOptionSelect]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent, option: DiningOption) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleOptionSelect(option);
        }
    }, [handleOptionSelect]);

    return (
        <section className={style.testSection}>
            <h2 className={style.questionTitle}>누구와 드시나요?</h2>
            <div 
                className={style.optionsContainer} 
                role="radiogroup" 
                aria-labelledby="dining-question"
            >
                <div id="dining-question" className="sr-only">식사 동반자를 선택해주세요</div>
                {options.map(option => (
                    <button
                        key={option.value}
                        className={`${style.optionButton} ${selectedOption === option.value ? style.selected : ''}`}
                        onClick={() => handleOptionSelect(option.value)}
                        onKeyDown={(e) => handleKeyDown(e, option.value)}
                        aria-checked={selectedOption === option.value}
                        aria-label={`${option.label} - ${option.description}`}
                        role="radio"
                        tabIndex={0}
                    >
                        <span className={style.optionEmoji} aria-hidden="true">{option.emoji}</span>
                        <div className={style.optionText}>
                            <span className={style.optionLabel}>{option.label}</span>
                            <span className={style.optionDescription}>{option.description}</span>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}