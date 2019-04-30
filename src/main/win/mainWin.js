import fs from 'fs'
import path from 'path'
import download from './download'
import contextMenu from './contextMenu'
import {
    app,
    BrowserWindow,
    shell,
    ipcMain,
    screen,
    nativeImage
} from 'electron'
import logo, {
    getNoMessageTrayIcon,
    getMessageTrayIcon,
    getMessageEmptyTrayIcon
} from './logo'
import clientiot from '@hxim/clientiot'
import {
    setTimeout
} from 'timers';

export default hxim => () => {
    if (hxim.$mainWin) {
        hxim.showMainWin()
        return
    }

    const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`;

    // 创建浏览器窗口
    const $win = new BrowserWindow({
        title: '华夏IM',
        width: 420,
        height: 326,
        center: true,
        resizable: false,
        frame: false,
        titleBarStyle: 'customButtonsOnHover',
        show: false,
        backgroundColor: '#d9d9d9',
        icon: getNoMessageTrayIcon(),
        webPreferences: {
            webSecurity: false
        }
    })
    $win.webContents.openDevTools();
    // BrowserWindow.addDevToolsExtension('C:/Users/wangchengwei/AppData/Local/Google/Chrome/User Data/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/4.1.5_0');
    //BrowserWindow.addExtension(path.join(path.join(app.getAppPath(), 'static/ext/hkcpnnnggfkfbmlgpboabgbipkpgfelm/1.8_0')));


    $win.setAlwaysOnTop(true)

    /**
     * 优雅的显示窗口
     */
    $win.once('ready-to-show', () => {
        $win.show()
        $win.focus()
    })

    /**
     * 窗体关闭事件处理
     * 默认只会隐藏窗口
     */
    $win.on('close', (e) => {
        e.preventDefault()
        $win.hide()
    })

    /*
     *窗体崩溃
     */
    $win.webContents.on('crashed', () => {
        const options = {
            type: 'error',
            title: '进程崩溃了',
            message: '这个进程已经崩溃.',
            buttons: ['重载', '退出'],
        };
        hxim.$app.recordCrash().then(() => {
            dialog.showMessageBox(options, (index) => {
                if (index === 0) hxim.$app.reloadWindow($win);
                else app.quit();
            });
        }).catch((e) => {
            console.log('err', e);
        });
    })

    /**
     * 窗体最大化事件处理
     */
    $win.on('maximize', (event) => {
        event.sender.send('MAINWIN:maximize');
    })

    /**
     * 当窗口从最大化状态退出时触发
     */
    $win.on('unmaximize', (event) => {
        event.sender.send('MAINWIN:unmaximize');
    })



    $win.webContents.on('dom-ready', () => {
        const filename = path.join(app.getAppPath(), './dist/preload/mainWin.js')
        // 读取js文件并执行
        fs.access(filename, fs.constants.R_OK, err => {
            if (err) return
            fs.readFile(filename, (error, data) => {
                if (error || $win.webContents.isDestroyed()) return
                $win.webContents.executeJavaScript(data.toString(), () => {
                    if (!$win.webContents.isDestroyed()) $win.webContents.send('dom-ready')
                })
            })
        })
    })

    // 右键菜单
    $win.webContents.on('context-menu', (e, params) => {
        e.preventDefault()
        contextMenu($win, params)
    })

    // 浏览器中打开链接
    $win.webContents.on('new-window', (e, url) => {
        e.preventDefault()
        if (url !== 'about:blank') {
            shell.openExternal(url)
        }
    })

    // 主窗口导航拦截
    $win.webContents.on('will-navigate', (e, url) => {
        e.preventDefault()
        //if (url !== 'about:blank' && url !== 'https://im.dingtalk.com/') {
        //  shell.openExternal(url)
        //}
    })

    //改变窗体参数
    ipcMain.on('MAINWIN:UpdateBrowserWindow', function (event, width, height, maximizable) {
        hxim.$mainWin.hide();
        hxim.$mainWin.setSize(width, height, false);
        hxim.$mainWin.setResizable(true);
        hxim.$mainWin.setMinimumSize(width, height);

        setTimeout(function () {
            hxim.$mainWin.show();
            hxim.$mainWin.center();
            hxim.$mainWin.setMaximizable(maximizable);
            hxim.$mainWin.setAlwaysOnTop(false)
        }, 2000)
    })

    //退出登录
    ipcMain.on('MAINWIN:LoginOut', function (event, width, height, maximizable) {
        hxim.$mainWin.hide();
        hxim.$mainWin.setSize(width, height, false);
        hxim.$mainWin.setResizable(false);
        hxim.$mainWin.setMaximizable(maximizable);

        hxim.$mainWin.setAlwaysOnTop(true)
    })

    //消息记录下载文件
    ipcMain.on('MAINWIN:MESSFILEDOWN', function (event, arg) {
        console.log(arg)
        // event.sender.send('MESSPATHVALUE', arg)
        $win.webContents.send('MESSPATHVALUE', arg);
    });
    //注册mqtt
    ipcMain.on('MAINWIN:RegMqtt', function (event, arg) {
        console.log("regmqtt")
        clientiot.globalinfo.regUserActiveMq(function (topic, res) {
            event.sender.send('MqttContent', res, topic);
        });

    })

    //截图
    ipcMain.on('MAINWIN:Screenshot', function (event, arg) {
        console.log("Screenshot")
        //hxim.shortcutCapture();
        hxim.shortcutCaptureExe()
        //$win.hide();
        //hxim.$shortcutCapture.on('capture', ({ dataURL, bound }) => {
        //    console.log(dataURL, bound)
        //    event.sender.send('capture', dataURL, bound);
        //    $win.focus();
        //})

    })



    //任务栏突出显示，闪烁框
    ipcMain.on('MAINWIN:flashFrame', function (event, arg) {
        if ($win.isMinimized() || !$win.isFocused()) {
            $win.once('focus', () => {
                $win.flashFrame(false);
                hxim.$notify.clearTwinkle(hxim.$tray);
            })
            $win.flashFrame(true)

            hxim.$notify.twinkle(hxim.$tray);
            //hxim.$notify.show("收到新消息");
        }

        if (arg) {
            hxim.$mainWin.setTitle(arg);
        }

    })

    //设置当前app信息
    ipcMain.on('MAINWIN:setApp', function (event, arg) {
        hxim.$app.setName(arg)
    })


    //设置当前窗体信息（标题与图标）
    ipcMain.on('MAINWIN:setWinTitleAndIcon', function (event, title, icon) {
        if (!icon) {
            icon = getNoMessageTrayIcon();
        }

        //console.log("icon:" + icon);
        //console.log("title:" + title);
        //hxim.$mainWin.setIcon(nativeImage.createFromPath(icon))
        hxim.$mainWin.setTitle(title)
    })


    //设置在底部任务栏右边显示图标（Windows 7+）
    ipcMain.on('MAINWIN:setOverlayIcon', (event, overlay, description) => {
        //console.log("overlay:" + nativeImage.createFromPath(path.join("D:\\Desktop\\dingtalk-master\\icon", "16x16.png")));
        //console.log("description:" + description)
        //$win.setOverlayIcon(nativeImage.createFromPath(path.join("D:\\Desktop\\dingtalk-master\\icon", "16x16.png")), description);
    })

    //打开消息记录
    ipcMain.on('MAINWIN:msgLogWin', (event, syncData) => {
        hxim.showMsgLogWin(syncData);
    })

    //打开人员卡片信息
    ipcMain.on('MAINWIN:userCardWin', (event, id, data) => {
        hxim.showUserCardWin(id, data);
    })

    //打开人员信息
    ipcMain.on('MAINWIN:userInfoWin', (event, id, data) => {
        hxim.showUserInfoWin(id, data);
    })

    //重启程序
    ipcMain.on('MAINWIN:restart', () => {
        hxim.$app.relaunch();
    })

    //打开消息提示窗
    ipcMain.on('MAINWIN:msgWin', (event, arg) => {
        hxim.showMsgWin(arg)
    })

    //获取项目路径
    ipcMain.on('MAINWIN:appPath', function (event, arg) {
        var pathValue = app.getAppPath();

        console.log(pathValue);
        event.sender.send('Pathvalue', pathValue)
    })

    //获取文件路径，打包之后文件路径为dist/electron/static/...,开发路径为static/....
    ipcMain.on('MAINWIN:developmentPath', function (event, arg) {
        var pathValue = app.getAppPath();
        var developmentPath = process.env.NODE_ENV === 'development' ? `` : `./dist/electron/`;
        var developmentPathValue = path.join(pathValue, developmentPath);
        event.sender.send('DevelopmentPathvalue', developmentPathValue)
    })


    ipcMain.on('MAINWIN:window-minimize', () => $win.minimize())

    ipcMain.on('MAINWIN:window-maximization', () => {
        if ($win.isMaximized()) {
            $win.unmaximize()
        } else {
            $win.maximize()
        }
    })

    ipcMain.on('MAINWIN:window-close', () => $win.hide())
    ipcMain.on('MAINWIN:open-email', (e, storage) => hxim.showEmailWin(storage))

    ipcMain.on('MAINWIN:window-show', () => {
        $win.show()
        $win.focus()
    })
    ipcMain.on('MAINWIN:badge', (e, count) => {
        app.setBadgeCount(count)
        if (hxim.$tray) {
            hxim.$tray.setImage(count ? getMessageTrayIcon() : getNoMessageTrayIcon())
        }
        if (app.dock) {
            app.dock.show()
            app.dock.bounce('critical')
        }
    })
    download($win)
    // 加载URL地址
    $win.loadURL(winURL)
    return $win
}