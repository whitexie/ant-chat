import { useThemeStore } from '@/store/theme'
import { Typography } from 'antd'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
import CodeBlock from './CodeBlock'
import style from './style.module.scss'

export interface RenderMarkdownProps {
  content: string
}

export default function RenderMarkdown({ content }: RenderMarkdownProps) {
  const _theme = useThemeStore(state => state.theme)

  const theme = _theme === 'default' ? 'light' : 'dark'
  return (
    <Typography className={style['markdown-typography']}>
      <ReactMarkdown
        remarkPlugins={[
          /**
           * 9.0.0版本以后 code函数中props没有`inline`属性，
           * 因此需通过插件来给下面这种代码块配置一个默认的语法这里使用`plaintext`
           * ```
           * ```
           * 这种没有标记语言的代码块
           * @see https://github.com/orgs/remarkjs/discussions/1346
           *
           * react-markdown changelog:
           * @see https://github.com/remarkjs/react-markdown/blob/main/changelog.md#remove-extra-props-passed-to-certain-components
           */
          () => (tree) => {
            visit(tree, 'code', (node) => {
              node.lang = node.lang ?? 'plaintext'
            })
          },
          remarkGfm,
        ]}
        components={{
          code: (props) => {
            const { children, className } = props
            const language = className ? className.replace('language-', '') : 'txt'

            return className
              ? (
                  <CodeBlock language={language} theme={theme}>
                    {children}
                  </CodeBlock>
                )
              : (
                  <code>
                    {children}
                  </code>
                )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </Typography>
  )
}
