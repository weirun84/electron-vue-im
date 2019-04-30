import { ipcRenderer } from 'electron'

export default () => {
  const $ul = document.createElement('ul')
  $ul.setAttribute('class', 'hxim-window-operations')

  // 按钮className，同时也是事件名称
    //const li = ['window-close', 'window-maximization', 'window-minimize']
    const li = [{ class: 'window-close', title: '关闭' }, { class: 'window-maximization', title: '最大化' },{ class: 'window-minimize', title: '最小化' }]


  li.forEach(item => {
    // 创建按钮
      const $li = document.createElement('li')
      $li.setAttribute('class', `operation-button ${item.class}`)
      $li.setAttribute('title', `${item.title}`)
    $ul.appendChild($li)

    // 点击按钮通知主进程
      $li.addEventListener('click', () => ipcRenderer.send(`MAINWIN:${item.class}`))
  })
  // 把生成的按钮添加到DOM
  const $layoutContainer = document.querySelector('#layout-container')
  if ($layoutContainer) {
    document.body.insertBefore($ul, $layoutContainer.nextSibling)
  } else {
    document.body.appendChild($ul)
  }


    ipcRenderer.on('MAINWIN:maximize', function (event, arg) {
        var $li = document.querySelector(".window-maximization");
        $li.setAttribute('class', `operation-button window-restore`)
        $li.setAttribute('title', `还原`)
    })

    ipcRenderer.on('MAINWIN:unmaximize', function (event, arg) {
        var $li = document.querySelector(".window-restore");
        $li.setAttribute('class', `operation-button window-maximization`)
        $li.setAttribute('title', `最大化`)
    })
}
