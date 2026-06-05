import {useState} from "react";
import {DiningOption, MealTime} from "../../../types/test";
import {MoodId} from "../moods";

export function useTestScores() {
    // 기분(감정 카드) + 강도
    const [mood, setMood] = useState<MoodId | null>(null);
    const [intensity, setIntensity] = useState<number>(1.0);

    // 카드 선택값 (선택 전 null → 명시적 선택 강제)
    const [tired, setTired] = useState<number | null>(null);       // 컨디션
    const [appetite, setAppetite] = useState<number | null>(null); // 배고픔
    const [budget, setBudget] = useState<number | null>(null);     // 예산
    const [selectedMealTime, setSelectedMealTime] = useState<MealTime | null>(null);
    const [dining, setDining] = useState<DiningOption | null>(null);

    return {
        mood: { mood, setMood, intensity, setIntensity },
        condition: { tired, setTired },
        hunger: { appetite, setAppetite },
        budgetStep: { budget, setBudget },
        mealTime: { selectedMealTime, setSelectedMealTime },
        dining: { dining, setDining },
    };
};
