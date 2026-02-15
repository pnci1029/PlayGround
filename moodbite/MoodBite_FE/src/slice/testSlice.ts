import {createAsyncThunk} from "@reduxjs/toolkit";
import {
    TestResultPostDTO, 
    TestResultResponseDTO, 
    LocationBasedTestResultRequestDTO, 
    LocationBasedRecommendationResponseDTO
} from "../types/test";
import {executePromise} from "./index";
import {TestApi} from "../components/api/TestApi";

export const submitTestResultAsync = createAsyncThunk<TestResultResponseDTO, TestResultPostDTO>(
    "test/submitTestResult",
    async (dto: TestResultPostDTO) => {
        const response = await executePromise(TestApi.submitTestResult(dto));
        return response.data;
    }
);

export const submitLocationBasedTestResultAsync = createAsyncThunk<LocationBasedRecommendationResponseDTO, LocationBasedTestResultRequestDTO>(
    "test/submitLocationBasedTestResult",
    async (dto: LocationBasedTestResultRequestDTO) => {
        const response = await executePromise(TestApi.submitLocationBasedTestResult(dto));
        return response.data;
    }
);
