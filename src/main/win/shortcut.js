import { globalShortcut, dialog, Notification, ipcRenderer } from 'electron'

export default hxim => () => {
    const actions = {
        'shortcut-capture': () => hxim.shortcutCaptureExe(),
        'openSoft': () => hxim.showMainWin()
    }

    const keymap = hxim.setting.keymap
  // 注销所有的快捷键
  globalShortcut.unregisterAll()
  Object.keys(actions)
    .forEach(key => {
        if (keymap[key] && keymap[key].length) {
            //if (globalShortcut.unregister(keymap[key].join('+'))) {
                globalShortcut.register(keymap[key].join('+'), actions[key])
            //}
            //else {

            //    if (Notification.isSupported()) {
            //        hxim.$notify.show(keymap[key].join('+') + '.已被占用')
            //    }
            //    else {

            //        dialog.showMessageBox(hxim.$mainWin, {
            //            type: 'question',
            //            title: '热键占用提示',
            //            message: keymap[key].join('+') + '.已被占用,是否更换？',
            //            noLink: true,
            //            buttons: ['是', '否']
            //        }, index => {
            //            if (index === 0) {
            //                hxim.showSettingWin()
            //            }
            //        })
            //    }
            //}
      }
    })
}
