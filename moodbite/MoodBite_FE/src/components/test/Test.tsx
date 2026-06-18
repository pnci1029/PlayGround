import React from 'react';
import style from "../../style/test.module.scss";
import {TestResultPostDTO, TestStep, MealTime, DiningOption} from "../../types/test";
import {MealTimeQuestion} from "./MealTimeQuestion";
import {NavigationButtons} from "./NavigationButtons";
import {useTestNavigation} from "./hooks/useTestNavigation";
import {useTestScores} from "./hooks/useTestScores";
import {HeaderWithBack} from "../common/HeaderWithBack";
import {DiningQuestion} from "./DiningQuestion";
import {useTestSubmit} from "./hooks/useTestSubmit";
import {AnalyzingScreen} from "./AnalyzingScreen";
import {MoodPicker} from "./MoodPicker";
import {ChoiceQuestion} from "./ChoiceQuestion";
import {CONDITION_CHOICES, HUNGER_CHOICES, BUDGET_CHOICES} from "./testChoices";
import {MoodId, MOOD_BY_ID, moodToScores} from "./moods";

interface TestProps {
    onBack: () => void;
}

export function Test({onBack}: TestProps) {
    const { submitTestResult, isSubmitting, error } = useTestSubmit();
    const {
        testStep,
        handlePrevScore,
        handleNextScore,
        currentIndex,
        totalSteps,
        isFirstStep,
        isLastStep
    } = useTestNavigation();

    const {
        mood: { mood, setMood, intensity, setIntensity },
        condition: { tired, setTired },
        hunger: { appetite, setAppetite },
        budgetStep: { budget, setBudget },
        mealTime: { selectedMealTime, setSelectedMealTime },
        dining: { dining, setDining },
    } = useTestScores();

    // 단일 선택 단계: 탭하면 잠깐 표시 후 자동으로 다음으로
    const advance = () => setTimeout(() => handleNextScore(), 280);

    const handleMoodSelect = (id: MoodId) => setMood(id);          // 강도 선택 대기 (자동진행 X)
    const handleIntensitySelect = (v: number) => { setIntensity(v); advance(); };
    const handleCondition = (v: number) => { setTired(v); advance(); };
    const handleHunger = (v: number) => { setAppetite(v); advance(); };
    const handleBudget = (v: number) => { setBudget(v); advance(); };
    const handleMealTime = (t: MealTime) => { setSelectedMealTime(t); advance(); };
    const handleDining = (d: DiningOption) => setDining(d);        // 마지막 단계 (자동진행 X)

    const canProceedToNext = () => {
        switch (testStep) {
            case TestStep.MOOD: return mood !== null;
            case TestStep.CONDITION: return tired !== null;
            case TestStep.HUNGER: return appetite !== null;
            case TestStep.MEAL_TIME: return selectedMealTime !== null;
            case TestStep.BUDGET: return budget !== null;
            case TestStep.DINING: return dining !== null;
            default: return false;
        }
    };

    const handleNext = async () => {
        if (!isLastStep) {
            handleNextScore();
            return;
        }
        // 마지막 단계: 모든 값이 채워졌을 때만 제출
        if (mood === null || tired === null || appetite === null ||
            budget === null || selectedMealTime === null || dining === null) {
            return;
        }
        const emotion = moodToScores(mood, intensity);
        const dto: TestResultPostDTO = {
            scores: {
                tired,
                anger: emotion.anger,
                stress: emotion.stress,
                appetite,
                budget,
            },
            dining,
            mealTime: selectedMealTime,
        };
        try {
            await submitTestResult(dto);
        } catch (e) {
            console.error('Error submitting test result:', e);
        }
    };

    const accentColor = mood ? MOOD_BY_ID[mood].color : undefined;

    // 분석(추천 API 호출) 중에는 전용 로딩 화면
    if (isSubmitting) {
        return (
            <div className={style.container}>
                <AnalyzingScreen />
            </div>
        );
    }

    return (
        <div className={style.container}>
            <HeaderWithBack
                onBack={onBack}
                title="오늘 뭐먹을까?"
                progress={{ current: currentIndex + 1, total: totalSteps }}
                accentColor={accentColor}
            />

            <main className={style.mainContent}>
                <div key={testStep} className={style.stepWrapper}>
                    {testStep === TestStep.MOOD && (
                        <MoodPicker
                            selectedMood={mood}
                            intensity={intensity}
                            onMoodSelect={handleMoodSelect}
                            onIntensitySelect={handleIntensitySelect}
                        />
                    )}

                    {testStep === TestStep.CONDITION && (
                        <ChoiceQuestion
                            title="오늘 컨디션은요?"
                            options={CONDITION_CHOICES}
                            selected={tired}
                            onSelect={handleCondition}
                        />
                    )}

                    {testStep === TestStep.HUNGER && (
                        <ChoiceQuestion
                            title="얼마나 배고프세요?"
                            options={HUNGER_CHOICES}
                            selected={appetite}
                            onSelect={handleHunger}
                        />
                    )}

                    {testStep === TestStep.MEAL_TIME && (
                        <MealTimeQuestion
                            selectedTime={selectedMealTime}
                            onTimeSelect={handleMealTime}
                        />
                    )}

                    {testStep === TestStep.BUDGET && (
                        <ChoiceQuestion
                            title="예산은 어느 정도?"
                            options={BUDGET_CHOICES}
                            selected={budget}
                            onSelect={handleBudget}
                        />
                    )}

                    {testStep === TestStep.DINING && (
                        <DiningQuestion
                            selectedOption={dining}
                            onOptionSelect={handleDining}
                        />
                    )}
                </div>

                {error && (
                    <p role="alert" className={style.errorText}>
                        {error}
                    </p>
                )}

                <NavigationButtons
                    currentStep={testStep}
                    onPrev={handlePrevScore}
                    onNext={handleNext}
                    isFirstStep={isFirstStep}
                    isLastStep={isLastStep}
                    canProceed={canProceedToNext()}
                    isSubmitting={isSubmitting}
                />
            </main>
        </div>
    );
}
