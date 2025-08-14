#!/usr/bin/env node

import { execSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    versionType: 'patch', // 默认版本类型
    skipChangelog: false,
    help: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--help' || arg === '-h') {
      options.help = true
    }
    else if (arg === '--major') {
      options.versionType = 'major'
    }
    else if (arg === '--minor') {
      options.versionType = 'minor'
    }
    else if (arg === '--patch') {
      options.versionType = 'patch'
    }
    else if (arg === '--skip-changelog') {
      options.skipChangelog = true
    }
  }

  return options
}

// 显示帮助信息
function showHelp() {
  console.log(`
🚀 Release Script - 版本发布工具

使用方法:
  node scripts/release.js [选项]

选项:
  -h, --help           显示帮助信息
  --major              更新主版本号 (1.0.0 -> 2.0.0)
  --minor              更新次版本号 (1.0.0 -> 1.1.0)
  --patch              更新修订版本号 (1.0.0 -> 1.0.1) [默认]
  --skip-changelog     跳过更新 CHANGELOG.md

示例:
  node scripts/release.js              # 使用默认 patch 版本
  node scripts/release.js --minor      # 更新次版本号
  node scripts/release.js --major      # 更新主版本号
  node scripts/release.js --skip-changelog  # 跳过更新 changelog

功能:
  1. 更新根目录 package.json 版本
  2. 更新 packages/electron package.json 版本
  3. 更新 CHANGELOG.md (除非跳过)
`)
}

// 获取当前目录
const rootDir = process.cwd()
const electronPackageDir = path.join(rootDir, 'packages', 'electron')

// 执行命令函数
function executeCommand(command, cwd = rootDir) {
  console.log(`执行: ${command}`)
  try {
    execSync(command, {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, FORCE_COLOR: '1' },
    })
    return true
  }
  catch (error) {
    console.error(`命令执行失败: ${command}`)
    console.error(error.message)
    return false
  }
}

// 主函数
function main() {
  const options = parseArgs()

  if (options.help) {
    showHelp()
    return
  }

  console.log('🚀 开始发布流程...')
  console.log(`📋 版本类型: ${options.versionType}\n`)

  // 1. 更新根目录版本
  console.log('1️⃣ 更新根目录 package.json 版本...')
  if (!executeCommand(`pnpm version ${options.versionType} --no-git-tag-version`)) {
    console.error('❌ 更新根目录版本失败')
    process.exit(1)
  }

  // 2. 更新packages/electron目录版本
  console.log('\n2️⃣ 更新 packages/electron package.json 版本...')
  if (!executeCommand(`pnpm version ${options.versionType} --no-git-tag-version`, electronPackageDir)) {
    console.error('❌ 更新 packages/electron 版本失败')
    process.exit(1)
  }

  // 3. 更新changelog
  if (!options.skipChangelog) {
    console.log('\n3️⃣ 更新 CHANGELOG.md...')
    if (!executeCommand('npx -y conventional-changelog-cli -p angular -i CHANGELOG.md -s -r 0')) {
      console.error('❌ 更新 CHANGELOG.md 失败')
      process.exit(1)
    }
  }
  else {
    console.log('\n3️⃣ 跳过更新 CHANGELOG.md...')
  }

  console.log('\n✅ 发布流程完成！')
  console.log('💡 请检查更新后的版本号和 CHANGELOG.md，然后手动提交到 git')
}

main()
