#!/usr/bin/env node

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    versionType: 'patch', // 默认版本类型
    preRelease: '', // 预发布版本: alpha, beta
    skipChangelog: false,
    commitAndTag: false, // 是否提交并打标签
    commitOnly: false, // 仅提交模式
    help: false,
  }

  // 检查是否只有 --commit 参数
  const hasVersionArgs = args.some(arg =>
    ['--major', '--minor', '--patch', '--alpha', '--beta', '--skip-changelog'].includes(arg),
  )
  const hasCommitArg = args.includes('--commit') || args.includes('-c')

  if (hasCommitArg && !hasVersionArgs) {
    options.commitOnly = true
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
    else if (arg === '--alpha') {
      options.preRelease = 'alpha'
      // 如果没有指定版本类型，默认使用 prerelease
      if (options.versionType === 'patch') {
        options.versionType = 'prerelease'
      }
    }
    else if (arg === '--beta') {
      options.preRelease = 'beta'
      // 如果没有指定版本类型，默认使用 prerelease
      if (options.versionType === 'patch') {
        options.versionType = 'prerelease'
      }
    }
    else if (arg === '--skip-changelog') {
      options.skipChangelog = true
    }
    else if (arg === '--commit' || arg === '-c') {
      options.commitAndTag = true
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
  --alpha              发布 Alpha 预发布版本 (1.0.0-alpha.1)
  --beta               发布 Beta 预发布版本 (1.0.0-beta.1)
  --skip-changelog     跳过更新 CHANGELOG.md
  -c, --commit         提交更改并创建 git tag

示例:
  node scripts/release.js                    # 使用默认 patch 版本
  node scripts/release.js --minor             # 更新次版本号
  node scripts/release.js --major             # 更新主版本号
  node scripts/release.js --alpha             # 发布 Alpha 预发布版本 (1.0.0-alpha.1)
  node scripts/release.js --beta              # 发布 Beta 预发布版本 (1.0.0-beta.1)
  node scripts/release.js --minor --alpha     # 次版本号 Alpha 版本 (1.1.0-alpha.1)
  node scripts/release.js --skip-changelog    # 跳过更新 changelog
  node scripts/release.js --commit            # 仅提交当前更改并打标签
  node scripts/release.js --minor --commit    # 更新次版本号并提交

注意:
  - 使用 --alpha 或 --beta 时，默认使用 prerelease 版本类型
  - 可以组合使用：--major --alpha 会创建主版本号的 Alpha 预发布版本
  - 单独使用 --commit 时，仅提交当前更改并创建 tag，不修改版本号

功能:
  1. 更新根目录 package.json 版本 (除非仅提交模式)
  2. 更新 packages/electron package.json 版本 (除非仅提交模式)
  3. 更新 CHANGELOG.md (除非跳过或仅提交模式)
  4. 提交更改并创建 git tag (如果指定 --commit)
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

// 读取当前版本号
function getCurrentVersion(dir = process.cwd()) {
  const packagePath = path.join(dir, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  return packageJson.version
}

// 主函数
function main() {
  const options = parseArgs()

  if (options.help) {
    showHelp()
    return
  }

  if (options.commitOnly) {
    console.log('🚀 开始仅提交模式...')
    console.log('📝 仅提交当前更改并创建 git tag\n')

    // 获取当前版本号
    const currentVersion = getCurrentVersion()

    // 添加文件到 git
    console.log('📁 添加文件到 git...')
    if (!executeCommand('git add package.json packages/electron/package.json CHANGELOG.md')) {
      console.error('❌ 添加文件到 git 失败')
      process.exit(1)
    }

    // 提交更改
    console.log('💾 提交更改...')
    const commitMessage = `chore: release ${currentVersion}`
    if (!executeCommand(`git commit -m "${commitMessage}"`)) {
      console.error('❌ 提交更改失败')
      process.exit(1)
    }

    // 创建 tag
    console.log('🏷️  创建 git tag...')
    if (!executeCommand(`git tag v${currentVersion}`)) {
      console.error('❌ 创建 git tag 失败')
      process.exit(1)
    }

    console.log(`\n✅ 已成功创建 tag: v${currentVersion}`)
    console.log('💡 版本已发布，可以使用 git push origin main --tags 推送到远程仓库')
    return
  }

  console.log('🚀 开始发布流程...')
  console.log(`📋 版本类型: ${options.versionType}`)
  if (options.preRelease) {
    console.log(`🔖 预发布版本: ${options.preRelease}`)
  }
  if (options.commitAndTag) {
    console.log('📝 将自动提交并创建 git tag')
  }
  console.log('')

  // 构建版本命令
  let versionCommand
  if (options.preRelease) {
    // 如果是预发布版本，使用对应的 pre 命令
    if (options.versionType === 'major') {
      versionCommand = `premajor --preid=${options.preRelease}`
    }
    else if (options.versionType === 'minor') {
      versionCommand = `preminor --preid=${options.preRelease}`
    }
    else if (options.versionType === 'patch') {
      versionCommand = `prepatch --preid=${options.preRelease}`
    }
    else {
      versionCommand = `prerelease --preid=${options.preRelease}`
    }
  }
  else {
    versionCommand = options.versionType
  }

  // 1. 更新根目录版本
  console.log('1️⃣ 更新根目录 package.json 版本...')
  if (!executeCommand(`pnpm version ${versionCommand} --no-git-tag-version`)) {
    console.error('❌ 更新根目录版本失败')
    process.exit(1)
  }

  // 2. 更新packages/electron目录版本
  console.log('\n2️⃣ 更新 packages/electron package.json 版本...')
  if (!executeCommand(`pnpm version ${versionCommand} --no-git-tag-version`, electronPackageDir)) {
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

  // 4. 提交和打标签
  if (options.commitAndTag) {
    console.log('\n4️⃣ 提交更改并创建 git tag...')

    // 获取新版本号
    const newVersion = getCurrentVersion()

    // 添加文件到 git
    console.log('📁 添加文件到 git...')
    if (!executeCommand('git add package.json packages/electron/package.json CHANGELOG.md')) {
      console.error('❌ 添加文件到 git 失败')
      process.exit(1)
    }

    // 提交更改
    console.log('💾 提交更改...')
    const commitMessage = `chore: release ${newVersion}`
    if (!executeCommand(`git commit -m "${commitMessage}"`)) {
      console.error('❌ 提交更改失败')
      process.exit(1)
    }

    // 创建 tag
    console.log('🏷️  创建 git tag...')
    if (!executeCommand(`git tag v${newVersion}`)) {
      console.error('❌ 创建 git tag 失败')
      process.exit(1)
    }

    console.log(`\n✅ 已成功创建 tag: v${newVersion}`)
  }

  console.log('\n✅ 发布流程完成！')
  if (!options.commitAndTag) {
    console.log('💡 请检查更新后的版本号和 CHANGELOG.md，然后手动提交到 git')
  }
  else {
    console.log('💡 版本已发布，可以使用 git push origin main --tags 推送到远程仓库')
  }
}

main()
