import type { SupportedLanguages } from '../RunnerCode'
import { clipboardWriteText } from '@/utils'
import { CopyOutlined, DownOutlined, PlayCircleFilled } from '@ant-design/icons'
import { Button } from 'antd'
import { useState } from 'react'
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import materialDark from 'react-syntax-highlighter/dist/esm/styles/prism/material-dark'
import materialLight from 'react-syntax-highlighter/dist/esm/styles/prism/material-light'
import { useRunnerCodeContext } from '../RunnerCode'

interface CodeBlockProps {
  children?: React.ReactNode
  language: string
  theme?: 'light' | 'dark'
}

const preKey = 'pre[class*="language-"]'
const codeKey = 'code[class*="language-"]'
const fontFamily = `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace`

function CodeBlock({ language, children, theme = 'light' }: CodeBlockProps) {
  const [showCode, setShowCode] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)
  // const { setContent } = useMermaidContext()
  const { updateConfig } = useRunnerCodeContext()

  const _style = { ...theme === 'light' ? materialLight : materialDark }

  /** 调整主题样式 */
  const preStyle = _style[preKey]
  const codeStyle = _style[codeKey]
  const style = {
    ..._style,
    [preKey]: { ...preStyle, margin: '0px' },
    [codeKey]: { ...codeStyle, fontFamily },
  }

  return (
    <div className="border-solid border-1px border-gray-400/20 rounded-md">
      {/* 代码块header */}
      <div className="flex justify-between select-none items-center px-2 py-1">
        <div
          className="flex gap-2 items-center cursor-pointer"
          onClick={() => setShowCode(!showCode)}
          style={{ fontFamily }}
        >
          <DownOutlined rotate={showCode ? 0 : -90} />
          {language}
        </div>
        <div className="text-xs flex justify-end gap-2 cursor-pointer">
          {copySuccess && <span className="color-blue">复制成功</span>}
          <CopyOutlined
            className="hover:color-blue-4"
            onClick={() => {
              setCopySuccess(true)
              const text = String(children)
              clipboardWriteText(text)
              setTimeout(() => {
                setCopySuccess(false)
              }, 1000)
            }}
          />
        </div>
      </div>
      <div className={`overflow-hidden transition-height ${!showCode && 'h-0'}`}>
        <SyntaxHighlighter
          showLineNumbers
          wrapLines
          language={language}
          style={style}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
      {
        ['mermaid', 'html'].includes(language.toLowerCase()) && (
          <div className="flex justify-end px-2 py-1 items-center gap-2">
            <Button
              type="text"
              size="small"
              icon={<PlayCircleFilled />}
              onClick={() => {
                updateConfig((draft) => {
                  draft.code = String(children)
                  draft.language = language as SupportedLanguages
                })
              }}
            >
              运行代码
            </Button>
          </div>
        )
      }
    </div>
  )
}

export default CodeBlock
