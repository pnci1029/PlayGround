import {useCallback} from "react";
import {useDispatch} from "react-redux";
import {submitTestResultAsync} from "../../../slice/testSlice";
import {TestResultPostDTO} from "../../../types/test";

export function useTestSubmit() {
    const dispatch = useDispatch<any>();

    const submitTestResult = useCallback(
        async (dto: TestResultPostDTO): Promise<string | undefined> => {
            if (window.confirm("결과를 확인하시겠습니까?")) {
                try {
                    const result = await dispatch(submitTestResultAsync(dto));
                    return result.payload;
                } catch (e) {
                    console.error('Error submitting test result:', e);
                    throw e;
                }
            }
            return undefined;
        }, [dispatch]);

    return{
        submitTestResult
    }
}