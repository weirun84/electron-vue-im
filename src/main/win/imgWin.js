import path from 'path'
import contextMenu from './contextMenu'
import { autoUpdater } from 'electron-updater'
import { app, BrowserWindow, ipcMain } from 'electron'
import logo, { getNoMessageTrayIcon, getMessageTrayIcon, getMessageEmptyTrayIcon } from './logo'

export default hxim => () => {
    if (hxim.$imgWin) {
        hxim.$imgWin.show()
        hxim.$imgWin.focus()
        return hxim.$imgWin
        
    }

  // 窗口关闭后手动让$window为null
  
  const $win = new BrowserWindow({
    title: '关于',
    width: 400,
    height: 400,
    useContentSize: true,
    resizable: true,
    menu: false,
    parent: hxim.$mainWin,
    modal: process.platform !== 'darwin',
      show: false,
      skipTaskbar: false,
      icon: getNoMessageTrayIcon(),
    webPreferences: {
        webSecurity: false
      },
  })

  $win.on('ready-to-show', () => {
    $win.show()
    $win.focus()
  })

  // 窗口关闭后手动让$window为null
  $win.on('closed', () => {
    hxim.$imgWin = null
})
global.sharedObject = {
  newTel: '000',
  video: '000'
}
// 右键上下文菜单
$win.webContents.on('context-menu', (e, params) => {
  e.preventDefault()
  contextMenu($win, params)
})

    var URL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/static/alonePage/imgBox.html?`
        : `file://${path.join(app.getAppPath(), 'dist/electron/static/alonePage/imgBox.html?')}`;

    global.sharedObject.newTel = URL

    ipcMain.on('IMGWIN:bigImg',(event,arg)=>{
      console.log(arg);
      event.sender.send('Pathvalue', URL);
    // $win.loadURL(URL)
    // hxim.showImgWin();
  })
    // 点击触发进程通信，通过全局函数返回url
    var videoURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080/static/alonePage/audioBox.html?`
    : `file://${path.join(app.getAppPath(), 'dist/electron/static/alonePage/audioBox.html?')}`;
     global.sharedObject.video=videoURL
    ipcMain.on('IMGWIN:video',(event,arg)=>{
      console.log(arg);
      event.sender.send('Pathvalue', videoURL);
  })



  return $win

}
