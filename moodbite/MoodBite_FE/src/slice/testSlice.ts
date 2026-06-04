import {createAsyncThunk} from "@reduxjs/toolkit";
import {TestResultPostDTO, FoodRecommendationDTO} from "../types/test";
import {executePromise} from "./index";
import {TestApi} from "../components/api/TestApi";

export const submitTestResultAsync = createAsyncThunk<FoodRecommendationDTO, TestResultPostDTO>(
    "test/submitTestResult",
    async (dto: TestResultPostDTO) => {
        const response = await executePromise(TestApi.submitTestResult(dto));
        return response; // axios interceptor already returns response.data
    }
);
