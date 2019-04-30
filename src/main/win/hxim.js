'use strict'

import {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    Tray,
    dialog,
    globalShortcut
} from 'electron'

import {
    initSetting,
    readSetting,
    writeSetting
} from './setting';
import {
    initSettingOld,
    readSettingOld,
    writeSettingOld
} from './settingold';
import tray from './tray';
import online from './online';
import Notify from './notify';
import App from './app';
import mainWin from './mainWin';
import emailWin from './emailWin';
import errorWin from './errorWin';
import newImgWin from './newImgWin';
import msgWin from './msgWin';
import userCardWin from './userCardWin';
import userInfoWin from './userInfoWin';
import msgLogWin from './msgLogWin';
import aboutWin from './aboutWin';
import fileMove from './fileMove';
import imgWin from './imgWin';
import settingWin from './settingWin';
import crashReporter from './crashReporter';
import autoUpdate from './autoUpdate';
import autoUpdateExe from './autoUpdateExe';
import shortcutCaptureExe from './shortcutCaptureExe';
import deletePath from './deletePath';
import shortcut from './shortcut';
import ShortcutCapture from 'shortcut-capture';
import os from 'os';

export default class HxIm {
    //查看图片窗口
    $imgWin = null
    // 托盘图标
    $tray = null
    //当前app
    $app = null
    // 主窗口
    $mainWin = null
    // 邮箱窗口
    $emailWin = null
    // 错误窗口
    $errorWin = null
    // 消息窗口
    $msgWin = null
    // 人员信息窗口
    $userCardWin = null
    // 当前登录中信息窗口
    $userInfoWin = null
    // 新的图片窗口
    $newImgWin = null
    // 下载
    $download = null
    // 消息记录窗口
    $msgLogWin = null
    // 设置窗口
    $settingWin = null
    // 关于窗口
    $aboutWin = null
    // 截图对象
    $shortcutCapture = null
    // 文件移动对象
    $fileMove = null
    // 网络情况，默认为null，必须等到页面报告状态
    online = null
    //上一次配置信息
    oldsetting = null
    // 默认配置
    setting = {
        autoupdate: false,
        keymap: {
            'shortcut-capture': ['Alt', 'Q'],
            'openSoft': ['CommandOrControl', 'Alt', 'H']
        },
        filepath: os.homedir(),
        flashframetime: 10000,
        isDeletePath: true
    }

    constructor() {
        // 同时只能运行一个人实例
        if (!app.requestSingleInstanceLock()) return app.quit()
        process.setMaxListeners(100)
        this.init().then(() => {
            // 移除窗口菜单
            Menu.setApplicationMenu(null)
            this.initMainWin()
            this.initTray()
            this.initShortcutCapture()
            this.initNotify()
            this.initApp()
            this.autoUpdateExe()
            this.bindShortcut()
            this.showImgWin()
            this.crashReporter()
            this.fileMove()
            // this.deletePath()
        })
    }

    /**
     * 初始化
     * @return {Promise} setting
     */
    async init() {
        online(this)()
        this.setting = await initSetting(this)()
        await initSettingOld(this)()
        // 第二次打开应用，显示主窗口
        app.on('second-instance', (event, commandLine, workingDirectory) => this.showMainWin())
        return app.whenReady()

        // 奔溃的时候重启
        app.on('will-finish-launching', () => {
            this.showMsgWin(JSON.stringify({
                title: "错误",
                message: "出现未知错误",
                type: "error"
            }))
            this.$app.relaunch()
        })
    }

    /**
     * 初始化主窗口
     */
    initMainWin() {
        this.$mainWin = mainWin(this)()
    }

    /**
     * 初始化托盘图标
     */
    initTray() {
        this.$tray = tray(this)()
    }

    /**
     * 初始化截图
     */
    initShortcutCapture() {
        this.$shortcutCapture = new ShortcutCapture()

    }

    /**
     * 初始化消息提示
     */
    initNotify() {
        this.$notify = new Notify()
        ipcMain.on('notify', (e, body) => this.$notify.show(body))
        this.$notify.on('click', () => this.showMainWin())
    }

    /**
     * 初始化app实例
     */
    initApp() {
        this.$app = new App()
    }

    /**
     * 从文件中读取设置信息
     * @return {Promise} setting
     */
    readSetting() {
        return readSetting(this)()
    }

    /**
     * 写入设置到文件
     * @return {Promise} setting
     */
    writeSetting() {
        return writeSetting(this)()
    }

    /**
     * 从文件中读取设置信息（上一次配置信息）
     * @return {Promise} setting
     */
    readSettingOld() {
        return readSettingOld(this)()
    }

