<template>
  <div style="font-family:'Microsoft YaHei'">
    <div
      class="messageBox"
      id="messageBox"
    >
      <div class="header">
        <div class="friendname">{{messRecodeName}}</div>
        <span
          @click="close"
          class="hiddenBox"
        >×</span>
      </div>
      <div class="messSearchDiv">
        <input
          type="search"
          placeholder="请输入搜索内容"
          id="messSearch" @change="searchChange" v-model="search"
        >
      </div>
      <ul class="messageSort">
        <li
          v-for="item in messTag"
          @click="cliTag(item)"
          :class="{ actives: item.code === tagCode }"
        >{{item.tagName}}</li>

      </ul>
      <hr>
      <div class="messageRecodeBox">
        <pull-to @infinite-scroll="loadmore">
          <ul>
            <li v-for="item in msgList">
              <div class="recodeCard">
                <!-- <img v-if="item.msgType==='notic'" class="userImg" width="36px" height="36px" src="static/images/group.png" alt="0.0"> -->
                <!-- <img v-else class="userImg" width="36px" height="36px" :src="item.self?realAvatarUrl():item.msgUserImg" alt="0.0"> -->
                <div class="messageTextBox" :data="JSON.stringify(item)">
                  <p class="messageTextName">{{item.fromName}}<span>{{item.time|time}}</span></p>
                  <!-- 文本 -->
                  <p v-if="item.msgType == 'text'"
                    class="messageTextContent"
                    @click="openWindow(item.content)"
                    @contextmenu="onmousecontextmenu($event)"
                    v-html="httpString(replaceFace(item.content))"
                  ></p>
                  <!-- 网址 -->
                  <p
                    v-if="item.msgType == 'http'"
                    class="messageTextContent"
                    @click="openWindow(item.content)"
                    @contextmenu="onmousecontextmenu($event)"
                    v-html="httpString(item.content)"
                  ></p>
                  <!-- 图片 -->
                  <div
                    v-if="item.msgType == 'image'"
                    class="content hx-Imagecontent"
                  >
                    <div class="text Setimagesize">
                      <img
                        @click="imgDialog(item,index)"
                        class="messageImg"
                        :src="showImg(item)"
                        :data-time="item.serverTime"
                      />
                    </div>
                  </div>
                  <!-- 文件 -->
                  <div v-if="item.msgType == 'file'" class="content">
                    <div class="attach-file">
                      <a class="attFileStyle">
                        <img
                          style="width:48px;float:left"
                          :src="fileDOC(item.content)"
                          alt=""
                          srcset="">
                        <div class="attach-desc">
                          <div class="filename">{{item.content}}</div>
                          <span style="margin-left:10px">大小：{{item.json | fileSize}}</span>
                          <span :id="item.message_key" style="margin-left:10px;font-size:15px;color:#333;display:none;">
                            &nbsp;下载中...
                          </span>
                          <div class="hx_version-bar"></div>
                        </div>
                        <div class="fileMessBox">
                          <i v-if="item.localPath==null" :data-downKey="item.message_key" class="icon iconfont icon-down1" @click="downFile($event,item)">&nbsp;&nbsp;</i>
                          <span v-if="item.localPath" class="myOpenFile" :data-key="item.message_key">
                            <span class="openTarget" @click="openn(item)">打开</span>&nbsp;&nbsp;
                            <span class="openfilePath" @click="button_choose_file(item)">打开文件夹</span>
                          </span>
                          <span v-else v-show="false" class="myOpenFile" :data-key="item.message_key">
                            <span class="openTarget" @click="openn(item)">打开</span>&nbsp;&nbsp;
                            <span class="openfilePath" @click="button_choose_file(item)">打开文件夹</span>
                          </span>
                        </div>
                      </a>
                    </div>
                  </div>
                  <!-- 视频 -->
                  <div v-if="item.msgType == 'video'" class="hx-viedo">
                    <img @click="imgDialog(item,index)" :src="videoImg(item)" class="video" style="width: 220px;height:120px;"/>
                    <div class="videoBox">
                      <span class="videoName">{{item.content}}</span>
                      <span v-if="item.localPath" @click="openVideo(item)"  :data-key="item.message_key" class="videoHover">打开文件夹</span>
                      <span v-else v-show="false" @click="openVideo(item)"  :data-key="item.message_key" class="videoHover">打开文件夹</span>
                      <span :id="item.message_key" style="margin-left:10px;font-size:15px;color:#333;display:none;">
                            &nbsp;下载中...
                      </span>
                    </div>
                  </div>
                  <!-- 音频 -->
                  <div v-if="item.msgType == 'voice'" class="content">
                    <audio class="audioTag" controls>
                      <source :src="item.localPath" type="audio/mpeg">
                    </audio>
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <div class="loading-bar" v-show="loadingShow">
            <svg class="icon icon-loading" aria-hidden="true">
              <use xlink:href="#icon-loading"></use>
            </svg>
            加载中...
          </div>
        </pull-to>
      </div>
    </div>
  </div>
