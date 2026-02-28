import {createAsyncThunk} from "@reduxjs/toolkit";
import {
    TestResultPostDTO, 
    TestResultResponseDTO, 
    LocationBasedTestResultRequestDTO, 
    LocationBasedRecommendationResponseDTO,
    FoodRecommendationDTO
} from "../types/test";
import {executePromise} from "./index";
import {TestApi} from "../components/api/TestApi";

export const submitTestResultAsync = createAsyncThunk<FoodRecommendationDTO, TestResultPostDTO>(
    "test/submitTestResult",
    async (dto: TestResultPostDTO) => {
        const response = await executePromise(TestApi.submitTestResult(dto));
        return response; // axios interceptor already returns response.data
    }
);

export const submitLocationBasedTestResultAsync = createAsyncThunk<LocationBasedRecommendationResponseDTO, LocationBasedTestResultRequestDTO>(
    "test/submitLocationBasedTestResult",
    async (dto: LocationBasedTestResultRequestDTO) => {
        const response = await executePromise(TestApi.submitLocationBasedTestResult(dto));
        return response; // axios interceptor already returns response.data
    }
);
