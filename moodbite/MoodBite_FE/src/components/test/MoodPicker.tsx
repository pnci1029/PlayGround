import React from 'react';
import style from '../../style/test/moodPicker.module.scss';
import { MOODS, MoodId, INTENSITY_OPTIONS } from './moods';

interface MoodPickerProps {
    selectedMood: MoodId | null;
    intensity: number;
    onMoodSelect: (moodId: MoodId) => void;
    onIntensitySelect: (value: number) => void;
}

export function MoodPicker({ selectedMood, intensity, onMoodSelect, onIntensitySelect }: MoodPickerProps) {
    return (
        <section className={style.container}>
            <h2 className={style.title}>지금 기분 어때요?</h2>
            <p className={style.subtitle}>오늘의 기분에 맞는 음식을 골라드릴게요</p>

            <div className={style.grid} role="radiogroup" aria-label="기분 선택">
                {MOODS.map((mood) => {
                    const selected = selectedMood === mood.id;
                    return (
                        <button
                            key={mood.id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            className={`${style.card} ${selected ? style.selected : ''}`}
                            style={selected
                                ? { borderColor: mood.color, boxShadow: `0 8px 20px ${mood.color}33` }
                                : undefined}
                            onClick={() => onMoodSelect(mood.id)}
                        >
                            <span className={style.emoji} aria-hidden="true">{mood.emoji}</span>
                            <span className={style.label} style={selected ? { color: mood.color } : undefined}>
                                {mood.label}
                            </span>
                            <span className={style.desc}>{mood.description}</span>
                        </button>
                    );
                })}
            </div>

            {selectedMood && (
                <div className={style.intensityBlock}>
                    <span className={style.intensityLabel}>얼마나요?</span>
                    <div className={style.intensityToggle} role="radiogroup" aria-label="강도 선택">
                        {INTENSITY_OPTIONS.map((opt) => {
                            const active = intensity === opt.value;
                            return (
                                <button
                                    key={opt.label}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    className={`${style.intensityButton} ${active ? style.intensityActive : ''}`}
                                    onClick={() => onIntensitySelect(opt.value)}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
}
