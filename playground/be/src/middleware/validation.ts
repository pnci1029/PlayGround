import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

// JSON Formatter 검증 스키마
export const jsonFormatterSchema = z.object({
  json: z.string().min(1, 'JSON string is required')
})

// Variable Generator 검증 스키마
export const variableGeneratorSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  style: z.enum(['camelCase', 'PascalCase', 'snake_case', 'kebab-case', 'UPPER_SNAKE_CASE'])
})

// 검증 미들웨어 팩토리
export function validateSchema(schema: z.ZodSchema) {
  return async function(request: FastifyRequest, reply: FastifyReply) {
    try {
      schema.parse(request.body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: 'Validation failed',
          details: error.issues
        })
      }
      throw error
    }
  }
}