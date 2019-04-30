<template>
  <div
    class="text Setimagesize"
    @contextmenu="onmousecontextmenu($event)"
  >
    <img
      v-if="message.self"
      class="messageImgKey"
      :src="showImgs(message)"
      @click="imgDialog(message)"
      ref="dataold"
      :data-old="message.oldname"
    >
    <img
      v-else
      class="messageImgKey imgload"
      :src="showImg(message)"
      @click="imgDialog(message)"
      ref="dataold"
      :data-old="message.oldname"
      :data-keey="message.messageKeys"
    >
  </div>
</template>
<script>
import { mapGetters, mapState, mapActions } from "vuex";
import Events from "../../api/eventBus.js";
import { setTimeout } from "timers";
import { returnStatement } from "babel-types";
const electron = require("electron");
const clipboard = require("electron").clipboard;
var remote = require("electron").remote;
const ipcRenderer = electron.ipcRenderer;
var { ipcRenderer: ipc } = require("electron");
const { shell } = require("electron").remote;
const { BrowserWindow } = require("electron").remote;
const uuidv4 = require("uuid/v4");
const clientiot = require("@hxim/clientiot");
var co = require("co");
//图片弹窗地址
var newTel = remote.getGlobal("sharedObject").newTel;
//视频弹窗地址
var videoUrl = remote.getGlobal("sharedObject").video;
var mediaWin = null;
var videoWin = null;
var target_ID;
var messageDataArr = [];
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const SendMenu = new Menu();
const AcceptMenu = new Menu();
const OvertimeMenu=new Menu();
var dataARR,
  txtEditorNum = 0;
