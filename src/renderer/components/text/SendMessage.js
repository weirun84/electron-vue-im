import { exec } from "child_process";

const clientiot = require("@hxim/clientiot");
var co = require("co");
const uuidv4 = require('uuid/v4');
/**
 * 格式化发送消息
 *
 * @param  content
 */
export function transform(content) {
    if (content) { 
        var clearRec = (content).indexOf("<br>") != -1;
        var checkImage = (content).indexOf("img") != -1;
        content = dealFaceImage(content);
        if (content.indexOf('<br>') > -1) {
            content = content.substring(0, content.lastIndexOf('<br>'))
        }
        //替换fileblot
        content = content.replace(/<fileblot.*?.*fileblot>/gi, "");  
        var backspace = (content).replace(/<\/p>/g,"\n").replace(/<[^>]+>/g, ""); 
    }

    return backspace
}

/**
 * 处理fileblot
 * @param {any} html
 */
export function getFileBlotData(html) {
    if (!html) {
        return [];
    }

    var datas = [];

    // 匹配（g表示匹配所有结果i表示区分大小写）
    let fileblotReg = /<fileblot.*?(?:>|\/>)/gi
    // 匹配data属性
    let nameReg = /data=[\'\"]?([^\'\"]*)[\'\"]?/i;
    let arr = html.match(fileblotReg);
    if (!arr) {
        return [];
    }
    // console.log('所有已成功匹配图片的数组：' + arr)
    for (let i = 0; i < arr.length; i++) {
        // console.log(arr[i])
        let names = arr[i].match(nameReg)
        // 获取数据
        if (names && names[1]) {
            // console.log('已匹配的图片地址' + (i + 1) + '：' + names[1])
            var thisJson = names[1].replace(/&quot;/gi, '"');
            datas.push(JSON.parse(thisJson));
        }
    }

    return datas;
}

/**
 * 处理atpopleblot
 * @param {any} html
 */
export function getAtPopleBlotData(html) {
    if (!html) {
        return [];
    }

    var datas = [];

    // 匹配（g表示匹配所有结果i表示区分大小写）
    let fileblotReg = /<myblot.*?(?:>|\/>)/gi
    // 匹配data属性
    let nameReg = /data=[\'\"]?([^\'\"]*)[\'\"]?/i;
    let arr = html.match(fileblotReg);
    if (!arr) {
        return [];
    }
    // console.log('所有已成功匹配图片的数组：' + arr)
    for (let i = 0; i < arr.length; i++) {
        // console.log(arr[i])
        let names = arr[i].match(nameReg)
        // 获取数据
        if (names && names[1]) {
            // console.log('已匹配的图片地址' + (i + 1) + '：' + names[1])
            var thisJson = names[1].replace(/&quot;/gi, '"');
            var obj = JSON.parse(thisJson);
            datas.push({ memberEId: obj.memberEId, memberName: obj.memberName});
        }
    }

    return datas;
}

/**
 * 转换输入框里的表情获取code码
 *
 * @param  content
 */
export function dealFaceImage(content) {
    var me = this;
    var reg = /(<img [^>]*src=['"]([^'"]+)[^>]*>)/gi;

    return content.replace(reg, findCodeInJson.bind(this));
}
function findCodeInJson() {
    var me = this;
    var data = faceUtils;
    var imgTag = arguments[0];
    var src = arguments[1];
    var code = "";
    for (var i = 0; i < data.alt.length; i++) {
        if (src.indexOf(data.alt[i].file) >= 0) {
            code = data.alt[i].code;
        }
    }

    var rCode = (code || (((imgTag.indexOf('data:image/') > -1) || (imgTag.indexOf('src') > -1)) ? '' : imgTag));

    return rCode.length > 0 ? rCode : arguments[2].indexOf('http') > -1 ? '图片={' + arguments[2] + '}' : imgTag;
}
/**
 * 表情
 * @param code
 * @returns {Promise}
 */
export let faceUtils = {
    alt: [{
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
    // faces: function () {
    //     let self = this;
    //     let arr = '';
    //     for (let i = 0; i < self.alt.length; i++) {
    //         arr = alt[i].code;
    //     }
    //     return arr;
    // }
};

/**
 * 发送消息格式化
 * @param content  
 * @returns me 
 */
export function CompositeMessage(content,me) {
    var imgReg = /<img.*?(?:>|\/>)/gi;
    var nameReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
    var arr = content.match(imgReg);
    let dataImage = [];
    let files = [];
    let msgCont = null,msgType;
    let now = new Date().getTime();
    let backspace = transform(content);
    let imgName = "hxim_" + now + ".png";
    if (arr != null) {
        for (let i = 0; i < arr.length; i++) {
            let names = arr[i].match(nameReg)
            // 获取图片地址
            if (names && names[1]) {
                msgCont = names[1]
                dataImage.push(names[1])
            }
        }
    } else {
        if (backspace != '') {
            msgCont = backspace;
            msgType = 'text'
        }
    }; 
    if (dataImage.length>0) {
       
        for (var i = 0; i < dataImage.length; i++) {
            var dataIm = dataImage[i].split('///')[1];
            var dataImages = dataIm != undefined ? decodeURI(dataIm.replace(/%/g, '%25')) : dataImage[i]
            if (dataImage[i] != undefined && dataImages.indexOf(':\\') > -1 || (dataImages.indexOf(':/') > -1 && dataImages.indexOf('http:/') == -1)) {
            
                var data = {
                    lastModified: now,
                    lastModifiedDate: now,
                    name:imgName,
                    path: dataImage[i],
                    size: 102400,
                    type: "image/png",
                    uid: uuidv4() + now,
                    webkitRelativePath: ''
                }; 
                PasteUpload(data,me); 
            } else {
                if (dataImage[i] != undefined && dataImage[i].indexOf('data:image') > -1) {
                    var filePaths = clientiot.globalinfo.base64ToLocalhost(dataImage[i], "/profile/images/", imgName);
                    var data = {
                        lastModified: now,
                        lastModifiedDate: now,
                        name: imgName,
                        path: filePaths,
                        size: 102400,
                        type: "image/png",
                        uid: uuidv4() + now,
                        webkitRelativePath: ''
                    };
                    files.push(data);
                }
            }
        }
        for (var k = 0; k < files.length; k++) {
            PasteUpload(files[k],me);
        }
        files = []; 
    }
}

/**
 * 根据路径获取文件图标
 * */
export function getFileIco(filePath) {

    if (!filePath) {
        return "";
    }

    var extName = filePath.substr(filePath.lastIndexOf('.') + 1);

    return "static/images/fileIcon/" + extName + ".svg"
}

/**
 * 发送
 * @param data
 * @returns {Promise}
 */
export function send(data) {
    var loginUser_id = JSON.parse(sessionStorage.getItem("currentUser")).id;
    if (data.target_id.channelType=='P') {
        var channelType = 'user',
            targetType = "single";
    } else {
        var channelType = 'group',
            targetType = "custom";
    }
    var datas = {
        fromId: parseInt(loginUser_id),
        model: 1,
        fromType: channelType,
        msgContent: {
            arn: "arn",
            durationTime: data.date,
            extras: "extras",
            fileSize: data.fileSize,
            format: "format",
            height: 5,
            mediaCrc32: "mediaCrc32",
            text: data.oldName,
            mediaId: data.content,
            width: 5
        },
        msgType: data.msgType,
        targetId: data.target_id.targetID,
        targetType: targetType,
        version: 0
    };
    clientiot.http.sendMessage(JSON.stringify(datas),data.filePath)
        .then(function (retvalue) {
            var retvalueCode = JSON.parse(retvalue); 
    })
}

/**
 * 图片组合
 * @param data
 * @returns {Promise}
 */
 function PasteUpload(file,me) {
     var _self = me;
    var nows = new Date().getTime(); 
    const suffix = file.name.split('.');
    const ext = suffix.splice(suffix.length - 1, 1)[0];
    const nameKey = uuidv4() + '.' + ext;
    let file_Path = file.path;
     if (file_Path.indexOf('file://') > -1) {
         var filePath = file_Path;
     } else {
         var filePath = file.path;
     }
     if (filePath.indexOf('/%') > -1) {
         var filePath = decodeURI(file.path.replace('%20', ' '));
     }
     if (filePath.indexOf('%20') > -1) {
         var filePath = unescape(file.path);
     }
    var localPath = filePath;
    const fileTypes = (file.type.split('/')[0]);
    const fileSize = file.size;
    const svideoURL = null;
    var video, output;
    var scale = 0.8;
    if (fileSize > 100 * 1024 * 1024) {
        _self.$message({
            message: '发送文件限制在100M内',
            duration: 1800,
            type: 'warning',
            center: true,
        })
        return
    };
    if (fileTypes == "text" || fileTypes == '' || fileTypes == 'application') {
        var fileType = 'file'
    } else if (fileTypes == "video") {
        var fileType = "video"
    }
    else {
        var fileType = fileTypes
    }
    var me = this;
   
        // TODO 图片格式/大小限制
        console.log('上传图片')
        if (localPath.indexOf('///') > -1) {
            var localPath = localPath.split('///')[1]
        }
        if (fileType == 'image') {
            if (localPath.indexOf('https://') > -1 || localPath.indexOf('http://') > -1) {
                var data = {
                    msgCont: localPath,
                    msgType: 'image'
                }
                me.TextMessage(data);
                return
            }
            // 获取光标所在位置
            var message = { content: file.path, msgType: fileType, UploadStore: null, target_id: _self.$store.state.selectFriendAticon, msgID: file.uid, filePath: file.path, date: nows, filename: file.name, fileSize: fileSize };
            _self.$store.dispatch("sendMessage", message);
            // Events.$emit('sendMessage',message) 
        } else {
            var message = { content: file.name, msgType: fileType, UploadStore: null, target_id: _self.$store.state.selectFriendAticon, msgID: file.uid != undefined ? file.uid : file.lastModified, filePath: file.path, date: nows, filename: file.name, fileSize: fileSize };
            Events.$emit('sendMessage', message)
            return
        }

        clientiot.awss31.UploadFile(nameKey, localPath, function (res) {
            let data = JSON.parse(res);
            var Uploadprogress = { upload: data.data, msgId: file.uid };
            if (data.errorCode == 200) {
                var message = { content: nameKey, target_id: _self.$store.state.selectFriendAticon, msgType: fileType, msgID: file.uid, filePath: localPath, oldName: file.name, date: nows, fileSize: fileSize, errorCode: data.success };
                send(message)
            } else if (data.errorCode == 400) {
                var message = { content: file.path, msgType: fileType, msgID: file.uid, filePath: file.path, oldName: file.name, date: nows, fileSize: fileSize, errorCode: data.success };
                _self.$store.dispatch("sendMessage", message);
            }
        }); 
}