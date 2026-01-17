import { FastifyRequest, FastifyReply } from 'fastify'
import { toolsService } from '../services/toolsService'

export const toolsController = {
  // JSON Formatter
  async formatJson(request: FastifyRequest<{ Body: { json: string } }>, reply: FastifyReply) {
    try {
      const { json } = request.body
      const result = await toolsService.formatJson(json)
      
      return reply.send({
        success: true,
        data: result
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid JSON'
      })
    }
  },

  // Variable Generator
  async generateVariable(request: FastifyRequest<{ Body: { text: string } }>, reply: FastifyReply) {
    try {
      const { text } = request.body
      const result = await toolsService.generateVariable(text)
      
      return reply.send({
        success: true,
        data: result
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Variable generation failed'
      })
    }
  },

  // Tools List
  async getToolsList(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tools = await toolsService.getToolsList()
      
      return reply.send({
        success: true,
        data: tools
      })
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch tools list'
      })
    }
  }
}