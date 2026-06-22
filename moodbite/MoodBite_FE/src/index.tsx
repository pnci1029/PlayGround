import React from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import {BrowserRouter, Navigate, Route, Routes, useNavigate} from 'react-router-dom';
import {Main} from "./components/common/Main";
import App from "./App";
import { TestResultPage } from "./components/test/TestResultPage";
import { Test } from "./components/test/Test";
import { NearbyRestaurants } from "./components/location/NearbyRestaurants";
import { FavoritesPage } from "./components/favorites/FavoritesPage";
import { ProfilePage } from "./components/profile/ProfilePage";
import { SettingsPage } from "./components/settings/SettingsPage";
import { NoticesPage } from "./components/info/NoticesPage";
import { SupportPage } from "./components/info/SupportPage";
import { AboutPage } from "./components/info/AboutPage";

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
                    <Route path="favorites" element={<FavoritesPage/>} />
                    <Route path="profile" element={<ProfilePage/>} />
                    <Route path="settings" element={<SettingsPage/>} />
                    <Route path="notices" element={<NoticesPage/>} />
                    <Route path="support" element={<SupportPage/>} />
                    <Route path="about" element={<AboutPage/>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
