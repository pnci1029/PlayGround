import { useLocalStorage } from './useLocalStorage';

export interface AppSettings {
    // 추천 결과 후 위치 권한을 자동으로 요청할지 여부
    autoLocation: boolean;
    // 추천 이유에 과학적 근거 문구를 강조 표시할지 (UI 환경설정)
    showScientificReason: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
    autoLocation: true,
    showScientificReason: true,
};

const STORAGE_KEY = 'moodbite:settings';

export function useSettings() {
    const [settings, setSettings] = useLocalStorage<AppSettings>(STORAGE_KEY, DEFAULT_SETTINGS);

    const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const reset = () => setSettings(DEFAULT_SETTINGS);

    return { settings: { ...DEFAULT_SETTINGS, ...settings }, update, reset };
}
