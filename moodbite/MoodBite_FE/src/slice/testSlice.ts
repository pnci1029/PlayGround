import {createAsyncThunk} from "@reduxjs/toolkit";
import {TestResultPostDTO, TestResultResponseDTO} from "../types/test";
import {executePromise} from "./index";
import {TestApi} from "../components/api/TestApi";

export const submitTestResultAsync = createAsyncThunk<TestResultResponseDTO, TestResultPostDTO>(
    "test/submitTestResult",
    async (dto: TestResultPostDTO) => {
        const response = await executePromise(TestApi.submitTestResult(dto));
        return response.data;
    }
);
