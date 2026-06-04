import {Action, configureStore, ThunkAction} from "@reduxjs/toolkit";
import {AxiosResponse} from "axios";

export const store = configureStore({
    reducer: {
    },
});

export const executePromise = async <T>(f: () => Promise<AxiosResponse<T>>) => {
    try {
        return await f();
    } catch (error: any) {
        const data = error?.response?.data;
        const message =
            (data && (data.message || (typeof data === 'string' ? data : JSON.stringify(data)))) ||
            error?.message ||
            '네트워크 오류가 발생했습니다.';
        throw new Error(message);
    }
};


export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;