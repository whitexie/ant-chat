import { Drawer } from 'antd'
import React from 'react'
import { useRunnerCodeContext } from './context/useRunnerCodeContext'

const MermaidDiagram = React.lazy(() => import('@/components/MermaidCanvas'))

function RunnerCode() {
  const { config, resetConfig } = useRunnerCodeContext()

  const open = !!(config?.code && config?.language)

  return (
    <Drawer
      title="Runner Code"
      open={open}
      onClose={() => {
        resetConfig()
      }}
      placement="bottom"
      height="calc(100dvh - 80px)"
    >

      <React.Suspense>
        {
          config.language === 'mermaid' && (
            <MermaidDiagram>
              {config.code}
            </MermaidDiagram>
          )
        }
      </React.Suspense>

    </Drawer>
  )
}

export default RunnerCode
