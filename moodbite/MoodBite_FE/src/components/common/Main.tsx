import React, {useState} from 'react';
import {Heart, MapPin, Menu, User, X} from 'lucide-react';
import style from "../../style/main.module.scss";
import {Test} from "../test/Test";
import {TestExecuted} from "../test/TestExecuted";
import {TestResultPostDTO} from "../../types/test";

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

    if (showResult && testResult) {
        return <TestExecuted
            onBack={handleBackFromResult}
            testResult={testResult}
            aiRecommendation={aiRecommendation}
        />;
    }

    if (showTest) {
        return <Test
            onBack={() => setShowTest(false)}
            onNext={handleTestComplete}
        />;
    }

    return (
        <div className={style.container}>
            {/* 상단 헤더 */}
            <header className={style.header}>
                <div className={style.headerContent}>
                    <h1 className={style.logo}>오늘의 한끼</h1>
                    <button
                        className={style.menuButton}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* 메인 콘텐츠 */}
            <main className={style.mainContent}>
                <div className={style.homeContent}>
                    <h2 className={style.mainTitle}>오늘 뭐먹지?</h2>
                    <button
                        className={style.recommendButton}
                        onClick={() => setShowTest(true)}
                    >
                        내 기분에 맞는 음식 추천받기!
                    </button>
                </div>
            </main>

            {/* 하단 네비게이션 */}
            <nav className={style.bottomNav}>
                <button className={style.navButton}>
                    <MapPin size={24} />
                    <span>주변맛집</span>
                </button>
                <button className={style.navButton}>
                    <Heart size={24} />
                    <span>찜목록</span>
                </button>
                <button className={style.navButton}>
                    <User size={24} />
                    <span>마이</span>
                </button>
            </nav>

            {/* 사이드 메뉴 */}
            {isMenuOpen && (
                <div className={style.sideMenu}>
                    <div className={style.menuHeader}>
                        <h2>메뉴</h2>
                        <button
                            className={style.closeButton}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <ul className={style.menuList}>
                        <li>공지사항</li>
                        <li>설정</li>
                        <li>고객센터</li>
                        <li>앱 정보</li>
                    </ul>
                </div>
            )}
        </div>
    );
}