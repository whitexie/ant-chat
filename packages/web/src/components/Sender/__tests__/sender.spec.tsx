import { checkModelConfig } from '@/store/modelConfig'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Sender from '../Sender'
import '@testing-library/jest-dom'

vi.mock('@/store/modelConfig')

describe('sender', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loading状态下展示stop按钮', () => {
    render(
      <Sender loading />,
    )

    expect(screen.getByTitle('取消')).toBeInTheDocument()
  })

  describe('文本输入框', () => {
    it('按回车触发onSubmit', async () => {
      vi.mocked(checkModelConfig).mockReturnValue({ ok: true })

      const onSubmit = vi.fn()
      render(<Sender onSubmit={onSubmit} />)

      const input = screen.getByTestId('textarea')
      await act(async () => {
        fireEvent.change(input, { target: { value: '123\n123\n123' } })
      })

      await act(async () => {
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
      })

      expect(onSubmit).toHaveBeenCalledTimes(1)
      expect(onSubmit).toHaveBeenCalledWith('123\n123\n123', [], [], { deepThinking: false, onlineSearch: false })
    })

    it('文本为空时，按回车不触发onSubmit', async () => {
      const onSubmit = vi.fn()
      render(<Sender onSubmit={onSubmit} />)

      const input = screen.getByTestId('textarea')
      await act(async () => {
        fireEvent.change(input, { target: { value: '' } })
      })

      await act(async () => {
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
      })

      expect(onSubmit).toHaveBeenCalledTimes(0)
    })

    it('shift+Enter触发换行', async () => {
      const onSubmit = vi.fn()
      render(<Sender onSubmit={onSubmit} />)

      const input = screen.getByTestId('textarea')
      await act(async () => {
        fireEvent.change(input, { target: { value: '123' } })
      })

      await act(async () => {
        fireEvent.focus(input)
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true })
      })

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(0)
      })

      expect((screen.getByTestId('textarea') as HTMLTextAreaElement).value).toBe('123')
    })
  })

  it('onCancel', () => {
    const onCancel = vi.fn()
    render(<Sender loading onCancel={onCancel} />)

    act(() => {
      fireEvent.click(screen.getByTitle('取消'))
    })

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('open header', async () => {
    render(<Sender />)

    // 找到触发打开头部的按钮
    const toggleButton = screen.getByTestId('toggle-header')

    // 点击按钮以打开头部
    await act(async () => {
      fireEvent.click(toggleButton)
    })

    const header = screen.getByTestId('header-content')
    expect(header).toBeInTheDocument()

    // 再次点击按钮以关闭头部
    await act(async () => {
      fireEvent.click(toggleButton)
    })

    // 验证头部的状态是否已恢复
    expect(header).not.toBeInTheDocument() // 验证标题是否不存在，表示头部已关闭
  })

  describe('发送按钮', () => {
    it('upload files', async () => {
      window.URL.createObjectURL = vi.fn(() => 'mocked-url')
      const onSubmit = vi.fn(() => {
        console.log('vi.fn onSubmit')
      })

      render(<Sender onSubmit={onSubmit} />)

      // 点击按钮以打开头部
      await act(async () => {
        fireEvent.click(screen.getByTestId('toggle-header'))
      })

      // 模拟文件上传
      const file = new File(['file content'], 'example.md', { type: '' })
      const imgFile = new File([], 'image.png', { type: 'image/png' })
      const attachmentsComponent = screen.getByTestId('header-content')!

      // 触发 onChange 事件，模拟文件上传
      await act(async () => {
        fireEvent.change(attachmentsComponent.querySelector('input[type="file"]')!, {
          target: { files: [file, imgFile] },
        })
      })

      expect(screen.getByText('example')).toBeInTheDocument()

      await act(async () => {
        fireEvent.change(screen.getByTestId('textarea'), { target: { value: '123\n123\n123' } })
      })

      await act(async () => {
        fireEvent.click(screen.getByTestId('sendBtn'))
      })

      // 使用 waitFor 等待 onSubmit 被调用
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1)
      })

      expect(onSubmit).toHaveBeenCalledWith(
        '123\n123\n123',
        [expect.anything()],
        [expect.anything()],
        { deepThinking: false, onlineSearch: false },
      )
    })

    it('激活联网搜索', async () => {
      const onSubmit = vi.fn()
      render(<Sender onSubmit={onSubmit} />)

      vi.mocked(checkModelConfig).mockReturnValue({ ok: true })

      const onlineSearchBtn = screen.getByRole('switchButton')
      const input = screen.getByTestId('textarea')
      const sendBtn = screen.getByTestId('sendBtn')

      await act(async () => {
        fireEvent.click(onlineSearchBtn)
      })

      await act(async () => {
        fireEvent.change(input, { target: { value: '123' } })
      })

      await act(async () => {
        fireEvent.click(sendBtn)
      })

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledTimes(1)
      })

      expect(onSubmit).toHaveBeenCalledWith(
        '123',
        [],
        [],
        { deepThinking: false, onlineSearch: true },
      )
    })
  })
})
