import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // config.ts 는 JWT_SECRET 미설정 시 throw 하므로 테스트용 값을 주입
    env: {
      JWT_SECRET: 'test-secret-key',
    },
  },
});
