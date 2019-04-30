import Vue from 'vue';
import Vuex from 'vuex';
import router from './router';
import Events from './api/eventBus'
const ipcRenderer = require('electron').ipcRenderer;

Vue.use(Vuex);

const clientiot = require("@hxim/clientiot");
var co = require('co');
var localForage = clientiot.localForageHelper.createInstance();

function postTime(value) {
    let userId = JSON.parse(sessionStorage.getItem('currentUser')).id;
    let flag;
    value.channelType == "P" ? flag = 0 : flag = 1;
    let data = {
        "flag": flag,
        "from_id": value.id,
        "target_id": userId,
        "last_read_time": formatDate(value.messages[value.messages.length - 1].date)
    }
    co(function* () {
        let putTime = JSON.parse(yield clientiot.messages.messagesSetReadSessionTime(data));
        if (putTime.success == true) {
            console.log(value.user.name + "会话最后阅读时间更新成功" + formatDate(value.messages[value.messages.length - 1].date))
        }
        // messagesSetReadSessionTime
    })
}


//数组去重
function removeDuplicatedItem(ar) {
    var tmp = {},
        ret = [];

    for (var i = 0, j = ar.length; i < j; i++) {
        var key = ar[i].id + ar[i].channelType;
        if (!tmp[key]) {
            tmp[key] = 1;
            ret.push(ar[i]);
        }
    }

    return ret;
    //return ar;
}

function sortId(a, b) {
    return a.index - b.index;
}

function formatDate(now) {
    if (typeof now == 'string') {
        now = parseInt(now);
    }
    now = new Date(now);
    var year = now.getYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds() + 5;
    if (month < 10) {
        month = "0" + month;
    }
    if (date < 10) {
        date = "0" + date;
    }
    if (hour < 10) {
        hour = "0" + hour;
    }
    if (minute < 10) {
        minute = "0" + minute;
    }
    if (second < 10) {
        second = "0" + second;
    }
    return (1900 + year) + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
}

