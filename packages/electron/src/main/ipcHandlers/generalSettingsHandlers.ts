import { createErrorIpcResponse, createIpcResponse } from '@ant-chat/shared'
import { ipcMain } from 'electron'
import { GeneralSettingsStore } from '../store/generalSettings'

export function setupGeneralSettingsHandlers() {
  ipcMain.handle('general-settings:get-settings', async () => {
    try {
      const settings = GeneralSettingsStore.getInstance().getSettings()
      return createIpcResponse(true, settings)
    }
    catch (error) {
      return createErrorIpcResponse(error instanceof Error ? error : String(error))
    }
  })

  ipcMain.handle('general-settings:update-settings', async (_, updates) => {
    try {
      const store = GeneralSettingsStore.getInstance()
      store.updateSettings(updates)
      const updatedSettings = store.getSettings()
      return createIpcResponse(true, updatedSettings)
    }
    catch (error) {
      console.error('Failed to update general settings:', error)
      return createErrorIpcResponse(error instanceof Error ? error : String(error))
    }
  })

  ipcMain.handle('general-settings:reset-settings', async () => {
    try {
      const store = GeneralSettingsStore.getInstance()
      store.resetSettings()
      const settings = store.getSettings()
      return createIpcResponse(true, settings)
    }
    catch (error) {
      return createErrorIpcResponse(error instanceof Error ? error : String(error))
    }
  })
}
