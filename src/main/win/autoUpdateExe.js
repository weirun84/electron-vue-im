import {
  app,
  shell
} from 'electron'
import path from 'path'
import fs from 'fs'
export default hxim => (mode) => {

    if (hxim.setting.autoupdate) {
        //autoUpdater.checkForUpdates()
        //调用打包软件的更新（暂时禁用）
        //if (process.env.NODE_ENV != 'development') {
        //    if (process.platform === 'win32') {
        //        try {
        //            var stat = fs.existsSync(path.join(app.getAppPath(), "./../../HxImUpdater.exe"));

        //            if (stat) {
        //                shell.openItem(path.join(app.getAppPath(), "./../../HxImUpdater.exe"));
        //            }
        //            else {
        //                if (mode == "click") {
        //                    hxim.showMsgWin(JSON.stringify({ title: "提示", message: "更新服务不存在", type: "info" }))
        //                }
        //            }
        //        }
        //        catch (error) {
        //            console.log(error)
        //        }
        //    }
        //}
    }
}