//获取当前时间
let GroupFriendlist = [];
var saveMessage = [];
const state = {
    //零时搜索值
    searchForward: [],
    //标识添加群的来源
    GroupDisplay: false,
    disPlayVersion: false,
    disPlayChatboxs: false,
    //搜索返回值
    searchFriendValue: [],

    //消息记录类别
    messagesTag: 'all',

    //当前会话
    selectMessageVue: '',

    //当前会话消息记录
    selectMessage: '',

    //会话列表搜索
    chatSearchText: '',

    //本地消息记录搜索
    messSearchText: '',

    //接收的通知Key
    noticKey: '',

    //接收的消息Key
    messKey: '',

    // 输入的搜索值
    searchText: '',

    // 当前登录用户
    user: {},

    // 对话好友列表
    chatlist: [],

    // 顶级部门列表
    friendlist: [],

    //子级部门列表
    initSubList: [],

    //三级部门列表
    threeDepList: [],

    //顶级部门人员列表
    departmentList: [],

    //子级部门人员列表
    subdepartmentList: [],

    //三级部门人员列表
    threedepartmentList: [],
    clearInputTxte: false,
    //设置列表项ID
    settingid: 1,
    //设置列表
    settinglist: [{
            icon: 'icon-geren',
            name: '个人信息',
            id: 1
        },
        {
            icon: 'icon-banben',
            name: '版本信息',
            id: 2
        }
    ],

    //收藏列表项ID
    collectId: 1,

    //聊天记录分类
    messlist: [{
            name: '全部',
            type: 'all'
        },
        {
            name: '文件',
            type: 'file'
        },
        {
            name: '图片',
            type: 'image'
        },
        {
            name: '视频',
            type: 'video'
        },
    ],

    //收藏分类列表
    collectlist: [],

    //收藏详情列表
    collectInfoList: [{
            contentType: 'text',
            content: '2月31号，八仙庄，聚餐',
            time: '2012-05-20',
            fromName: '叶孤城',
            fromId: 1033561,
        },
        {
            contentType: 'voice',
            content: '13月12号，侠客岛，鲸落',
            time: '2012-05-20',
            fromName: '石中玉',
            fromId: 1033561,
        },
        {
            contentType: 'voice',
            content: '11.05，绝地岛，马蹄山',
            time: '2012-05-20',
            fromName: '孤存',
            fromId: 1033561,
        },
        {
            contentType: 'video',
            content: 'static/images/UserAvatar.jpg',
            time: '2012-05-20',
            fromName: 'Snake',
            fromId: 1033561,
        },
        {
            contentType: 'video',
            content: 'static/images/viedo.png',
            time: '2012-05-20',
            fromName: 'Snake',
            fromId: 1033561,
        },
        {
            contentType: 'file',
            content: '只见美人迟暮，不许英雄白头',
            time: '2012-05-20',
            fromName: 'clearLove',
            fromId: 1033561,
        },
    ],
    // 文件后缀
    fileSuffix: [
        'css', 'ttf', 'mpp', 'node', 'vue', 'js', 'php', 'docx', 'xls', 'folder', 'zip', 'avi', 'swf', 'wav', 'txt', 'rmvb', 'xlsx', 'mkv', 'psd', 'mpg', 'exe', 'pdf', 'mp4', 'ppt', 'dll', 'mp3', 'html', 'jpg', 'doc', 'rar'
    ],
    //emoji表情
    emojis: [{
            file: '100.gif',
            code: '/::)',
            title: '微笑',
            reg: /\/::\)/g
        },
        {
            file: '101.gif',
            code: '/::~',
            title: '伤心',
            reg: /\/::~/g
        },
        {
            file: '102.gif',
            code: '/::B',
            title: '美女',
            reg: /\/::B/g
        },
        {
            file: '103.gif',
            code: '/::|',
            title: '发呆',
            reg: /\/::\|/g
        },
        {
            file: '104.gif',
            code: '/:8-)',
            title: '墨镜',
            reg: /\/:8-\)/g
        },
        {
            file: '105.gif',
            code: '/::KU',
            title: '哭',
            reg: /\/::KU/g
        },
        {
            file: '106.gif',
            code: '/::$',
            title: '羞',
            reg: /\/::\$/g
        },
        {
            file: '107.gif',
            code: '/::X',
            title: '哑',
            reg: /\/::X/g
        },
        {
            file: '108.gif',
            code: '/::Z',
            title: '睡',
            reg: /\/::Z/g
        },
        {
            file: '109.gif',
            code: '/::\'(',
            title: '哭',
            reg: /\/::'\(/g
        },
        {
            file: '110.gif',
            code: '/::-|',
            title: '囧',
            reg: /\/::-\|/g
        },
        {
            file: '111.gif',
            code: '/::@',
            title: '怒',
            reg: /\/::@/g
        },
        {
            file: '112.gif',
            code: '/::P',
            title: '调皮',
            reg: /\/::P/g
        },
        {
            file: '113.gif',
            code: '/::D',
            title: '笑',
            reg: /\/::D/g
        },
        {
            file: '114.gif',
            code: '/::O',
            title: '惊讶',
            reg: /\/::O/g
        },
        {
            file: '115.gif',
            code: '/::(',
            title: '难过',
            reg: /\/::\(/g
        },
        {
            file: '116.gif',
            code: '/::+',
            title: '酷',
            reg: /\/::\+/g
        },
        {
            file: '117.gif',
            code: '/:--b',
            title: '汗',
            reg: /\/:--b/g
        },
        {
            file: '118.gif',
            code: '/::Q',
            title: '抓狂',
            reg: /\/::Q/g
        },
        {
            file: '119.gif',
            code: '/::T',
            title: '吐',
            reg: /\/::T/g
        },
        {
            file: '120.gif',
            code: '/:,@P',
            title: '笑',
            reg: /\/:,@P/g
        },
        {
            file: '121.gif',
            code: '/:,@-D',
            title: '快乐',
            reg: /\/:,@-D/g
        },
        {
            file: '122.gif',
            code: '/::d',
            title: '奇',
            reg: /\/::d/g
        },
        {
            file: '123.gif',
            code: '/:,@o',
            title: '傲',
            reg: /\/:,@o/g
        },
        {
            file: '124.gif',
            code: '/::e',
            title: '饿',
            reg: /\/::e/g
        },
        {
            file: '125.gif',
            code: '/:|-)',
            title: '累',
            reg: /\/:\|-\)/g
        },
        {
            file: '126.gif',
            code: '/::!',
            title: '吓',
            reg: /\/::!/g
        },
        {
            file: '127.gif',
            code: '/::L',
            title: '汗',
            reg: /\/::L/g
        },
        {
            file: '128.gif',
            code: '/::gaoxing',
            title: '高兴',
            reg: /\/::gaoxing/g
        },
        {
            file: '129.gif',
            code: '/::,@',
            title: '闲',
            reg: /\/::,@/g
        },
        {
            file: '130.gif',
            code: '/:,@f',
            title: '努力',
            reg: /\/:,@f/g
        },
        {
            file: '131.gif',
            code: '/::-S',
            title: '骂',
            reg: /\/::-S/g
        },
        {
            file: '133.gif',
            code: '/:,@x',
            title: '秘密',
            reg: /\/:,@x/g
        },
        {
            file: '134.gif',
            code: '/:,@@',
            title: '乱',
            reg: /\/:,@@/g
        },
        {
            file: '135.gif',
            code: '/::8',
            title: '疯',
            reg: /\/::8/g
        },
        {
            file: '136.gif',
            code: '/:,@!',
            title: '哀',
            reg: /\/:,@!/g
        },
        {
            file: '137.gif',
            code: '/:!!!',
            title: '鬼',
            reg: /\/:!!!/g
        },
        {
            file: '138.gif',
            code: '/:xx',
            title: '打击',
            reg: /\/:xx/g
        },
        {
            file: '139.gif',
            code: '/:bye',
            title: 'bye',
            reg: /\/:bye/g
        },
        {
            file: '142.gif',
            code: '/:handclap',
            title: '鼓掌',
            reg: /\/:handclap/g
        },
        {
            file: '145.gif',
            code: '/:s@',
            title: '什么',
            reg: /\/:s@/g
        },
        {
            file: '147.gif',
            code: '/::-O',
            title: '累',
            reg: /\/::-O/g
        },
        {
            file: '153.gif',
            code: '/:@x',
            title: '吓',
            reg: /\/:@x/g
        },
        {
            file: '155.gif',
            code: '/:pd',
            title: '刀',
            reg: /\/:pd/g
        },
        {
            file: '156.gif',
            code: '/:shuiguo',
            title: '水果',
            reg: /\/:shuiguo/g
        },
        {
            file: '157.gif',
            code: '/:beer',
            title: '酒',
            reg: /\/:beer/g
        },
        {
            file: '158.gif',
            code: '/:basketb',
            title: '篮球',
            reg: /\/:basketb/g
        },
        {
            file: '159.gif',
            code: '/:oo',
            title: '乒乓',
            reg: /\/:oo/g
        },
        {
            file: '195.gif',
            code: '/:circle',
            title: '跳舞',
            reg: /\/:circle/g
        },
        {
            file: '160.gif',
            code: '/:coffee',
            title: '咖啡',
            reg: /\/:coffee/g
        }
    ],

    // 得知当前选择的是哪个对话
    selectId: 0,

    // 得知当前选择的是哪个部门
    selectDepartment: 0,
    // 得知当前会话是否显示正在输入状态
    selectIsinputState: false,
    // 得知当前选择的是哪个好友
    selectFriendId: 0,
    selectFriendAticon: 0,
    selectSendmessageAticon: {},
    // 得知当前选择的是群组：4或者顶级部门：3或者子级部门：2或者人员：1，默认为0
    selectedSort: 0,

    //确定是顶级部门还是子级部门的人员,2为顶级部门，1为子级部门
    selectdeplev: 0,

    // 判断聊天列表有无数据
    chatlistText: true,
    //添加分组列表
    groupList: [],
    //
    UploadprogNum: '',
    members: [],
    transfermembers:[],
    Atmembers: [],
    UploadprogNums: [],
    //新增人员
    NewPersonnel: false,
    Windowclosure: false,
    GroupTitle: '',
    //消息计数
    msgCounting: '',
    //禁言状态
    getUserAllowedSendStatus: true,
    //当前会话消息记录
    getMessRecode: [],
    getMessRecodeName: '',
    // 当前点击的待办事项
    taskKey: '',
    // 拉取离线消息状态
    offlineMessage: false,
    // 时间锚点
    startT:0,
    // 最新邮箱地址连接
    newEmailUrl:''

};

