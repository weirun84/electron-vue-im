import path from 'path'
import { app, Tray, Menu, screen } from 'electron'
import logo, { getNoMessageTrayIcon, getMessageTrayIcon, getMessageEmptyTrayIcon } from './logo'
import fs from 'fs'

export default hxim => () => {
    if (hxim.$tray) {
    return
    }

  // 生成托盘图标及其菜单项实例
    const $tray = new Tray(getNoMessageTrayIcon())


  // 设置鼠标悬浮时的标题
    $tray.setToolTip('华夏IM')
  // 绑定菜单
  $tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: '显示窗口',
          click: () => hxim.showMainWin()
    },
    //{
    //  label: '消息窗口',
    //    click: () => hxim.showMsgLogWin()
    //},
    //{
    //      label: '查看图片',
    //    click: () => hxim.showNewImgWin()
    //},
    {
      label: '设置',
        click: () => hxim.showSettingWin()
    },
    {
      label: '关于',
        click: () => hxim.showAboutWin()
    },
    {
      label: '退出',
        click: () => hxim.quit()
    }
  ]))
  if (screen.getPrimaryDisplay().scaleFactor > 1 && process.platform !== 'darwin') {
      $tray.setImage(getNoMessageTrayIcon())
  } else if (process.platform === 'darwin') {
      $tray.setImage(getNoMessageTrayIcon())
  }
    $tray.on('click', () => hxim.showMainWin())
    $tray.on('double-click', () => hxim.showMainWin())

  return $tray
}
