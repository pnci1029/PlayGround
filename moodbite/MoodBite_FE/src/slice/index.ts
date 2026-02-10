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
        throw new Error(JSON.stringify(error?.response?.data));
    }
};


export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;