import {useState} from 'react';
import {TestStep} from '../../../types/test';

// 검사 단계 진행 순서 (진행률 계산과 이전/다음 이동의 단일 기준)
const STEP_ORDER: TestStep[] = [
    TestStep.STEP1_TIREDNESS,
    TestStep.STEP2_ANGER,
    TestStep.STEP3_STRESS_LEVEL,
    TestStep.STEP4_APPETITE_DEGREE,
    TestStep.STEP5_MEAL_TIME,
    TestStep.STEP6_BUDGET,
    TestStep.STEP10_DINING_WITH,
];

export function useTestNavigation() {

    const [testStep, setTestStep] = useState(TestStep.STEP1_TIREDNESS);

    const currentIndex = STEP_ORDER.indexOf(testStep);

    const handlePrevScore = () => {
        if (currentIndex > 0) {
            setTestStep(STEP_ORDER[currentIndex - 1]);
        }
    };

    const handleNextScore = () => {
        if (currentIndex < STEP_ORDER.length - 1) {
            setTestStep(STEP_ORDER[currentIndex + 1]);
        }
    };

    return {
        testStep,
        handlePrevScore,
        handleNextScore,
        currentIndex,
        totalSteps: STEP_ORDER.length,
        isFirstStep: currentIndex === 0,
        isLastStep: currentIndex === STEP_ORDER.length - 1,
    };
};
