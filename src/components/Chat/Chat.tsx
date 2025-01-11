import type { BubbleDataType } from '@ant-design/x/es/bubble/BubbleList'

import RenderMarkdown from '@/components/RenderMarkdown'
import { Role } from '@/constants'
import { useChat } from '@/hooks/useChat'
import { getNow, uuid } from '@/utils'
import { Bubble, Sender } from '@ant-design/x'
import { Button } from 'antd'
import { useState } from 'react'
import Icon from '../Icon'
import { roles } from './roles'

export default function Chat() {
  const [message, setMessage] = useState('')
  const { agent, messages, onRequest } = useChat()

  const prefix = (
    <div className="flex gap-1">
      <Button type="text" icon={<Icon name="i-ant-design:link-outlined" classNames="w-3.5 h-3.5" />} />
    </div>
  )

  const items = messages.map((msg) => {
    const { id: key, message: { role, content } } = msg
    const styles = { content: { maxWidth: '60%' } }
    const item: BubbleDataType = { role, content, styles, key }

    if (item.role === Role.AI) {
      item.messageRender = (content: string) => <RenderMarkdown content={content} />
    }

    return item
  })

  function onSubmit(message: string) {
    onRequest({
      id: uuid(),
      role: Role.USER,
      content: message,
      createAt: getNow(),
    })
    setMessage('')
  }

  return (
    <div className="flex flex-col h-full w-full p-1">
      <div className="flex-1 overflow-y-auto">
        <Bubble.List items={items} roles={roles} />
      </div>
      <div className="flex-shrink-0 w-full relative">
        <div className="w-full p-2">
          <Sender
            value={message}
            prefix={prefix}
            onChange={setMessage}
            loading={agent.isRequesting()}
            placeholder="按回车发送，Shift + 回车 换行"
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  )
}
