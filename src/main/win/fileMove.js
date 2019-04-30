import path from 'path'
import { app, ipcMain, dialog } from 'electron'
import clientiot from '@hxim/clientiot'
import logo, { getNoMessageTrayIcon, getMessageTrayIcon, getMessageEmptyTrayIcon } from './logo'
import { setTimeout, clearInterval } from 'timers';

export default  hxim => async () => {
    if (hxim.$fileMove) {
        return
    }

    var oldSetting = await hxim.readSettingOld();

    //如果上次配置跟本次配置的路径一直，则退出
    if (oldSetting.filepath == hxim.setting.filepath) {
        return;
    }


    console.log("fileSetting.fileMove:" + oldSetting.fileMove)
    if (hxim.setting.fileMove != true) {
        return;
    }


    const filePath = hxim.setting.filepath
    hxim.$app.setName("正在移动文件....");

    //切换目录

    var fileMoveTimer = null,t=0;

    fileMoveTimer = setInterval(function () {

        hxim.$mainWin.setProgressBar(t);

        hxim.$msgWin.webContents.send("FILEMOVE:Progress", t*100);

        t=t+0.01;
    }, 400)

    //打开消息框
    hxim.showMsgWin(JSON.stringify({ title: "移动文件", message: "正在移动文件，请等待完成", type: "info", progress: true }))
    hxim.$tray=null;
    clientiot.globalinfo.endActiveMq();
    //clientiot.sqllite.close();
    try {
        console.log("开始移动文件1")
        clientiot.globalinfo.updateFilePath(filePath, function (fileDirs, fileList) {
            clearInterval(fileMoveTimer);
            hxim.$msgWin.webContents.send("FILEMOVE:Progress", 100);
            hxim.$mainWin.setProgressBar(-1);

            clientiot.sqllite.close();

            hxim.setting.fileMove = false
            hxim.writeSetting()
            hxim.initTray();
            hxim.hideMsgWin();
        })
    }
    catch (error) {
        console.log(error)
        hxim.initTray()
        hxim.showMsgWin(JSON.stringify({ title: "移动文件", message: "文件移动失败，数据库文件正在使用中，下次重启软件时再试", type: "info" }))
    }

}
