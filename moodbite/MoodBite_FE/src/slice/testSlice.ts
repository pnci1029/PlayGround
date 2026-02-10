import {createAsyncThunk} from "@reduxjs/toolkit";
import {TestResultPostDTO} from "../types/test";
import {executePromise} from "./index";
import {TestApi} from "../components/api/TestApi";


export const submitTestResultAsync = createAsyncThunk("test/submitTestResult",
    (dto: TestResultPostDTO) => executePromise(TestApi.submitTestResult(dto)));
