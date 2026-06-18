import React from 'react';
import style from '../../style/common/toast.module.scss';

interface ToastProps {
    message: string | null;
}

// 화면 하단에 잠깐 떠오르는 안내 토스트. 표시/숨김 타이밍은 호출 측에서 관리한다.
export function Toast({ message }: ToastProps) {
    if (!message) return null;
    return (
        <div role="status" className={style.toast}>
            {message}
        </div>
    );
}
