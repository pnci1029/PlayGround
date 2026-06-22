import React, {useCallback, useState} from 'react';
import {useNavigate} from "react-router-dom";
import style from "../../style/main.module.scss";
import {Header} from "../layout/Header";
import {BottomNavigation} from "../layout/BottomNavigation";
import {SideMenu} from "../layout/SideMenu";
import {HomeContent} from "../home/HomeContent";

export function Main() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 메뉴 항목 선택 시 메뉴를 닫고 해당 페이지로 이동
    const goTo = useCallback((path: string) => {
        setIsMenuOpen(false);
        navigate(path);
    }, [navigate]);

    const menuItems = [
        { label: '공지사항', onClick: () => goTo('/notices') },
        { label: '설정', onClick: () => goTo('/settings') },
        { label: '고객센터', onClick: () => goTo('/support') },
        { label: '앱 정보', onClick: () => goTo('/about') },
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
                onFavorites={() => navigate('/favorites')}
                onProfile={() => navigate('/profile')}
            />

            <SideMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                menuItems={menuItems}
            />
        </div>
    );
}
