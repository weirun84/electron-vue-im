import path from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'
import logo, { getNoMessageTrayIcon, getMessageTrayIcon, getMessageEmptyTrayIcon } from './logo'
import clientiot from '@hxim/clientiot'

/*传入工号*/
export default hxim => (id,data) => {
    if (hxim.$userCardWin) {
        hxim.$userCardWin.show()
        hxim.$userCardWin.focus()
        return hxim.$userCardWin
    }

    if (!id) {
        return;
    }


    const $win = new BrowserWindow({
        title: '人员信息',
        x: data.x,
        y: data.y,
        width: 370,
        height: 336,
        resizable: false,
        center: true,
        frame: false,
        menu: false,
        transparent: true,
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
      hxim.$userCardWin = null
    })

    $win.on('blur', () => {
        hxim.hideUserCardWin()
        hxim.$userCardWin = null
    })

    ipcMain.on('USERCARDWIN:close', () => {
        hxim.hideUserCardWin()
        hxim.$userCardWin = null
    })

    $win.webContents.on('did-finish-load', function () {
        if (!id) {
            return;
        }

        //查询人员信息
        var userJson = clientiot.globalinfo.getUserInfoByJson(id);
        console.log(userJson)
        $win.webContents.send('USERCARDWIN:dataJson', userJson);
    });

  // 加载URL地址
  const URL = process.env.NODE_ENV === 'development'
      ? 'file://' + path.join(app.getAppPath(), './dist/other/userCardWin.html')
      : `file://${path.join(app.getAppPath(), './dist/other/userCardWin.html')}`

  $win.loadURL(URL)
  return $win
}
