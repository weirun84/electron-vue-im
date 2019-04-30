import path from 'path'
import contextMenu from './contextMenu'
import { autoUpdater } from 'electron-updater'
import { app, BrowserWindow, ipcMain } from 'electron'
import logo, { getNoMessageTrayIcon, getMessageTrayIcon, getMessageEmptyTrayIcon } from './logo'

export default hxim => () => {
    if (hxim.$aboutWin) {
        hxim.$aboutWin.show()
        hxim.$aboutWin.focus()
        return hxim.$aboutWin
    }

  const $win = new BrowserWindow({
    title: '关于',
    width: 320,
    height: 400,
    useContentSize: true,
    resizable: false,
    menu: false,
    parent: hxim.$mainWin,
    modal: process.platform !== 'darwin',
    show: false,
      icon: getNoMessageTrayIcon()
    })

  $win.on('ready-to-show', () => {
    $win.show()
    $win.focus()
  })

  // 窗口关闭后手动让$window为null
  $win.on('closed', () => {
      hxim.$aboutWin = null
  })

  $win.webContents.on('dom-ready', () => {
    if (!$win.webContents.isDestroyed()) $win.webContents.send('dom-ready')
  })

  // 右键上下文菜单
  $win.webContents.on('context-menu', (e, params) => {
    e.preventDefault()
    contextMenu($win, params)
  })

  ipcMain.on('ABOUTWIN:checkForUpdates', () => {
      hxim.autoUpdateExe("click")
  })

  // 加载URL地址
  //const URL = process.env.NODE_ENV === 'development'
  //    ? `http://localhost:9080/index.html#about`
  //      : `file://${path.join(app.getAppPath(), 'index.html#about')}`


    const URL = process.env.NODE_ENV === 'development'
        ? 'file://' + path.join(app.getAppPath(), './dist/other/aboutWin.html')
        : `file://${path.join(app.getAppPath(), './dist/other/aboutWin.html')}`


  $win.loadURL(URL)
  return $win
}
