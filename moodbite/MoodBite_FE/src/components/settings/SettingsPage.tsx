import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeaderWithBack } from '../common/HeaderWithBack';
import { useSettings } from '../../hooks/useSettings';
import { useFavorites } from '../../hooks/useFavorites';
import { Toast } from '../common/Toast';
import style from '../../style/page.module.scss';

interface ToggleRowProps {
    label: string;
    desc: string;
    value: boolean;
    onChange: (next: boolean) => void;
}

function ToggleRow({ label, desc, value, onChange }: ToggleRowProps) {
    return (
        <div className={style.row}>
            <span className={style.rowText}>
                <span className={style.rowLabel}>{label}</span>
                <span className={style.rowDesc}>{desc}</span>
            </span>
            <button
                className={style.switch}
                data-on={value}
                role="switch"
                aria-checked={value}
                aria-label={label}
                onClick={() => onChange(!value)}
            >
                <span className={style.knob} />
            </button>
        </div>
    );
}

export function SettingsPage() {
    const navigate = useNavigate();
    const { settings, update, reset } = useSettings();
    const { clear: clearFavorites } = useFavorites();
    const [toast, setToast] = useState<string | null>(null);

    const flash = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 1800);
    };

    const handleResetData = () => {
        if (!window.confirm('찜 목록과 설정을 모두 초기화할까요? 이 작업은 되돌릴 수 없어요.')) return;
        clearFavorites();
        reset();
        flash('데이터를 초기화했어요');
    };

    return (
        <div className={style.container}>
            <HeaderWithBack onBack={() => navigate(-1)} title="설정" />
            <main className={style.content}>
                <h3 className={style.sectionTitle}>추천</h3>
                <div className={style.card}>
                    <ToggleRow
                        label="위치 자동 요청"
                        desc="추천 결과를 받으면 주변 맛집을 위해 위치 권한을 자동으로 물어봐요."
                        value={settings.autoLocation}
                        onChange={(v) => update('autoLocation', v)}
                    />
                    <ToggleRow
                        label="추천 근거 표시"
                        desc="추천 이유에 영양학적 분석 설명을 함께 보여줘요."
                        value={settings.showScientificReason}
                        onChange={(v) => update('showScientificReason', v)}
                    />
                </div>

                <h3 className={style.sectionTitle}>데이터</h3>
                <div className={style.card}>
                    <p className={style.rowDesc} style={{ marginBottom: '0.85rem' }}>
                        찜 목록과 설정은 이 기기에만 저장돼요. 초기화하면 모두 삭제됩니다.
                    </p>
                    <button className={style.dangerButton} onClick={handleResetData}>
                        찜 목록 · 설정 초기화
                    </button>
                </div>
            </main>
            <Toast message={toast} />
        </div>
    );
}
