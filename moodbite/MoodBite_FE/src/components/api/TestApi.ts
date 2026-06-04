import {TestResultPostDTO} from "../../types/test";
import {MainApi} from "./MainApi";

export class TestApi {
    static url = `/api/test`;

    static submitTestResult = (dto: TestResultPostDTO) => () =>
        MainApi.api.post(`${TestApi.url}`, dto);
}
