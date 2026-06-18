import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TestExecuted } from './TestExecuted';
import { TestResultPostDTO } from '../../types/test';
import style from '../../style/test.module.scss';

interface ResultState {
    testResult: TestResultPostDTO;
    recommendation: string;
}

export function TestResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as ResultState | null;

    // 결과 데이터 없이 직접 진입(새로고침·딥링크)한 경우 홈으로 돌려보낸다.
    useEffect(() => {
        if (!state?.testResult) {
            navigate('/', { replace: true });
        }
    }, [state, navigate]);

    if (!state?.testResult) {
        return (
            <div className={style.resultLoading}>
                <div>로딩 중...</div>
            </div>
        );
    }

    return (
        <TestExecuted
            onBack={() => navigate('/')}
            testResult={state.testResult}
            aiRecommendation={state.recommendation}
            onRetryTest={() => navigate('/')}
        />
    );
}