</template>
<script>
import PullTo from "vue-pull-to";
import moment from "moment";
import Vue from "vue";
import path from "path";
import { setTimeout } from "timers";
require("video.js/dist/video-js.css");
require("vue-video-player/src/custom-theme.css");
const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const { BrowserWindow } = require("electron").remote;
const { shell } = require("electron").remote;
var remote = require("electron").remote;
//图片弹窗地址
var newTel = remote.getGlobal("sharedObject").newTel;
var mediaWin = null;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const SendMenu = new Menu();
const AcceptMenu = new Menu();
const clipboard = require("electron").clipboard;
var dataARR,
  txtEditorNum = 0;
Event = new Vue();
    moment.locale("zh-cn");
    var appPath = "";
    
export default {
  components: {
    PullTo
  },
  data() {
    return {
      getMess: "",
      messRecodeName: "",
      msgList: [],
      getMessObj: null,
      userMsg: null,
      pageIndex: 1,
      pageSize: 15,
      sqlAnd: null,
      searchSql: null,
      loadingShow: true,
      tagCode: 1,
      emojis: [
          { file: '100.gif', code: '/::)', title: '微笑', reg: /\/::\)/g },
          { file: '101.gif', code: '/::~', title: '伤心', reg: /\/::~/g },
          { file: '102.gif', code: '/::B', title: '美女', reg: /\/::B/g },
          { file: '103.gif', code: '/::|', title: '发呆', reg: /\/::\|/g },
          { file: '104.gif', code: '/:8-)', title: '墨镜', reg: /\/:8-\)/g },
          { file: '105.gif', code: '/::KU', title: '哭', reg: /\/::KU/g },
          { file: '106.gif', code: '/::$', title: '羞', reg: /\/::\$/g },
          { file: '107.gif', code: '/::X', title: '哑', reg: /\/::X/g },
          { file: '108.gif', code: '/::Z', title: '睡', reg: /\/::Z/g },
          { file: '109.gif', code: '/::\'(', title: '哭', reg: /\/::'\(/g },
          { file: '110.gif', code: '/::-|', title: '囧', reg: /\/::-\|/g },
          { file: '111.gif', code: '/::@', title: '怒', reg: /\/::@/g },
          { file: '112.gif', code: '/::P', title: '调皮', reg: /\/::P/g },
          { file: '113.gif', code: '/::D', title: '笑', reg: /\/::D/g },
          { file: '114.gif', code: '/::O', title: '惊讶', reg: /\/::O/g },
          { file: '115.gif', code: '/::(', title: '难过', reg: /\/::\(/g },
          { file: '116.gif', code: '/::+', title: '酷', reg: /\/::\+/g },
          { file: '117.gif', code: '/:--b', title: '汗', reg: /\/:--b/g },
          { file: '118.gif', code: '/::Q', title: '抓狂', reg: /\/::Q/g },
          { file: '119.gif', code: '/::T', title: '吐', reg: /\/::T/g },
          { file: '120.gif', code: '/:,@P', title: '笑', reg: /\/:,@P/g },
          { file: '121.gif', code: '/:,@-D', title: '快乐', reg: /\/:,@-D/g },
          { file: '122.gif', code: '/::d', title: '奇', reg: /\/::d/g },
          { file: '123.gif', code: '/:,@o', title: '傲', reg: /\/:,@o/g },
          { file: '124.gif', code: '/::e', title: '饿', reg: /\/::e/g },
          { file: '125.gif', code: '/:|-)', title: '累', reg: /\/:\|-\)/g },
          { file: '126.gif', code: '/::!', title: '吓', reg: /\/::!/g },
          { file: '127.gif', code: '/::L', title: '汗', reg: /\/::L/g },
          { file: '128.gif', code: '/::gaoxing', title: '高兴', reg: /\/::gaoxing/g },
          { file: '129.gif', code: '/::,@', title: '闲', reg: /\/::,@/g },
          { file: '130.gif', code: '/:,@f', title: '努力', reg: /\/:,@f/g },
          { file: '131.gif', code: '/::-S', title: '骂', reg: /\/::-S/g },
          { file: '133.gif', code: '/:,@x', title: '秘密', reg: /\/:,@x/g },
          { file: '134.gif', code: '/:,@@', title: '乱', reg: /\/:,@@/g },
          { file: '135.gif', code: '/::8', title: '疯', reg: /\/::8/g },
          { file: '136.gif', code: '/:,@!', title: '哀', reg: /\/:,@!/g },
          { file: '137.gif', code: '/:!!!', title: '鬼', reg: /\/:!!!/g },
          { file: '138.gif', code: '/:xx', title: '打击', reg: /\/:xx/g },
          { file: '139.gif', code: '/:bye', title: 'bye', reg: /\/:bye/g },
          { file: '142.gif', code: '/:handclap', title: '鼓掌', reg: /\/:handclap/g },
          { file: '145.gif', code: '/:s@', title: '什么', reg: /\/:s@/g },
          { file: '147.gif', code: '/::-O', title: '累', reg: /\/::-O/g },
          { file: '153.gif', code: '/:@x', title: '吓', reg: /\/:@x/g },
          { file: '155.gif', code: '/:pd', title: '刀', reg: /\/:pd/g },
          { file: '156.gif', code: '/:shuiguo', title: '水果', reg: /\/:shuiguo/g },
          { file: '157.gif', code: '/:beer', title: '酒', reg: /\/:beer/g },
          { file: '158.gif', code: '/:basketb', title: '篮球', reg: /\/:basketb/g },
          { file: '159.gif', code: '/:oo', title: '乒乓', reg: /\/:oo/g },
          { file: '195.gif', code: '/:circle', title: '跳舞', reg: /\/:circle/g },
          { file: '160.gif', code: '/:coffee', title: '咖啡', reg: /\/:coffee/g }
      ],
      fileSuffix: ["css","ttf","mpp","node","vue","js","php","docx","xls","folder","zip","avi","swf","wav","txt","rmvb","xlsx","mkv","psd","mpg","exe","pdf","mp4","ppt","dll","mp3","html","jpg","doc","rar"],
      messTag: [
        {tagName: "全部",code: 1,type:'all'},
        {tagName: "图片",code: 2,type:'image'},
        {tagName: "文件",code: 3,type:'file'},
        {tagName: "视频",code: 4,type:'video'}
      ],
        sqlData: [],
        searchData: null,
        sqlWhere: null,
        sqlType: false
    };
  },

        computed: {},
        watch: {
            search(newValue, oldValue) {
                console.log('变动之前的值:' + oldValue);
                console.log('变动后的值：' + newValue); 
            }
        },
  created() {
      var _me = this;

      appPath = localStorage.getItem("developmentPath");
    // 监听下载进度
      ipcRenderer.on("ipcDown", function (event, arg, value) {
          try {
              if (arg.errorCode === 300) {
                  var argData = JSON.parse(arg.data);
                  document.getElementById(value.message_key).style.display = "inline-block";
                  document.getElementById(value.message_key).innerHTML = "已下载：" + (argData.progressAmount / argData.progressTotal * 100).toFixed(2) + "%";
              }
              if (arg.errorCode === 200) {
                  if (value.type == "file") {
                      document.getElementById(value.message_key).style.display = "none";
                      var openArr = document.getElementsByClassName("myOpenFile");
                      for (var i = 0; i < openArr.length; i++) {
                          if (openArr[i].getAttribute("data-key") === value.message_key) {
                              openArr[i].style.display = "inline-block";
                              openArr[i].setAttribute("data-path", arg.data.rootPath + arg.data.thisDir);
                          }
                      };
                  } else {
                      document.getElementById(value.message_key).style.display = "none";
                      var openVideoArr = document.getElementsByClassName("videoHover");
                      for (var i = 0; i < openVideoArr.length; i++) {
                          if (openVideoArr[i].getAttribute("data-key") === value.message_key) {
                              openVideoArr[i].style.display = "inline-block";
                              openVideoArr[i].setAttribute("data-path", arg.data.rootPath + arg.data.thisDir);
                          }
                      };
                  }
                  var sendsData = {};
                  sendsData.keys = value.message_key;
                  sendsData.path = arg.data.rootPath + arg.data.thisDir;
                  sendsData.id = _me.getMess.id
                  ipcRenderer.send("MAINWIN:MESSFILEDOWN", JSON.stringify(sendsData));
              }
          }
          catch (error) {
              console.log(error);
          }
    })
    ipcRenderer.once("SyncData", function(event, data) {
      console.log(JSON.stringify(data));
      _me.getMess = data.selectFriendAticon;
      _me.messRecodeName = data.selectFriendAticon.name;
      _me.loadData();
    });
    //this.loadData();
  },
  mounted() {
    if (txtEditorNum == 0) {
      txtEditorNum++;
      SendMenu.append(
        new MenuItem({
          label: "复制",
          role: "copy",
          enabled: true
        })
      );

      AcceptMenu.append(
        new MenuItem({
          label: "复制",
          role: "copy",
          enabled: true
        })
      );
    }
  },

