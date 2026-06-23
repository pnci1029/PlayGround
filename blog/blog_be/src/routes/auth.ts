import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { timingSafeEqual } from 'crypto';

interface AuthCheckRequest {
  Body: {
    username: string;
    password: string;
  };
}

// 관리자 게이트 무차별 대입 방지용 IP 기반 레이트 리밋(인메모리)
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5분
const attempts = new Map<string, { count: number; resetAt: number }>();

function tooManyAttempts(ip: string, now: number): boolean {
  const rec = attempts.get(ip);
  if (!rec || now > rec.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

// 길이가 달라도 누설되지 않는 상수시간 문자열 비교
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) {
    // 길이가 다르면 즉시 false. 동일 길이 더미와 비교해 타이밍 평탄화.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/check', async (request: FastifyRequest<AuthCheckRequest>, reply: FastifyReply) => {
    try {
      const now = Date.now();
      if (tooManyAttempts(request.ip, now)) {
        return reply.status(429).send({ error: '잠시 후 다시 시도해주세요' });
      }

      const body = request.body;
      const username = typeof body?.username === 'string' ? body.username : '';
      const password = typeof body?.password === 'string' ? body.password : '';
      if (!username || !password) {
        return reply.status(400).send({ error: 'username and password are required' });
      }

      const adminUsername = process.env.BLOG_ADMIN_USERNAME;
      const adminPassword = process.env.BLOG_ADMIN_PASSWORD;

      if (!adminUsername || !adminPassword) {
        request.log.error('BLOG_ADMIN_USERNAME / BLOG_ADMIN_PASSWORD 미설정');
        return reply.status(500).send({ error: 'Admin credentials not configured' });
      }

      // 두 비교 모두 수행해 사용자명 일치 여부에 따른 타이밍 차이를 줄인다.
      const userOk = safeEqual(username, adminUsername);
      const passOk = safeEqual(password, adminPassword);
      if (userOk && passOk) {
        attempts.delete(request.ip);
        return reply.send({ success: true });
      }

      return reply.status(401).send({ error: 'Invalid credentials' });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
}
