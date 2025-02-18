import type { EntityTable } from 'dexie'
import type { IConversations, IMessage } from '../interface'
import type { IMessage as IMessageV1 } from '../interface.v1'
import { Role } from '@/constants'
import Dexie from 'dexie'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { upgradeToV1, upgradeToV2 } from '../db'
import { generateConversationId, generateMessageId } from '../messagesActions'

describe('数据库版本迁移', async () => {
  let db: any = null
  let messageV1_1: IMessageV1 | null = null

  let messageV1_2: IMessageV1 | null = null

  // 测试前重置数据库
  beforeEach(async () => {
    await Dexie.delete('antChat')
    db = new Dexie('antChat') as Dexie & {
      conversations: EntityTable<IConversations, 'id'>
      messages: EntityTable<IMessage, 'id'>
    }
    // 创建旧版本数据库
    upgradeToV1(db)

    messageV1_1 = {
      id: generateMessageId(),
      convId: generateConversationId(),
      role: Role.USER,
      content: 'Hello ',
      createAt: Date.now(),
    }

    messageV1_2 = {
      ...messageV1_1,
      id: generateMessageId(),
      content: [
        { type: 'text', text: 'Hello ' },
        { type: 'image_url', image_url: { uid: '1', name: 'test.jpg', size: 100, type: 'image/jpeg', url: 'test.jpg' } },
      ],
    }

    // 使用独立事务插入数据
    await db.open()

    await db.messages.add(messageV1_1 as any)
    await db.messages.add(messageV1_2 as any)

    await db.close()

    upgradeToV2(db)

    // 初始化新版本数据库
    await db.open()
  })

  afterEach(async () => {
    await db.transaction('rw', db.messages, async () => {
      await db.messages.clear()
    })
  })

  describe('v1 -> v2', () => {
    it('应该正确升级消息内容格式', async () => {
      const upgradedMessage = await db.messages.get(messageV1_2!.id)

      // 验证文本内容合并
      // @ts-expect-error 忽略报错
      expect(upgradedMessage!.content).toEqual(messageV1_2?.content[0].text)

      // 验证图片字段转换
      expect(upgradedMessage?.images).toEqual([
        expect.objectContaining({
          data: 'test.jpg', // 根据实际转换逻辑调整
        }),
      ])
    })

    it('应该正确处理纯文本内容', async () => {
      // 准备纯文本测试数据
      const v1Message: IMessageV1 = {
        id: generateMessageId(),
        convId: generateConversationId(),
        role: Role.USER,
        content: 'Simple text',
        createAt: new Date().getTime(),
      }

      await db.messages.add(v1Message as any)
      const upgradedMessage = await db.messages.get(v1Message.id)

      expect(upgradedMessage?.content).toBe('Simple text')
      expect(upgradedMessage?.images).toBeUndefined()
      expect(upgradedMessage?.attachments).toBeUndefined()
    })
  })
})
