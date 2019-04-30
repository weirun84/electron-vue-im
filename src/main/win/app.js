import path from 'path'
import Events from 'events'
import { app, Notification } from 'electron'
import clientiot from '@hxim/clientiot'
import logo, { getNoMessageTrayIcon, getMessageTrayIcon, getMessageEmptyTrayIcon } from './logo'



export default class App extends Events {

    /**
 * 退出应用
 */
    quit() {
        clientiot.sqllite.close();
        app.quit()
    }

  /**
   * 重启应用
   */
    relaunch() {
       //clientiot.sqllite.close();
       app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
       app.exit(0)
  }


    /**
     * 设置应用程序名称与图标
     * @param {any} name
     * @param {any} icoPath
     */
    setName(name) {
        if (name) {
            app.setName(name)
        }
        else {
            app.setName(app.getName())
        }
    }

    recordCrash() {
        return new Promise(resolve => {
            // 崩溃日志请求成功.... 
            //clientiot.sqllite.close();
            resolve();
        })
    }

    reloadWindow(mainWin) {
        if (mainWin.isDestroyed()) {
            app.relaunch();
            app.exit(0);
        } else {
            BrowserWindow.getAllWindows().forEach((w) => {
                if (w.id !== mainWin.id) w.destroy();
            });
            mainWin.reload();
        }
    }




}
