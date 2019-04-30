<template>
<div>
  <div
    class="messageBox"
    id="messageBox"
  >
    <div class="header">
        <div class="friendname">{{messRecodeName}}</div>
      <span
        class="hiddenBox"
        @click="messagesPlay"
      >×</span>
    </div>
    <messSearch></messSearch>
    <ul class="messageSort">
      <li
        v-for="list in searchedMesslist"
        @click="chooseMess(list)"
        :class="{actives:list.type===messagesTag}"
      >{{list.name}}</li>
    </ul>
    <hr>
    <div class="messageRecodeBox"
         ref="message">
        <pull-to @infinite-scroll="loadmore">
            <ul v-if="msgList">
                <li v-for="(item,index) in msgList">
                    <div class="recodeCard">
                        <!-- <img v-if="item.msgType==='notic'" class="userImg" width="36px" height="36px" src="static/images/group.png" alt="0.0"> -->
                        <!-- <img v-else class="userImg" width="36px" height="36px" :src="item.self?realAvatarUrl():item.msgUserImg" alt="0.0"> -->
                        <div class="messageTextBox">
                            <p class="messageTextName">{{item.fromName?item.fromName:"未知"}}<span>{{item.time | time}}</span></p>
                            <!-- 文本 -->
                            <p class="messageTextContent"
                               v-if="item.msgType==='text'"
                               v-html="httpString(replaceFace(item.content))" @contextmenu="onmousecontextmenu($event)"></p>
                            <!-- 网址 -->
                            <p class="messageTextContent"
                               v-if="item.msgType==='http'"
                               @click="openWindow(item.content)" @contextmenu="onmousecontextmenu($event)" v-html="httpString(item.content)"></p>
                            <!-- 图片 -->
                            <p class="messageTextContent"
                               v-if="item.msgType==='image'">
                                <div class="content hx-Imagecontent" v-if="item.msgType==='image'" ref="dataurl" :data-url="item.json">
                                    <div class="text Setimagesize">
                                        <img class="messageImg" :data-time="item.serverTime" :src="showImg(item)" @contextmenu="onmousecontextmenu($event)" @click="imgDialog(item,index)" ref="dataold" :data-path="item.localPath">
                                    </div>
                                </div>
                            </p>
                            <!-- 文件 -->
                            <div class="content"
                                 v-if="item.msgType==='file'"
                                 ref="dataurl"
                                 :data-url="JSON.stringify(item)">
                                <messRecodeFile v-bind:message='item'></messRecodeFile>
                            </div>
                            <!-- 视频 -->
                            <p class="messageTextContent" v-if="item.msgType==='video'">
                                <div v-if="item.msgType==='video'" :key="initLoading(item)" class="hx-viedo">
                                    <el-card v-loading="loadings&&item.localPath==null&&downItem == item.message_key" :lock-scroll="false">
                                    <img @click="imgDialog(item)" src="static/images/video.png" class="video" style="width: 100%;" />
                                    <div class="box" style="left:12px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;width: 80%;maring:0">{{item.content }}</div>
                                    <span v-if="item.localPath!=null" class="videoHover" @click="button_choose($event,item)" :data-path="item.localTime">打开文件夹</span>
                                    </el-card>
                                </div>
                            </p>
                            <div class="content" v-if="item.msgType==='audio'">
                                <audio class="audioTag" controls>
                                    <source :src="item.localPath" type="audio/mpeg">
                                </audio>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
            <div class="loading-bar" v-show="loadingShow">
                <svg class="icon icon-loading"
                     aria-hidden="true">
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
    import PullTo from 'vue-pull-to'

