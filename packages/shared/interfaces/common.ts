/**
 * 当主线程需要在渲染进程中发送通知时的需要传递的数据结构
 */
export interface NotificationOption {
  type: 'success' | 'info' | 'error' | 'warning'
  message: string
  description?: string
}
