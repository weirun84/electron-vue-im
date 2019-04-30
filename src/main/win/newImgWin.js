import path from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'
import logo, { getNoMessageTrayIcon, getMessageTrayIcon, getMessageEmptyTrayIcon } from './logo'

export default hxim => (content) => {
    if (hxim.$newImgWin) {
        hxim.$newImgWin.show()
        hxim.$newImgWin.focus()
        return hxim.$newImgWin
    }


  const $win = new BrowserWindow({
    title: '图片查看',
    width: 800,
    height: 810,
    resizable: false,
    center: true,
    frame: false,
      menu: false,
      transparent: false,
    maximizable:false,
    show: false,
    closable: false,
    modal: process.platform !== 'darwin',
    skipTaskbar: true,
    icon: getNoMessageTrayIcon(),
      webPreferences: {
          webSecurity: false
      },
  })

  $win.on('ready-to-show', () => {
    $win.show()
    $win.focus()
  })
  $win.on('closed', () => {
    hxim.$errorWin = null
  })

    ipcMain.on('NEWIMGWIN:close', () => {
        hxim.hideMsgWin()
        hxim.$msgWin = null
    })

    $win.webContents.on('did-finish-load', function () {
        $win.webContents.send('dataJson', content);
    });

  // 加载URL地址
  const URL = process.env.NODE_ENV === 'development'
      ? 'file://' + path.join(app.getAppPath(), './dist/other/newImgWin.html')
      : `file://${path.join(app.getAppPath(), './dist/other/newImgWin.html')}`

  $win.loadURL(URL)
  return $win
}