const mutations = {
    // 获取最新邮件地址链接
    newEmailUrl(state,value){
        state.newEmailUrl = value;
    },
    cliAt(state, value) {
        let cliItem = state.chatlist.find(sessions => sessions.id === value.id);
        cliItem.itemAt = false;
        cliItem.atAll = false;
    },
    requestList(state, value) {
        value.forEach(element => {
            element.CreateAt = element.CreateAt.substr(0, 10);
        });
        state.collectlist = value;
    },
    // 个人撤回消息通知
    pushNotic(state, value) {
        let itemChat = state.chatlist.find(items => items.id === state.selectFriendId);
        if (itemChat.channelType == "P") {
            itemChat.messages.splice(value, 1, {
                content: '你撤回了一条消息',
                date: Date.parse(new Date()),
                msgType: "notic"
            })
        }
    },

    //文件上传状态
    uploadFilePath(state, value) {
        let downCaht = state.chatlist.find(sessions => sessions.id === value.id);
        for (let i = 0; i < downCaht.messages.length; i++) {
            if (downCaht.messages[i].msgID == value.keys) {
                downCaht.messages[i].UploadStore = true;
            }
        }
        localStorage.setItem('vue-chat', JSON.stringify(state.chatlist));
    },
    // 查看当前会话的聊天记录
    showMessRecode(state, value) {

        var id = value;

        if (value instanceof Object) {
            id = value.id;
        }

        state.getMessRecode = state.chatlist.find(messages => messages.id === id).messages;
        state.getMessRecodeName = state.chatlist.find(messages => messages.id === id).user.name;
        state.getMess = state.chatlist.find(messages => messages.id === id);

        //state.getMess.messages = [];

        //localStorage.setItem("getMess", JSON.stringify(state.getMess));
        localStorage.setItem("getMess", JSON.stringify({
            id: state.getMess.id,
            name: state.getMess.user.name,
            channelType: state.getMess.channelType
        }));
    },

    //下载文件(原始的，怕有地方在用)
    downFilePath(state, value) {
        let downCaht = state.chatlist.find(sessions => sessions.id === value.id);
        if (downCaht && downCaht.messages) {
            for (let i = 0; i < downCaht.messages.length; i++) {
                if (downCaht.messages[i].messageKeys == value.keys) {
                    downCaht.messages[i].downFilePath = value.path;
                    downCaht.messages[i].downFile = value.downFile;
                    downCaht.messages[i].mediaId = value.mediaId;
                }
            }

            localStorage.setItem('vue-chat', JSON.stringify(removeDuplicatedItem(state.chatlist)));
        }
    },

    //下载文件(20190117增加)
    downFilePathNew(state, message) {
        let downCaht = state.chatlist.find(sessions => sessions.id === state.selectMessageVue.id && sessions.channelType === state.selectMessageVue.channelType);
        if (downCaht && downCaht.messages) {
            for (let i = 0; i < downCaht.messages.length; i++) {
                if (downCaht.messages[i].messageKeys == message.messageKeys) {
                    downCaht.messages[i].filePath = message.fileInfo;
                }
            }
            localStorage.setItem('vue-chat', JSON.stringify(removeDuplicatedItem(state.chatlist)));
        }
    },

    // 退出群聊
    exitGroup(state, value) {
        let GroupChat = state.chatlist.find(session => session.id === value);
        state.chatlist.splice(GroupChat.index, 1);
        for (let i = 0; i < state.chatlist.length; i++) {
            state.chatlist[i].index = i;
        }
        state.selectId = 0;
        state.selectFriendId = state.chatlist.length!=0?state.chatlist[0].id:0;
        state.selectFriendAticon = state.chatlist.length!=0?state.chatlist[0].id:0;
        
    },

    // 选择聊天记录列表
    chooseMess(state, value) {
        state.messagesTag = value.type;
    },

    //修改群名称
    modifyName(state, value) {
        let groupId = value.msg_content.group_info.group_id;
        let modifyG = state.chatlist.find(modifys => modifys.id === groupId);
        modifyG.user.name = value.msg_content.group_info.group_name;
    },

    //获取焦点
    getMessTop(state, value) {

    },

    //将接收消息的会话上移
    topMessage(state, value) {
        if (state.chatlist.length == 1) {
            state.selectFriendId = state.chatlist[0].id;
        }
        // 收到消息的是第一个会话，但不是正在阅读的会话
        if (value.index == 0 && value.id != state.selectFriendId) {
            let akali = state.chatlist.find(kalis => kalis.id === value.id);
            akali.underLen > 0 ? akali.underLen = akali.underLen + 1 : akali.underLen = 1;
        }
        // 收到消息的是第一个会话，且是正在阅读的会话
        if (value.index == 0 && value.id == state.selectFriendId) {
            value.underLen = 0;
            value.itemAt = value.AtPoples;
            value.AtPoples = false;
            postTime(value);
            return
        }
        if (value.index != 0 && value.id != state.selectFriendId) {
            // 将不是第一个但收到消息且不是当前正在阅读的会话上移
            if (!value.underLen || value.underLen == 0) {
                value.underLen = 1
            } else {
                value.underLen = value.underLen + 1;
            }
            value.index > state.selectId ? state.selectId++ : state.selectId = state.selectId;
            var topChat = state.chatlist.find(chats => chats.id === value.id)
            topChat.index = -1;
            state.chatlist.sort(sortId)
            for (let i = 0; i < state.chatlist.length; i++) {
                state.chatlist[i].index = i;
            }
        }
        if (value.index != 0 && value.id == state.selectFriendId) {
            var topChat = state.chatlist.find(chats => chats.id === value.id)
            topChat.index = -1;
            state.chatlist.sort(sortId)
            for (let i = 0; i < state.chatlist.length; i++) {
                state.chatlist[i].index = i;
            }
            state.selectId = 0;
            postTime(value);
        }
        setTimeout(() => {
            localStorage.setItem('vue-chat', JSON.stringify(state.chatlist));
        }, 200)
    },

    //通讯录所选项
    chooseDepment(state, value) {
        console.log("当前所选项ID" + value)
        state.selectDepartment = value;
    },
    //选择查看的收藏分类
    chooseColl(state, value) {
        state.collectlist.forEach(element => {
            if (element.StepID === value.tid) {
                element.jumpUrl = "http://bpm-test.g5air.com/bpm/YZSoft/Forms/Process.aspx?tid=" + value.pid + "&pid=" + value.tid + "&userkey=" + value.key + ""
            }
        });
        state.collectId = value.tid;
    },

    //通讯录---三级部门人员列表
    threedepartmentList(state, value) {
        state.threedepartmentList = value;
    },

    //通讯录---子级部门人员列表
    subdepartmentList(state, value) {
        state.subdepartmentList = value;
    },

    //通讯录---顶级部门人员列表
    departmentList(state, value) {
        state.departmentList = value;
    },

    //通讯录---三级部门列表
    threeDepList(state, value) {
        state.threeDepList = value;
    },

    //通讯录---子级部门列表
    initSubList(state, value) {
        state.initSubList = value;
    },

    //通讯录---顶级部门列表
    getTopdepartment(state, value) {
        state.friendlist = value;
    },
    //转发消息置顶
    ForwarDtopChatlist(state, value) {
        let downCaht = state.chatlist.find(sessions => sessions.id === value.id);
        var messBox = value.messages ? value.messages : [];
        if (messBox.length == 0) {
            var messBox = downCaht.messages
        }
        downCaht.index = -1;
        state.chatlist.sort(sortId)
        for (let i = 0; i < state.chatlist.length; i++) {
            state.chatlist[i].index = i;
        }
        state.selectId = 0;
        state.selectFriendId = value.id;
        state.selectFriendAticon = value.id;
        state.selectSendmessageAticon.targetID = value.id;
        state.selectSendmessageAticon.channelType = value.channelType;
    },

    //右键菜单----置顶
    topChatlist(state, value) {
        let messBox = value.messages ? value.messages : [];
        state.chatlist.splice(value.index, 1);
        for (let i = 0; i < state.chatlist.length; i++) {
            state.chatlist[i].index = i + 1;
        }
        state.chatlist.unshift({
            id: value.id,
            Immunity: value.Immunity, //免扰状态
            user: {
                name: value.user.name,
                img: value.user.img,
            },
            messages: messBox,
            index: 0,
            channelType: value.channelType
        })
        state.selectId = 0;
        state.selectFriendId = value.id;
        state.selectFriendAticon = value.id;
        state.selectSendmessageAticon.targetID = value.id
    },

    //右键菜单----删除
    delChatlist(state, value) {
        console.log(value);
        state.chatlist.splice(value.index, 1);
        state.selectId = 0;
        for (let i = 0; i < state.chatlist.length; i++) {
            state.chatlist[i].index = i;
        }
        if (state.chatlist.length == 0) {
            localStorage.setItem("vue-chat", "");
            state.disPlayChatboxs = false
            state.disPlayVersion = true
        } else {
            state.disPlayChatboxs = true
            state.disPlayVersion = false
        }
        state.selectFriendId = state.chatlist.length!=0?state.chatlist[0].id:0;
        state.selectFriendAticon = state.chatlist.length!=0?state.chatlist[0].id:0;
        // clientiot.sqllite.delHxImMsgList(value.id,value.channelType);

    },

    //消息撤回
    delMessage(state, value) {
        let operateId;
        value.msg_content.target_type == "USER" ? operateId = value.msg_content.user_id : operateId = value.msg_content.target_id;
        let retract = state.chatlist.find(items => items.id === operateId);
        for (let l = 0; l < retract.messages.length; l++) {
            if (retract.messages[l].messageKeys === value.msg_content.msg.message_key) {
                retract.messages.splice(l, 1, {
                    content: value.noticName + '撤回了一条消息',
                    date: value.operate_time,
                    msgType: "notic"
                })
            }
        }
    },

    //添加群组会话
    addGroups(state, value) {
        if (value != '') {
            for (let i = 0; i < state.chatlist.length; i++) {
                state.chatlist[i].index++;
            }
            state.chatlist.unshift({
                id: value.group_id,
                Immunity: false, //免扰状态
                user: {
                    name: value.group_name,
                    img: 'static/images/group.png'
                },
                messages: [{
                    content: '已经建立会话，可以发消息啦！',
                    date: new Date().getTime(),
                    msgType: 'text'
                }],
                index: 0,
                channelType: "G"
            })
            state.selectId = 0;
            state.selectFriendId = value.group_id;
            state.selectFriendAticon = value.group_id;
        } else {
            state.groupList = [];
            GroupFriendlist = [];
        }

    },

    // 从localStorage 中获取数据
    initData(state) {
        //let data = localStorage.getItem('vue-chat');
        let data = localForage.getItem('vue-chat');
        let loginUser_id = JSON.parse(sessionStorage.getItem("currentUser")).id;
        let userId = localStorage.getItem("userMsg") ? JSON.parse(localStorage.getItem("userMsg")).employee_id : 0;
        if (data && data != "[]") {
            if (data.length > 0) {
                state.chatlist = JSON.parse(data);
                state.chatlist.length > 0 ? state.selectFriendId = state.chatlist[0].id : state.selectFriendId = 0;
                state.chatlist.length > 0 ? state.selectFriendAticon = state.chatlist[0].id : state.selectFriendAticon = 0;
                state.chatlist.length > 0 ? state.selectId = state.chatlist[0].index : state.selectId = 0;
                state.chatlist.length > 0 ? state.chatlist[0].underLen = 0 : state.chatlist[0].underLen = state.chatlist[0].underLen;
            } else {
                //localStorage.removeItem('vue-chat');
                localForage.removeItem('vue-chat');
                state.chatlist = [];
            }
            state.chatlist.length > 0 ? state.chatlistText = true : state.chatlistText = false;
        }
    },

    // 获取消息记录搜索值
    messSearch(state, value) {
        state.messSearchText = value;
    },

    //获取聊天列表搜索值
    chatSearch(state, value) {
        state.chatSearchText = value;
    },
    //获取搜索好友
    searchFriendValue(state, value) {
        state.searchFriendValue = value;
    },
    // 获取搜索值
    search(state, value) {
        state.searchText = value;
    },

    //获取登录用户值
    userInfo(state, value) {
        state.user = value
    },

    // 得知用户当前选择的是哪个对话。便于匹配对应的对话框
    selectSession(state, value) {
        state.disPlayChatboxs = true;
        state.clearInputTxte = true;
        console.log(value);
        let flag;
        value.channelType == "P" ? flag = 0 : flag = 1;
        let data = {
            "flag": flag,
            "from_id": value.id,
            "target_id": state.user.employee_id,
            "last_read_time": formatDate(value.messages[value.messages.length - 1].date)
        }
        for (let i = 0; i < state.chatlist.length; i++) {
            if (state.chatlist[i].id === value.id && state.chatlist[i].underLen > 0) {
                state.chatlist[i].underLen = 0;
            }
        }
        setTimeout(() => {
            //localStorage.setItem('vue-chat', JSON.stringify(state.chatlist));
            localForage.setItem('vue-chat', JSON.stringify(state.chatlist));
            //localForage.removeItem('vue-chat');
        }, 200)
        let chatItem = state.chatlist.find(session => session.id === value.id)
        chatItem.AtPoples = false;
        chatItem.atAll = false;
        chatItem.itemAt = false;

        chatItem.underLen = 0;
        state.selectId = value.index;
        state.selectMessage = value.messages;
        state.selectMessageVue = value;
        state.selectFriendId = value.id;
        state.selectFriendAticon = value.id;
        //添加CODE码
        state.selectSendmessageAticon.targetID = value.id;
        state.selectSendmessageAticon.targetCode = value.code;
        state.selectSendmessageAticon.channelType = 'P';
        state.startT = 0;
        //先按用户本地时间排序,
        //if (chatItem.messages && chatItem.messages.length > 0) {
        //    chatItem.messages = chatItem.messages.sort(function (a, b) {
        //        return a.localTime - b.localTime
        //    })
        //}
        state.selectIsinputState = false;

        ipcRenderer.send('MAINWIN:setWinTitleAndIcon', value.user.name, value.user.img);
        Events.$emit("readyFileListSet", true);
        var inputStateTimeOut;
        //正在输入状态
        Events.$on("otherData", data => {
            if (data.fromId === value.id && value.channelType === 'P') {
                state.selectIsinputState = data.message.state === 1;
            }
            else {
                state.selectIsinputState = false;
            }

            if (inputStateTimeOut) {
                clearTimeout(inputStateTimeOut)
            }

            inputStateTimeOut = setTimeout(function () {
                state.selectIsinputState = false;
            }, 5000)

        });



        Event.$emit("getSelectFriendId", value);

        Events.$emit("newMess", 0);

        Events.$emit('DisplayDetails', false)
        if (sessionStorage.getItem("offlineMessage") == "false") {
            co(function* () {
                let putTime = JSON.parse(yield clientiot.messages.messagesSetReadSessionTime(data));
                if (putTime.success == true) {
                    console.log(value.user.name + "会话最后阅读时间更新成功" + formatDate(value.messages[value.messages.length - 1].date))
                }
            })
        }
    },

    // 得知用户当前选择的是哪个好友。
    selectFriend(state, value) {
        state.selectdeplev = value.getLev;
        console.log(value);
        state.selectedSort = 1;
        // state.selectFriendId = value.employeeNo;
        // state.selectFriendAticon = value.employeeNo;
        state.selectDepartment = value.employeeNo;
    },

    // 发送信息
    sendMessage(state, msg) {
        var elems;

        if (msg.sendID) {
            state.chatlist.find(function (elem) {
                if (elem.id == msg.sendID) {
                    elems = elem
                }
            });
        } else {
            // const result = state.chatlist.find(session => session.id === state.selectFriendId);
            state.chatlist.find(function (elem) {
                if (elem.id == state.selectFriendId) {
                    elems = elem
                }
            });
        }

        var messageObj = {
            content: msg.content,
            date: new Date().getTime(),
            self: true,
            fromId: JSON.parse(sessionStorage.getItem("currentUser")).id,
            msgType: '',
            msgID: msg.msgID,
            filePath: msg.filePath,
            filename: msg.filename,
            fileSize: msg.fileSize,
            messageKeys: msg.message_key,
            theme_key: msg.theme_key,
            target_id: msg.target_id,
            errorCode: msg.errorCode,
            UploadStore: msg.UploadStore,
            forwardKey: msg.forwardKey,
            localTime: new Date().getTime(),
            mediaId: msg.mediaId
        }


        var thisType = msg.content.toLowerCase();
        if ((thisType.indexOf("http:") != -1 && thisType.indexOf("localhost") == -1) || (thisType.indexOf("https:") != -1 && thisType.indexOf("localhost") == -1)) {
            if (thisType.indexOf(".gif") != -1 || thisType.indexOf(".bmp") != -1 || thisType.indexOf(".jpg") != -1 || thisType.indexOf(".jpge") != -1 || thisType.indexOf(".png") != -1) {
                messageObj.msgType = 'text';
            } else {
                messageObj.msgType = 'http';
            }

        } else {
            messageObj.msgType = msg.msgType;
        }

        if (messageObj.msgType === "text") {
            messageObj.content = messageObj.content.replace(/<.*?>/g, "");
        }

        if (msg.message_key == undefined) {
            if (msg.errorCode == false || msg.errorCode != undefined) {
                for (var i = 0; i < elems.messages.length; i++) {
                    var msgID = elems.messages[i].msgID;
                    if (msgID != undefined && msgID != '') {
                        if (msgID == msg.msgID) {
                            if (i > -1) {
                                elems.messages.splice(i, 1, messageObj);
                            }
                        }
                    }
                }
            } else {
                elems.messages.push(messageObj);
                if (msg.msgType != 'text') {
                    sessionStorage.setItem('saveMessage', JSON.stringify(messageObj))
                    saveMessage.push(messageObj)
                }
            }
        } else {
            for (var i = 0; i < elems.messages.length; i++) {
                var msgID = elems.messages[i].msgID;
                if (msgID != undefined && msgID != '') {
                    if (msgID == msg.msgID) {
                        if (i > -1) {
                            // elems.messages[i].filePath = msg.filePath; 
                            // elems.messages[i].messageKeys = msg.message_key;
                            // elems.messages[i].theme_key = msg.theme_key;
                            // elems.messages[i].target_id = msg.target_id;
                            // elems.messages[i].UploadStore = msg.UploadStore;
                            // elems.messages[i].forwardKey = msg.forwardKey;
                            // elems.messages[i].mediaId = msg.mediaId; 
                            elems.messages.splice(i, 1, messageObj);
                        }
                    }
                }
            }
            var stores = JSON.parse(sessionStorage.getItem('saveMessage'));
            if (stores != null) {
                for (var j = 0; j < saveMessage.length; j++) {
                    if (saveMessage[j].msgID == msg.msgID) {

                        state.chatlist.find(function (elem) {
                            if (saveMessage[j] != undefined) {
                                if (elem.id == saveMessage[j].target_id) {
                                    saveMessage.splice(j, 1)
                                    elems = elem
                                    for (var i = 0; i < elems.messages.length; i++) {
                                        var msgID = elems.messages[i].msgID;
                                        if (msgID != undefined && msgID != '') {
                                            if (msgID == msg.msgID) {
                                                if (i > -1) {
                                                    // elems.messages[i].filePath = msg.filePath;
                                                    // elems.messages[i].messageKeys = msg.message_key;
                                                    // elems.messages[i].theme_key = msg.theme_key;
                                                    // elems.messages[i].target_id = msg.target_id;
                                                    // elems.messages[i].UploadStore = msg.UploadStore;
                                                    // elems.messages[i].forwardKey = msg.forwardKey;
                                                    // elems.messages[i].mediaId = msg.mediaId; 
                                                    elems.messages.splice(i, 1, messageObj);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
            }
        }
    },

    // 选择好友后，点击发送信息。判断在聊天列表中是否有该好友，有的话跳到该好友对话。没有的话
    // 添加该好友的对话 并置顶
    send(state) {
        var result;
        if (state.selectdeplev == 2) {
            var result = state.departmentList.find(friend => friend.employeeNo === state.selectDepartment);
        } else if (state.selectdeplev == 1) {
            var result = state.subdepartmentList.find(friend => friend.employeeNo === state.selectDepartment);
        } else if (state.selectdeplev == 3) {
            var result = state.threedepartmentList.find(friend => friend.employeeNo === state.selectDepartment);
        } else {
            var result = state.searchFriendValue.find(friend => friend.employeeNo === state.selectDepartment);
        }
        var msg = state.chatlist.find(msg => msg.id === result.employeeNo);
        if (!msg || msg == undefined) {
            for (let i = 0; i < state.chatlist.length; i++) {
                state.chatlist[i].index++;
            }
            state.chatlist.unshift({
                id: parseInt(result.employeeNo),
                Immunity: false, //免扰状态
                code: result.code,
                user: {
                    name: result.employeeName,
                    img: result.photoUrl,
                    code: result.code
                },
                messages: [{
                    content: '已经建立会话，可以互发信息啦！',
                    date: new Date().getTime(),
                    userName: result.employeeName,
                    msgType: 'once'
                }],
                index: 0,
                channelType: "P"
            });
            state.selectId = 0;
            state.selectFriendId = state.chatlist[0].id;
            state.selectFriendAticon = state.chatlist[0].id;
            //添加CODE码
            state.selectSendmessageAticon.targetID = state.chatlist[0].id;
            state.selectSendmessageAticon.targetCode = state.chatlist[0].code;
            state.selectSendmessageAticon.channelType = 'P'
            router.push({
                path: '/chat'
            });
            let data = JSON.stringify({
                targetName: result.employeeName,
                photo: result.photoUrl,
                targetType: "0", //会话类型 私聊：0，群聊：1
                targetId: result.employeeNo, //会话ID
                isTop: 0, //是否置顶
                indexSort: 0,
                isDisturb: 0,
            });
            clientiot.sqllite.addHxImChatList(data, function (res) {
                console.log("添加列表到本地数据库:" + res)
            })
        } else {
            state.selectId = msg.index;
            state.selectFriendId = msg.id;
            state.selectFriendAticon = msg.id;
            state.selectSendmessageAticon.targetID = msg.id;
            state.selectSendmessageAticon.targetCode = result.code;
            state.selectSendmessageAticon.channelType = 'P'
            router.push({
                path: '/chat'
            });
        }
    },

    AddGroups(state, value) {
        if (value != '') {
            GroupFriendlist.push(value);
        } else {
            GroupFriendlist = [];
        }

        state.groupList = Array.from(new Set(GroupFriendlist));
    },
    DelGrouplist(state, value) {
        let array = [];
        array.push(value)
        for (var i = 0; i < GroupFriendlist.length; i++) {
            if (GroupFriendlist[i].posid == value.posid) {
                GroupFriendlist.splice(i, 1);
            }
        }
    },
    //上传进度条
    Uploadprogress(state, value) {
        var mskey = null;
        let datastore = JSON.parse(value.upload);
        var num = (datastore.progressAmount / datastore.progressTotal);
        var Updateprogress = Math.round(num * 100);
        let messsg = {
            msgNum: Updateprogress,
            msgId: value.msgId,
            msgKey: datastore.key
        };
        state.UploadprogNum = messsg;
    },
    //群人员详情
    GroupInfo(state, value) {
        let datastore = JSON.parse(value).data.members;
        let datavlue = JSON.parse(value).data;
        let Atdatavlue = JSON.parse(value).data.members;
        if (datastore == undefined) {
            let datas = JSON.parse(value).data,
                dataNewArr = [];
            var AtdataNewArr = [];
            let newArr = {
                memberName: datas.fullname,
                images_url: datas.images_url,
                employeeNo: datas.employeeNo,
                NoGroup: false
            }
            dataNewArr.push(newArr)
            AtdataNewArr.push(newArr)
            state.members = dataNewArr
            state.Atmembers = AtdataNewArr
        } else {
            state.members = datastore
            state.Atmembers = Atdatavlue
            state.GroupTitle = datavlue
        }

    },
    transferGroupInfo(state, value) {

        var newMembers = [];
        var userInfo = JSON.parse(localStorage.getItem("*&_userInfo")).data;
        if (value) {
            value.forEach(it => {
                if (it.memberEId != userInfo.employee_id) {
                    newMembers.push(it);
                }
            })
        }

        state.transfermembers = newMembers 
    },
    //免扰状态
    PerturbedState(state, value) {
        let downCaht = state.chatlist.find(sess => sess.id === value);
        if (downCaht != undefined) {
            downCaht.Immunity = true
        }
    },
    PerturbedStateFalse(state, value) {
        let downCaht = state.chatlist.find(sess => sess.id === value);
        if (downCaht != undefined) {
            downCaht.Immunity = false
        }
    },
    // //新增人员
    InvitingStaff(state, value) {
        state.NewPersonnel = value
    },
    showToggle(state, value) {
        state.Windowclosure = value
    },
    //消息计数
    MessageCounting(state, value) {
        state.selectFriendId === value.fromId ? state.msgCounting = 0 : state.msgCounting = value.msgCountAll
    },
    getUserAllowedSend(state, value) {
        if (!value) {
            return
        }
        var status = JSON.parse(value).data.be_ban;
        if (status.length > 0) {
            for (var l = 0; l < status.length; l++) {
                if (status[l].group_id == state.selectFriendId) {

                    state.getUserAllowedSendStatus = false
                } else {
                    state.getUserAllowedSendStatus = true
                }
            }
        } else {
            console.log("没有查询到禁言会话")
        }
    }
}
const getters = {
    // 统计未读消息数量
    messCount(state) {
        var len = 0;
        for (let i = 0; i < state.chatlist.length; i++) {
            len = state.chatlist[i].underLen + len
        }
        return len;
    },
    //筛选出含有搜索值的聊天记录
    searchFriendMessage(state) {
        if (state.messagesTag != 'all') {
            let sessions = state.getMessRecode.filter(sessions => state.messSearchText == "" ? sessions.msgType === state.messagesTag : sessions.content.includes(state.messSearchText));
            return sessions
        } else {
            let sessions = state.messSearchText == "" ? state.getMessRecode : state.getMessRecode.filter(
                sessions =>
                sessions.content.includes(
                    state.messSearchText
                )
            );
            return sessions
        }
    },
    //帅选出含有添加群组
    searchGroopFriendlist(state) {
        let friends = state.searchFriendValue;
        return friends
    },
    //帅选出含有搜索值的收藏列表
    searchedCollectedInfo(state) {
        let collInfo = state.collectInfoList.filter(collInfo => collInfo.content.includes(state.searchText));
        return collInfo
    },

    //消息记录分类
    searchedMesslist(state) {
        let sions = state.messlist;
        return sions
    },

    //筛选出含有搜索值的收藏分类
    searchedCollect(state) {
        let colls = state.collectlist;
        return colls.reverse()
    },

    // 筛选出含有搜索值的设置列表
    searchedSetting(state) {
        let settings = state.settinglist.filter(settings => settings.name.includes(state.searchText));
        return settings
    },
    // 筛选出含有搜索值的聊天列表
    searchedChatlist(state) {
        state.chatlist = removeDuplicatedItem(state.chatlist)
        let sessions = state.chatlist.filter(sessions => sessions.user.name.includes(state.chatSearchText));
        for (let i = 0; i < sessions.length; i++) {
            sessions[i].index = i;
        }
        return sessions
    },

    //筛选出含有搜索值的子级部门人员列表
    searchedthreedepartmentList(state) {
        let three = state.threedepartmentList;
        return three
    },

    //筛选出含有搜索值的子级部门人员列表
    searchedsubdepartmentList(state) {
        let sub = state.subdepartmentList;
        return sub
    },

    // 筛选出含有搜索值的顶部门列表
    searchedFriendlist(state) {
        let friends = state.friendlist;
        return friends
    },

    //筛选出含有搜索值的子级部门列表
    searchedInitSubList(state) {
        let subs = state.initSubList;
        return subs
    },

    //筛选出含有搜索值的三级部门列表
    searchedThreeDepList(state) {
        let subs = state.threeDepList;
        return subs
    },


    //筛选出含有搜索值的顶级部门人员列表
    searchedDepartmentList(state) {
        let departmens = state.departmentList;
        return departmens
    },

    // 通过选择的收藏分类ID匹配相应的页面
    selectedColl(state) {
        let colls = state.collectlist.find(colls => colls.StepID === state.collectId);
        return colls
    },

    // 通过当前选择是哪个对话匹配相应的对话
    selectedChat(state) {
        state.startT = 0;
        let session = state.chatlist.find(session => session.index === state.selectId);
        state.selectSendmessageAticon.targetID = session.id;
        state.selectSendmessageAticon.channelType = session.channelType;
        for(var i=0;i<session.messages.length;i++){
            if(typeof session.messages[i].date == "string"){
                session.messages[i].date = parseInt(session.messages[i].date);
            }
            if(session.messages[i].date - state.startT>300000){
                session.messages[i].isShowDate=true;
                state.startT = session.messages[i].date;
            }else{
                session.messages[i].isShowDate=false;
            }
        }

        return session
    },

    // 通过当前选择是哪个好友匹配相应的好友
    selectedFriend(state) {
        if (state.selectdeplev == 2) {
            let friend = state.departmentList.find(friend => friend.employeeNo === state.selectDepartment);
            return friend
        } else if (state.selectdeplev == 1) {
            let subfriend = state.subdepartmentList.find(subfriend => subfriend.employeeNo === state.selectDepartment);
            return subfriend
        } else if (state.selectdeplev == 3) {
            let threefriend = state.threedepartmentList.find(threefriend => threefriend.employeeNo === state.selectDepartment);
            return threefriend
        } else {
            // state.searchText
            let subfriend = state.searchFriendValue.find(subfriend => subfriend.employeeNo === state.selectDepartment);
            return subfriend
        }
    },

    //监听渲染消息界面
    messages(state) {
        if (state.chatlist && state.chatlist.length > 0 && state.selectFriendId > 0) {
            let session = state.chatlist.find(session => session.id === state.selectFriendId);
            return session.messages
        }
    },

    //添加分组好友列表
    groupFriendlist(state) {
        let frien = state.friendlist.find(friend => friend.id === state.selectFriendId);
        return frien
    },

}

const actions = {
    // 获取最新的邮件链接
    newEmailUrl:({commit},value)=>commit('newEmailUrl',value),
    // 点击艾特提示
    cliAt: ({commit}, value) => commit('cliAt', value),

    requestList: ({commit}, value) => commit('requestList', value),
    //个人撤回消息通知pushNotic
    pushNotic: ({commit}, value) => commit('pushNotic', value),

    //上传状态
    uploadFilePath: ({commit}, value) => commit('uploadFilePath', value),
    // 查看当前会话的聊天记录
    showMessRecode: ({commit}, value) => commit('showMessRecode', value),

    // 下载文件
    downFilePath: ({commit}, value) => commit('downFilePath', value),

    // 下载文件(new)
    downFilePathNew: ({commit}, value) => commit('downFilePathNew', value),

    // 退出群聊
    exitGroup: ({commit}, value) => commit('exitGroup', value),

    // 选择会话
    chooseMess: ({commit}, value) => commit('chooseMess', value),

    //消息撤回
    delMessage: ({commit}, value) => commit('delMessage', value),

    //修改群名称
    modifyName: ({commit}, value) => commit('modifyName', value),

    //上移收到消息的会话
    topMessage: ({commit}, value) => commit('topMessage', value),

    // 格式化焦点

    getMessTop: ({commit}, value) => commit('getMessTop', value),


    //通讯录---当前所选项
    chooseDepment: ({commit}, value) => commit('chooseDepment', value),

    chooseColl: ({commit}, value) => commit('chooseColl', value),
    //通讯录---子级部门人员列表
    threedepartmentList: ({commit}, value) => commit('threedepartmentList', value),

    //通讯录---子级部门人员列表
    subdepartmentList: ({commit}, value) => commit('subdepartmentList', value),

    //通讯录---顶级部门人员列表
    departmentList: ({commit}, value) => commit('departmentList', value),
    //通讯录---三级部门列表
    threeDepList: ({commit}, value) => commit('threeDepList', value),

    //通讯录---子级部门列表
    initSubList: ({commit}, value) => commit('initSubList', value),

    //通讯录---顶级部门列表
    getTopdepartment: ({
        commit
    }, value) => commit('getTopdepartment', value),

    //聊天列表右键---置顶
    topChatlist: ({
        commit
    }, value) => commit('topChatlist', value),
    //转发消息置顶
    ForwarDtopChatlist: ({
        commit
    }, value) => commit('ForwarDtopChatlist', value),
    //聊天列表右键---删除
    delChatlist: ({
        commit
    }, value) => commit('delChatlist', value),

    //聊天记录搜索
    messSearch: ({
        commit
    }, value) => commit('messSearch', value),

    //会话列表搜索
    chatSearch: ({
        commit
    }, value) => commit('chatSearch', value),

    //搜索联系人

    searchFriendValue: ({
        commit
    }, value) => {
        setTimeout(() => {
            commit('searchFriendValue', value)
        }, 100)
    },

    //搜索
    search: ({
        commit
    }, value) => {
        setTimeout(() => {
            commit('search', value)
        }, 100)
    },

    //用户信息
    userInfo: ({
        commit
    }, value) => commit("userInfo", value),

    //添加群组
    addGroups: ({
        commit
    }, value) => commit('addGroups', value),

    selectSession: ({
        commit
    }, value) => commit('selectSession', value),

    selectFriend: ({
        commit
    }, value, lev) => commit('selectFriend', value, lev),

    sendMessage: ({
        commit
    }, msg) => commit('sendMessage', msg),

    send: ({
        commit
    }) => commit('send'),

    initData: ({
        commit
    }) => commit('initData'),

    AddGroups: ({
        commit
    }, newArr) => commit('AddGroups', newArr),
    DelGrouplist: ({
        commit
    }, value) => commit("DelGrouplist", value),
    Uploadprogress: ({
        commit
    }, value) => commit("Uploadprogress", value),
    //群组详情
    GroupInfo: ({
        commit
    }, value) => commit("GroupInfo", value),
    InvitingStaff: ({
        commit
    }, value) => commit("InvitingStaff", value),
    //弹窗关闭
    showToggle: ({
        commit
    }, value) => commit("showToggle", value),
    //接受消息计数
    MessageCounting: ({
        commit
    }, value) => commit("MessageCounting", value),
    //免扰状态
    PerturbedState: ({
        commit
    }, value) => commit("PerturbedState", value),
    PerturbedStateFalse: ({ commit }, value) => commit("PerturbedStateFalse", value),
    //禁言状态
    getUserAllowedSend: ({
        commit
    }, value) => commit("getUserAllowedSend", value),
    transferGroupInfo: ({ commit }, value) => commit("transferGroupInfo",value)
}
const store = new Vuex.Store({
    state,
    mutations,
    getters,
    actions
})

// 监听聊天列表的值， 发生变化就保存在localStorage中
store.watch(
    (state) => state.chatlist,
    (val) => {
        localStorage.setItem('vue-chat', JSON.stringify(removeDuplicatedItem(val)));
        localForage.setItem('vue-chat', JSON.stringify(removeDuplicatedItem(val)));
    }, {
        deep: true
    },
)
export default store;