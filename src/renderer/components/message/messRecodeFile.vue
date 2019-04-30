<template>
  <div  class="attach-file">
    <a class="attFileStyle">
        <img style="width:48px;float:left" :src="fileDOC(message)" alt="" srcset="">
    <div class="attach-desc">
        <div v-if="data.self==true" style="padding-left:10px;line-height:35px;" class="itemContent">{{data.content}}</div>
        <div v-else class="filename">{{fileName}}</div>
        <span v-if="!data.self">大小：{{fileSize}}</span>
        <span style="margin-left:15px;font-size:15px;color:#333;" v-show="this.downStatus||data.localPath===''">&nbsp;下载中...</span>
        <div class="hx_version-progress" v-if="data.self&&data.UploadStore==null" style="display:block" :id="BoxforId(data.msgID)">
            <div :id="forId(data.msgID)" class="hx_version-bar"  :style="{width:this.state.UploadprogNums+'%'}"></div>
        </div> 
        <div :id="fileMessBoxs(data.msgID)" v-if="data.UploadStore"  class="fileMessBoxs">&nbsp;&nbsp;<span>已发送</span>&nbsp;&nbsp;<span @click="button_choose(data.downPath)" :data-path="data.downPath">打开文件夹</span></div>
        <div class="fileMessBox">
            <i v-show="filePath||data.localPath===''" class="el-icon-download" @click="downFile(data)" :data-content="data.content" :data-oldname="data.oldname">&nbsp;&nbsp;</i>
            <span v-show="filePathStatus||data.localPath" class="myOpenFile">
                <span class="openTarget" :data-path="data.content" @click="openn($event,data.localPath)">打开</span>&nbsp;&nbsp;
                <span class="openfilePath" @click="button_choose_file($event,data.localPath)" :data-path="data.content">打开文件夹</span>
            </span>
        </div>    
    </div>
    </a>
