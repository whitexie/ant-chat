export async function createDirectory(directoryName: string) {
  const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' })
  const targetDirHandle = await dirHandle.getDirectoryHandle(directoryName, { create: true })

  return targetDirHandle
}

export async function stringToBinaryFile(stringContent: string, fileName: string) {
  const fileHandle = await window.showSaveFilePicker({
    suggestedName: fileName,
    types: [{
      description: 'Text Files',
      accept: {
        'application/octet-stream': ['.antchat'],
      },
    }],
  })
  if (fileHandle) {
    const writableStream = await fileHandle.createWritable()
    await writableStream.write(stringContent)
    await writableStream.close()
  }
}

export async function readBinaryFile() {
  const fileHandle = await window.showOpenFilePicker({
    types: [{
      description: 'Text Files',
      accept: {
        'application/octet-stream': ['.antchat'],
      },
    }],
  })

  if (fileHandle.length > 0) {
    const file = await fileHandle[0].getFile()
    const text = await file.text()
    return text
  }
}
