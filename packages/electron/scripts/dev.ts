import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 获取项目根目录路径
const rootDir = join(__dirname, '../../..')
const webDir = join(rootDir, 'packages/web')
const electronDir = join(rootDir, 'packages/electron')

// 检查端口是否可用
async function waitForPort(port: number, retries = 3): Promise<void> {
  const net = await import('node:net')

  return new Promise((resolve, reject) => {
    let currentRetries = 0

    const checkPort = () => {
      const socket = new net.Socket()

      socket.once('error', () => {
        socket.destroy()

        if (currentRetries >= retries) {
          reject(new Error(`Timeout waiting for port ${port}`))
          return
        }

        currentRetries++
        setTimeout(checkPort, 1000)
      })

      socket.connect(port, 'localhost', () => {
        socket.destroy()
        // 添加一个小延迟确保服务完全启动
        setTimeout(resolve, 1000)
      })
    }

    checkPort()
  })
}

async function startProcess(command: string, args: string[], options: any): Promise<any> {
  const childProcess = spawn(command, args, options)

  return new Promise((resolve, reject) => {
    childProcess.on('error', reject)
    // 等待一段时间以确保进程正常启动
    setTimeout(() => resolve(childProcess), 1000)
  })
}

async function main() {
  try {
    // 启动 Web 开发服务器
    console.log('🚀 Starting web development server...')
    const webProcess = await startProcess('pnpm', ['dev'], {
      cwd: webDir,
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        VITE_APP_ENV: 'electron',
      },
    })

    // 等待 Web 服务器启动（默认端口 5173）
    console.log('⏳ Waiting for web server to be ready...')
    await waitForPort(5173)
    console.log('✅ Web server is ready!')

    // 启动 Electron 开发环境
    console.log('🚀 Starting Electron development environment...')
    const electronProcess = await startProcess('pnpm', ['vite'], {
      cwd: electronDir,
      stdio: 'inherit',
      shell: true,
    })

    // 处理进程退出
    const cleanup = () => {
      webProcess.kill()
      electronProcess.kill()
      process.exit()
    }

    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)

    // 监听子进程退出
    webProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Web process exited with code:', code)
        cleanup()
      }
    })

    electronProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Electron process exited with code:', code)
        cleanup()
      }
    })

    // 保持主进程运行
    process.on('exit', cleanup)
  }
  catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
