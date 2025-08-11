/* eslint-disable no-template-curly-in-string */
import type { Configuration } from 'electron-builder'

const config: Configuration = {
  appId: 'com.ant-chat.app',
  productName: 'Ant Chat',
  asar: true,
  directories: {
    output: 'release/${version}',
  },
  files: [
    'out/**/*',
    'migrations/**/*',
  ],
  extraResources: [
    { from: 'out/web/dist', to: 'out/web/dist' },
  ],
  electronDownload: {
    mirror: 'https://npmmirror.com/mirrors/electron/',
  },
  mac: {
    icon: 'app-icons/mac/logo-mac.icns',
    category: 'public.app-category.productivity',
    target: [
      'dmg',
    ],
  },
  dmg: {
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications',
      },
      {
        x: 130,
        y: 150,
        type: 'file',
      },
    ],
  },
  win: {
    icon: 'app-icons/win/logo-win.ico', // 建议使用 .ico 格式
    target: [
      {
        target: 'nsis',
        arch: [
          'x64',
        ],
      },
    ],
    artifactName: '${productName}_${version}.${ext}',
    requestedExecutionLevel: 'asInvoker', // 避免 UAC 提示
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: true,
    createDesktopShortcut: true, // 创建桌面快捷方式
    createStartMenuShortcut: true, // 创建开始菜单快捷方式
    shortcutName: 'Ant Chat', // 快捷方式名称
  },
}

export default config
