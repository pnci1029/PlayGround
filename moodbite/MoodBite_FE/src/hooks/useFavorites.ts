import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface FavoriteFood {
    name: string;
    addedAt: number; // epoch ms
}

const STORAGE_KEY = 'moodbite:favorites';

// 찜한 음식 목록을 localStorage에 보관한다. (백엔드 계정 시스템이 없어 로컬 저장)
export function useFavorites() {
    const [favorites, setFavorites] = useLocalStorage<FavoriteFood[]>(STORAGE_KEY, []);

    const isFavorite = useCallback(
        (name: string) => favorites.some((f) => f.name === name),
        [favorites],
    );

    const add = useCallback((name: string) => {
        setFavorites((prev) =>
            prev.some((f) => f.name === name) ? prev : [{ name, addedAt: Date.now() }, ...prev],
        );
    }, [setFavorites]);

    const remove = useCallback((name: string) => {
        setFavorites((prev) => prev.filter((f) => f.name !== name));
    }, [setFavorites]);

    const toggle = useCallback((name: string) => {
        setFavorites((prev) =>
            prev.some((f) => f.name === name)
                ? prev.filter((f) => f.name !== name)
                : [{ name, addedAt: Date.now() }, ...prev],
        );
    }, [setFavorites]);

    const clear = useCallback(() => setFavorites([]), [setFavorites]);

    return { favorites, isFavorite, add, remove, toggle, clear };
}
