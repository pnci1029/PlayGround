import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TestExecuted } from './TestExecuted';
import { TestResultPostDTO } from '../../types/test';

export function TestResultPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [testResult, setTestResult] = useState<TestResultPostDTO | null>(null);
    const [aiRecommendation, setAiRecommendation] = useState<string>('');

    useEffect(() => {
        // URL에서 테스트 결과 데이터 추출
        const testResultData = searchParams.get('data');
        const recommendation = searchParams.get('recommendation');
        
        if (testResultData) {
            try {
                const parsedResult = JSON.parse(decodeURIComponent(testResultData));
                setTestResult(parsedResult);
            } catch (error) {
                console.error('Failed to parse test result data:', error);
                navigate('/'); // 데이터가 잘못된 경우 홈으로 리다이렉트
            }
        } else {
            navigate('/'); // 데이터가 없으면 홈으로 리다이렉트
        }

        if (recommendation) {
            setAiRecommendation(decodeURIComponent(recommendation));
        }
    }, [searchParams, navigate]);

    const handleBack = () => {
        navigate('/');
    };

    const handleRetry = () => {
        navigate('/');
    };

    if (!testResult) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <div>로딩 중...</div>
            </div>
        );
    }

    return (
        <TestExecuted
            onBack={handleBack}
            testResult={testResult}
            aiRecommendation={aiRecommendation}
            onRetryTest={handleRetry}
        />
    );
}