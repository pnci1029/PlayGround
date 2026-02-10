import {useState} from "react";
import {DiningOption, MealTime} from "../../../types/test";

export function useTestScores() {
    const [tiredScore, setTiredScore] = useState(50);
    const [angerScore, setAngerScore] = useState(50);
    const [stressScore, setStressScore] = useState(50);
    const [appetiteScore, setAppetiteScore] = useState(50);
    const [budgetScore, setBudgetScore] = useState(10000);
    const [selectedMealTime, setSelectedMealTime] = useState<MealTime>('MORNING');
    const [dining, setDining] = useState<DiningOption>('FRIENDS');

    return {
        scores: {
            tired: tiredScore,
            anger: angerScore,
            stress: stressScore,
            appetite: appetiteScore,
            budget: budgetScore,
        },
        setters: {
            setTiredScore,
            setAngerScore,
            setStressScore,
            setAppetiteScore,
            setBudgetScore,
            setDining
        },
        dining:{
            dining,
            setDining
        },
        mealTime: {
            selectedMealTime,
            setSelectedMealTime
        }
    };
};