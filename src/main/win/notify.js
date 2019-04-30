import path from 'path'
import Events from 'events'
import { app, Notification } from 'electron'
import logo, { getNoMessageTrayIcon, getMessageTrayIcon, getMessageEmptyTrayIcon } from './logo'

var appIconTimer = null

export default class Notify extends Events {
    $notify = null

    twinkletime = 500


  /**
   * 显示提示
   * @param {String} body
   */
  show (body) {
    this.close()
    this.$notify = new Notification({
      title: '华夏IM通知',
      body,
        icon: getNoMessageTrayIcon()
      })
      console.log("是否支持通知：" + Notification.isSupported())

    this.$notify.on('click', () => {
      this.close()
      this.emit('click')
    })
    this.$notify.show()
  }

    /**
     * 托盘闪烁
     * */
    twinkle(appIcon) {
        var count = 0;
        if (this.twinkletime > 0 && !appIconTimer) {
            appIconTimer = setInterval(function () {
                count++;
                if (count % 2 == 0) {
                    appIcon.setImage(getMessageEmptyTrayIcon());
                } else {
                    appIcon.setImage(getNoMessageTrayIcon());
                }
            }, this.twinkletime);
        }
    }
    clearTwinkle(appIcon) {
        if (!!appIconTimer) {
            appIcon.setImage(getNoMessageTrayIcon());
        }
        clearInterval(appIconTimer);
        appIconTimer = null;
    }

  /**
   * 关闭提示
   */
  close () {
    if (this.$notify) {
      this.$notify.close()
        this.$notify = null

    }
  }
}
