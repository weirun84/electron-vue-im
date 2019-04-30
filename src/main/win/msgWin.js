import path from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'
import logo, { getNoMessageTrayIcon, getMessageTrayIcon, getMessageEmptyTrayIcon } from './logo'

export default hxim => (content) => {
    if (hxim.$msgWin) {
        hxim.$msgWin.show()
        hxim.$msgWin.focus()
        return hxim.$msgWin
    }


  const $win = new BrowserWindow({
    title: '提醒',
    width: 400,
    height: 210,
    resizable: false,
    center: true,
    frame: false,
    menu: false,
    transparent: true,
    maximizable:false,
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
      hxim.$msgWin = null
  })

    ipcMain.on('MSGWIN:close', () => {
        hxim.hideMsgWin()
        hxim.$msgWin = null
    })

    $win.webContents.on('did-finish-load', function () {
        $win.webContents.send('dataJson', content);
    });

  // 加载URL地址
  const URL = process.env.NODE_ENV === 'development'
      ? 'file://' + path.join(app.getAppPath(), './dist/other/msgWin.html')
      : `file://${path.join(app.getAppPath(), './dist/other/msgWin.html')}`

  $win.loadURL(URL)
  return $win
}