export default {
  props: ["message"],
  data() {
    return {
      data: this.message,
      state: {
        UploadprogNums:
          sessionStorage.getItem("Updateprogress" + this.message.msgID) || 0,
        UploadID: null
      }
    };
  },
  computed: {
    ...mapGetters(["selectedChat", "messages"]),
    ...mapState([
      "user",
      "emojis",
      "chatlist",
      "UploadprogNum",
      "selectId",
      "GroupTitle",
      "members",
      "selectFriendId",
      "selectFriendAticon"
    ])
  },
  methods: {
    onmousecontextmenu(e) {
      this.selectText(e.target);
      if (e.button == 2) {
        txtEditorNum++;
        var data = e.target.dataset.src;
        var dataText = e.target.innerText;
        var items = e.target.offsetParent.dataset.url;

        if (items != undefined) {
          dataARR = JSON.parse(items);
        }

        if (data == undefined && items != undefined) {
          var item = { dataText: dataText, itemsUrl: dataARR };
          Events.$emit("setForData", item);
        } else if (dataText == undefined || dataText == "") {
          var item = { dataText: data, itemsUrl: dataARR };
          Events.$emit("setForData", item);
        } else if (data == undefined && items == undefined) {
          Events.$emit("setForData", dataText);
        }
      }
      if (dataARR.self == true) {
        var now = new Date().getTime();
        var Seletime= now-(dataARR.date);
        var dat=Math.floor(Seletime / (60 * 1000));
        if(dat>=2){
              OvertimeMenu.popup(remote.getCurrentWindow())
        }else{
              SendMenu.popup(remote.getCurrentWindow())
        }
      } else {
        AcceptMenu.popup(remote.getCurrentWindow());
      }
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
        if (text.currentSrc.split("///")[1] != undefined) {
          var currentSrc = text.currentSrc.split("///")[1];
        } else {
          var currentSrc = text.currentSrc;
        }

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
    forId: function(index) {
      return "forid_image" + index;
    },
    fileMessBoxs(index) {
      return "fileMessBoxs_image" + index;
    },
    BoxforId(index) {
      return "BoxforId_image" + index;
    },
    showImgs(item) {
      if (item.filePath) {
        return item.filePath;
      } else {
        return item.content;
      }
    },
    showImg(item) {
      if (item.httpImg) {
        return item.httpImg;
      } else {
        if (typeof item.filePath == "object") {
          return clientiot.config.setting.filePath + item.filePath.thisDir;
        }
        return this.downFile(item);
      }
    },
    setItemID(data) {
      if (this.state.UploadprogNums < 100 && data == this.state.UploadID) {
        var result = true;
        return result;
      } else {
        var result = false;
        return result;
      }
    },
    //打开视频文件夹
    button_choose_video(item) {
      if (item.self == true) {
        shell.showItemInFolder(item.filePath);
      } else {
        shell.showItemInFolder(item.filePath.rootPath + item.filePath.thisDir);
      }
    },
    //打开发送的文件夹路径
    button_choose(filePath) {
      shell.showItemInFolder(filePath);
    },
    //打开接收的文件夹路径
    button_choose_file(item) {
      shell.showItemInFolder(item);
    },
    openn: function(item) {
      shell.openItem(item);
    },
    //下载文件
    downFile: function(item) {
      /*从S3下载文件*/
      var me = this;
      var thisPath = "";
      const itemFileCode = item.S3Key;
      const itemFilename = item.oldname;
      const thisMessageVue = me.$store.state.selectMessageVue;
      if (itemFileCode && itemFilename) {
        clientiot.awss31.DownloadFile(
          itemFileCode,
          "/profile/images/",
          function(res) {
            var resData = JSON.parse(res);
            console.log(resData);
            if (resData.errorCode == 300) {
              var Uploadprogress = {
                upload: resData.data,
                msgId: itemFileCode
              };
              me.$store.dispatch("Uploadprogress", Uploadprogress);
            }
            if (resData.errorCode == 200) {
              var localFilePath = resData.data.rootPath + resData.data.thisDir;
              item.fileInfo = resData.data;
              me.$store.dispatch("downFilePathNew", item);
              var imgClassArr = document.getElementsByClassName("messageImgKey");
              for(var k=0;k<imgClassArr.length;k++){
                if(imgClassArr[k].dataset.keey==item.messageKeys){
                  console.log("找到你了。");
                  imgClassArr[k].classList.remove("imgload");
                }
              }
              setTimeout(function() {
                clientiot.sqllite.updateHxImMsg(
                  { localPath: localFilePath },
                  { message_key: item.messageKeys },
                  function(res) {
                    console.log(res);
                  }
                );

                me.$forceUpdate();
              }, 100);
              return resData.data;
            }
          },
          itemFilename
        );
      }
    },
    chickMessage() {
      Events.$off("sendMessage");
      Events.$on("sendMessage", message => {
        target_ID = message.target_id;
        this.uploadFile(message);
      });
    },
    uploadFile: function(file) {
      var me = this;
      const suffix = file.filename.split(".");
      const ext = suffix.splice(suffix.length - 1, 1)[0];
      console.log(this.uploadType);
      const nameKey = uuidv4() + "." + ext;
      //   me.state.UploadID=file.msgID;
      me.$set(me.state, "UploadID", file.msgID);
      var getElementById = "forid_image" + file.msgID;
      var getElement = "fileMessBoxs_image" + file.msgID;
      var BoxforId_ = "BoxforId_image" + file.msgID;

      sessionStorage.setItem("messageID" + file.msgID, file.msgID);
      clientiot.awss31.UploadFile(nameKey, file.filePath, function(res) {
        let data = JSON.parse(res);
        var Uploadprogresed = { upload: data.data, msgId: file.msgID };
        if (data.errorCode == 200) {
          let message = {
            content: nameKey,
            msgType: file.msgType,
            msgID: file.msgID,
            filePath: file.filePath,
            target_ID: file.target_id,
            oldName: file.filename,
            fileSize: file.fileSize
          };
          me.sendImage(message);
          let value = {};
          value.keys = file.msgID;
          value.id = target_ID;
          me.$store.dispatch("uploadFilePath", value);
        } else {
          var Uploadprogress = JSON.parse(data.data);
          var num =
            Uploadprogress.progressAmount / Uploadprogress.progressTotal;
          var Updateprogress = Math.round(num * 100);
          me.state.UploadprogNums = Updateprogress;
          console.log("上传进度" + Uploadprogress.key + ":" + Updateprogress);
          sessionStorage.setItem(file.msgID, Updateprogress);
          me.$store.dispatch("Uploadprogress", Uploadprogresed);
          //  if(Updateprogress<100){
          //     var tt=document.getElementById(getElementById);
          //     var dd=document.getElementById(getElement);
          //     if(tt!=null){
          //          tt.style.width=Updateprogress+'%';
          //     }
          //  }
          //  else{
          //     var dd=document.getElementById(getElement);
          //     dd.style.display='block'
          //  }
        }
      });
    },
    // 点击发送按钮发送图片文件
    sendImage(msg) {
      var me = this;
      var nows = new Date().getTime();
      var loginUser_id = JSON.parse(sessionStorage.getItem("currentUser")).id;
      var channelType = msg.target_ID;
      this.$store.state.selectFriendAticon = channelType;
      var now = new Date().getTime();
      if (channelType < 10000) {
        if (typeof msg.msgType != "undefined") {
          const msgType = msg.msgType;
          const contentText = msg.content;
          var data = {
            fromId: parseInt(loginUser_id),
            model: 1,
            fromType: "group",
            msgContent: {
              arn: "arn",
              durationTime: nows,
              extras: "extras",
              fileSize: msg.fileSize,
              format: "format",
              height: 5,
              mediaCrc32: "mediaCrc32",
              mediaId: msg.content,
              text: msg.oldName,
              width: 5
            },
            msgType: msg.msgType,
            targetId: parseInt(channelType),
            targetType: "custom",
            version: 0
          };
        }
        clientiot.http
          .sendMessage(JSON.stringify(data), msg.filePath)
          .then(function(retvalue) {
            console.log("群发图片文件:" + retvalue);
            var dataArr = JSON.parse(retvalue);
            if (msg.msgType == "image") {
              var message = {
                content: msg.filePath,
                UploadStore: true,
                msgType: msg.msgType,
                msgID: msg.msgID,
                filePath: msg.filePath,
                date: nows,
                filename: msg.oldName,
                fileSize: msg.fileSize,
                message_key: dataArr.data.message_key,
                theme_key: dataArr.data.theme_key,
                target_id: dataArr.data.targetId,
                errorCode: dataArr.success
              };
            } else {
              var message = {
                content: msg.oldName,
                UploadStore: true,
                msgType: msg.msgType,
                msgID: msg.msgID,
                filePath: msg.filePath,
                date: nows,
                filename: msg.oldName,
                fileSize: msg.fileSize,
                message_key: dataArr.data.message_key,
                theme_key: dataArr.data.theme_key,
                target_id: dataArr.data.targetId,
                errorCode: dataArr.success
              };
            }

            if (dataArr.success == true) {
              me.$store.dispatch("sendMessage", message);
              me.$store.dispatch("topChatlist", me.selectedChat);
            }
          });
      } else {
        if (typeof msg.msgType != "undefined") {
          const msgType = msg.msgType;
          const contentText = msg.content;
          var data = {
            fromId: parseInt(loginUser_id),
            model: 1,
            fromType: "user",
            msgType: msg.msgType,
            targetId: parseInt(channelType),
            targetType: "single",
            dataUrl: "",
            msgContent: {
              arn: "arn",
              durationTime: nows,
              extras: "extras",
              fileSize: msg.fileSize,
              format: "format",
              height: 5,
              mediaCrc32: "mediaCrc32",
                mediaId: msg.content,
                text: msg.oldName,
              width: 5
            }
          };
          clientiot.http
            .sendMessage(JSON.stringify(data), msg.filePath)
            .then(function(retvalue) {
              console.log("messageImage.vue个人发图片文件:" + retvalue);
              var dataArr = JSON.parse(retvalue);
              var message;
              if (msg.msgType == "image") {
                message = {
                  content: msg.filePath,
                  msgType: msg.msgType,
                  UploadStore: true,
                  msgID: msg.msgID,
                  filePath: msg.filePath,
                  date: nows,
                  filename: msg.oldName,
                  fileSize: msg.fileSize,
                  message_key: dataArr.data.message_key,
                  theme_key: dataArr.data.theme_key,
                  target_id: dataArr.data.targetId,
                  errorCode: dataArr.success
                };
              } else {
                message = {
                  content: msg.oldName,
                  msgType: msg.msgType,
                  UploadStore: true,
                  msgID: msg.msgID,
                  filePath: msg.filePath,
                  date: nows,
                  filename: msg.oldName,
                  fileSize: msg.fileSize,
                  message_key: dataArr.data.message_key,
                  theme_key: dataArr.data.theme_key,
                  target_id: dataArr.data.targetId,
                  errorCode: dataArr.success
                };
              }
              me.$store.dispatch("sendMessage", message);
              me.$store.dispatch("topChatlist", me.selectedChat);
            });
        }
      }
    },
    //图片视频弹窗
    imgDialog(item) {
      if (item.msgType == "image") {
        var value;
        if (item.self == true) {
          item.filePath == undefined
            ? (value = item.content)
            : (value = item.filePath);
        } else {
          value =
            item.filePath.rootPath == undefined
              ? item.filePath
              : item.filePath.rootPath + item.filePath.thisDir;
        }
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
        var eImg = 1;
        for (var i = 0; i < messBox.length; i++) {
          if (messBox[i].msgType == "image") {
            if (messBox[i].self == true) {
              keyArr.push(
                messBox[i].filePath == undefined
                  ? messBox[i].content
                  : messBox[i].filePath
              );
              imgarr.push({
                imgsrc: messBox[i].filePath,
                imgkey: messBox[i].messageKeys
              });
            } else {
              keyArr.push(
                messBox[i].filePath.rootPath == undefined
                  ? messBox[i].filePath
                  : messBox[i].filePath.rootPath + messBox[i].filePath.thisDir
              );
              imgarr.push({
                imsrc:
                  messBox[i].filePath.rootPath == undefined
                    ? messBox[i].filePath
                    : messBox[i].filePath.rootPath +
                      messBox[i].filePath.thisDir,
                imgkey: messBox[i].messageKeys
              });
            }
          }
        }
        var imgarrStr = keyArr.join(",");
        //图片路径存入本地
        //clientiot.globalinfo.storage("imgArr",imgarrStr);
        //图片张数
        var imgarrLen = imgarr.length;
        // for(let j=0;j<imgarr.length;j++){
        //     if (typeof imgarr[j].imgkey == "string" || typeof imgarr[j].imgkey == "object"){
        //     imgarr[j].imgkey=Date.parse(imgarr[j].imgkey)
        // }
        // }
        //  if (typeof item.msgID == "string" || typeof item.msgID == "object"){
        //     item.msgID=Date.parse(item.msgID)
        // }
        for (var i = 0; i < imgarr.length; i++) {
          if (imgarr[i].imgkey == item.messageKeys) {
            eImg = i + 1;
          }
        }
        ipcRenderer.send("IMGWIN:bigImg", value);
        //if (mediaWin) {
        //    mediaWin.show();
        //    mediaWin.focus();
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
            webSecurity: false,
            devTools: false
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
        });
      } else {
        var value;
        if (item.self == true) {
          value = item.filePath;
        } else {
          value = item.content.rootPath + item.content.thisDir;
        }
        shell.openExternal(value);
        // shell.openItem(value)
        // var videos=document.getElementById("video");
        // videos.src=value;
        // videos.addEventListener("canplay",function(){
        //     if(videos.videoWidth){
        //         console.log(videos.videoWidth);
        //         clientiot.globalinfo.storage("imgArr",value);
        //         ipcRenderer.send('IMGWIN:bigImg',value);
        //         if(videoWin){
        //             return
        //         }
        //         videoWin = new BrowserWindow({
        //                 modal: true,
        //                 show: false,
        //                 width: videos.videoWidth+25,
        //                 height: videos.videoHeight+35,
        //                 resizable: true,
        //                 alwaysOnTop: false,
        //                 useContentSize: true,
        //                 frame: false,
        //                 webPreferences: {
        //                         webSecurity: false,
        //                     },
        //         });
        //             var codeUrl=encodeURI('value='+value)
        //             videoWin.isMovable(true);
        //             videoWin.webContents.openDevTools();
        //             videoWin.loadURL(videoUrl+codeUrl);
        //             videoWin.once("ready-to-show",() => {
        //                 videoWin.show();
        //             },100);
        //             videoWin.on('closed', () => {
        //                     videoWin = null
        //             })
        //     }
        // })
      }
    }
  },
  watch: {
    // 发送信息后,让信息滚动到最下面
    messages() {
      var me = this;
      messageDataArr = me.$store.getters.messages;
    }
  },
  mounted() {
    var me = this;
    this.$nextTick(function() {
      this.chickMessage();
    });
    Events.$on("IsForwardData", data => {
      this.IsForwardData = data;
    });
    var txtEditor = document.getElementById("ForwardData");
    if (txtEditorNum == 0) {
      txtEditorNum++;
      SendMenu.append(
        new MenuItem(
          {
            label: "复制",
            role: "copy",
            enabled: true

            // click:function(){
            //     Events.$on('setForData', dataText=>{
            //         if(dataText.itemsUrl.content.rootPath!=undefined){
            //             var content=dataText.itemsUrl.content.rootPath+dataText.itemsUrl.content.thisDir
            //         }else if(dataText.itemsUrl.msgType=='file'){
            //             var content=JSON.stringify(dataText.itemsUrl)
            //         }
            //         else{
            //              var content=dataText.itemsUrl.content
            //         }
            //      clipboard.writeText(content)
            //     })
            // const message = `粘贴的内容: ${clipboard.readText()}`
            // alert(message)
            // }
          } //Undo菜单项
        )
      );
      SendMenu.append(
        new MenuItem(
          {
            label: "撤回",
            click: function() {
              var userInfo = JSON.parse(sessionStorage.getItem("currentUser"));
              var userId = parseInt(userInfo.id);
              var message_key = dataARR.messageKeys;
              var theme_key = dataARR.theme_key;
              var target_id = dataARR.target_id;
              var errorCode = dataARR.errorCode;
              var now = new Date().getTime();
              var Seletime = now - dataARR.date;
              var dat = Math.floor(Seletime / (60 * 1000));
              var channelType = parseInt(channelType);
              if (target_id < 100000) {
                var flag = 1;
              } else {
                var flag = 0;
              }
              var data = {
                flag: flag,
                message_key: message_key,
                target_id: target_id,
                theme_key: theme_key,
                user_id: userId
              };
              if (errorCode == false) {
                me.$message({
                  message: "本条消息发送失败",
                  duration: 1800,
                  type: "warning",
                  center: true
                });
                return;
              }
              if (target_id == undefined) {
                me.$message({
                  message: "只能撤回自己发送的消息",
                  duration: 1800,
                  type: "warning",
                  center: true
                });
                return;
              }
              if (dat >= 2) {
                me.$message({
                  message: "只能撤回2分钟内的消息",
                  duration: 1800,
                  type: "warning",
                  center: true
                });
              } else {
                //2018.12.24更改为新的撤回消息
                clientiot.http.messageRevoke(data).then(res => {
                  var sucssData = JSON.parse(res);
                  if (sucssData.success == true) {
                    me.Revoke = true;
                    for (var i = 0; i < messageDataArr.length; i++) {
                      if (
                        messageDataArr[i].messageKeys &&
                        messageDataArr[i].messageKeys === message_key
                      ) {
                        me.$store.dispatch("pushNotic", i);
                        dataARR = "";
                        return;
                      }
                    }
                  }
                });
              }
            }
          } //Undo菜单项
        )
      );
      SendMenu.append(new MenuItem({ type: "separator" }));
      SendMenu.append(
        new MenuItem({
          label: "转发",
          click: function(e) {
            var me = this;
            Events.$emit("IsForwardData", true);
          }
        })
      );
      OvertimeMenu.append(
        new MenuItem({
          label: "复制",
          role: "copy",
          enabled: true
        })
      );
      OvertimeMenu.append(new MenuItem({
        label: '转发',
        click: function (e) {
             var me=this;
            Events.$emit('IsForwardData', true);
        }
     }));
      AcceptMenu.append(
        new MenuItem({
          label: "复制",
          role: "copy",
          enabled: true
        })
      );
      AcceptMenu.append(new MenuItem({ type: "separator" }));
      AcceptMenu.append(
        new MenuItem({
          label: "转发",
          click: function(e) {
            var me = this;
            Events.$emit("IsForwardData", true);
          }
        })
      );
    }
  },
  created() {
    Events.$off("sendMessage", this.chickMessage());
  },
  beforeDestroy() {
    Events.$off("sendMessage", this.chickMessage());
  }
};
</script>
<style lang="stylus" scoped>
.attach-file {
  margin-top: 3px;
  margin-left: 2px;
  width: 280px;
  height: 64px;
  line-height: 64px;
  vertical-align: middle;
  cursor: pointer;

  svg {
    float: left;
    border-right: solid 1px #DCDAD6;
  }

  .attach-desc {
    padding-left: 10px;
    width: 205px;
    min-height: 64px;
    line-height: 20px;
    color: #464548;
    font-size: 23px;
    float: left;

    div {
      font-size: 14px;
    }

    span {
      font-size: 13px;
      color: #8F8B86;
    }
  }
}

