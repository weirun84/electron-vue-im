<template>
    <div class="hx-viedo" style="display:flex;">
        <mAudio v-if="message.self==true" :src="message.filePath"></mAudio>
        <mAudio v-else :src="getMp3Url(message)"></mAudio>
        <!--<audio class="audioTag" controls>
        <source v-if="message.self==true" :src="message.filePath" type="audio/mpeg">
        <source v-else :src="message.filePath.rootPath+message.filePath.thisDir" type="audio/mpeg">
    </audio>-->
    </div> 
</template>
<script>
import { mapGetters, mapState, mapActions } from "vuex";
import Events from '../../api/eventBus.js';
import VideoPlayer from 'vue-video-player';
import { setTimeout } from 'timers'; 
import mAudio from './mAudio';
const electron = require("electron");
var remote=require('electron').remote
const ipcRenderer = electron.ipcRenderer;
var { ipcRenderer: ipc } = require("electron");
const {shell} = require("electron").remote;
const { BrowserWindow } = require("electron").remote;
const uuidv4 = require('uuid/v4');
const clientiot = require("@hxim/clientiot");
require('video.js/dist/video-js.css');
require('vue-video-player/src/custom-theme.css'); 
var co = require("co");
//图片弹窗地址
var newTel=remote.getGlobal('sharedObject').newTel
//视频弹窗地址
var videoUrl=remote.getGlobal('sharedObject').video
var mediaWin=null;
var videoWin=null;
var target_ID;
export default {
  props:['message'],
  components: {   
      VideoPlayer,
      mAudio
  },
  data(){ 
    return{
      data:this.message, 
      state:{
        UploadprogNums:sessionStorage.getItem('Updateprogress'+this.message.msgID)||0, 
        UploadID:null,
      },
     videoImage:"static/images/viedo.png"
    }
  },
   computed: {
    ...mapGetters(["selectedChat", "messages"]),
    ...mapState(["user", "emojis", "chatlist", "UploadprogNum", "selectId",'GroupTitle',"members",'selectFriendId','selectFriendAticon'])
  },
  methods:{
      forId:function(index){
				return "forid_video" +index
        },
    fileMessBoxs(index){
        return "fileMessBoxs_video" +index
    },
    BoxforId(index){
         return "BoxforId_video" +index
    },
      setItemID(data){
          if(this.state.UploadprogNums<100 && data==this.state.UploadID){
             var result = true; 
             return result;
          }else{
               var result = false; 
             return result;
          }
      },
     //打开视频文件夹
    button_choose_video(item){
        if(item.self==true){
            if(item.filePath.rootPath!=undefined){
                var filePath=item.filePath.rootPath+item.filePath.thisDir;
                shell.showItemInFolder(filePath);
            }else{
                 shell.showItemInFolder(item.filePath);
            } 
        }else{
            shell.showItemInFolder(item.filePath.rootPath+item.filePath.thisDir);
        }
    },
    //打开发送的文件夹路径
    button_choose(filePath){       
        shell.showItemInFolder(filePath)
    },
    //打开接收的文件夹路径
    button_choose_file(item){
        shell.showItemInFolder(item);
    },
     openn:function(item){
        shell.openItem(item)
      },
      getMp3Url(item) {
          if (!item) {
              return "";
          }

          return clientiot.awss31.getObjectUrlHttp(item.S3Key);

      },
        //下载文件
    //下载文件
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
    chickMessage(){
        Events.$off('sendMessage')
         Events.$on('sendMessage',message=>{
             target_ID=message.target_id;
             this.uploadFile(message)
         })
    },
    uploadFile:function(file){
        var me=this;
         const suffix = file.filename.split('.')
          const ext = suffix.splice(suffix.length - 1, 1)[0]
          console.log(this.uploadType)
          const nameKey=uuidv4()+'.'+ext;
        //   me.state.UploadID=file.msgID; 
          me.$set(me.state,'UploadID',file.msgID)
          var getElementById='forid_video'+file.msgID;
          var getElement='fileMessBoxs_video'+file.msgID;
          var BoxforId_='BoxforId_video'+file.msgID;

        sessionStorage.setItem('messageID' + file.msgID, file.msgID);
         clientiot.awss31.UploadFile(nameKey, file.filePath, function (res) {
            let data=JSON.parse(res);  
            var Uploadprogresed={upload:data.data,msgId:file.msgID}; 
            if(data.errorCode==200){  
              let message={content:nameKey,msgType:file.msgType,msgID:file.msgID,filePath:file.filePath,target_ID:file.target_id,oldName:file.filename,fileSize:file.fileSize};
              me.sendImage(message)  
             let value={};
                value.keys=file.msgID; 
                value.id=target_ID;
                me.$store.dispatch('uploadFilePath',value)
            }else{ 
                var Uploadprogress=JSON.parse(data.data);
                var num = (Uploadprogress.progressAmount / Uploadprogress.progressTotal);
                var Updateprogress = Math.round(num * 100);
                me.state.UploadprogNums=Updateprogress; 
                console.log("上传进度"+Uploadprogress.key+':'+Updateprogress); 
                sessionStorage.setItem(file.msgID,Updateprogress);
                 me.$store.dispatch("Uploadprogress", Uploadprogresed);
                 if(Updateprogress<100){
                    var tt=document.getElementById(getElementById);
                    var dd=document.getElementById(getElement);
                    if(tt!=null){
                         tt.innerText="上传进度:"+Updateprogress+'%'; 
                    } 
                 }
                //  else{ 
                //     var dd=document.getElementById(getElement); 
                //     dd.style.display='block'
                //  }  
            }
        }); 
    },
         // 点击发送按钮发送图片文件
    sendImage(msg) {
      var me=this;
      var nows = new Date().getTime();
      var loginUser_id=JSON.parse( sessionStorage.getItem("currentUser")).id;
      var channelType= msg.target_ID;
      this.$store.state.selectFriendAticon = channelType;
      var now=new Date().getTime();
       if(channelType<10000){
          if (typeof(msg.msgType)!='undefined'){
          const msgType=msg.msgType;
          const contentText = msg.content;
         var data = {
             fromId: parseInt(loginUser_id),
             model:1,
                fromType: "group", 
                  msgContent: {
                    arn: "arn",
                    durationTime: nows,
                    extras: "extras",
                    fileSize: msg.fileSize,
                    format: "format",
                    height: 5,
                    mediaCrc32: "mediaCrc32",
                   text: msg.oldName,
                    mediaId: msg.content,
                    width: 5
                  }, 
                msgType: msg.msgType,
                targetId:parseInt(channelType),
                targetType: "custom",
                version: 0
              }
          } 
            clientiot.http.sendMessage(JSON.stringify(data),msg.filePath).then(function(retvalue){
                console.log("群发图片文件:"+retvalue);
                var dataArr=JSON.parse(retvalue);
                if(msg.msgType=='image'){
                    var message={content:msg.filePath,UploadStore:true,msgType:msg.msgType,msgID:msg.msgID,filePath:msg.filePath,date:nows,filename:msg.oldName,fileSize:msg.fileSize,
                    message_key:dataArr.data.message_key,
                    theme_key:dataArr.data.theme_key,target_id:dataArr.data.targetId,errorCode:dataArr.success
                }
                }else{
                    var message={content:msg.oldName,UploadStore:true,msgType:msg.msgType,msgID:msg.msgID,filePath:msg.filePath,date:nows,filename:msg.oldName,fileSize:msg.fileSize,
                    message_key:dataArr.data.message_key,
                    theme_key:dataArr.data.theme_key,target_id:dataArr.data.targetId,errorCode:dataArr.success
                }
                }
            
                if(dataArr.success==true){
                me.$store.dispatch("sendMessage", message);
                    me.$store.dispatch('topChatlist',me.selectedChat);  
                }
            })
             
       }else{
          if (typeof(msg.msgType)!='undefined'){
          const msgType=msg.msgType;
          const contentText = msg.content;
         var data = {
              fromId: parseInt(loginUser_id),
              model:1,
              fromType: "user",
              msgType:msg.msgType,
              targetId: parseInt(channelType),
              targetType: "single",
              dataUrl:'',
              msgContent: {
                  arn: "arn",
                  durationTime:nows,
                  extras: "extras",
                  fileSize: msg.fileSize,
                  format: "format",
                  height: 5,
                  mediaCrc32: "mediaCrc32",
                  text: msg.oldName,
                  mediaId: msg.content,
                  width: 5
              }
          }
            clientiot.http.sendMessage(JSON.stringify(data),msg.filePath).then(function(retvalue){
                console.log("个人发图片文件:"+retvalue); 
                var dataArr=JSON.parse(retvalue);
                var message;
                if(msg.msgType=='image'){
                    message={content:msg.filePath,msgType:msg.msgType,UploadStore:true,msgID:msg.msgID,filePath:msg.filePath,date:nows,filename:msg.oldName,fileSize:msg.fileSize,
                    message_key:dataArr.data.message_key,
                    theme_key:dataArr.data.theme_key,
                    target_id:dataArr.data.targetId,errorCode:dataArr.success
                    };
                }else{
                    message={content:msg.oldName,msgType:msg.msgType,UploadStore:true,msgID:msg.msgID,filePath:msg.filePath,date:nows,filename:msg.oldName,fileSize:msg.fileSize,
                    message_key:dataArr.data.message_key,
                    theme_key:dataArr.data.theme_key,
                    target_id:dataArr.data.targetId,
                    errorCode:dataArr.success
                    };
                }  
                me.$store.dispatch("sendMessage", message);
                me.$store.dispatch('topChatlist',me.selectedChat); 
            })
        }
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
                    skipTaskbar: true,
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
    },
  },
 mounted(){ 
     this.$nextTick(function () {
        this.chickMessage() 
    })  
 },
 created(){
      Events.$off('sendMessage', this.chickMessage())  
 },
 beforeDestroy () {
    Events.$off('sendMessage', this.chickMessage())
 },
}
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
.itemContent{
    padding-left: 10px;
    line-height: 35px;
    width: 178px; 
    display: inline-block;
    white-space: nowrap;
    text-overflow: ellipsis;
    word-break: break-all;
    overflow: hidden;
}
.Setimagesize{  
    max-height: 113px;
}
.Setimagesize:nth-child(0){
    max-width:200px;
    background:red
} 

.hx-viedo{
    &:hover {
        cursor: pointer
    }
}
.openVideoParent{
    position: absolute;
    color: white;
    bottom: 6px;
    right: 15px;
    margin-right 2s0px
}
.audioTag{
    width:265px
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
.myOpenFile{
        // display : none;
    }
.video{
    position :relative
}
.box{
    position :absolute;
    bottom:15px;
    right:0;
    color: white;
}
</style>
