/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// CRA 대체. dev 포트와 빌드 출력 경로(build/)는 기존 파이프라인과 동일하게 유지한다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'build', // Docker/Vercel 의 기존 build/ 가정을 유지 → COPY 등 무변경
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern', // Dart Sass legacy JS API deprecation 경고 제거
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    css: false, // 테스트에서는 scss 모듈 처리를 건너뛴다 (식별자 객체로 대체)
  },
});
