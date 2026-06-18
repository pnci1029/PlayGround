import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import style from "../../style/main.module.scss";
import {Header} from "../layout/Header";
import {BottomNavigation} from "../layout/BottomNavigation";
import {SideMenu} from "../layout/SideMenu";
import {HomeContent} from "../home/HomeContent";
import {Toast} from "./Toast";

export function Main() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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

    // 메인 홈 화면
    // 테스트/주변맛집은 별도 라우트(/test, /nearby)로 이동한다.
    return (
        <div className={style.container}>
            <Header
                isMenuOpen={isMenuOpen}
                onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
            />

            <HomeContent onStartTest={() => navigate('/test')} />

            <BottomNavigation
                onNearbyRestaurants={() => navigate('/nearby')}
                onFavorites={showComingSoon}
                onProfile={showComingSoon}
            />

            <SideMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                menuItems={menuItems}
            />

            <Toast message={toast} />
        </div>
    );
}
