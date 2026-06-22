import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { authenticateUser, requireRole } from './auth.js';
import { config } from '../utils/config.js';

// Fastify reply 의 최소 모킹: status()/send() 체인과 호출 여부만 기록
function mockReply() {
  const r: any = { statusCode: 200, payload: undefined, sent: false };
  r.status = (c: number) => { r.statusCode = c; return r; };
  r.send = (p: any) => { r.payload = p; r.sent = true; return r; };
  return r;
}

function mockReq(headers: Record<string, string> = {}) {
  return { headers } as any;
}

describe('requireRole', () => {
  it('인증되지 않은 요청은 401', async () => {
    const reply = mockReply();
    await requireRole(['admin'])({} as any, reply);
    expect(reply.statusCode).toBe(401);
  });

  it('권한이 부족하면 403', async () => {
    const reply = mockReply();
    await requireRole(['admin'])({ user: { role: 'writer' } } as any, reply);
    expect(reply.statusCode).toBe(403);
  });

  it('허용된 역할이면 응답하지 않고 통과', async () => {
    const reply = mockReply();
    await requireRole(['admin', 'editor'])({ user: { role: 'editor' } } as any, reply);
    expect(reply.sent).toBe(false);
    expect(reply.statusCode).toBe(200);
  });
});

describe('authenticateUser', () => {
  it('토큰이 없으면 401', async () => {
    const reply = mockReply();
    await authenticateUser(mockReq({}), reply);
    expect(reply.statusCode).toBe(401);
  });

  it('Bearer 형식이 아니면 401', async () => {
    const reply = mockReply();
    await authenticateUser(mockReq({ authorization: 'token-without-bearer' }), reply);
    expect(reply.statusCode).toBe(401);
  });

  it('위조/잘못된 토큰은 401', async () => {
    const reply = mockReply();
    await authenticateUser(mockReq({ authorization: 'Bearer not.a.valid.token' }), reply);
    expect(reply.statusCode).toBe(401);
  });

  it('유효한 토큰이면 request.user 를 설정하고 통과', async () => {
    const token = jwt.sign(
      { userId: 'u1', username: 'kim', role: 'admin' },
      config.jwtSecret,
    );
    const req = mockReq({ authorization: `Bearer ${token}` });
    const reply = mockReply();
    await authenticateUser(req, reply);

    expect(reply.sent).toBe(false);
    expect(req.user.userId).toBe('u1');
    expect(req.user.username).toBe('kim');
    expect(req.user.role).toBe('admin');
  });
});