methods: {
    searchChange() {
        if (this.search.length > 0) {
            this.searchData = {
                content: {
                    $like: '%' + this.search + '%'
                }
            }
        }
        else {
            this.searchData = null;
        }

        this.pageIndex = 1;
        this.msgList = [];
        this.loadData()

    },
    // 视频封面
    videoImg(value) {
        return path.join(appPath, "/static/images/video.png");
    },
    // 文件后缀图片
    fileDOC(value) {
      var extName = value.substr(value.lastIndexOf(".") + 1);
      let doc = this.fileSuffix.find(session => session === extName);
      if (doc == undefined) {
          return path.join(appPath, "/static/images/fileIcon/othe.svg");
      } else {
          return path.join(appPath, "/static/images/fileIcon/" + doc + ".svg");
      }
    },
    // 打开网址
    openWindow(url) {
      shell.openExternal(url);
    },
    cliTag(item) {
        this.tagCode = item.code;
        this.pageIndex = 1;
        this.msgList = [];

        this.sqlAnd = { msgType: item.type };


        this.sqlType = item.type != "all";

        if (item.type === "all") {
            this.sqlAnd = {
                $or: [
                    { msgType: 'text' },
                    { msgType: 'file' },
                    { msgType: 'image' },
                    { msgType: 'video' }
                ]
            }
        }


        this.loadData();


    },
    close() {
      ipcRenderer.send("MSGLOGWIN:close");
    },
    onmousecontextmenu(e) {
      var url = e.currentTarget.dataset.path;
      if (url != undefined) {
        this.selectImg(e.target);
      } else {
        this.selectText(e.target);
      }

      SendMenu.popup(remote.getCurrentWindow());
    },
    loadData() {
        var _me = this;

      if (!_me.sqlType) {
        _me.sqlAnd = {
          $or: [
            { msgType: "text" },
            { msgType: "file" },
            { msgType: "image" },
            { msgType: "video" }
          ]
        };
      }

        if (_me.getMess.channelType === "G") {
            _me.sqlWhere = {
                fromType: "group",
                targetId: _me.getMess.id,
                isRevoke: 0,
                $and: _me.sqlAnd
            };
        }
        else {
            _me.sqlWhere = {
                targetType: "single",
                isRevoke: 0,
                $and: [{
                    $or: [
                        { targetId: _me.getMess.id },
                        { fromId: _me.getMess.id },
                    ]
                }, _me.sqlAnd]
            };
        }

        //搜索数据
      if (_me.searchData) {
        //_me.sqlAnd = {
        //  msgType: "text"
        //};

          if (_me.getMess.channelType === "G") {
              _me.sqlWhere = {
                  fromType: "group",
                  targetId: _me.getMess.id,
                  isRevoke: 0,
                  $and: [_me.sqlAnd, _me.searchData]
              };
          }
          else {
              _me.sqlWhere = {
                  targetType: "single",
                  isRevoke: 0,
                  $and: [_me.sqlAnd, _me.searchData, {
                      $or: [
                          { targetId: _me.getMess.id },
                          { fromId: _me.getMess.id },
                      ]
                  }]
              };
          }
        }

      var sendData = {
        sqlWhere: _me.sqlWhere,
        pageSize: _me.pageSize,
        pageIndex: _me.pageIndex
      };

      var data = ipcRenderer.sendSync("MSGLOGWIN:SelectData", sendData);

      var resObj = JSON.parse(data);

      _me.loadingShow = resObj.length > 0 && resObj.length >= _me.pageSize;

      resObj.forEach(it => {
        _me.msgList.push(it);
      });
      _me.pageIndex++;
      console.log("查询数据:" + data);
    },
    loadmore() {
      this.loadData();
    },
    selectText(element) {
      var text = element;
      if (document.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(text);
        range.select();
      } else if (window.getSelection) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
        /*if(selection.setBaseAndExtent){
                        selection.setBaseAndExtent(text, 0, text, 1);
                    }*/
      } else {
        alert("none");
      }
    },
    selectImg(element) {
      var text = element;
      if (document.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(text);
        range.select();
      } else if (window.getSelection) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(text);
        var currentSrc = text.currentSrc.split("///")[1];
        var rangeS = "<img src=" + currentSrc + ">";
        clipboard.writeText(currentSrc);
        selection.removeAllRanges();
        selection.addRange(range);
        /*if(selection.setBaseAndExtent){
                        selection.setBaseAndExtent(text, 0, text, 1);
                    }*/
      } else {
        alert("none");
      }
    },

    showImg(item) {
      if (item.localPath != null) {
        return item.localPath;
      } else {
        // return this.downFile(item);
      }
    },
    downFile(e,value){
      if(typeof value.json == "string"){
        value.json = JSON.parse(value.json);
      };
      if(typeof value.json.msgBody == "string"){
        value.json.msgBody = JSON.parse(value.json.msgBody);
      };
      e.currentTarget.style.display="none";
      document.getElementById(value.message_key).style.display="inline-block";
      var fileMess={};
      fileMess.type = value.msgType
      fileMess.name = value.content;
      fileMess.code = value.json.msgBody.msgContent.mediaId;
      fileMess.message_key = value.message_key;
      // 打包数据，发往主进程处理
      ipcRenderer.send("MSGLOGWIN:downFile",fileMess);
    },
    httpString(s) {
        var reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|;|#|,|&amp;|%|$|#|!|:|_|-)+)/g;
      var imgName = s.substr(s.lastIndexOf(".") + 1);
      let imgFormat = ["jpg","jpge","png","gif","tiff","bmp","tga","psd","ai","raw","webp"];
        let isImg = imgFormat.find(imgs => imgs == imgName);
      if (isImg == undefined) {
          s = s.replace(reg,"<a style='text-decoration:underline;color:#423fd8' @click='cliHttp($1$2)'  href='$1$2'>$1$2</a>"); //这里的reg就是上面的正则表达式
      } else {
          s = "<img style='max-width: 100%' src='" + s + "'>";
        }
        //替换“图片={xxxx}”
        var imgUrlReg = /图片={<a[^>]*href=['"]([^"]*)['"][^>]*>(.*?)<\/a>}/g;
        s = s.replace(imgUrlReg, "<img style='max-width: 100%;' src='$1'>");
        console.log("httpString:" + s)
        //图片替换完成
      return s;
    },
    cliHttp(value) {
      shell.openExternal(value);
    },
    // 打开视频文件夹
    openVideo(item) {
      if(item.localPath){
        shell.showItemInFolder(item.localPath);
      }else{
        var openVideoArr = document.getElementsByClassName("videoHover");
        for(var i=0;i<openVideoArr.length;i++){
          if(openVideoArr[i].getAttribute("data-key")===item.message_key){
            shell.showItemInFolder(openVideoArr[i].getAttribute("data-path"));
          }
        }
      }
    },
    // 打开文件文件夹
    button_choose_file(item) {
      if(item.localPath){
        shell.showItemInFolder(item.localPath);
      }else{
        var openArr = document.getElementsByClassName("myOpenFile");
        for(var i=0;i<openArr.length;i++){
          if(openArr[i].getAttribute("data-key")===item.message_key){
            shell.showItemInFolder(openArr[i].getAttribute("data-path"));
          }
        }
      }
    },
    // 打开文件
    openn: function(item) {
      if(item.localPath){
        shell.openItem(item.localPath);
      }else{
        var openArr = document.getElementsByClassName("myOpenFile");
        for(var i=0;i<openArr.length;i++){
          if(openArr[i].getAttribute("data-key")===item.message_key){
            shell.openItem(openArr[i].getAttribute("data-path"));
          }
        }
      }
    },

    //图片视频弹窗
    imgDialog(item, index) {
      var itemObj = JSON.parse(item.json);
      if (typeof itemObj.msgBody == "string") {
        itemObj.msgBody = JSON.parse(itemObj.msgBody);
      }
      if (item.localPath === null) {
        var value = item.content;
      } else {
        var value = item.localPath;
      }
      if (item.msgType == "image") {
        var imgTags = document.getElementsByClassName("messageImg");
        //聊天图片数组
        var imgarr = [];
        var keyArr = [];
        var imgS = "";
        for (var i = 0; i < imgTags.length; i++) {
          if (imgTags[i].src != "") {
            if (imgTags[i].src.indexOf("file:///") != -1) {
              imgS = imgTags[i].src.slice(8);
            } else {
              imgS = imgTags[i].src;
            }
            keyArr.push(imgS);
            imgarr.push({
              imgsrc: imgS,
              imgkey: imgTags[i].dataset.time
            });
          }
        }
        //当前图片位置
        //当前图片位置
        var eImg = 1;
        var flag = false;
        for (var j = 0; j < imgarr.length; j++) {
          if (imgarr[j].imgkey == item.serverTime && flag == false) {
            eImg = j + 1;
            flag = true;
          }
        }
        var imgarrStr = keyArr.join(",");
        //图片路径存入本地
        //clientiot.globalinfo.storage("imgArr",imgarrStr);
        //图片张数
        var imgarrLen = imgarr.length;

        ipcRenderer.send("IMGWIN:bigImg", value);
        //if(mediaWin){
        //    return
        //}
        var icoPath =
          process.env.NODE_ENV === "development"
            ? `./static/icons/icon.ico`
            : `./dist/electron/static/icons/icon.ico`;
        mediaWin = new BrowserWindow({
          modal: true,
          show: false,
          width: 1000,
          height: 800,
          resizable: false,
          alwaysOnTop: false,
          useContentSize: true,
          frame: false,
          skipTaskbar: false,
          icon: icoPath,
          webPreferences: {
            webSecurity: false
          }
        });
        var codeUrl = encodeURI(
          "value=" +
            value +
            "&imgarr=" +
            imgarrStr +
            "&eImg=" +
            eImg +
            "&imgarrLen=" +
            imgarrLen
        );
        mediaWin.isMovable(true);
        mediaWin.loadURL(newTel + codeUrl);
        mediaWin.once(
          "ready-to-show",
          () => {
            mediaWin.show();
          },
          100
        );
        mediaWin.on("closed", () => {
          mediaWin = null;
          flag = false;
        });
      } else {
        if(item.localPath){
          shell.openExternal(item.localPath);
        }else{
          var openVideoArr = document.getElementsByClassName("videoHover");
            for(var i=0;i<openVideoArr.length;i++){
              if(openVideoArr[i].getAttribute("data-key")===item.message_key){
                if(openVideoArr[i].getAttribute("data-path")){
                  shell.openExternal(openVideoArr[i].getAttribute("data-path"));
                }else{
                  var videoMess={};
                  videoMess.type = item.msgType;
                  videoMess.name = item.content;
                  videoMess.code = itemObj.msgBody.msgContent.mediaId;
                  videoMess.message_key = item.message_key;
                  // 打包数据，发往主进程处理
                  ipcRenderer.send("MSGLOGWIN:downFile",videoMess);
                }
              }
            };
        }
      }
    },

    replaceFace(con) {

        var _staticPath = path.join(appPath, "/static/emoji/");
      if (!con && typeof con == "object") {
        return con;
      }
      if (typeof con != "string") {
        return con;
      }

      if (con === "undefined") {
        return "";
      }
      if (con.includes("/:")) {
        var emojis = this.emojis;
        for (var i = 0; i < emojis.length; i++) {
          con = con.replace(
            emojis[i].reg,
            '<img src="file://'+_staticPath +emojis[i].file +
              '" alt="" style="vertical-align: middle; width: 24px; height: 24px" />'
          );
        }
          return con.replace(/,/g, "").replace(/<\/?p[^>]*>/gi, '');
        }
        return con;
    },
    realAvatarUrl() {
      let user_image = JSON.parse(sessionStorage.getItem("currentUser"))
        .avatarUrl;
      if (user_image) {
        return user_image;
      }
    }
  },
  filters: {
    // 文件大小
    fileSize(value) {
      if (typeof value == "string") {
        value = JSON.parse(value);
      }
      if (typeof value.msgBody == "string") {
        value.msgBody = JSON.parse(value.msgBody);
      }
      var size = value.msgBody.msgContent.fileSize;
      if (size < 1024) {
        return String(size) + "B";
      } else if (size > 1024 && size < 1024 * 1024) {
        return String((size / 1024).toFixed(2)) + "KB";
      } else if (size > 1024 * 1024) {
        return String((size / 1024 / 1024).toFixed(2)) + "MB";
      }
    },
    // 将日期过滤为 hour:minutes
    time(value) {
      if (!value) {
        return value;
      }
      if (typeof value == "string" || typeof value == "object") {
        value = Date.parse(value);
      }
      //获取当天的时间
      let getDate = new Date();
      const now = Date.now();
      getDate.setHours(0);
      getDate.setMinutes(0);
      getDate.setSeconds(0);
      getDate.setMilliseconds(0);
      let oneDay = getDate.getTime();
      if (value > oneDay) {
        return moment(value).format("HH:mm");
      } else if (value < oneDay) {
        return moment(value).format("YYYY-MM-DD HH:mm");
      }
    }
  }
};
</script>
<style lang="stylus">
@import '../../../src/renderer/assets/fonts/iconfont.css';

