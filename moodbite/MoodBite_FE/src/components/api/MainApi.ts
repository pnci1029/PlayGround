import {HttpClient} from "./HttpClient";

export class MainApi extends HttpClient {
    private static classInstance?: MainApi;

    public static api = MainApi.getInstance().instance;

    private constructor() {
        super(import.meta.env.VITE_API_URL as string);
    }

    public static getInstance() {
        if (!this.classInstance) {
            this.classInstance = new MainApi();
        }

        return this.classInstance;
    }
}