import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import os from 'os';
/**
 * 初始化设置选项（用于记录上一次配置信息）
 */
export const initSettingOld = hxim => (data) => {
    //const filename = path.join(app.getPath('userData'), 'setting.json')
    const filename = path.join(os.homedir(), 'hximsettingfirst.data')
  return new Promise((resolve, reject) => {
    fs.access(filename, fs.constants.R_OK | fs.constants.W_OK, async err => {
      if (err) {
        if (err.code === 'ENOENT') {
            return resolve(await hxim.writeSettingOld(data))
        } else {
          return reject(err)
        }
      }
        resolve(await hxim.readSettingOld())
    })
  })
}

/**
 * 从文件中读取设置信息
 */
export const readSettingOld = hxim => () => {
    //const filename = path.join(app.getPath('userData'), 'setting.json')
    const filename = path.join(os.homedir(), 'hximsettingfirst.data')
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (err, data) => {
      if (err) return reject(err)
      try {
        const setting = JSON.parse(data)
        if (typeof setting.keymap['shortcut-capture'] === 'string') {
          setting.keymap['shortcut-capture'] = setting.keymap['shortcut-capture'].split('+')
        }
          resolve({ ...hxim.oldsetting, ...setting })
      } catch (e) {
          resolve(hxim.oldsetting)
      }
    })
  })
}

/**
 * 写入设置到文件
 */
export const writeSettingOld = hxim => (data) => {
    if (!data) {
        data = hxim.setting;
    }
    //const filename = path.join(app.getPath('userData'), 'setting.json')
    const filename = path.join(os.homedir(), 'hximsettingfirst.data')
    return new Promise((resolve, reject) => {
      fs.writeFile(filename, JSON.stringify(hxim.setting, null, 2), err => {
      if (err) return reject(err)
          resolve(hxim.setting)
    })
  })
}
