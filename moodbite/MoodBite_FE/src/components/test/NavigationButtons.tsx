import React from 'react';
import style from "../../style/common/buttons.module.scss";
import {TestStep} from "../../types/test";

interface Args {
    currentStep: TestStep;
    onPrev: () => void;
    onNext: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    canProceed: boolean;
}

export function NavigationButtons(
    {canProceed, onPrev, onNext, isFirstStep, isLastStep, currentStep}:Args
) {

    return (
        <div className={style.buttonContainer}>
            {!isFirstStep && (
                <button
                    className={style.prevButton}
                    onClick={onPrev}
                >
                    이전
                </button>
            )}
            <button
                className={style.nextButton}
                onClick={onNext}
                disabled={!canProceed}
            >
                {isLastStep ? '완료' : '다음'}
            </button>
        </div>
    );
};