    /**
     * 写入设置到文件(上一次配置信息)
     * @return {Promise} setting
     */
    writeSettingOld(data) {
        return writeSettingOld(this)(data)
    }

    /**
     * 退出应用
     */
    quit() {
        BrowserWindow.getAllWindows().forEach(item => {
            if (!item.isDestroyed()) item.destroy()
        })
        if (process.platform !== 'darwin') {
            if (this.$tray && !this.$tray.isDestroyed()) {
                this.$tray.destroy()
                this.$tray = null
            }
            this.$app.quit()
        }
    }


    /**
     * 绑定快捷键
     */
    bindShortcut() {
        shortcut(this)()
    }

    /**
     * 显示主窗口
     */
    showMainWin() {
        if (this.$mainWin) {
            if (this.online) {
                if (this.$mainWin.isMinimized()) this.$mainWin.restore()
                this.$mainWin.show()
                this.$mainWin.focus()
                this.$notify.clearTwinkle(this.$tray);
            } else if (this.online === false) {
                /**
                 * this.online === null不显示
                 * 因为可能此时还没有初始化online
                 * 即$mainWin还没有触发dom-ready
                 */
                this.showErrorWin()
            }
        }
    }

    /**
     * 截图
     */
    shortcutCapture() {
        if (this.shortcutCapture) {
            this.$shortcutCapture.shortcutCapture()
        }
    }

    /**
     * 显示邮箱窗口
     * @param {Object} storage
     */
    showEmailWin(storage) {
        this.$emailWin = emailWin(this)(storage)
    }

    /**
     * 显示错误窗口
     */
    showErrorWin() {
        this.$errorWin = errorWin(this)()
    }

    /**
     * 隐藏错误窗口
     */
    hideErrorWin() {
        if (this.$errorWin) {
            this.$errorWin.destroy()
        }
    }

    /**
     * 显示消息窗口
     */
    showMsgWin(content) {
        this.$msgWin = msgWin(this)(content)
    }

    /**
     * 隐藏消息窗口
     */
    hideMsgWin() {
        if (this.$msgWin) {
            this.$msgWin.destroy()
        }
    }

    /**
 * 显示人员卡片信息窗口
 */
    showUserCardWin(id,data) {
        this.$userCardWin = userCardWin(this)(id,data)
    }

    /**
     * 隐藏人员卡片信息窗口
     */
    hideUserCardWin() {
        if (this.$userCardWin) {
            this.$userCardWin.destroy()
        }
    }

    /**
* 显示人员信息窗口
*/
    showUserInfoWin(id, data) {
        this.$userInfoWin = userInfoWin(this)(id, data)
    }

    /**
     * 隐藏人员信息窗口
     */
    hideUserInfoWin() {
        if (this.$userInfoWin) {
            this.$userInfoWin.destroy()
        }
    }

    /**
     * 显示图片窗口
     */
    showNewImgWin(content) {
        this.$newImgWin = newImgWin(this)(content)
    }

    /**
     * 隐藏图片窗口
     */
    hideNewImgWin() {
        if (this.$newImgWin) {
            this.$newImgWin.destroy()
        }
    }

    /**
     * 显示消息记录窗口
     */
    showMsgLogWin(syncData) {
        this.$msgLogWin = msgLogWin(this)(syncData)
    }

    /**
     * 隐藏消息记录窗口
     */
    hideMsgLogWin() {
        if (this.$msgLogWin) {
            this.$msgLogWin.destroy()
        }
    }

    /**
     * 显示设置窗口
     */
    showSettingWin() {
        this.$settingWin = settingWin(this)()
    }
    /**
     * 显示图片窗口
     */
    showImgWin() {
        this.$imgWin = imgWin(this)()
    }


    /**
     * 关闭设置窗口
     */
    hideSettingWin() {
        if (this.$settingWin) {
            this.$settingWin.destroy()
        }
    }

    /**
     * 显示关于窗口
     */
    showAboutWin() {
        this.$aboutWin = aboutWin(this)()
    }

    /**
     * 移动文件
     */
    fileMove() {
        this.$fileMove = fileMove(this)()
    }

    /**
     * 清空文件
     */
    deletePath() {
        deletePath(this)()
    }

    /**
     * 检查更新
     */
    autoUpdate() {
        autoUpdate(this)()
    }

    /**
     * 检查更新(调用本地exe)
     */
    autoUpdateExe(mode) {
        autoUpdateExe(this)(mode)
    }

    /**
     * 崩溃日志
     */
    crashReporter() {
        crashReporter(this)()
    }

    /**
     * 截图(调用本地exe)
     */
    shortcutCaptureExe(mode) {
        shortcutCaptureExe(this)(mode)
    }
}