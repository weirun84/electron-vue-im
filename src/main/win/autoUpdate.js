import {
  app,
  dialog,
  shell
} from 'electron'
import axios from 'axios'
import { autoUpdater } from 'electron-updater'

export default hxim => () => {
  autoUpdater.on('update-downloaded', info => {
      dialog.showMessageBox(hxim.$mainWin, {
      type: 'question',
      title: '立即更新',
      message: `新版本${info.version}已经下载完成，是否立即更新？`,
      noLink: true,
      buttons: ['是', '否']
    }, index => {
      if (index === 0) {
        autoUpdater.quitAndInstall()
      }
    })
  })

  autoUpdater.on('error', e => {
    axios.get('http://mobileportal-test.g5air.com:8030/hxim/update.txt')
        .then(({ data }) => {

            var sss = data.substring(data.indexOf("ProductVersion = "), index);
            // console.log(sss);
            data = data.substring(index + 1);
            index = data.indexOf('\n');
        // 检查版本号
        // 如果本地版本小于远程版本则更新
        if (data.tag_name.slice(1) > app.getVersion()) {
            dialog.showMessageBox(hxim.$mainWin, {
            type: 'question',
            title: '版本更新',
            message: '已有新版本更新，是否立即前往下载最新安装包？',
            noLink: true,
            buttons: ['是', '否']
          }, index => {
            if (index === 0) {
                shell.openExternal('http://mobileportal-test.g5air.com:8030/hxim/hxim.exe')
            }
          })
        }
      })
  })

    if (hxim.setting.autoupdate) {
    autoUpdater.checkForUpdates()
  }
}