body {
  margin: 0;
}

.loading-bar {
  height: 40px;
  text-align: center;
  line-height: 40px;
  font-size: 12px;
  color: #34495e;
}

.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.icon-loading {
  transform: rotate(0deg);
  animation-name: loading;
  animation-duration: 3s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

@keyframes loading {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.messageBox {
  top: -600px;
  left: 0px;
  z-index: 2;
  background-color: #f5f5f5;
  border: 1px solid #d1d1d1;
  border-radius: 5px;
  box-shadow: 0 2px 4px 2px #d1d1d1;
  -webkit-app-region: drag;
  user-select: text;

  &.showMessageBox-enter-active, &.showMessageBox-leave-active {
    transition: all 0.5s;
  }

  &.showMessageBox-enter, &.showMessageBox-leave-active {
    opacity: 1;
  }

  .wrapper {
    padding: 0px;
    width: 80%;
    margin-left: 10%;
  }

  .header {
    height: 60px;
    width: 100%;
    display: flex;
    padding-left: 20px;
    box-sizing: border-box;

    .friendname {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 60px;
      flex: 1;
    }

    .hiddenBox {
      display: inline-block;
      width: 30px;
      height: 30px;
      text-align: center;
      line-height: 30px;
      -webkit-app-region: no-drag;

      &:hover {
        background-color: #f45454;
        color: white;
        cursor: pointer;
      }
    }
  }

  .messageSort {
    padding-left: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    -webkit-app-region: no-drag;

    li {
      width: 15%;
      list-style: none;
      line-height: 34px;
      text-align: center;
      font-size: large;
      border-bottom: 2px solid #f5f5f5;

      &:hover {
        border-bottom: 2px solid #1AAD19;
        color: #1AAD19;
        cursor: pointer;
      }

      &.actives {
        border-bottom: 2px solid #1AAD19;
        color: #1AAD19;
      }
    }
  }

  hr {
    border: none;
    height: 1px;
    background-color: #dddddd;
    width: 100%;
    margin-top: 10px;
  }

  .messageRecodeBox {
    padding: 10px 30px;
    height: 459px;
    -webkit-app-region: no-drag;

    .recodeCard {
      border-bottom: 1px solid #ccc;
      margin-bottom: 10px;
    }
  }

  .messageRecodeBox ul {
    padding: 0;
  }

  .messageRecodeBox ul li {
    list-style: none;
  }

  .messageRecodeBox ::-webkit-scrollbar {
    display: none;
  }

  .messageTextBox {
    display: inline-block;
    width: 100%;
    heigth: 100%;

    .messageTextName {
      height: 18px;
      line-height: 18px;
      color: #adaeaf;
      font-size: 13px;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      span {
        float: right;
        font-size: 12px;
      }
    }

    .messageTextContent {
      overflow: hidden;
      word-wrap: break-word;
      color: #333;
      font-size: 14px;
      margin: 5px;
      white-space: pre-line;

      p {
        margin: 0px;
      }
    }
  }
}

.messageImg {
  max-width: 100px;
}

.attach-file {
  color: #333;
  font-size: 14px;
}

.attach-file {
  margin: 10px 0px;
}

.filename {
  margin-left: 10px;
  line-height: 24px;
  width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fileMessBox, .fileMessBoxs {
  margin-right: 60px;
}

.fileMessBoxs {
  margin-bottom: 10px;

  &:hover {
    cursor: pointer;
  }
}

.el-icon-download, .videoHover, .openfilePath, .openTarget {
  &:hover {
    color: #1aad19;
    cursor: pointer;
  }
}

.myOpenFile {
  cursor: pointer;
}

.box, .Setimagesize, .video, .getVideo {
  margin-bottom: 10px;
}

.hx-viedo {
  color: #333;
  font-size: 14px;
}

.attach-desc {
    height: 64px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}

.audioTag {
  width: 265px;
}

.videoBox {
  display: flex;
  width:220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-direction: row;
  justify-content: space-between;
}

.messSearchDiv {
  width: 100%;
  text-align: center;
  -webkit-app-region: no-drag;
}

#messSearch {
  width: 80%;
  height: 32px;
  padding: 0 15px;
  background: #f2efee;
  border-style: hidden;
  border-radius: 4px;

  &:focus {
    border: 1px solid #eee;
    background: white;
    outline: none;
  }
}
.icon-down1{
  margin-left:15px;  
  &:hover{
    cursor: pointer;
  }
}
.videoName{
  width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

