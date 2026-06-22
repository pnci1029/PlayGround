import { useCallback, useEffect, useState } from 'react';

// localStorage에 JSON 값을 동기화하는 범용 훅.
// 같은 키를 쓰는 다른 탭/컴포넌트와도 storage 이벤트로 동기화된다.
export function useLocalStorage<T>(key: string, initialValue: T) {
    const read = useCallback((): T => {
        try {
            const raw = window.localStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : initialValue;
        } catch {
            return initialValue;
        }
    }, [key, initialValue]);

    const [value, setValue] = useState<T>(read);

    const setStored = useCallback((next: T | ((prev: T) => T)) => {
        setValue((prev) => {
            const resolved = next instanceof Function ? next(prev) : next;
            try {
                window.localStorage.setItem(key, JSON.stringify(resolved));
            } catch {
                // 저장 실패(용량 초과 등)는 무시하고 메모리 상태만 갱신한다.
            }
            return resolved;
        });
    }, [key]);

    // 다른 탭에서 같은 키가 바뀌면 반영
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === key) setValue(read());
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [key, read]);

    return [value, setStored] as const;
}
