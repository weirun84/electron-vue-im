import { ipcMain } from 'electron'

export default hxim => () => {
  ipcMain.on('online', (e, online) => {
    if (online === false) {
      // 第一次启动窗口
        if (hxim.online === null) {
            hxim.showErrorWin()
      }
    } else {
        hxim.hideErrorWin()
    }
      hxim.online = online
  })
}
