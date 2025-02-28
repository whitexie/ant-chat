import type {
  TestingLibraryMatchers,
} from '@testing-library/jest-dom/matchers'
import matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'

import '@testing-library/jest-dom'

declare module 'vitest' {
  interface JestAssertion<T = any>
    extends jest.Matchers<void, T>,
    TestingLibraryMatchers<T, void> {}
}

// 继承 testing-library 的扩展 except
expect.extend(matchers)
// 全局设置清理函数，避免每个测试文件手动清理
afterEach(() => {
  cleanup()
})
