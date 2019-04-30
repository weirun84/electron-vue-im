import path from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'
import logo, { getNoMessageTrayIcon, getMessageTrayIcon, getMessageEmptyTrayIcon } from './logo'

export default hxim => () => {
    if (hxim.$errorWin) {
        hxim.$errorWin.show()
        hxim.$errorWin.focus()
        return hxim.$errorWin
    }


  const $win = new BrowserWindow({
    title: '网络错误',
    width: 600,
    height: 320,
    useContentSize: true,
    resizable: false,
    center: true,
    frame: false,
    menu: false,
    transparent: true,
    show: false,
    closable: false,
    parent: hxim.$mainWin,
    modal: process.platform !== 'darwin',
    skipTaskbar: true,
      icon: getNoMessageTrayIcon()
  })

  $win.on('ready-to-show', () => {
    $win.show()
    $win.focus()
  })
  $win.on('closed', () => {
    hxim.$errorWin = null
  })

  ipcMain.on('ERRORWIN:retry', () => {
      hxim.hideErrorWin()
      if (hxim.$mainWin) {
          hxim.$mainWin.reload()
          hxim.showMainWin()
    }
  })

  ipcMain.on('ERRORWIN:close', () => {
      hxim.hideErrorWin()
  })

  // 加载URL地址
  const URL = process.env.NODE_ENV === 'development'
      ? 'file://' + path.join(app.getAppPath(), './dist/other/errorWin.html')
      : `file://${path.join(app.getAppPath(), './dist/other/errorWin.html')}`

  $win.loadURL(URL)
  return $win
}
