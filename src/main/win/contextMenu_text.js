import { Menu } from 'electron'

export default ($win, params) => {
  // 菜单执行命令
  const menuCmd = {
    copy: {
      id: 1,
      label: '复制'
    },
    cut: {
      id: 2,
      label: '剪切'
    }
  }

    console.log("params:" + JSON.stringify(params))
  // 生成菜单模板
  const template = Object.keys(menuCmd)
    .map(cmd => {
      const { id, label } = menuCmd[cmd]
      let enabled = false
      let visible = false
      //const { canCopy, canCut, canPaste, canSelectAll } = editFlags
      switch (cmd) {
        case 'copy':
          // 有文字选中就显示
          visible = true
          enabled = true
          break
        case 'cut':
          // 可以编辑就显示项目
              visible = true
              enabled = true
          break
        default:
          break
      }
      return {
        id,
        label,
        role: cmd,
        enabled,
        visible
      }
    })
    .filter(item => item.visible)
    .sort((a, b) => a.id > b.id)

  // 用模板生成菜单
  if (template.length && !$win.isDestroyed()) {
    const menu = Menu.buildFromTemplate(template)
    menu.popup($win)
  }
}
