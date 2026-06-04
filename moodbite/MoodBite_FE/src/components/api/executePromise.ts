import {AxiosResponse} from "axios";

// axios 호출을 감싸 에러 메시지를 보존한다.
// MainApi 의 response 인터셉터가 response.data 를 반환하므로 결과는 곧 응답 데이터다.
export const executePromise = async <T>(f: () => Promise<AxiosResponse<T>>): Promise<T> => {
    try {
        return (await f()) as unknown as T;
    } catch (error: any) {
        const data = error?.response?.data;
        const message =
            (data && (data.message || (typeof data === 'string' ? data : JSON.stringify(data)))) ||
            error?.message ||
            '네트워크 오류가 발생했습니다.';
        throw new Error(message);
    }
};
