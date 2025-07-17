import type { SearchResult } from '@ant-chat/shared'
import { SearchOutlined } from '@ant-design/icons'
import { debounce } from 'lodash-es'
import React from 'react'
import { dbApi } from '@/api/dbApi'
import { SearchResults } from './SearchResults'

export function SearchBar() {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [keywords, setKeyword] = React.useState('')
  const [items, setItems] = React.useState<SearchResult[]>([])

  const debouncedSearch = React.useCallback(
    debounce(async (value: string) => {
      if (!value.trim()) {
        setItems([])
        return
      }
      const result = await dbApi.searchByKeyword(value)

      setItems(result)
    }, 300),
    [],
  )

  React.useEffect(() => {
    debouncedSearch(keywords)
  }, [keywords])

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <>
      <div
        className="
        absolute top-20 left-1/2 translate-x-[-50%]
        w-4xl bg-white dark:bg-gray-800 rounded-xl
      "
      >
        <div className="flex gap-2 items-center rounded-md p-2 border m-3 border-solid border-(--border-color)">
          <SearchOutlined className="text-[1.5em] !text-[#9ca3af]" />
          <input
            ref={inputRef}
            className="h-8 w-full focus:outline-none"
            type="text"
            placeholder="Search..."
            value={keywords}
            autoFocus
            onChange={e => setKeyword(e.target.value)}
          />
        </div>
        {
          keywords.length
            ? (
                <div className="">
                  <SearchResults
                    keywords={keywords}
                    items={items}
                  />
                </div>
              )
            : null
        }
      </div>
    </>
  )
}
