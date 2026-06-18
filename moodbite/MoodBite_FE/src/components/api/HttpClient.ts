import axios, { AxiosInstance, AxiosResponse } from "axios";

// 응답 인터셉터에서 response.data 를 바로 반환하므로, 각 API 호출 결과(await)는
// AxiosResponse 가 아니라 응답 본문이다. 타입상으로는 여전히 AxiosResponse 로 보이므로
// 호출부(executePromise)에서 응답 본문 타입으로 캐스팅한다.
export abstract class HttpClient {
    public readonly instance: AxiosInstance;

    public constructor(baseURL: string) {
        this.instance = axios.create({ baseURL });
        this._initializeResponseInterceptor();
    }

    private _initializeResponseInterceptor = () => {
        this.instance.interceptors.response.use(
            this._handleResponse,
            this._handleError
        );
    };

    private _handleResponse = (response: AxiosResponse) => response.data;

    protected _handleError = (error: any) => Promise.reject(error);
}
