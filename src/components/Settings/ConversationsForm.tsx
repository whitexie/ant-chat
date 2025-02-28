import type { RefObject } from 'react'
import { Form, Input } from 'antd'
import { pick } from 'lodash-es'
import { useEffect, useImperativeHandle } from 'react'

interface ConversationsFormProps {
  title: string
  systemPrompt: string
  ref?: RefObject<ConversationsFormInstance | null>
}

export interface ConversationsFormInstance {
  getValues: () => { title: string, systemPrompt: string }
  validate: () => Promise<void>
}

function ConversationsForm(props: ConversationsFormProps) {
  const [form] = Form.useForm()
  const initialValues = pick(props, ['title', 'systemPrompt'])

  useEffect(() => {
    const currentTitle = form.getFieldValue('title')
    if (currentTitle !== props.title) {
      form.setFieldsValue({
        title: props.title,
      })
    }
  }, [props.title])

  useImperativeHandle(props.ref, () => ({
    getValues: () => form.getFieldsValue(),
    validate: () => form.validateFields(),
  }))

  return (
    <Form form={form} layout="vertical" initialValues={initialValues}>
      <Form.Item label="标题" name="title">
        <Input />
      </Form.Item>
      <Form.Item label="系统提示词" name="systemPrompt">
        <Input.TextArea className="h-[200px]" />
      </Form.Item>
    </Form>
  )
}

export default ConversationsForm
