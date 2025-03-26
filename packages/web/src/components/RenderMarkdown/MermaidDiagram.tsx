import { Image } from 'antd'
import mermaid from 'mermaid'
import React, { useState } from 'react'

let initialized = false

function MermaidDiagram({ children, className, style }: { children: string, className?: string, style?: React.CSSProperties }) {
  const id = React.useRef(`d-${Date.now()}-mermaid`)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [svgUrl, setSvgUrl] = useState('')
  const [inited, setInited] = useState(initialized)

  React.useEffect(() => {
    if (!initialized) {
      mermaid.initialize({
        suppressErrorRendering: true,
        startOnLoad: true,
        // logLevel: 'warn'
        securityLevel: 'antiscript',
      })

      initialized = true

      setInited(true)
    }
  }, [])

  React.useEffect(() => {
    if (inited) {
      (async () => {
        const { svg } = await mermaid.render(id.current, children)
        console.log('svg => ', svg)
        containerRef.current!.innerHTML = svg
        setSvgUrl(svgStringToObjectURL(svg))
      })()
    }
  }, [children, inited])

  return (
    <div ref={containerRef} className={className} style={{ width: '100%', height: '100%', overflow: 'auto', ...style }}>
      <pre id={id.current}>
      </pre>
      {
        svgUrl && (
          <Image src={svgUrl} width="100%" />
        )
      }
    </div>
  )
}

function svgStringToObjectURL(svgString: string) {
  // 1. Create a Blob from the SVG string.
  // The first argument is an array containing the string parts.
  // The second argument is an options object specifying the MIME type.
  // The correct MIME type for SVG is 'image/svg+xml'.
  const blob = new Blob([svgString], { type: 'image/svg+xml' })

  // 2. Create an Object URL from the Blob.
  // This URL points to the Blob data held in the browser's memory.
  const url = URL.createObjectURL(blob)

  return url
}

export default MermaidDiagram
