import { ANT_CHAT_FILE_TYPE, ANT_CHAT_STRUCTURE } from '@/constants'
import { pick } from 'lodash-es'

export async function downloadAntChatFile(fileContent: string, fileName: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([fileContent]))
  a.download = fileName
  a.click()
  a.remove()
}

export async function exportAntChatFile(fileContent: string, fileName: string) {
  const fileHandle = await window.showSaveFilePicker({ suggestedName: fileName, types: [ANT_CHAT_FILE_TYPE] })
  const writableStream = await fileHandle.createWritable()
  await writableStream.write(fileContent)
  await writableStream.close()
}

export async function importAntChatFile() {
  const fileHandle = await showOpenFilePicker({
    types: [ANT_CHAT_FILE_TYPE],
  })
  const file = await fileHandle[0].getFile()
  if (!file.name.endsWith('.antchat')) {
    throw new Error('文件格式错误')
  }
  const text = await file.text()
  try {
    return parseAntFile(text)
  }
  catch {
    throw new Error('antchat文件解析失败～')
  }
}

function parseAntFile(text: string) {
  const data = pick(JSON.parse(text), Object.keys(ANT_CHAT_STRUCTURE))
  const { type, version, conversations } = data
  if (type !== 'Ant Chat' || version !== '1' || !Array.isArray(conversations)) {
    throw new Error('antchat文件解析失败～')
  }
  return data
}
