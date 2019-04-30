const views = [
  {
    key: 'errorWin',
    title: '网络错误'
  },
  {
    key: 'settingWin',
    title: '设置'
  },
  {
    key: 'aboutWin',
    title: '关于'
  },
    {
        key: 'msgWin',
        title: '消息提醒'
    },
    {
        key: 'msgLogWin',
        title: '消息记录'
    },
    {
        key: 'newImgWin',
        title: '图片查看器'
    },
    {
        key: 'userCardWin',
        title: '人员卡片信息'
    },
    {
        key: 'userInfoWin',
        title: '人员信息'
    }
]

module.exports = {
  entries (entry) {
    return views.reduce((entries, view) => ({ ...entries, [view.key]: entry(view) }), {})
  },
  htmlWebpackPlugins (pligin) {
    return views.reduce((plugins, view) => ([...plugins, pligin(view)]), [])
  }
}
