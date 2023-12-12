import { BrowserWindow, ipcMain } from 'electron'
import { ProgressInfo, UpdateInfo, autoUpdater } from 'electron-updater'
import { join } from 'path'
import { isDev } from './utils'

export default (win: BrowserWindow) => {
  // 定义返回给渲染层的相关提示文案
  const message = {
    error: '检查更新出错',
    checking: '正在检查更新……',
    updateAva: '检测到新版本，正在下载……',
    updateNotAva: '现在使用的就是最新版本，不用更新'
  }

  autoUpdater.autoDownload = false
  // 这里是为了在本地做应用升级测试使用
  if (isDev) {
    autoUpdater.forceDevUpdateConfig = true
    autoUpdater.updateConfigPath = join(__dirname, '../../dev-app-update.yml')
  }
  const contents = win.webContents

  // 检测下载错误
  autoUpdater.on('error', (error) => {
    console.error(error)
    contents.send('update-message', '检查更新失败，请稍后再试！')
  })
  // 检测是否需要更新
  autoUpdater.on('checking-for-update', () => {
    contents.send('update-message', message.checking)
  })
  // 检测到可以更新时
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    const updateMessage = {
      version: info.version || ''
    }
    contents.send('new-version', updateMessage)
    // 也可以默认直接更新，二选一即可
    // autoUpdater.downloadUpdate();
    // sendUpdateMessage(message.updateAva);
  })

  ipcMain.handle('check-update', async () => {
    try {
      await autoUpdater.checkForUpdates()
      return true
    } catch (error) {
      console.error('更新检测失败', error)
      return null
    }
  })

  ipcMain.on('download-update', (_e, status: boolean) => {
    status && autoUpdater.downloadUpdate()
  })

  // 检测到不需要更新时
  autoUpdater.on('update-not-available', () => {
    // 这里可以做静默处理，不给渲染进程发通知，或者通知渲染进程当前已是最新版本，不需要更新
    contents.send('update-message', '当前已是最新版本')
  })

  // 更新下载进度
  autoUpdater.on('download-progress', (progress: ProgressInfo) => {
    // 直接把当前的下载进度发送给渲染进程即可，有渲染层自己选择如何做展示
    contents.send('download-progress', progress)
  })

  // 当需要更新的内容下载完成后
  autoUpdater.on('update-downloaded', () => {
    console.info('下载已完成')
    // 给用户一个提示，然后重启应用；或者直接重启也可以，只是这样会显得很突兀
    contents.send('download-end', '安装程序已准备就绪，应用重启后并进行安装')
  })

  // 推出并安装
  ipcMain.on('quitAndInstall', (_event, status: boolean) => {
    status && setImmediate(() => autoUpdater.quitAndInstall())
  })
}