</div>
</template>
<script>
import { mapGetters, mapState, mapActions } from "vuex";
import Events from '../../api/eventBus.js'
import { setTimeout } from 'timers'; 
import { file } from 'babel-types';
import { parse } from 'querystring';
const electron = require("electron");
var remote=require('electron').remote
const ipcRenderer = electron.ipcRenderer;
var { ipcRenderer: ipc } = require("electron");
const {shell} = require("electron").remote;
const uuidv4 = require('uuid/v4');
const clientiot = require("@hxim/clientiot");
var co = require("co");
var target_ID;
export default {
  props:['message'],
  data(){ 
    return{
      data:this.message,
      fileName:'',
      fileSize:'',
      filePath:true,
      filePathStatus:false,
      downPath:'',
      fileCode:'',
      messKeys:'',
      downStatus:false,
      state:{
        UploadprogNums:sessionStorage.getItem('Updateprogress'+this.message.msgID)||0, 
        UploadID:null,
      }
    }
  },
   computed: {
    ...mapGetters(["selectedChat", "messages"]),
    ...mapState(["user", "fileSuffix", "emojis", "chatlist", "UploadprogNum", "selectId",'GroupTitle',"members",'selectFriendId','selectFriendAticon'])
  },
  methods:{

      fileDOC:function(value){
            let path;
            var extName=value.content.substr(value.content.lastIndexOf('.')+1);
            for(let i=0;i<this.fileSuffix.length;i++){
                if(this.fileSuffix[i]==extName){
                   path = "static/images/fileIcon/"+this.fileSuffix[i]+".svg"
                   return path
                }else{
                    path = "static/images/fileIcon/othe.svg"
                }
            }
          return path
        },
      forId:function(index){
				return "forid_" +index
        },
    fileMessBoxs(index){
        return "fileMessBoxs_" +index
    },
    BoxforId(index){
         return "BoxforId_" +index
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
            shell.showItemInFolder(item.filePath);
        }else{
            shell.showItemInFolder(item.filePath.rootPath+item.filePath.thisDir);
        }
    },
    //打开发送的文件夹路径
    button_choose(filePath){       
        shell.showItemInFolder(filePath)
    },
    //打开接收的文件夹路径
    button_choose_file(e,item){
        if(typeof item =="object"){
             let e1=e.currentTarget.attributes.filePath.value;
             shell.showItemInFolder(e1);
         }else{
             shell.showItemInFolder(item);
         }
        
    },
     openn:function(e,item){
         if(typeof item =="object"){
             let e1=e.currentTarget.attributes.filePath;
             shell.openItem(e1)
         }else{
             shell.openItem(item)
         }
    },
        //下载文件
    //下载文件
    downFile:function(item) {
      /*从S3下载文件*/
      var me=this;
      let openTarget = document.getElementsByClassName("openTarget");
      let openfilePath = document.getElementsByClassName("openfilePath");
        const itemFileCode = this.fileCode;
        const itemFilename = this.fileName;
      const chatId = me.$store.state.selectFriendId;
      let downChat = me.$store.state.chatlist.find(chats=>chats.id===chatId);
      if( itemFileCode && itemFilename ){
          co(function*(){
            clientiot.awss31.DownloadFile(itemFileCode,"/profile/images/",function(res) {
                var resData = JSON.parse(res);
                console.log(resData)
                if(resData.errorCode ==300){
                    me.downStatus=true;
                    me.filePath = false;
                    var Uploadprogress={upload:resData.data,msgId:itemFileCode} 
                    me.$store.dispatch("Uploadprogress", Uploadprogress);
                }
                if (resData.errorCode == 200) {
                    me.downStatus=false;
                    me.filePathStatus = true;
                    me.downPath = resData.data.rootPath+resData.data.thisDir;
                    let value={};
                    value.keys=me.messKeys;
                    value.path=me.downPath;
                    value.id=parseInt(localStorage.getItem("messBoxId"));
                    ipc.send("MAINWIN:MESSFILEDOWN",JSON.stringify(value));
                    Event.$emit("messDownFile", value);
                    var u_sql = "update HxImMsg set localPath='" + value.path + "' where message_key='" + item.message_key + "'";
                    clientiot.sqllite.executeNoQuerySql(u_sql, function (res) {
                        console.log(res);
                    });
                    for(let i = 0;i<openTarget.length;i++){
                        if(openTarget[i].dataset.path==item.content){
                            openTarget[i].setAttribute("filepath",me.downPath)
                        }
                    }
                    // openfilePath
                    for(let i = 0;i<openfilePath.length;i++){
                        if(openfilePath[i].dataset.path==item.content){
                            openfilePath[i].setAttribute("filepath",me.downPath)
                        }
                    }
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
          var getElementById='forid_'+file.msgID;
          var getElement='fileMessBoxs_'+file.msgID;
          var BoxforId_='BoxforId_'+file.msgID;
          
        sessionStorage.setItem('messageID'+file.msgID,file.msgID);
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
                         tt.style.width=Updateprogress+'%'; 
                    } 
                 }
                //  else{ 
                //     var dd=document.getElementById(getElement); 
                //     dd.style.display='block'
                //  }  
            }
        }); 
    },
  },
 mounted(){ 
     this.$nextTick(function () {
        this.chickMessage() 
    })  
 },
 created(){
    var fileZ = JSON.parse(this.data.json);
    if(typeof fileZ.msgBody=="string"){
        fileZ.msgBody=JSON.parse(fileZ.msgBody);
    }
    this.fileName = fileZ.msgBody.msgContent.text;
    if(fileZ.msgBody.msgContent.fileSize){
        let size = fileZ.msgBody.msgContent.fileSize;
        if (size<1024){
            fileZ.msgBody.msgContent.fileSize=String(size)+"B";
        }else if(size>1024&&size<(1024*1024)){
            fileZ.msgBody.msgContent.fileSize=String((fileZ.msgBody.msgContent.fileSize/1024).toFixed(2))+"KB";
        }else if(size>(1024*1024)){
            fileZ.msgBody.msgContent.fileSize=String((fileZ.msgBody.msgContent.fileSize/1024/1024).toFixed(2))+"MB";
        }
    }
    if(typeof this.data.localPath!="object"){
        this.filePath= false
    }else{
        this.filePath = true
    }
    this.fileSize = fileZ.msgBody.msgContent.fileSize;
     this.fileCode = fileZ.msgBody.msgContent.mediaId;
    this.messKeys = fileZ.message_key;
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
    min-height: 64px;
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
.attFileStyle{
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}
</style>
