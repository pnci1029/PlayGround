import React from 'react';
import { X } from 'lucide-react';
import style from "../../style/main.module.scss";

interface MenuItem {
    label: string;
    onClick: () => void;
}

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    menuItems?: MenuItem[];
}

export function SideMenu({ isOpen, onClose, menuItems }: SideMenuProps) {
    const defaultMenuItems: MenuItem[] = [
        {
            label: '공지사항',
            onClick: () => console.log('공지사항 클릭')
        },
        {
            label: '설정',
            onClick: () => console.log('설정 클릭')
        },
        {
            label: '고객센터',
            onClick: () => console.log('고객센터 클릭')
        },
        {
            label: '앱 정보',
            onClick: () => console.log('앱 정보 클릭')
        }
    ];

    const items = menuItems || defaultMenuItems;

    if (!isOpen) return null;

    return (
        <div className={style.sideMenu}>
            <div className={style.menuHeader}>
                <h2>메뉴</h2>
                <button
                    className={style.closeButton}
                    onClick={onClose}
                >
                    <X size={24} />
                </button>
            </div>
            <ul className={style.menuList}>
                {items.map((item, index) => (
                    <li key={index} onClick={item.onClick}>
                        {item.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}