import path from 'path'
import contextMenu from './contextMenu'
import contextMenu_text from './contextMenu_text'
import {
    autoUpdater
} from 'electron-updater'
import {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} from 'electron'
import logo, {
    getNoMessageTrayIcon,
    getMessageTrayIcon,
    getMessageEmptyTrayIcon
} from './logo'
import clientiot from '@hxim/clientiot'

export default hxim => (syncData) => {
    if (hxim.$msgLogWin) {
        hxim.$msgLogWin.show()
        hxim.$msgLogWin.focus()
        return hxim.$msgLogWin
    }

    const $win = new BrowserWindow({
        title: '消息记录',
        width: 451,
        height: 650,
        useContentSize: true,
        resizable: false,
        center: true,
        frame: false,
        menu: false,
        transparent: true,
        show: false,
        closable: false,
        modal: process.platform !== 'darwin',
        skipTaskbar: true,
        icon: getNoMessageTrayIcon(),
        webPreferences: {
            webSecurity: false
        }
    })
    $win.webContents.openDevTools();



    //$win.on('ready-to-show', () => {
        $win.show()
        $win.focus()
     //})

    $win.webContents.on('crashed', function () {
        const options = {
            type: 'info',
            title: '渲染器进程崩溃',
            message: '这个进程已经崩溃.',
            buttons: ['重载', '关闭']
        }
        dialog.showMessageBox(options, function (index) {
            if (index === 0) $win.reload()
            else $win.close()
        })
    })

    // 窗口关闭后手动让$window为null
    $win.on('closed', () => {
        hxim.$msgLogWin = null
    })

    ipcMain.on('MSGLOGWIN:close', () => {
        hxim.hideMsgLogWin()
        ipcMain.removeListener('MSGLOGWIN:SelectData', function () {
            console.log("移除事件")
        })
    })

    $win.webContents.on('dom-ready', () => {
        if (!$win.webContents.isDestroyed()) {
            $win.webContents.send('dom-ready')
            $win.webContents.send('SyncData', syncData)
        }
    })

    // 右键上下文菜单
    $win.webContents.on('context-menu', (e, params) => {
        e.preventDefault()
        contextMenu($win, params)
    })

    //查询数据
    ipcMain.on('MSGLOGWIN:SelectData', function (event, data) {
        clientiot.sqllite.getHxImMsg({
            where: data.sqlWhere,
            limit: data.pageSize,
            order: [
                ['localTime', 'desc']
            ],
            offset: data.pageSize * (data.pageIndex - 1)
        }, function (res) {
            //event.sender.send('SelectData', res);
            //$win.webContents.send('SelectData', res)
            event.returnValue = res;
        });

    })

    //文件下载
    ipcMain.on('MSGLOGWIN:downFile', (event, value) => {
        clientiot.awss31.DownloadFile(value.code, "/profile/images/", function (res) {
            try {
                var resData = JSON.parse(res);
                //resData.data.message_key = value.message_key;

                console.log(resData);
                if (hxim.$msgLogWin) {
                    $win.webContents.send('ipcDown', resData, value);
                }
                if (resData.errorCode == 200) {
                    var localPath = resData.data.rootPath + resData.data.thisDir
                    clientiot.sqllite.updateHxImMsg({
                        localPath: localPath
                    }, {
                            message_key: value.message_key
                        }, function (res) {
                            console.log(res)
                        })

                }
            }
            catch (error) {
                console.log(error);
            }
        }, value.name)
    })

    // 右键上下文菜单（当鼠标指针改变的时候触发）
    //$win.webContents.on('cursor-changed', (e, params) => {
    //    e.preventDefault()
    //    contextMenu_text($win, params)
    //})


    // 加载URL地址
    const URL = process.env.NODE_ENV === 'development' ?
       'file://' + path.join(app.getAppPath(), './dist/other/msgLogWin.html') :
       `file://${path.join(app.getAppPath(), './dist/other/msgLogWin.html')}`

    // 加载URL地址
       //const URL = process.env.NODE_ENV === 'development' ?
       //    `http://localhost:9080/index.html#msglog` :
       //    `file://${__dirname}/index.html#msglog`

    $win.loadURL(URL)
    return $win
}