import { mapGetters, mapState, mapActions } from "vuex";
import messSearch from "../../components/search/messSearch";
import moment from "moment";
import Vue from "vue";
import messRecodeFile from './messRecodeFile'
import path from "path";
import { setTimeout } from "timers";
require("video.js/dist/video-js.css");
require("vue-video-player/src/custom-theme.css");
const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const clientiot = require("@hxim/clientiot");
var co = require("co");
const { BrowserWindow } = require("electron").remote;
const { shell } = require("electron").remote;
var remote = require("electron").remote;
//图片弹窗地址
var newTel = remote.getGlobal("sharedObject").newTel;
var mediaWin = null;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const SendMenu = new Menu();
const AcceptMenu=new Menu()
const clipboard = require('electron').clipboard
var  dataARR,txtEditorNum=0;
    Event = new Vue();
    var imgDir = clientiot.globalinfo.createDirPath("/profile/images/", clientiot.config.setting.filePath);
    var orderBy = " order by time desc";
moment.locale("zh-cn");
export default {
  components: {
    messSearch,
      messRecodeFile,
      PullTo
  },
  data() {
      return {
          getMess: '',
          downItem:'',
          loadings:false,
          messRecodeName: '',
          msgList: [],
          getMessObj: null,
          userMsg: null,
          pageIndex: 1,
          pageSize:15,
          sqlAnd: null,
          searchData: null,
          loadingShow: false,
          sqlWhere: null,
          sqlType: false
      };
  },

  computed: {
    ...mapState([
      "user",
      "selectId",
      "emojis",
      "selectFriendId",
      "messagesTag",
      "UploadprogNum",
      "getMessRecodeName"
    ]),
    ...mapGetters([
      "selectedChat",
      "searchFriendMessage",
      "messages",
      "searchedMesslist"
    ])
  },
        created() {
            this.loadData();


        },
  mounted() {
      this.$refs.message.scrollTop = this.$refs.message.scrollHeight;
      Event.$on("searchData", data => {
          this.pageIndex = 1;
          this.msgList = [];
          this.searchData = data;
          this.loadData()
      });
      if(txtEditorNum==0){
        txtEditorNum++;
        SendMenu.append(new MenuItem(
            {
                label: '复制',
                role: 'copy',
                enabled:true
            }  
        ))
   
        // SendMenu.append(new MenuItem({type: 'separator'}))
        // SendMenu.append(new MenuItem({
        //     label: '转发',
        //     click: function (e) {
        //         var me=this;
        //         Events.$emit('IsForwardData', true);
        //     }
        // }));
        AcceptMenu.append(new MenuItem(
            {
                label: '复制',
                role: 'copy',
                enabled:true 
            }  
        ))
        // AcceptMenu.append(new MenuItem({type: 'separator'}))
        // AcceptMenu.append(new MenuItem({
        //     label: '转发',
        //     click: function (e) {
        //         var me=this;
        //         Events.$emit('IsForwardData', true);
        //     }
        // }));
    } 
  },
       
        methods: {
            initLoading(value){
                var getLoadKey = sessionStorage.getItem(value.message_key);
                if(getLoadKey == "true"){
                    this.loadings = true
                }
                return value.message_key
            },
            onmousecontextmenu(e) {
                var url=e.currentTarget.dataset.path;
                if(url!=undefined){
                    this.selectImg(e.target)
                }else{
                    this.selectText(e.target)
                }
        //         if(e.button ==2){
        //             txtEditorNum++;
        //             var data=e.target.dataset.src;
        //             var dataText=e.target.innerText;
        //             var items=e.target.offsetParent.dataset.url;
        //             var url=e.target.offsetParent.dataset.path;
                    
        //             if(items!=undefined){
        //                 dataARR=JSON.parse(items)
        //             }
        // 　　    };
                // if(dataARR.self==true){
                    SendMenu.popup(remote.getCurrentWindow())
                // }else{
                    // AcceptMenu.popup(remote.getCurrentWindow())
                // }
            
            },
            loadData() {
                var _me = this;

                var getMessJson = localStorage.getItem("getMess");
                this.userMsg = JSON.parse(localStorage.getItem("userMsg"));
                this.getMessObj = JSON.parse(getMessJson);
                this.getMess = getMessJson;
                this.messRecodeName = this.getMessObj.name;

                if (!this.sqlType) {
                    this.sqlAnd = {
                        $or: [
                            { msgType: 'text' },
                            { msgType: 'file' },
                            { msgType: 'image' },
                            { msgType: 'video' }
                        ]
                    }
                }

                this.sqlWhere = {
                    targetType: "single",
                    isRevoke: 0,
                    $and: [{
                        $or: [
                            { targetId: this.getMessObj.id },
                            { fromId: this.getMessObj.id },
                        ]
                    }, this.sqlAnd]
                }


                if (this.getMessObj.channelType == "G") {

                    this.sqlWhere = {
                        fromType: "group",
                        targetId: this.getMessObj.id,
                        isRevoke: 0,
                        $and: this.sqlAnd
                    }

                }


                if (this.searchData) {

                    //之前有提过bug：不允许在其他类型中搜索
                    //this.sqlAnd = {
                    //    msgType: 'text'
                    //};
                       

                    this.sqlWhere = {
                        targetType: "single",
                        isRevoke: 0,
                        $and: [this.sqlAnd, this.searchData, {
                            $or: [
                                { targetId: this.getMessObj.id },
                                { fromId: this.getMessObj.id },
                            ]
                        }]
                    }

                    if (this.getMessObj.channelType == "G") {
                        this.sqlWhere = {
                            fromType: "group",
                            targetId: this.getMessObj.id,
                            isRevoke: 0,
                            $and: [this.sqlAnd, this.searchData]
                        }
                    }
                }



                clientiot.sqllite.getHxImMsg({
                    where: _me.sqlWhere,
                    limit: _me.pageSize,
                    order: [['time', 'desc']],
                    offset: _me.pageSize * (_me.pageIndex - 1)
                }, function (res) {

                    var resObj = JSON.parse(res);

                    _me.loadingShow = resObj.length > 0 && resObj.length >= _me.pageSize;

                    resObj.forEach(it => {
                        _me.msgList.push(it);
                    })
                    _me.pageIndex++;
                    console.log("查询数据:" + res)
                });


                //clientiot.localData.getMsgList(data).then((res) => {
                //    this.loadingShow = res.length > 0 && res.length>=this.pageSize;
                //    res.forEach(it => {
                //        this.msgList.push(it);
                //    })

                //    this.pageIndex++;

                //    console.log("res:" + res)
                //})
            },
            loadmore() {
                this.loadData();
            },
            // onmousecontextmenu(e) {
            //     this.selectText(e.target)
            // },
         
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
                     var currentSrc=text.currentSrc.split('///')[1]
                     var rangeS='<img src='+currentSrc+'>'
                    clipboard.writeText(currentSrc)
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
          if(item.localPath===null){
            //查找vue-chat中的路径
              var getMessJson = localStorage.getItem("getMess");
              var vue_chat = localStorage.getItem("vue-chat");
              var getMessObj = JSON.parse(getMessJson);

              var thisChat = JSON.parse(vue_chat).find(messages => messages.id === getMessObj.id && messages.channelType === getMessObj.channelType);
              if (!thisChat) {
                  return "http://mobileportal-test.g5air.com:8030/hxim/noImg.jpg";
              }
              var thisMessage = thisChat.messages.find(it => it.messageKeys === item.message_key);

              if (thisMessage) {
                  clientiot.sqllite.updateHxImMsg(
                      { localPath: thisMessage.filePath },
                      { message_key: item.message_key },
                      function (res) {
                          console.log(res);
                      }
                  );

                  return thisMessage.filePath;
              }
              else {
                  return "http://mobileportal-test.g5air.com:8030/hxim/noImg.jpg"
              }
          }else{
            return item.localPath
          }
          //return item.localPath;
    },
    openWindow(url){
        shell.openExternal(url);
    },
     httpString(s) {
         var reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|;|#|,|&amp;|%|$|#|_|-)+)/g;
        //var reg = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        //var reg=/(http(s)?\:\/\/)?(www\.)?(\w+\:\d+)?(\/\w+)+\.(swf|gif|jpg|bmp|jpeg)/gi;
        //var reg=/(http(s)?\:\/\/)?(www\.)?(\w+\:\d+)?(\/\w+)+\.(swf|gif|jpg|bmp|jpeg)/gi;
        //var reg= /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
        //var reg= /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/;
        var imgName=s.substr(s.lastIndexOf('.')+1);
        let imgFormat = ['jpg','jpge','png','gif','tiff','bmp','tga','psd','ai','raw','webp'];
        let isImg = imgFormat.find(imgs=>imgs==imgName);
        if(isImg == undefined){
            s = s.replace(reg, "<a style='text-decoration:underline;color:#423fd8' @click='cliHttp($1$2)'  href='#'>$1$2</a>"); //这里的reg就是上面的正则表达式
        }else{
            s = "<img style='max-width:300px' src='"+s+"'>"
        }
        // if(imgName=="jpg"){

        //     console.log(imgName)
        // }
        //s = s.replace(reg, "$1$2"); //这里的reg就是上面的正则表达式
        //s = s.match(reg);
        console.log("httpString:"+s)
        return s
    },
    cliHttp(value){
      shell.openExternal(value)
    },
    button_choose(e,item) {
      if(typeof item.localPath != "string"){
        var itemObj = JSON.parse(item.json);
        if(typeof itemObj.msgBody=="string"){
            itemObj.msgBody=JSON.parse(itemObj.msgBody);
        }
        shell.showItemInFolder(path.join(imgDir, itemObj.msgBody.msgContent.mediaId));
      }else{
        shell.showItemInFolder(item.localPath)
      }


      // var path2=filePath.lastIndexOf('\\');
      // var path3=filePath.substring(0,path2)
      // shell.openItem(path3);
    },
    button_choose_file(item) {
        var itemObj = JSON.parse(item.json);

        shell.showItemInFolder(path.join(imgDir, itemObj.msgBody.msgContent.mediaId));
    },
    openn: function(item) {
      shell.openItem(item);
    },
    downFile:function(item) {
      /*从S3下载文件*/
      var me=this;
      const itemFileCode = item.content;
      const itemFilename = item.oldname;
      const chatId = me.$store.state.selectFriendId;
      let downChat = me.$store.state.chatlist.find(chats=>chats.id===chatId);
      if( itemFileCode && itemFilename ){
          co(function*(){
            clientiot.awss31.DownloadFile(itemFileCode,"/profile/images/",function(res) {
                var resData = JSON.parse(res);
                console.log(resData)
                if(resData.errorCode ==300){
                    var Uploadprogress={upload:resData.data,msgId:itemFileCode}
                    me.$store.dispatch("Uploadprogress", Uploadprogress);
                }
                if (resData.errorCode == 200) {
                    let value={};
                    value.keys=item.messageKeys;
                    value.path=resData.data.rootPath+resData.data.thisDir;
                    value.id=chatId;
                    me.$store.dispatch("downFilePath", value);
                    setTimeout(function(){
                        me.$forceUpdate();
                    },200)
                }
            },itemFilename);
        })
      }
    },
    //图片视频弹窗
      imgDialog(item, index) {
          var me = this;
          if(typeof item.json == "string"){
              var itemObj = JSON.parse(item.json);
          }else{
              var itemObj = item.json;
          }
          if(typeof itemObj.msgBody=="string"){
            itemObj.msgBody=JSON.parse(itemObj.msgBody);
          }
          if(item.localPath ===null){
            var value = item.content
          }else{
            var value = item.localPath
          }
        if (item.msgType == 'image') {

            var imgTags = document.getElementsByClassName("messageImg");

            //聊天图片数组
            var imgarr = [];
            var keyArr = [];
            var imgS ='';
            for (var i = 0; i < imgTags.length; i++) {
              if(imgTags[i].src!=''){
                if(imgTags[i].src.indexOf("file:///") != -1){
                 imgS = imgTags[i].src.slice(8)
                }else{
                  imgS = imgTags[i].src
                }
                keyArr.push(imgS)
                imgarr.push({
                    imgsrc: imgS,
                    imgkey:imgTags[i].dataset.time
                })
              }
            }
            //当前图片位置
            //当前图片位置
            var eImg = 1;
            var flag = false;
            for(var j=0;j<imgarr.length;j++){
              if(imgarr[j].imgkey == item.serverTime&&flag==false){
                eImg = j+1;
                flag=true;
              }
            }
            var imgarrStr=keyArr.join(",")
            //图片路径存入本地
            //clientiot.globalinfo.storage("imgArr",imgarrStr);
            //图片张数
            var imgarrLen = imgarr.length;
           
            ipcRenderer.send('IMGWIN:bigImg',value)
            //if(mediaWin){
            //    return
            //}
            var icoPath = process.env.NODE_ENV === 'development' ? `./static/icons/icon.ico` : `./dist/electron/static/icons/icon.ico`;  
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
                    webSecurity: false,
                },
            });
                var codeUrl=encodeURI('value='+value+'&imgarr='+imgarrStr+'&eImg='+eImg+'&imgarrLen='+imgarrLen)
                mediaWin.isMovable(true);
                mediaWin.loadURL(newTel+codeUrl);
                mediaWin.once("ready-to-show",() => {
                    mediaWin.show();
                },100);
                 mediaWin.on('closed', () => {
                        mediaWin = null
                        flag=false;
                    })      
        }else{
            if(item.localPath!=null){
                shell.openExternal(item.localPath)
            }else{
                me.loadings = true;
                me.downItem = item.message_key;
                sessionStorage.setItem(item.message_key,true)
                item.json = JSON.parse(item.json);
                co(function*(){
                    clientiot.awss31.DownloadFile(item.json.msgBody.msgContent.mediaId,"/profile/images/",function(res) {
                        var resData = JSON.parse(res);
                        console.log(resData)
                        if(resData.errorCode ==300){
                        }
                        if (resData.errorCode == 200) {
                            me.loadings = false;
                            sessionStorage.removeItem(item.message_key)
                            var value = {};
                            value.keys = item.message_key;
                            value.path = resData.data.rootPath+resData.data.thisDir;
                            value.id = parseInt(localStorage.getItem("messBoxId"));
                            ipcRenderer.send("MAINWIN:MESSFILEDOWN",JSON.stringify(value));
                            var u_sql = "update HxImMsg set localPath='" + value.path + "' where message_key='" + item.message_key + "'";
                            clientiot.sqllite.executeNoQuerySql(u_sql, function (res) {
                                console.log(res);
                            });
                            var videoArr = document.getElementsByClassName("videoHover");
                            for(var t=0;t<videoArr.length;t++){
                                if(parseInt(videoArr[t].dataset.path) == item.localTime){
                                    videoArr[t].setAttribute("filePath",value.path)
                                }
                            }
                            shell.openExternal(resData.data.rootPath+resData.data.thisDir)
                        }
                    },item.json.msgBody.msgContent.text);
                })
            }
        }
    },
      chooseMess(value) {
          //alert(JSON.stringify(value))
          this.pageIndex = 1;
          this.msgList = [];

          this.$store.dispatch("chooseMess", value);

          this.sqlAnd = { msgType: value.type };


          this.sqlType = value.type != "all";

          if (value.type === "all") {
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

          //var data = {
          //    where: "(fromId=" + this.getMessObj.id + " or targetId=" + this.getMessObj.id + ") and targetType='single' and isRevoke=0" + sqlAnd + searchSql,
          //    pageSize: 15
          //}


          //if (this.getMessObj.channelType == "G") {
          //    data.where = "targetId=" + this.getMessObj.id + " and fromType='group' and isRevoke=0" + sqlAnd;
          //}

          //clientiot.localData.getMsgList(data).then((res) => {
          //    this.msgList = res;
          //    this.pageIndex++;
          //    localStorage.setItem("msgLogSql", data.where);
          //})


    },
      messagesPlay(e) {
          //清除缓存
          localStorage.removeItem("msgLogOrderBy");
          localStorage.removeItem("msgLogSql");
          localStorage.removeItem("mgArr");
          localStorage.removeItem("getMess");

          ipcRenderer.send('MSGLOGWIN:close');
      Event.$emit("messagePlay", false);
    },
      replaceFace(con) {
          var rel = /style\s*?=\s*?([‘"])[\s\S]*?\1/;
          var con=con.replace(rel,'')
          if (!con && typeof con == "object") {
              return con
          }
          if (typeof con != "string") {
              return con
          }

          if (con === "undefined") {
              return ''
          }
      if (con.includes("/:")) {
        var emojis = this.emojis;
        for (var i = 0; i < emojis.length; i++) {
          con = con.replace(
            emojis[i].reg,
            '<img src="static/emoji/' +
              emojis[i].file +
              '"  alt="" style="vertical-align: middle; width: 24px; height: 24px" />'
          );
        }
        return con;
      }
          return con.replace(/\r?\n/g, "<br/>").replace(/\s/g, "&nbsp;&nbsp;");
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
    // 将日期过滤为 hour:minutes
    time(value){
            if (!value) {
                return value
            }
            if (typeof value == "string" || typeof value == "object") {
                value = Date.parse(value);
            }
            //获取当天的时间
            let getDate = new Date();
            const now = Date.now()
            getDate.setHours(0);
            getDate.setMinutes(0);
            getDate.setSeconds(0);
            getDate.setMilliseconds(0)
            let oneDay = getDate.getTime();
            if (value > oneDay) {
                return moment(value).format('HH:mm')
            } else if (value < oneDay) {
                return moment(value).format('YYYY-MM-DD HH:mm')
            }  
       }
  }
};
</script>
<style lang="stylus" scoped>
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
  /*position: absolute;*/
  top: -600px;
  left: 0px;
  z-index :2;
  width: 450px;
  height: 650px;
  background-color: #f5f5f5;
  border: 1px solid #d1d1d1;
  border-radius: 5px;
  box-shadow: 0 2px 4px 2px #d1d1d1;
  -webkit-app-region: drag;
  user-select:text

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
        background-color: #e4393c;
        color: white;
        cursor: pointer;
      }
    }
  }

  .messageSort {
    float: left;
    width: 75%;
    margin: 10px 12.5%;
    -webkit-app-region: no-drag;

    li {
      float: left;
      width: 25%;
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
    height: 480px;
     -webkit-app-region: no-drag;

    .recodeCard {
      border-bottom: 1px solid #ccc;
      margin-bottom: 10px;
    }
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
        line-height: 22px;
    }
  }
}

.messageImg {
  width: 100px;
}

.attach-file {
  color: #333;
  font-size: 14px;
}

.attach-file {
  margin: 10px 0px;
}

.filename {
    height: 32px;
    line-height: 32px;
}

.fileMessBox, .fileMessBoxs {
  float: right;
  margin-right: 60px;
}

.fileMessBoxs {
  margin-bottom: 10px;

  &:hover {
    cursor: pointer;
  }
}

.el-icon-download, .videoHover,.openfilePath,.openTarget {
  &:hover {
    color: #1aad19;
    cursor: pointer;
  }
}

.myOpenFile {
    cursor: pointer;
}

.box, .Setimagesize, .video,.getVideo {
  margin-bottom: 10px;
}

.hx-viedo {
  color: #333;
  font-size: 14px;
}
.attach-desc{
    display: inline-block;
    height: 64px;
}
.audioTag{
  width:265px
}
</style>

