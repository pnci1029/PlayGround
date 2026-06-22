import { useLocalStorage } from './useLocalStorage';

export interface Profile {
    nickname: string;
}

const STORAGE_KEY = 'moodbite:profile';
const DEFAULT_PROFILE: Profile = { nickname: '' };

export function useProfile() {
    const [profile, setProfile] = useLocalStorage<Profile>(STORAGE_KEY, DEFAULT_PROFILE);

    const setNickname = (nickname: string) => setProfile({ nickname });

    return { profile: { ...DEFAULT_PROFILE, ...profile }, setNickname };
}
