import React, {useCallback, useEffect, useState} from 'react';
import style from "../../style/main.module.scss";
import {Test} from "../test/Test";
import {Header} from "../layout/Header";
import {BottomNavigation} from "../layout/BottomNavigation";
import {SideMenu} from "../layout/SideMenu";
import {HomeContent} from "../home/HomeContent";

export function Main() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showTest, setShowTest] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    // 아직 구현되지 않은 기능에 대한 안내 토스트
    const showComingSoon = useCallback(() => {
        setToast('준비 중인 기능이에요 🙂');
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 1800);
        return () => clearTimeout(timer);
    }, [toast]);

    const handleMenuItem = useCallback(() => {
        setIsMenuOpen(false);
        showComingSoon();
    }, [showComingSoon]);

    const menuItems = [
        { label: '공지사항', onClick: handleMenuItem },
        { label: '설정', onClick: handleMenuItem },
        { label: '고객센터', onClick: handleMenuItem },
        { label: '앱 정보', onClick: handleMenuItem },
    ];

    // 테스트 화면
    // 테스트 완료 시 useTestSubmit 에서 /test/result 로 라우팅된다.
    if (showTest) {
        return <Test onBack={() => setShowTest(false)} />;
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
                onNearbyRestaurants={showComingSoon}
                onFavorites={showComingSoon}
                onProfile={showComingSoon}
            />

            <SideMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                menuItems={menuItems}
            />

            {toast && (
                <div
                    role="status"
                    style={{
                        position: 'fixed',
                        left: '50%',
                        bottom: '90px',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: '#fff',
                        padding: '10px 18px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        zIndex: 1000,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {toast}
                </div>
            )}
        </div>
    );
}
