import {
  app,
  shell
} from 'electron'
import path from 'path'
import fs from 'fs'
export default hxim => (mode) => {

    //const screenerExePath = "./../../prscrn.exe";  //微信截图
    const screenerExePath = "./../../screener.exe";  //360截图

    //调用exe截图工具
    if (process.env.NODE_ENV != 'development') {
        if (process.platform === 'win32') {
            try {
                var stat = fs.existsSync(path.join(app.getAppPath(), screenerExePath));

                if (stat) {
                    shell.openItem(path.join(app.getAppPath(), screenerExePath));
                }
                else {
                    if (mode == "click") {
                        hxim.showMsgWin(JSON.stringify({ title: "提示", message: "缺少截图模块", type: "info" }))
                    }
                }
            }
            catch (error) {
                console.log(error)
            }
        }
    }
    else {
        hxim.shortcutCapture();
    }
}
