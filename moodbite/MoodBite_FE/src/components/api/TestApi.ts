import {TestResultPostDTO} from "../../types/test";
import {MainApi} from "./MainApi";

export class TestApi {
    static url = `${process.env.REACT_APP_BASE_URL}/test`;

    static submitTestResult = (dto:TestResultPostDTO) => () =>
        MainApi.api.post(`${TestApi.url}`, dto);
}