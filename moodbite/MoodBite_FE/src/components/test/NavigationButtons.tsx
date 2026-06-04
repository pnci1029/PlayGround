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
    isSubmitting?: boolean;
}

export function NavigationButtons(
    {canProceed, onPrev, onNext, isFirstStep, isLastStep, currentStep, isSubmitting = false}:Args
) {

    const nextLabel = isSubmitting ? '처리 중...' : (isLastStep ? '완료' : '다음');

    return (
        <div className={style.buttonContainer}>
            {!isFirstStep && (
                <button
                    className={style.prevButton}
                    onClick={onPrev}
                    disabled={isSubmitting}
                >
                    이전
                </button>
            )}
            <button
                className={style.nextButton}
                onClick={onNext}
                disabled={!canProceed || isSubmitting}
            >
                {nextLabel}
            </button>
        </div>
    );
};
