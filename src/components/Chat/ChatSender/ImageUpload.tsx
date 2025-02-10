import type { IImage } from '@/db/interface'
import type { UploadChangeParam, UploadFile } from 'antd/es/upload'
import { useToken } from '@/utils'
import { PlusOutlined } from '@ant-design/icons'
import { Image, Upload } from 'antd'
import { pick } from 'lodash-es'
import { useState } from 'react'

interface ImagePreviewProps {
  items: IImage[]
  onChange: (files: IImage[]) => void
}

function imageFileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ImageUpload({ items = [], onChange }: ImagePreviewProps) {
  const { token } = useToken()
  const [previewImage, setPreviewImage] = useState('')
  const fileList = items.map(item => ({
    ...item,
    status: 'done',
  } as const))

  const uploadButton = (
    <button className="border-0 bg-[transparent] flex justify-center items-center" type="button">
      <PlusOutlined
        style={{
          color: token.colorText,
        }}
      />
    </button>
  )

  async function handleChange(info: UploadChangeParam<UploadFile<IImage>>) {
    const { fileList } = info
    const files = await Promise.all(fileList.map(async (file) => {
      if (file.url) {
        return pick(file, ['uid', 'name', 'size', 'type', 'url']) as IImage
      }
      const url = await imageFileToBase64(file.originFileObj as File)
      return {
        ...pick(file, ['uid', 'name', 'size', 'type']),
        url,
      } as IImage
    }))
    onChange(files)
  }

  function handlePreview(file: UploadFile<any>) {
    setPreviewImage(file.url!)
  }

  return (
    <>
      <Upload
        multiple
        listType="picture-card"
        maxCount={9}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        fileList={fileList}
        beforeUpload={() => false}
        onChange={handleChange}
        onPreview={handlePreview}
      >
        {fileList.length > 8 ? null : uploadButton}
      </Upload>
      <Image
        wrapperStyle={{ display: 'none' }}
        preview={{
          visible: !!previewImage,
          onVisibleChange: () => setPreviewImage(''),
          afterOpenChange: visible => !visible && setPreviewImage(''),
        }}
        src={previewImage}
      />
    </>
  )
}
