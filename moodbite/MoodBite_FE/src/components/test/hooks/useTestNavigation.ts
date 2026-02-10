import {useState} from 'react';
import {MealTime, Scores, TestStep, TestResultPostDTO} from '../../../types/test';

interface Args {
    onComplete: (testResult: TestResultPostDTO, aiRecommendation?: string) => void;
}

export function useTestNavigation(
    {onComplete}: Args
) {

    const [testStep, setTestStep] = useState(TestStep.STEP1_TIREDNESS);

    const handlePrevScore = (currentStep: TestStep) => {
        switch (currentStep) {
            case TestStep.STEP2_ANGER:
                return setTestStep(TestStep.STEP1_TIREDNESS);
            case TestStep.STEP3_STRESS_LEVEL:
                return setTestStep(TestStep.STEP2_ANGER);
            case TestStep.STEP4_APPETITE_DEGREE:
                return setTestStep(TestStep.STEP3_STRESS_LEVEL);
            case TestStep.STEP5_MEAL_TIME:
                return setTestStep(TestStep.STEP4_APPETITE_DEGREE);
            case TestStep.STEP6_BUDGET:
                return setTestStep(TestStep.STEP5_MEAL_TIME);
            case TestStep.STEP10_DINING_WITH:
                return setTestStep(TestStep.STEP6_BUDGET);
        }
    };

    const handleNextScore = (
        currentStep: TestStep,
        scores: Scores,
        selectedMealTime: MealTime | null,
        dining: any = 'FRIENDS'
    ) => {
        switch (currentStep) {
            case TestStep.STEP1_TIREDNESS:
                return setTestStep(TestStep.STEP2_ANGER);
            case TestStep.STEP2_ANGER:
                return setTestStep(TestStep.STEP3_STRESS_LEVEL);
            case TestStep.STEP3_STRESS_LEVEL:
                return setTestStep(TestStep.STEP4_APPETITE_DEGREE);
            case TestStep.STEP4_APPETITE_DEGREE:
                return setTestStep(TestStep.STEP5_MEAL_TIME);
            case TestStep.STEP5_MEAL_TIME:
                return setTestStep(TestStep.STEP6_BUDGET);
            case TestStep.STEP6_BUDGET:
                return setTestStep(TestStep.STEP10_DINING_WITH);
            case TestStep.STEP10_DINING_WITH:
                // 이 단계에서는 Test 컴포넌트에서 직접 처리
                return;
        }
    };

    const calculateFinalScore = (scores: Scores) => {
        const {tired, anger, stress, appetite, budget} = scores;
        return (tired + anger + stress + appetite + budget) / 5;
    };

    return {
        testStep,
        handlePrevScore,
        handleNextScore,
        isFirstStep: testStep === TestStep.STEP1_TIREDNESS,
        isLastStep: testStep === TestStep.STEP10_DINING_WITH,
    };
};