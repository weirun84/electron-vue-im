import path from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'
import logo, { getNoMessageTrayIcon, getMessageTrayIcon, getMessageEmptyTrayIcon } from './logo'
import clientiot from '@hxim/clientiot'

/*传入工号*/
export default hxim => (id,data) => {
    if (hxim.$userInfoWin) {
        hxim.$userInfoWin.show()
        hxim.$userInfoWin.focus()
        return hxim.$userInfoWin
    }

    if (!id) {
        return;
    }


  const $win = new BrowserWindow({
    title: data.employeeName,
    width: 429,
    height: 536,
    resizable: false,
    center: true,
    frame: false,
    menu: false,
    transparent: false,
    maximizable: false,
    show: false,
    closable: false,
    modal: process.platform !== 'darwin',
    skipTaskbar: true,
    icon: getNoMessageTrayIcon()
  })

  $win.on('ready-to-show', () => {
    $win.show()
    $win.focus()
  })
  $win.on('closed', () => {
      hxim.$userInfoWin = null
    })


    ipcMain.on('USERINFOWIN:close', () => {
        hxim.hideUserInfoWin()
        hxim.$userInfoWin = null
    })

    $win.webContents.on('did-finish-load', function () {
        if (!id) {
            return;
        }

        //查询人员信息
        var userJson = clientiot.globalinfo.getUserInfoByJson(id);
        console.log(userJson)
        $win.webContents.send('USERINFOWIN:dataJson', userJson);
    });

  // 加载URL地址
  const URL = process.env.NODE_ENV === 'development'
      ? 'file://' + path.join(app.getAppPath(), './dist/other/userInfoWin.html')
      : `file://${path.join(app.getAppPath(), './dist/other/userInfoWin.html')}`

  $win.loadURL(URL)
  return $win
}
