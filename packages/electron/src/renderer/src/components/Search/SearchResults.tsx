import type { SearchResult } from '@ant-chat/shared'
import { EnterOutlined, MessageOutlined } from '@ant-design/icons'
import { Empty } from 'antd'

interface SearchResultsProps {
  keywords: string
  items: SearchResult[]
}

const IconMapping: Record<SearchResult['type'], React.ReactNode> = {
  message: <MessageOutlined className="!text-[#9ca3af]" />,
}

export function SearchResults({ items, keywords }: SearchResultsProps) {
  return items?.length
    ? (
        <div className="max-h-[60vh] overflow-y-auto px-3 pb-1">
          {
            items.map(item => (
              <div
                key={item.id}
                className="
                  p-2 border mt-2 rounded-md border-solid border-(--border-color)
                  transition-colors duration-200
                "
              >
                <div className="text-xs">
                  <div className="flex items-center gap-2 text-xs">
                    {IconMapping[item.type]}
                    {item.conversationTitle}
                  </div>
                  <div className="mt-2 w-full">
                    {item.messages.map((message, index) => (
                      <div key={message.id} className="flex justify-between items-center w-full text-xs p-2 cursor-pointer hover:bg-(--hover-bg-color) group/message">
                        <div className="flex gap-2 items-center">
                          <span>
                            {index + 1}
                          </span>
                          {message.content}
                        </div>
                        <span className="hidden group-hover/message:block">
                          <EnterOutlined />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )
    : (
        keywords && (
          <div className="flex justify-center items-center w-full h-full">
            <Empty />
          </div>
        )
      )
}
