import CryptoJS from 'crypto-js'

const SECRET_KEY = location.host

// 加密函数
export function encryptData(data: Record<string, any>) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString()
}

// 解密函数
export function decryptData(ciphertext: string) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY)
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}
