<template>
<div>
  <div
    class="messageBox"
    id="messageBox"
    @mousedown="move"
  >
    <div class="header">
      <div class="friendname">{{this.getMessRecodeName}}</div>
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
    <div
      class="messageRecodeBox"
      ref="message"
    >
      <ul v-if="selectedChat">
        <li v-for="item in searchFriendMessage">
          <div class="recodeCard">
            <!-- <img v-if="item.msgType==='notic'" class="userImg" width="36px" height="36px" src="static/images/group.png" alt="0.0"> -->
            <!-- <img v-else class="userImg" width="36px" height="36px" :src="item.self?realAvatarUrl():item.msgUserImg" alt="0.0"> -->
            <div class="messageTextBox">
              <p
                v-if="item.msgType==='notic'||item.msgType==='once'"
                class="messageTextName"
              >通知消息<span>{{item.date | time}}</span></p>
              <p
                v-else
                class="messageTextName"
              >{{item.self?user.name:(item.msgUserName?item.msgUserName:selectedChat.user.name)}}<span>{{item.date | time}}</span></p>
              <!-- 通知消息 -->
              <p
                class="messageTextContent"
                v-if="item.msgType==='notic'||item.msgType==='once'"
                v-html="replaceFace(item.content)"
              ></p>
              <!-- 网址 -->
              <p
                class="messageTextContent"
                v-if="item.msgType==='http'"
                @click="openWindow(item.content)"
              ><i style="color:blue">{{item.content}}</i></p>
              <!-- 文本 -->
              <p
                class="messageTextContent"
                v-if="item.msgType==='text'"
                v-html="replaceFace(item.content)"
              ></p>
              <!-- 图片 -->
              <p
                class="messageTextContent"
                v-if="item.msgType==='image'"
              >
                <div class="content hx-Imagecontent" v-if="item.msgType==='image'"  ref="dataurl" :data-url="JSON.stringify(item)"> 
                  <div class="text Setimagesize">
                      <img v-if="item.self" class="messageImg" :src="item.content" @click="imgDialog(item)" ref="dataold" :data-old="item.oldname">
                      <img v-else class="messageImg" :src="showImg(item)" @click="imgDialog(item)" ref="dataold" :data-old="item.oldname">
                  </div>
                </div>
              </p>
              <!-- 文件 -->
             <div
              class="content"
              v-if="item.msgType==='file'"
              ref="dataurl"
              :data-url="JSON.stringify(item)"
            >
              <MessageFile v-bind:message='item'></MessageFile>
            </div>
              <!-- 视频 -->
              <p
                class="messageTextContent"
                v-if="item.msgType==='video'"
              >
                <div
                  v-if="item.msgType==='video'"
                  class="hx-viedo"
                >
                  <img
                    @click="imgDialog(item)"
                    src="static/images/viedo.png"
                    class="video"
                    style="width: 100%;"
                  />
                  <div
                    v-if="item.self==true"
                    class="box"
                    style="left:12px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;width: 80%;"
                  >{{item.content }}</div>
                  <div v-else>{{item.oldname}}</div>
                  <div style="display:none">
                    <video id="video"></video>
                  </div>
                  <div
                    class="box"
                    v-if="item.self==true && UploadprogNum.msgNum<100 && item.msgID==UploadprogNum.msgId"
                    style="right:15px;"
                  >
                    上传进度:{{UploadprogNum.msgNum}}&nbsp;%
                  </div>
                  <div
                    class="box"
                    v-else-if="item.self==true"
                    style="right:15px;"
                  ><span>已发送</span>&nbsp;&nbsp;<span
                      class="videoHover"
                      @click="button_choose(item.filePath)"
                      :data-path="item.filePath"
                    >打开文件夹</span></div>
                  <div
                    class="getVideo"
                    v-else
                  ><span
                      class="videoHover"
                      @click="button_choose(item.filePath)"
                      :data-path="item.filePath"
                    >打开文件夹</span></div>
                </div>
              </p>
              <div class="content" v-if="item.msgType==='audio'">
                  <audio class="audioTag" controls>
                      <source :src="item.filePath" type="audio/mpeg">
                  </audio>
              </div> 
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
  </div>
