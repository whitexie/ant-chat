import type { ProviderServiceModelsSchema } from '@ant-chat/shared'
import { Form, Input, Modal } from 'antd'

type AddModelForm = Omit<ProviderServiceModelsSchema, 'providerServiceId'>

interface AddModelFormModalProps {
  open: boolean
  title: string
  onClose?: () => void
  onCancel?: () => void
  onSave?: (data: AddModelForm) => void
}

export function AddModelFormModal({ open, title, onClose, onCancel, onSave }: AddModelFormModalProps) {
  const [form] = Form.useForm<AddModelForm>()

  return (
    <Modal
      open={open}
      onClose={() => onClose?.()}
      title={title}
      onCancel={() => onCancel?.()}
      onOk={() => {
        form.validateFields().then((value) => {
          onSave?.(value)
        })
      }}
    >
      <Form form={form} layout="vertical" className="!pt-3">
        <Form.Item required label="模型ID" name="model">
          <Input />
        </Form.Item>
        <Form.Item required label="模型名称" name="name">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  )
}
