import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter, Route, Routes, useNavigate} from 'react-router-dom';
import {Main} from "./components/common/Main";
import App from "./App";
import { TestResultPage } from "./components/test/TestResultPage";
import { Test } from "./components/test/Test";
import { NearbyRestaurants } from "./components/location/NearbyRestaurants";

// 라우트 진입점: 기존 onBack 인터페이스를 라우터 이동으로 연결한다.
function TestRoute() {
    const navigate = useNavigate();
    return <Test onBack={() => navigate('/')} />;
}

function NearbyRoute() {
    const navigate = useNavigate();
    return <NearbyRestaurants onBack={() => navigate('/')} />;
}

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App/>}>
                    <Route path="" element={<Main/>} />
                    <Route path="test" element={<TestRoute/>} />
                    <Route path="test/result" element={<TestResultPage/>} />
                    <Route path="nearby" element={<NearbyRoute/>} />
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