</template>
<script>
import { mapGetters, mapState, mapActions } from "vuex";
import messSearch from "../../components/search/messSearch";
import moment from "moment";
import Vue from "vue";
import ForwardDatas from "./ForwardData";
import GroupListInfo from "../chatlist/GroupListInfo";
import MessageFile from './messageFile'
import VideoPlayer from "vue-video-player";
import formatDate from "../switch/filters.js";
import path from "path";
import Events from "../../api/eventBus.js";
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
Event = new Vue();
moment.locale("zh-cn");
export default {
  components: {
    messSearch,
    MessageFile
  },
  data() {
    return {};
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
 
  mounted() {
    this.$refs.message.scrollTop=this.$refs.message.scrollHeight;
  },
  methods: {
    showImg(item){
      if(item.httpImg){
          return item.httpImg
      }else{
          return item.content.rootPath+item.content.thisDir
      }
    },
    openWindow(url){
        shell.openExternal(url);
    },
    button_choose(item) {
      if (!item.rootPath) {
        shell.showItemInFolder(item);
      } else {
        shell.showItemInFolder(item.rootPath + item.thisDir);
      }
      // var path2=filePath.lastIndexOf('\\');
      // var path3=filePath.substring(0,path2)
      // shell.openItem(path3);
    },
    button_choose_file(item) {
      console.log(item);
      if (item.self == true) {
        shell.showItemInFolder(item.filePath);
      } else {
        
        shell.showItemInFolder(item.downFilePath);
      }
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
    imgDialog(item) {
        if(item.msgType=='image'){
            var value;
            if(item.self==true){
                item.filePath==undefined?value=item.content:value=item.filePath
            }else{
                value=item.content.rootPath==undefined?item.content:item.content.rootPath+item.content.thisDir;
            };
            //当前对话在chatlist中的位置
            var eIndex = this.$store.state.selectId;
            //聊天列表
            var chatArr = this.$store.state.chatlist;
            //当前聊天框中的信息
            var messBox = chatArr[eIndex].messages;
            //聊天图片数组
            var imgarr = [];
            var keyArr = [];
            //当前图片位置
            var eImg;
            for (var i = 0; i < messBox.length; i++) {
                if (messBox[i].msgType == "image") {
                    if(messBox[i].self==true){
                        keyArr.push(messBox[i].filePath==undefined?messBox[i].content:messBox[i].filePath);
                        imgarr.push({
                            imgsrc:messBox[i].filePath,
                            imgkey:messBox[i].msgID
                        });
                    }else{
                        keyArr.push(messBox[i].content.rootPath==undefined?messBox[i].content:messBox[i].content.rootPath+messBox[i].content.thisDir)
                        imgarr.push({
                            imsrc:messBox[i].content.rootPath==undefined?messBox[i].content:messBox[i].content.rootPath+messBox[i].content.thisDir,
                            imgkey:messBox[i].msgID
                        });
                    };
                }
            }
            var imgarrStr=keyArr.join(",")
            //图片路径存入本地
            clientiot.globalinfo.storage("imgArr",imgarrStr);
            //图片张数
            var imgarrLen = imgarr.length;
            for(let j=0;j<imgarr.length;j++){
                if (typeof imgarr[j].imgkey == "string" || typeof imgarr[j].imgkey == "object"){
                imgarr[j].imgkey=Date.parse(imgarr[j].imgkey)
            }
            }
             if (typeof item.msgID == "string" || typeof item.msgID == "object"){
                item.msgID=Date.parse(item.msgID)
            }
            for (var i = 0; i < imgarr.length; i++) {
                if (imgarr[i].imgkey == item.msgID) {
                eImg = i + 1;
                }
            }
            ipcRenderer.send('IMGWIN:bigImg',value)
            if(mediaWin){
                return
            }
            mediaWin = new BrowserWindow({ 
                    modal: true,
                    show: false,
                    width: 1000,
                    height: 800,
                    resizable: false,
                    alwaysOnTop: false,
                    useContentSize: true,
                    frame: false,
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
                    })      
        }else{
            var value;
            if(item.self==true){
                value=item.filePath
            }else{
                value=item.content.rootPath + item.content.thisDir;
            };
            shell.openExternal(value)
        }
    },
    chooseMess(value) {
      this.$store.dispatch("chooseMess", value);
    },
    messagesPlay(e) {
      Event.$emit("messagePlay", false);
    },
      replaceFace(con) {
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
      return con;
    },
    //拖拽聊天记录框
    move(e) {
      //获取目标元素
      let odiv = document.getElementById("messageBox");
      //算出鼠标相对元素的位置
      let disX = e.clientX - odiv.offsetLeft;
      let disY = e.clientY - odiv.offsetTop;
      const bodyHeight=document.body.clientHeight;
      const bodyWidth=document.body.clientWidth;
      document.onmousemove = e => {
        //鼠标按下并移动的事件
        //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
        let left = e.clientX - disX;
        let top = e.clientY - disY;
         if(top<0-(bodyHeight-160)){
           top=0-(bodyHeight-160)
         }
         if(top>0-(odiv.clientHeight-160)){
           top=0-(odiv.clientHeight-160)
         }
        if(left>bodyWidth-odiv.clientWidth-314){
          left=bodyWidth-odiv.clientWidth-314
        }
        if(left<-307){
          left=-307
        }
        //移动当前元素
        odiv.style.left = left + "px";
        odiv.style.top = top + "px";
      };
      document.onmouseup = e => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
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
  },
  watch: {
    // 当输入框中的值为空时 弹出提示  并在一秒后消失
    content() {
      if (this.content === "") {
        if (this.frequency === 0) {
          this.warn = true;
          this.frequency++;
          setTimeout(() => {
            this.warn = false;
          }, 1000);
        }
      }
    }
  }
};
</script>
<style lang="stylus" scoped>
.messageBox {
  position: absolute;
  top: -600px;
  left: 0px;
  z-index :2;
  width: 450px;
  height: 650px;
  background-color: #f5f5f5;
  border: 1px solid #d1d1d1;
  border-radius: 5px;
  box-shadow: 0 2px 4px 2px #d1d1d1;
  -webkit-app-region: no-drag;

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
    height: 500px;
    overflow: hidden;
    overflow-y: scroll;

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
    padding-left: 2%;

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
      word-wrap:break-word
      color: #333;
      font-size: 14px;
      margin:5px
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

