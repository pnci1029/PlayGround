import React, { useCallback } from 'react';
import style from '../../style/common/questionOption.module.scss';
import { Choice } from './testChoices';

interface ChoiceQuestionProps<T extends string | number> {
    title: string;
    options: Choice<T>[];
    selected: T | null;
    onSelect: (value: T) => void;
    columns?: number;
}

export function ChoiceQuestion<T extends string | number>({
    title,
    options,
    selected,
    onSelect,
    columns = 3,
}: ChoiceQuestionProps<T>) {
    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent, value: T) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(value);
            }
        },
        [onSelect]
    );

    return (
        <section className={style.testSection}>
            <h2 className={style.questionTitle}>{title}</h2>
            <div
                className={style.optionsContainer}
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                role="radiogroup"
                aria-label={title}
            >
                {options.map((option) => (
                    <button
                        key={String(option.value)}
                        type="button"
                        role="radio"
                        aria-checked={selected === option.value}
                        aria-label={`${option.label} - ${option.description}`}
                        tabIndex={0}
                        className={`${style.optionButton} ${selected === option.value ? style.selected : ''}`}
                        onClick={() => onSelect(option.value)}
                        onKeyDown={(e) => handleKeyDown(e, option.value)}
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
