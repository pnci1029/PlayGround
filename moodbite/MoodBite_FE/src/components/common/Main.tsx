import React, {useState} from 'react';
import style from "../../style/main.module.scss";
import {Test} from "../test/Test";
import {TestExecuted} from "../test/TestExecuted";
import {TestResultPostDTO} from "../../types/test";
import {Header} from "../layout/Header";
import {BottomNavigation} from "../layout/BottomNavigation";
import {SideMenu} from "../layout/SideMenu";
import {HomeContent} from "../home/HomeContent";

export function Main() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showTest, setShowTest] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [testResult, setTestResult] = useState<TestResultPostDTO | null>(null);
    const [aiRecommendation, setAiRecommendation] = useState<string>('');

    const handleTestComplete = (result: TestResultPostDTO, recommendation?: string) => {
        setTestResult(result);
        setAiRecommendation(recommendation || '');
        setShowTest(false);
        setShowResult(true);
    };

    const handleBackFromResult = () => {
        setShowResult(false);
        setTestResult(null);
        setAiRecommendation('');
    };

    // 네비게이션 핸들러들
    const handleNearbyRestaurants = () => {
    };

    const handleFavorites = () => {
    };

    const handleProfile = () => {
    };

    // 조건부 렌더링: 테스트 결과 화면
    if (showResult && testResult) {
        return <TestExecuted
            onBack={handleBackFromResult}
            testResult={testResult}
            aiRecommendation={aiRecommendation}
        />;
    }

    // 조건부 렌더링: 테스트 화면
    if (showTest) {
        return <Test
            onBack={() => setShowTest(false)}
            onNext={handleTestComplete}
        />;
    }

    // 메인 홈 화면
    return (
        <div className={style.container}>
            <Header 
                isMenuOpen={isMenuOpen}
                onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
            />

            <HomeContent onStartTest={() => setShowTest(true)} />

            <BottomNavigation
                onNearbyRestaurants={handleNearbyRestaurants}
                onFavorites={handleFavorites}
                onProfile={handleProfile}
            />

            <SideMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </div>
    );
}