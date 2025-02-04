import { decryptData, encryptData } from '@/utils'

export default {
  getItem(key: string) {
    // console.log('getItem', key)
    const value = localStorage.getItem(key)
    if (value) {
      return decryptData(value)
    }
    return null
  },
  setItem(key: string, value: string) {
    // console.log('setItem', key, value)
    localStorage.setItem(key, encryptData(value))
  },
  removeItem(key: string) {
    // console.log('removeItem', key)
    localStorage.removeItem(key)
  },
}
