<template>
  <div class="attach-file" @contextmenu="onmousecontextmenu($event)" :data-url="JSON.stringify(message)">
    <a class="attFileStyle">
        <img style="width:48px" @click="opennn(message)" :src="fileDOC(message)" alt="" srcset="">
    <div class="attach-desc">
        <div v-if="message.self" style="line-height:35px;" class="itemContent" @click="opennn(message)" >{{message.content}}</div>
        <div v-else class="filename" @click="opennn(message)">{{message.content}}</div>
        <span v-if="!message.self">大小：{{message.fileSize}}</span> 
        <!-- 发送上传 -->
       <div  v-if="message.self&&message.UploadStore==null" style="margin-top:13px;display:none;" :id="BoxforId(message.msgID)">
           <el-progress :id="forId(message.msgID)" :percentage="0" :stroke-width="3"  :show-text='false'></el-progress>
       </div>
        <div :id="fileMessBoxs(message.msgID)" v-if="message.UploadStore&&message.filePath!=undefined"  class="fileMessBoxs"><span class="openTarget" @click="openn(message.filePath)">打开</span>&nbsp;&nbsp;<span @click="button_choose(message.filePath)" :data-path="data.filePath">打开文件夹</span></div>
     
        <!-- 转发时没有下载的文件 -->
        <div class="fileMessBox" v-if="message.self&&message.UploadStore&& message.filePath==undefined">
             <span v-if="message.self">大小：{{message.fileSize}}</span>
            <i :id="fileMessBoxs(message.messageKeys)" v-show="!message.downFilePath" class="el-icon-download" @click="downFile(message,message.forwardKey)" :data-content="data.content" :data-oldname="data.oldname">&nbsp;&nbsp;</i>
            <div class="myOpenFile" v-show="message.downFilePath">
                <span class="openTarget" @click="openn(message.downFilePath)">打开</span>&nbsp;&nbsp;
                <span class="openfilePath" @click="button_choose_file(message.downFilePath)" :data-path="message.filePath">打开文件夹</span>
            </div>
        </div> 
         <div  v-if="message.self&& message.downFile==undefined" style="margin-top:13px;display:none;" :id="BoxforId(message.messageKeys)">
            <el-progress :id="forId(message.messageKeys)" :percentage="0" :stroke-width="3"  :show-text='false'></el-progress>
       </div>
         <!-- 接收下载 -->
       <div  v-if="!message.self&& message.downFile==undefined" style="margin-top:13px;display:none;" :id="BoxforId(message.messageKeys)">
            <el-progress :id="forId(message.messageKeys)" :percentage="0" :stroke-width="3"  :show-text='false'></el-progress>
       </div>
       
        <div class="fileMessBox" v-if="!message.self">
            <i :id="fileMessBoxs(message.messageKeys)" v-show="!message.downFilePath" class="el-icon-download" @click="downFile(message)" :data-content="data.content" :data-oldname="data.oldname">&nbsp;&nbsp;</i>
            <span class="myOpenFile" v-show="message.downFilePath">
                <span class="openTarget" @click="openn(message.downFilePath)">打开</span>&nbsp;&nbsp;
                <span class="openfilePath" @click="button_choose_file(message.downFilePath)" :data-path="message.filePath">打开文件夹</span>
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
const electron = require("electron");
var remote=require('electron').remote
const ipcRenderer = require('electron').ipcRenderer;
var { ipcRenderer: ipc } = require("electron");
const {shell} = require("electron").remote;
const uuidv4 = require('uuid/v4');
const clipboard = require('electron').clipboard
const clientiot = require("@hxim/clientiot");
var co = require("co");
var target_ID;
var messageDataArr=[];
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const SendMenu = new Menu();
const AcceptMenu=new Menu();
const ForwardAcceptMenu=new Menu();
const OvertimeMenu=new Menu();
var  dataARR,txtEditorNum=0;
export default {
  props:['message'],
  data(){ 
    return{
        // showDown:true,
        data:this.message,
        state:{ 
            UploadID:null,
        },
        Uploads:sessionStorage.getItem('UploadprogNums'+this.message.msgID)||0, 
    }
  },
  components:{ 
  },
   computed: {
    ...mapGetters(["selectedChat", "messages"]),
    ...mapState(["user", "fileSuffix",'selectSendmessageAticon', "emojis", "chatlist", "UploadprogNum", "selectId",'GroupTitle',"members",'selectFriendId','selectFriendAticon'])
  },
  methods:{
       onmousecontextmenu(e) {
            // this.selectText(e.target)
            if(e.button ==2){
            txtEditorNum++;
            var data=e.target.dataset.src;
            var dataText=e.target.innerText;
            var items=e.target.offsetParent.dataset.url;

            if(items!=undefined){
                dataARR=JSON.parse(items)
            }

            if(data==undefined&& items!=undefined){
                var item= {dataText:dataText,itemsUrl:dataARR};
                Events.$emit('setForData', item)
            }else if(dataText==undefined||dataText == ""){
                var item= {dataText:data,itemsUrl:dataARR};
                Events.$emit('setForData', item)
            }else if(data==undefined && items==undefined){
                Events.$emit('setForData', dataText)
            }
    　　   };
            if(dataARR.self==true){
                var now = new Date().getTime();
                var Seletime= now-(dataARR.date);
                var dat=Math.floor(Seletime / (60 * 1000));
                if(dat>=2){
                     OvertimeMenu.popup(remote.getCurrentWindow())
                }else{
                     SendMenu.popup(remote.getCurrentWindow())
                }
            }else{
                if(dataARR.downFilePath){
                     AcceptMenu.popup(remote.getCurrentWindow())
                }else{
                     ForwardAcceptMenu.popup(remote.getCurrentWindow())
                }
                
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
                     
                    selection.removeAllRanges();
                    selection.addRange(range);
                    /*if(selection.setBaseAndExtent){
                        selection.setBaseAndExtent(text, 0, text, 1);
                    }*/
                } else {
                    alert("none");
                }
            },
        fileDOC:function(value){
            let content;
            value.self?content = value.filename:content = value.oldname;
            var extName=content.substr(content.lastIndexOf('.')+1);
            let doc = this.fileSuffix.find(session => session == extName);
            if(doc == undefined){
                return "static/images/fileIcon/othe.svg"
            }else{
                return "static/images/fileIcon/"+doc+".svg"
            }
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
        // 打开文件
        openn:function(item){
            shell.openItem(item)
        },
        // 点击卡片打开文件
        opennn:function(value){
            if(value.self===true){
                shell.openItem(value.filePath)
            }else{
                if(value.downFilePath){
                    shell.openItem(value.downFilePath)
                }else{
                    this.downFile(value)
                }
            }

        },
        //下载文件
        downFile:function(item) {
        /*从S3下载文件*/
        var me=this;
            if (sessionStorage.getItem(item.filename)) {
                me.$message({
                    message: "正在下载，请稍后！",
                    duration: 1800,
                    type: 'error',
                    center: true,
                });
            return;
        }else{
            sessionStorage.setItem(item.filename,item.filename);
        }
        this.showDown = false;
        const itemFileCode = item.filename;
        const itemFilename = item.content;
        const chatId = me.$store.state.selectFriendId;
        let downChat = me.$store.state.chatlist.find(chats=>chats.id===chatId);
        var getElementById='forid_'+item.messageKeys;
        var getElement='fileMessBoxs_'+item.messageKeys;
        var BoxforId_='BoxforId_'+item.messageKeys;
       
        if( itemFileCode && itemFilename ){
            co(function*(){
                clientiot.awss31.DownloadFile(itemFileCode,"/profile/FileRecv/",function(res) {
                    var resData = JSON.parse(res);
                    console.log(resData)
                    if(resData.errorCode ==300){
                    var Uploadprogress={upload:resData.data,msgId:itemFileCode} 
                    me.$store.dispatch("Uploadprogress", Uploadprogress);
                    var Uploadprogress=JSON.parse(res);
                    var Uploadprogress=JSON.parse(Uploadprogress.data)
                    var num = (Uploadprogress.progressAmount / Uploadprogress.progressTotal);
                    var Updateprogress = Math.round(num * 100); 
                     var BoxforId_getElement=document.getElementById(getElement); 
                    if(Updateprogress >3){
                       var BoxforId_dd=document.getElementById(BoxforId_);
                       if(BoxforId_dd!=null){
                            BoxforId_dd.style.display='block'
                       }
                      
                    }
                    if(Updateprogress<100){ 
                        var downFilett=document.getElementById(getElementById); 
                        if(downFilett!=null){
                            downFilett.style.width=Updateprogress+'%'; 
                             me.showDown = false 
                        }  
                    };
                     if(BoxforId_getElement!=null){
                        BoxforId_getElement.style.display='none'
                    };  
                    };
                    if (resData.errorCode == 200) {
                        me.showDown = false
                        let value={};
                        value.keys=item.messageKeys;
                        value.path=resData.data.rootPath+resData.data.thisDir;
                        value.id = chatId;
                        value.downFile=true;
                        var u_sql = "update HxImMsg set localPath='" + value.path + "' where message_key='" + item.messageKeys + "'";
                        clientiot.sqllite.executeNoQuerySql(u_sql,function(res){
                            console.log(res);
                        });
                        me.$store.dispatch("downFilePath", value);
                        setTimeout(function(){
                            me.$forceUpdate();
                        },200)
                    }
                    if(resData.errorCode == 400){
                        me.$message({
                            message:"下载失败",
                            duration:1800,
                            type:'error',
                            center:true,
                        });
                        me.showDown=true;
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
                // let message={content:file.filename,msgType:file.msgType,msgID:file.msgID,filePath:file.filePath,target_ID:file.target_id,oldName:file.filename,fileSize:file.fileSize,errorCode:data.success};
                if(data.errorCode==200){  
                var message={content:file.filename,mediaId:nameKey,date:file.date,selectID:(JSON.stringify(file.channelType)),msgType:file.msgType,msgID:file.msgID,filePath:file.filePath,target_ID:file.target_id,oldName:file.filename,fileSize:file.fileSize,errorCode:data.success};
                me.sendImage(message)  
                let value={};
                    value.keys=file.msgID; 
                    value.id=target_ID;
                    me.$store.dispatch('uploadFilePath',value)
                }else if(data.errorCode==400 && data.success==false){
                    me.$store.dispatch("sendMessage", message);
                }
                else{ 
                    var Uploadprogress=JSON.parse(data.data);
                    var num = (Uploadprogress.progressAmount / Uploadprogress.progressTotal);
                    var Updateprogress = Math.round(num * 100); 
                    console.log("上传进度"+Uploadprogress.key+':'+Updateprogress); 
                    me.Uploads=Updateprogress;
                    me.$store.dispatch("Uploadprogress", Uploadprogresed);
                    if(Updateprogress >3){
                       var BoxforId_dd=document.getElementById(BoxforId_);
                       if(BoxforId_dd!=null){
                            BoxforId_dd.style.display='block'
                       }
                      
                    }
                    if(Updateprogress<100){
                         sessionStorage.setItem('UploadprogNums'+file.msgID,Updateprogress);
                        var tt=document.getElementById(getElementById);
                      
                        if(tt!=null){
                            tt.style.width=Updateprogress+'%'; 
                        } 
                    }  
                }
            }); 
        },
            // 点击发送按钮发送图片文件
        sendImage(msg) {
        var me=this;
        var nows = new Date().getTime();
        var loginUser_id=JSON.parse( sessionStorage.getItem("currentUser")).id;
        var channelType= JSON.parse(msg.selectID);
       
        var now=new Date().getTime();
        if(msg.target_ID<100000){
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
                        mediaId: msg.mediaId,
                        width: 5
                    }, 
                    msgType: msg.msgType, 
                    targetId:msg.target_ID,
                    targetType: "custom",
                    version: 0
                }
            } 
            clientiot.http.sendMessage(JSON.stringify(data),msg.filePath).then(function(retvalue){
                console.log("群发图片文件:"+retvalue);
                var dataArr=JSON.parse(retvalue);
                if(msg.msgType=='image'){
                    var message={content:msg.filePath,mediaId:msg.mediaId,UploadStore:true,msgType:msg.msgType,msgID:msg.msgID,filePath:msg.filePath,date:msg.date,filename:msg.oldName,fileSize:msg.fileSize,
                    message_key:dataArr.data.message_key,
                    theme_key:dataArr.data.theme_key,target_id:dataArr.data.targetId,errorCode:dataArr.success
                }
                }else{
                    var message={content:msg.oldName,mediaId:msg.mediaId,UploadStore:true,msgType:msg.msgType,msgID:msg.msgID,filePath:msg.filePath,date:msg.date,filename:msg.oldName,fileSize:msg.fileSize,
                    message_key:dataArr.data.message_key,
                    theme_key:dataArr.data.theme_key,target_id:dataArr.data.targetId,errorCode:dataArr.success
                }
                }
            
                if(dataArr.success==true){
                me.$store.dispatch("sendMessage", message); 
                me.$store.dispatch('topChatlist',me.selectedChat);
                //   this.content = "";
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
                targetCode: channelType.targetCode,
                targetId:msg.target_ID,
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
                    mediaId: msg.mediaId,
                    width: 5
                }
            }
            clientiot.http.sendMessage(JSON.stringify(data),msg.filePath).then(function(retvalue){
                console.log("个人发文件:"+retvalue); 
                var dataArr=JSON.parse(retvalue);
                var message;
                if(msg.msgType=='image'){
                    message={content:msg.filePath,msgType:msg.msgType,mediaId:msg.mediaId,UploadStore:true,msgID:msg.msgID,filePath:msg.filePath,date:msg.date,filename:msg.oldName,fileSize:msg.fileSize,
                    message_key:dataArr.data.message_key,
                    theme_key:dataArr.data.theme_key,
                    target_id:dataArr.data.targetId,errorCode:dataArr.success
                    };
                }else{
                    message={content:msg.oldName,msgType:msg.msgType,mediaId:msg.mediaId,UploadStore:true,msgID:msg.msgID,filePath:msg.filePath,date:msg.date,filename:msg.oldName,fileSize:msg.fileSize,
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
  },
 mounted(){ 
     var me=this;
     ipcRenderer.on('MESSPATHVALUE', function (event, arg) {
			console.log(arg);
            me.$store.dispatch("downFilePath",JSON.parse(arg));
            me.$forceUpdate();
		})
     this.$nextTick(function () {
        this.chickMessage() 
    });

    Event.$on("messDownFile", data => {
          me.$store.dispatch("downFilePath", data);
    });
      if(txtEditorNum==0){
      txtEditorNum++;
     SendMenu.append(new MenuItem(
    {
        label: '复制',
        // role: 'copy',
        // enabled:false

        click:function(){
            
            Events.$on('setForData', dataText=>{
                var contents=null; 
             if(dataText.itemsUrl.downFilePath!=undefined){
                    clipboard.writeText("[file]"+dataText.itemsUrl.downFilePath)
                } 
                else{
                    clipboard.writeText("[file]"+dataText.itemsUrl.filePath)
                } 
            //  clipboard.writeBuffer(text,buffer)
            }) 
       
        }
     }   //Undo菜单项
    ))
    SendMenu.append(new MenuItem(
    {
        label: '撤回',
        click: function () {
             var userInfo=JSON.parse(sessionStorage.getItem('currentUser'));
             var userId=parseInt(userInfo.id);
            var message_key=dataARR.messageKeys;
            var theme_key=dataARR.theme_key;
            var target_id=dataARR.target_id;
            var errorCode=dataARR.errorCode;
            var now = new Date().getTime();
            var Seletime= now-(dataARR.date);
            var dat=Math.floor(Seletime / (60 * 1000));
            var channelType= parseInt(channelType);
            if(target_id<100000){
                var flag=1;
            }else{
                 var flag=0;
            }
            var data={
                "flag": flag,
                "message_key":message_key,
                "target_id":target_id,
                "theme_key": theme_key,
                "user_id": userId
                };
             if(errorCode==false){
                 me.$message({
                    message:'本条消息发送失败',
                    duration:1800,
                    type:'warning',
                    center:true,
                })
                 return
            };
             if(target_id==undefined){
                 me.$message({
                    message:'只能撤回自己发送的消息',
                    duration:1800,
                    type:'warning',
                    center:true,
                })
                 return
            };
            if (dat >= 2) {
                me.$message({
                    message: '只能撤回2分钟内的消息',
                    duration: 1800,
                    type: 'warning',
                    center: true,
                })
            }
            else {

                //2018.12.24更改为新的撤回消息
                clientiot.http.messageRevoke(data).then((res) => {
                    var sucssData = JSON.parse(res);
                    if (sucssData.success == true) {
                        me.Revoke = true
                        for (var i = 0; i < messageDataArr.length; i++) {
                            if (messageDataArr[i].messageKeys && messageDataArr[i].messageKeys === message_key) {
                                me.$store.dispatch("pushNotic", i);
                                dataARR='';
                                return
                            }
                        }

                    }
                })
            }
        }
     }   //Undo菜单项
    ))
    SendMenu.append(new MenuItem({type: 'separator'}))
    SendMenu.append(new MenuItem({
        label: '转发',
        click: function (e) {
             var message_key=dataARR;
            if(message_key.UploadStore==null){
                 me.$message({
                    message: '发送中,请稍后！',
                    duration: 1800,
                    type: 'warning',
                    center: true,
                })
            }else{
                 Events.$emit('IsForwardData', true);
            }
        }
     }));
    
     OvertimeMenu.append(new MenuItem(
    {
        label: '复制',
        // role: 'copy',
        // enabled:false

        click:function(){
            
            Events.$on('setForData', dataText=>{
                var contents=null;
                if(dataText.itemsUrl.downFilePath!=undefined){
                    clipboard.writeText("[file]"+dataText.itemsUrl.downFilePath)
                } 
                else{
                    clipboard.writeText("[file]"+dataText.itemsUrl.filePath)
                } 
            //  clipboard.writeBuffer(text,buffer)
            }) 
       
        }
     }  
    ));
     OvertimeMenu.append(new MenuItem({
        label: '转发',
        click: function (e) {
             var message_key=dataARR;
            if(message_key.UploadStore==null){
                 me.$message({
                    message: '发送中,请稍后！',
                    duration: 1800,
                    type: 'warning',
                    center: true,
                })
            }else{
                 Events.$emit('IsForwardData', true);
            }
        }
     }));
     AcceptMenu.append(new MenuItem(
    {
        label: '复制',
        // role: 'copy',
        // enabled:false

        click:function(){
            
            Events.$on('setForData', dataText=>{
                var contents=null; 
              clipboard.writeText("[file]"+dataText.itemsUrl.downFilePath)
            //  clipboard.writeBuffer(text,buffer)
            })
        const message = `粘贴的内容: ${clipboard.readText()}`
       
        }
     }  
    ))
    AcceptMenu.append(new MenuItem({type: 'separator'}))
    AcceptMenu.append(new MenuItem({
        label: '转发',
        click: function (e) {
             var me=this;
            Events.$emit('IsForwardData', true);
        }
     }));
   
// 文件未下载时
     ForwardAcceptMenu.append(new MenuItem({
        label: '转发',
        click: function (e) {
             var me=this;
            Events.$emit('IsForwardData', true);
        }
     }));
    } 
 },
  watch: {
    // 发送信息后,让信息滚动到最下面
    messages() {
    var me=this; 
      messageDataArr= me.$store.getters.messages;
    }
  },
 created(){
      Events.$off('sendMessage', this.chickMessage()) 
 },
 beforeDestroy () {
    Events.$off('sendMessage', this.chickMessage())
 }
}
</script>
<style lang="stylus" scoped>
.attach-file {
    margin-top: 3px;
    margin-left: 2px;
    width: 280px;
    vertical-align: middle;
    cursor: pointer;
    img {
        float: left;
        
    }

    .attach-desc {
        padding-left: 7px;
        width: 205px;
        min-height: 64px;
        line-height: 20px;
        color: #464548;
        font-size: 23px;
        float: right;
        border-left: solid 1px #DCDAD6;
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
