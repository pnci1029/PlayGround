import {TestResultPostDTO, LocationBasedTestResultRequestDTO} from "../../types/test";
import {MainApi} from "./MainApi";

export class TestApi {
    static url = `${process.env.REACT_APP_BASE_URL}/mood-test`;

    static submitTestResult = (dto: TestResultPostDTO) => () =>
        MainApi.api.post(`${TestApi.url}`, dto);

    static submitLocationBasedTestResult = (dto: LocationBasedTestResultRequestDTO) => () =>
        MainApi.api.post(`${TestApi.url}/location-based`, dto);
}