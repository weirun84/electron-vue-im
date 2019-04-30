import path from 'path'
import { app, ipcMain, dialog } from 'electron'
import clientiot from '@hxim/clientiot'
import logo, { getNoMessageTrayIcon, getMessageTrayIcon, getMessageEmptyTrayIcon } from './logo'
import { setTimeout, clearInterval } from 'timers';
import localStorage from 'localStorage';
import fs from 'fs';

export default hxim => async () => {

    var setting = await hxim.readSetting();

    if (setting.isDeletePath == false) {
        return;
    }

    clientiot.sqllite.close();

    clientiot.globalinfo.endActiveMq();


    function delDir(path) {
        let files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach((file, index) => {
                let curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) {
                    delDir(curPath); //递归删除文件夹
                } else {
                    fs.unlinkSync(curPath); //删除文件
                }
            });
            fs.rmdirSync(path);
        }
    }

    delDir(setting.filepath);


    localStorage.clear();

    hxim.setting.isDeletePath = false;

    await hxim.writeSetting();
}
