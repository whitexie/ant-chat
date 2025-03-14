import { spawn } from 'node:child_process'
import { join } from 'node:path'
import process from 'node:process'
import electron from 'electron'
import { createServer } from 'vite'

async function startDevServer() {
  // 启动 web 项目的 vite 服务
  const webRoot = join(__dirname, '../../web')
  const server = await createServer({
    configFile: join(webRoot, 'vite.config.ts'),
    root: webRoot,
    server: {
      port: 5173,
    },
  })
  await server.listen()

  // 设置环境变量
  const env = {
    ...process.env,
    NODE_ENV: 'development',
  }

  // 启动 Electron
  const electronProcess = spawn(electron.toString(), ['.'], {
    stdio: 'inherit',
    env,
  })

  electronProcess.on('close', () => {
    server.close()
    process.exit()
  })
}

startDevServer().catch((err) => {
  console.error('Failed to start dev server:', err)
  process.exit(1)
})
