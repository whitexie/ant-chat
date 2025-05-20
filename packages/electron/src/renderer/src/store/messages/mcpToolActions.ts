import type { IMcpToolCall, McpToolCallResponse, MessageId } from '@ant-chat/shared'
import { dbApi } from '@/db/dbApi'
import { executeMcpToolCall } from '@/mcp/api'
import { setRequestStatus, updateMessageAction } from './actions'

export async function setMcpToolCallexecuteState(id: MessageId, toolId: string, state: IMcpToolCall['executeState']) {
  const message = await dbApi.getMessageById(id)
  if (!message) {
    throw new Error('message not found')
  }
  if (!message.mcpTool) {
    throw new Error('message not has mcpTool')
  }
  const toolIndex = message.mcpTool.findIndex(item => item.id === toolId)

  if (toolIndex < 0) {
    throw new Error('mcp tool not found')
  }

  message.mcpTool[toolIndex].executeState = state

  await updateMessageAction(message)
}

export async function executeMcpToolAction(messageId: MessageId, tool: IMcpToolCall) {
  let message = await dbApi.getMessageById(messageId)

  await setMcpToolCallexecuteState(messageId, tool.id, 'executing')
  setRequestStatus('loading')

  if (!message.mcpTool) {
    throw new Error('message not has mcpTool')
  }

  const mcpToolCallResponse = await executeMcpToolCall(tool)
  const result = createMcpToolCallResponse(mcpToolCallResponse)

  const toolIndex = message.mcpTool?.findIndex(item => item.id === tool.id)

  message.mcpTool[toolIndex].result = result

  await updateMessageAction(message)

  await setMcpToolCallexecuteState(messageId, tool.id, 'completed')
  setRequestStatus('success')

  // 检查当前message.mcpTool是否都执行完了
  message = await dbApi.getMessageById(messageId)
  const isAllCompleted = message.mcpTool?.every(item => item.executeState === 'completed')

  return { isAllCompleted }
}

export function createMcpToolCallResponse(mcpToolCallResponse: McpToolCallResponse) {
  const { isError, content } = mcpToolCallResponse

  const result = {
    success: !isError,
    data: '',
    error: '',
  }

  if (isError) {
    result.error = content[0].text
  }
  else {
    result.data = content[0].text
  }

  return result
}
