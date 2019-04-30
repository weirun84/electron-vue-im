import path from 'path'
import { app, screen } from 'electron'

var icoPath = process.env.NODE_ENV === 'development' ? `./static/icons/icon.ico` : `./dist/electron/static/icons/icon.ico`;  
var emptyicoPath = process.env.NODE_ENV === 'development' ? `./static/icons/empty.ico` : `./dist/electron/static/icons/empty.ico`

export default path.join(app.getAppPath(), icoPath)

/**
 * 没有消息时的托盘图标
 */
export function getNoMessageTrayIcon() {
    if (process.platform === 'darwin') {
        return path.join(app.getAppPath(), icoPath)
    } else if (process.platform === 'win32') {
        return path.join(app.getAppPath(), icoPath)
    } else if (screen.getPrimaryDisplay().scaleFactor > 1) {
        return path.join(app.getAppPath(), icoPath)
    } else {
        return path.join(app.getAppPath(), icoPath)
    }
}

/**
 * 有消息时的托盘图标
 */
export function getMessageTrayIcon() {
    if (process.platform === 'darwin') {
        return path.join(app.getAppPath(), icoPath)
    } else if (process.platform === 'win32') {
        return path.join(app.getAppPath(), icoPath)
    } else if (screen.getPrimaryDisplay().scaleFactor > 1) {
        return path.join(app.getAppPath(), icoPath)
    } else {
        return path.join(app.getAppPath(), icoPath)
    }
}

/**
 * 有消息时的托盘空图标
 */
export function getMessageEmptyTrayIcon() {
    if (process.platform === 'darwin') {
        return path.join(app.getAppPath(), emptyicoPath)
    } else if (process.platform === 'win32') {
        return path.join(app.getAppPath(), emptyicoPath)
    } else if (screen.getPrimaryDisplay().scaleFactor > 1) {
        return path.join(app.getAppPath(), emptyicoPath)
    } else {
        return path.join(app.getAppPath(), emptyicoPath)
    }
}