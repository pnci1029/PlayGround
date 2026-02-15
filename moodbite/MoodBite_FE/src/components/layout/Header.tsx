import React from 'react';
import { Menu, X } from 'lucide-react';
import style from "../../style/main.module.scss";

interface HeaderProps {
    isMenuOpen: boolean;
    onMenuToggle: () => void;
}

export function Header({ isMenuOpen, onMenuToggle }: HeaderProps) {
    return (
        <header className={style.header}>
            <div className={style.headerContent}>
                <h1 className={style.logo}>오늘의 한끼</h1>
                <button
                    className={style.menuButton}
                    onClick={onMenuToggle}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </header>
    );
}