import React from 'react';
import style from "../../style/test.module.scss";
import {TestResultPostDTO, TestStep} from "../../types/test";
import {useTestFunctions} from "./hooks/useTestFunctions";
import {SliderQuestion} from "./SliderQuestion";
import {MealTimeQuestion} from "./MealTimeQuestion";
import {NavigationButtons} from "./NavigationButtons";
import {useTestNavigation} from "./hooks/useTestNavigation";
import {useTestScores} from "./hooks/useTestScores";
import {HeaderWithBack} from "../common/HeaderWithBack";
import {DiningQuestion} from "./DiningQuestion";
import {useTestSubmit} from "./hooks/useTestSubmit";

interface TestProps {
    onBack: () => void;
    onNext: (testResult: TestResultPostDTO, aiRecommendation?: string) => void;
}

export function Test({onBack, onNext}: TestProps) {
    const { sliderLabels } = useTestFunctions();
    const { submitTestResult } = useTestSubmit()
    const {
        testStep,
        handlePrevScore,
        handleNextScore,
        isFirstStep,
        isLastStep
    } = useTestNavigation({ onComplete: onNext });

    const {
        scores,
        setters,
        dining:{dining, setDining},
        mealTime: { selectedMealTime, setSelectedMealTime }
    } = useTestScores();

    const getCurrentLabels = (step: TestStep) => {
        return sliderLabels[step] || { min: "0", mid: "50", max: "100" };
    };

    const canProceedToNext = () => {
        if (testStep === TestStep.STEP10_DINING_WITH) {
            return selectedMealTime !== null;
        }
        return true;
    };

    const handleNext = async () => {
        if (isLastStep) {
            const dto: TestResultPostDTO = {
                scores: scores,
                dining: dining,
                mealTime: selectedMealTime
            };
            
            try {
                const response = await submitTestResult(dto);
                onNext(dto, response);
            } catch (error) {
                console.error('Error submitting test result:', error);
                onNext(dto);
            }
        } else {
            handleNextScore(testStep, scores, selectedMealTime);
        }
    };


    return (
        <div className={style.container}>
            <HeaderWithBack onBack={onBack} title="오늘 뭐먹을까?" />

            <main className={style.mainContent}>
                {testStep === TestStep.STEP1_TIREDNESS && (
                    <SliderQuestion
                        title="얼마나 피곤하신가요?"
                        value={scores.tired}
                        onChange={setters.setTiredScore}
                        testStep={testStep}
                        labels={getCurrentLabels(testStep)}
                    />
                )}

                {testStep === TestStep.STEP2_ANGER && (
                    <SliderQuestion
                        title="지금 예민한 상태인가요?"
                        value={scores.anger}
                        onChange={setters.setAngerScore}
                        testStep={testStep}
                        labels={getCurrentLabels(testStep)}
                    />
                )}

                {testStep === TestStep.STEP3_STRESS_LEVEL && (
                    <SliderQuestion
                        title="스트레스 정도를 평가해주세요."
                        value={scores.stress}
                        onChange={setters.setStressScore}
                        testStep={testStep}
                        labels={getCurrentLabels(testStep)}
                    />
                )}

                {testStep === TestStep.STEP4_APPETITE_DEGREE && (
                    <SliderQuestion
                        title="얼마나 배고프신가요?"
                        value={scores.appetite}
                        onChange={setters.setAppetiteScore}
                        testStep={testStep}
                        labels={getCurrentLabels(testStep)}
                    />
                )}

                {testStep === TestStep.STEP5_MEAL_TIME && (
                    <MealTimeQuestion
                        selectedTime={selectedMealTime}
                        onTimeSelect={setSelectedMealTime}
                    />
                )}

                {testStep === TestStep.STEP6_BUDGET && (
                    <SliderQuestion
                        title="식사 예산은 어느정도인가요?"
                        value={scores.budget}
                        onChange={setters.setBudgetScore}
                        testStep={testStep}
                        labels={getCurrentLabels(testStep)}
                    />
                )}

                {testStep === TestStep.STEP10_DINING_WITH && (
                    <DiningQuestion
                        selectedOption={dining}
                        onOptionSelect={setDining}
                    />
                )}

                <NavigationButtons
                    currentStep={testStep}
                    onPrev={() => handlePrevScore(testStep)}
                    onNext={handleNext}
                    isFirstStep={isFirstStep}
                    isLastStep={isLastStep}
                    canProceed={canProceedToNext()}
                />
            </main>
        </div>
    );
}