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
import {AnalyzingScreen} from "./AnalyzingScreen";

interface TestProps {
    onBack: () => void;
}

export function Test({onBack}: TestProps) {
    const { sliderLabels } = useTestFunctions();
    const { submitTestResult, isSubmitting, error } = useTestSubmit()
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
                await submitTestResult(dto);
                // submitTestResult에서 자동으로 결과 페이지로 네비게이션됨
            } catch (error) {
                console.error('Error submitting test result:', error);
            }
        } else {
            handleNextScore();
        }
    };

    // 단일 선택(식사시간) 단계는 선택 즉시 다음으로 자동 진행
    const handleMealTimeSelect = (time: typeof selectedMealTime) => {
        setSelectedMealTime(time!);
        setTimeout(() => handleNextScore(), 280);
    };

    // 분석(추천 API 호출) 중에는 전용 로딩 화면을 보여준다
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
            />

            <main className={style.mainContent}>
                <div key={testStep} className={style.stepWrapper}>
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
                        onTimeSelect={handleMealTimeSelect}
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
                </div>

                {error && (
                    <p role="alert" style={{ color: '#ff6b6b', textAlign: 'center', margin: '12px 0' }}>
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