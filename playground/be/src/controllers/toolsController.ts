import { FastifyRequest, FastifyReply } from 'fastify'

/**
 * 🛠️ 도구 컨트롤러 (간소화)
 * 실제 서버 처리가 필요한 기능만 제공
 */

export const toolsController = {
  /**
   * 도구 서비스 정보 
   * (클라이언트에서 어떤 도구들을 사용할 수 있는지 안내)
   */
  async getToolsInfo(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      data: {
        service: 'DEVFORGE Tools',
        version: '1.0.0',
        description: 'Client-side developer tools',
        clientSideTools: [
          {
            name: 'JSON Formatter',
            description: 'Format and validate JSON (runs in browser)',
            implementation: 'JSON.stringify(JSON.parse(json), null, 2)',
            location: 'client-side'
          },
          {
            name: 'QR Generator', 
            description: 'Generate QR codes instantly (runs in browser)',
            implementation: 'qrcode.js library',
            location: 'client-side'
          },
          {
            name: 'Base64 Encoder/Decoder',
            description: 'Encode/decode Base64 (runs in browser)',
            implementation: 'btoa() / atob() browser APIs',
            location: 'client-side'
          },
          {
            name: 'Variable Name Generator',
            description: 'Generate programming variable names (runs in browser)', 
            implementation: 'JavaScript string manipulation',
            location: 'client-side'
          },
          {
            name: 'Color Converter',
            description: 'Convert between color formats (runs in browser)',
            implementation: 'CSS/JavaScript color functions',
            location: 'client-side'
          }
        ],
        serverSideFeatures: [
          {
            name: 'File Upload',
            description: 'Upload and process large files',
            endpoint: '/api/tools/upload'
          },
          {
            name: 'External API Proxy',
            description: 'Proxy requests to external APIs (CORS bypass)',
            endpoint: '/api/tools/proxy'
          }
        ],
        note: 'Most tools run client-side for better performance and privacy'
      }
    })
  },

  /**
   * 파일 업로드 (실제 서버 처리 필요)
   */
  async uploadFile(request: FastifyRequest, reply: FastifyReply) {
    try {
      // 실제 파일 업로드 로직 구현 필요
      return reply.send({
        success: true,
        message: 'File upload functionality - to be implemented when needed',
        data: {
          supportedTypes: ['image/*', 'text/*', 'application/json'],
          maxSize: '10MB'
        }
      })
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'File upload failed'
      })
    }
  },

  /**
   * 외부 API 프록시 (CORS 우회용 - 필요시에만)
   */
  async proxyRequest(request: FastifyRequest, reply: FastifyReply) {
    try {
      return reply.send({
        success: true,
        message: 'External API proxy - to be implemented when needed',
        note: 'Use this only when CORS restrictions require server-side proxy'
      })
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Proxy request failed'
      })
    }
  }
}