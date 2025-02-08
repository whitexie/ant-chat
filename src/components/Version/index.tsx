import changelog from '@/../CHANGELOG.md?raw'
import { version } from '@/../package.json'
import { InfoCircleOutlined } from '@ant-design/icons'
import { Modal, Typography } from 'antd'
import { lazy, Suspense, useState } from 'react'
import Loading from '../Loading'
import { Logo } from '../Logo'
import SideButton from '../SideButton'

const RenderMarkdown = lazy(() => import('../Chat/RenderMarkdown'))

const { Title, Paragraph } = Typography

export function VersionButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <SideButton icon={<InfoCircleOutlined className="w-4 h-4" />} onClick={() => setOpen(true)}>
        关于（
        {version}
        ）
      </SideButton>
      <Modal
        open={open}
        onCancel={() => {
          setOpen(false)
        }}
        onClose={() => {
          setOpen(false)
        }}
        title="版本信息"
        footer={null}
      >
        <div className="h-[500px] overflow-y-auto">
          <div className="flex justify-center items-center">
            <Logo />
          </div>
          <div className="mt-4">
            <Typography>
              <Paragraph>
                <Title className="text-center" level={5}>更新日志</Title>
              </Paragraph>
            </Typography>
            <Suspense fallback={<Loading />}>
              <RenderMarkdown content={changelog} />
            </Suspense>
          </div>
        </div>
      </Modal>
    </>
  )
}
