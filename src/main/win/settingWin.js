import path from 'path'
import contextMenu from './contextMenu'
import { autoUpdater } from 'electron-updater'
import { app, BrowserWindow, ipcMain } from 'electron'
import clientiot from '@hxim/clientiot'
import logo, { getNoMessageTrayIcon, getMessageTrayIcon, getMessageEmptyTrayIcon } from './logo'

export default hxim => () => {
    if (hxim.$settingWin) {
        hxim.$settingWin.show()
        hxim.$settingWin.focus()
        return hxim.$settingWin
    }


  const $win = new BrowserWindow({
    title: '设置',
    width: 320,
    height: 420,
    useContentSize: true,
    resizable: true,
    menu: false,
    parent: hxim.$mainWin,
    modal: process.platform !== 'darwin',
    show: false,
      icon: getNoMessageTrayIcon()
  })

    $win.on('ready-to-show', () => {
        hxim.$mainWin.show()
        $win.show()
        $win.focus()
  })

  // 窗口关闭后手动让$window为null
  $win.on('closed', () => {
      hxim.$settingWin = null
  })

  $win.webContents.on('dom-ready', () => {
      $win.webContents.send('dom-ready', hxim.setting)
  })

  // 右键上下文菜单
  $win.webContents.on('context-menu', (e, params) => {
    e.preventDefault()
    contextMenu($win, params)
  })

    ipcMain.on('SETTINGWIN:setting', async (e, setting) => {

        var oldSetting = await hxim.readSetting(), newSetting = setting;

        console.log("oldSetting:" + JSON.stringify(oldSetting))
        console.log("newSetting:" + JSON.stringify(newSetting))

      await hxim.writeSettingOld(oldSetting)

      hxim.setting = setting
      hxim.bindShortcut()
    //  if (hxim.setting.autoupdate) {
    //  autoUpdater.checkForUpdates()
    //}
        hxim.hideSettingWin();

        //先保存到配置文件里面，重启之后开始移动文件
        if (oldSetting.filepath != newSetting.filepath) {
            //hxim.fileMove();
            clientiot.globalinfo.endActiveMq();
            clientiot.sqllite.close();
            hxim.quit();
            hxim.$app.relaunch();
        }


        hxim.setting.fileMove = oldSetting.filepath != newSetting.filepath;

        await hxim.writeSetting()
  })

    // 加载URL地址
    const URL = process.env.NODE_ENV === 'development'
        ? 'file://'+path.join(app.getAppPath(), './dist/other/settingWin.html')
        : `file://${path.join(app.getAppPath(), './dist/other/settingWin.html')}`


  $win.loadURL(URL)
  return $win
}