.itemContent {
  padding-left: 10px;
  line-height: 35px;
  width: 178px;
  display: inline-block;
  white-space: nowrap;
  text-overflow: ellipsis;
  word-break: break-all;
  overflow: hidden;
}

.Setimagesize {
  max-height: 113px;
}

.Setimagesize:nth-child(0) {
  max-width: 200px;
  background: red;
}

.messageImgKey {
  max-width: 150px;
  max-height: 113px;

  &:hover {
    cursor: pointer;
  }
}

.hx_version-progress {
  overflow: hidden;
  height: 3px;
  margin-bottom: 0px;
  margin-top: 20px;
  background-color: #f7f7f7;
  background-image: -moz-linear-gradient(top, #f5f5f5, #f9f9f9);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#f5f5f5), to(#f9f9f9));
  background-image: -webkit-linear-gradient(top, #f5f5f5, #f9f9f9);
  background-image: -o-linear-gradient(top, #f5f5f5, #f9f9f9);
  background-image: linear-gradient(to bottom, #f5f5f5, #f9f9f9);
  background-repeat: repeat-x;
  border-radius: 4px;
  width: 100%;
  margin-right: 12px;
}

.hx_version-progress .hx_version-bar {
  width: 0%;
  height: 100%;
  color: #ffffff;
  float: left;
  font-size: 7px;
  text-align: center;
  align-items: center;
  display: flex;
  justify-content: center;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  background-color: #0e90d2;
  background-image: -moz-linear-gradient(top, #149bdf, #0480be);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#149bdf), to(#0480be));
  background-image: -webkit-linear-gradient(top, #149bdf, #0480be);
  background-image: -o-linear-gradient(top, #149bdf, #0480be);
  background-image: linear-gradient(to bottom, #149bdf, #0480be);
  background-repeat: repeat-x;
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  transition: width 0.6s ease;
}
.imgload{
  min-width:100px;
  min-height:100px;
  background:url("/static/images/imgLoad.gif")no-repeat;
  background-position:50% 50%;
}
</style>
