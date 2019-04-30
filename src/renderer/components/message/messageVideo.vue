<template>
    <div class="hx-viedo" style="display:flex;position: relative;" :key="initLoading(message)"  @contextmenu="onmousecontextmenu($event)" :data-url="JSON.stringify(message)">
        <!-- <Loadings></Loadings> -->
        <!-- 发送 -->
         <div v-if="message.self&&message.UploadStore==null" :class="fileMessBoxs(message.msgID)"  class="circle-bar" style="position: absolute;top: 23px; z-index: 1; left: 31%;">
            <div class="circle-bar-left"></div>
            <div class="circle-bar-right"></div>
            <!--遮罩层，显示百分比-->
            <div class="mask">
                <span class="percent" :class="forId(message.msgID)" :id="forId(message.msgID)" @click="imgDialog(message)"></span>
            </div>
        </div>
        <!-- 接受下载 -->
         <div v-if="!message.self&&!message.downFilePath" :id="fileMessBoxs(message.messageKeys)" :class="fileMessBoxs(message.messageKeys)"  class="circle-bar" style="position: absolute;top: 23px; left: 31%;">
            <div class="circle-bar-left"></div>
            <div class="circle-bar-right"></div>
            <!--遮罩层，显示百分比-->
            <div class="mask">
                <span class="percent" :class="forId(message.messageKeys)" :id="forId(message.messageKeys)" @click="imgDialog(message)"></span>
            </div>
        </div>
        <!-- 转发没有下载的 -->
          <div v-if="message.self && message.UploadStore&& message.filePath==''&&!message.downFilePath" :id="fileMessBoxs(message.messageKeys)" :class="fileMessBoxs(message.messageKeys)"  class="circle-bar" style="position: absolute;top: 23px; left: 31%;">
            <div class="circle-bar-left"></div>
            <div class="circle-bar-right"></div>
            <!--遮罩层，显示百分比-->
            <div class="mask">
                <span class="percent" :class="forId(message.messageKeys)"  :id="forId(message.messageKeys)" @click="imgDialog(message)"></span>
            </div>
        </div>
        <!-- <el-card v-loading="!message.downFilePath&&message.self!=true&&downVideoTips" :lock-scroll="false"> -->
        <img v-loading="loading"  :id="fileMessBoxs(message.messageKeys)" @click="imgDialog(message)"  :src="videoImage" class="video" style="flex:1;width: 220px;height: 120px;"/>
        <div v-if="message.self==true" class="box" style="left:3px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;width: 80%;top:-4px;height: 20px;color: wheat;">{{message.content }}</div>
        <div v-else class="box" style="left:3px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;width: 80%;top:-4px;height: 20px;color: wheat;">{{message.content}}</div>
        <!-- <div style="margin-top:10px;" :id="BoxforId(message.msgID)" v-if="message.self&&message.UploadStore==null">
             <div class="box" :id="forId(message.msgID)" style="right:30px;"> </div>
        </div> -->
        <!-- <el-table v-loading="false" style="height:120px;position: absolute;width: 92%;"></el-table>  -->
        <div class="box" :id="fileMessBoxs(message.msgID)" v-if="message.UploadStore && message.downFilePath" style="right:4px;bottom: -1px;color: wheat;">&nbsp;&nbsp;<span @click="imgDialog(message)">播放</span>&nbsp;&nbsp;<span class="getShou" @click="button_choose_video(message)" :data-path="message.localPath">打开文件夹</span></div> 
        <div class="box" :id="fileMessBoxs(message.msgID)" v-if="message.UploadStore && message.filePath" style="right:4px;bottom:-2px;color: wheat;">&nbsp;&nbsp;<span @click="imgDialog(message)">播放</span>&nbsp;&nbsp;<span class="getShou" @click="button_choose_video(message)" :data-path="message.localPath">打开文件夹</span></div>                           
        <div class="openVideoParent" v-if="!message.self&&message.downFilePath"><span @click="imgDialog(message)" style="color: wheat;display: inline-block; padding-right: 10px;">播放</span><span   @click="button_choose_video(message)" :data-path="message.localPath" class="openVideo" style="color: wheat;">打开文件夹</span></div>        
        <!-- </el-card> -->
    </div> 
</template>
<script>
import { mapGetters, mapState, mapActions } from "vuex";
import Events from '../../api/eventBus.js';
import VideoPlayer from 'vue-video-player';
import { setTimeout } from 'timers'; 
import Loadings from '../LandingPage/loading'
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
var messageDataArr=[];
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const SendMenu = new Menu();
const AcceptMenu=new Menu();
const OvertimeMenu=new Menu();
var  dataARR,txtEditorNum=0;
export default {
  props:['message'],
  components: {   
    VideoPlayer,
    Loadings
  },
  data(){ 
    return{
      data:this.message,
      downVideoTips:false,
      loading:true,
      isDisable: true,
      state:{
        UploadprogNums:sessionStorage.getItem('Updateprogress'+this.message.msgID)||0, 
        UploadID:null,
      },
     videoImage:"static/images/video.png"
    }
  },
   computed: {
    ...mapGetters(["selectedChat", "messages"]),
    ...mapState(["user", "emojis", "chatlist", "UploadprogNum", "selectId",'GroupTitle',"members",'selectFriendId','selectFriendAticon'])
  },
  methods:{
      initLoading(value){
            var getLoadKey = sessionStorage.getItem(value.messageKeys);
            if(getLoadKey == "true"){
                this.downVideoTips = true
            }else{
                this.downVideoTips = false;
            }
            return value.message_key
        },
       onmousecontextmenu(e) {
            this.selectText(e.target)
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
                 AcceptMenu.popup(remote.getCurrentWindow())
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
            if(item.filePath){
                shell.showItemInFolder(item.filePath);
            }else{
                if(item.downFilePath){
                shell.showItemInFolder(item.downFilePath);
                }else {
                     shell.showItemInFolder(item.filePath);
                }
                
            } 
        }else{
            shell.showItemInFolder(item.downFilePath);
        }
    },
   
    chickMessage(){
        Events.$off('sendMessage')
         Events.$on('sendMessage',message=>{
             target_ID=message.target_id;
             this.uploadFile(message);
             console.log("上传视频：" + JSON.stringify(message));
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
          
        sessionStorage.setItem('messageID'+file.msgID,file.msgID);
         clientiot.awss31.UploadFile(nameKey, file.filePath, function (res) {
            let data=JSON.parse(res);  
            var Uploadprogresed={upload:data.data,msgId:file.msgID}; 
            if(data.errorCode==200){  
              let message={content:nameKey,mediaId:nameKey,msgType:file.msgType,selectID:JSON.stringify(file.channelType),msgID:file.msgID,filePath:file.filePath,target_ID:file.target_id,oldName:file.filename,fileSize:file.fileSize};
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
                        //  tt.innerText="上传进度:"+Updateprogress+'%';
                          tt.innerText=Updateprogress+'%'
                           me.onload(getElementById,getElement) 
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
      var channelType= JSON.parse(msg.selectID);
      this.$store.state.selectFriendAticon = channelType;
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
                    mediaId: msg.content,
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
                    var message={content:msg.filePath,UploadStore:true,msgType:msg.msgType,msgID:msg.msgID,filePath:msg.filePath,date:nows,filename:msg.oldName,fileSize:msg.fileSize,
                    message_key:dataArr.data.message_key,
                     mediaId:msg.mediaId,
                    theme_key:dataArr.data.theme_key,target_id:dataArr.data.targetId,errorCode:dataArr.success
                }
                }else{
                    var message={content:msg.oldName,UploadStore:true,msgType:msg.msgType,msgID:msg.msgID,filePath:msg.filePath,date:nows,filename:msg.oldName,fileSize:msg.fileSize,
                    message_key:dataArr.data.message_key,
                    mediaId:msg.mediaId,
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
              targetId: msg.target_ID,
              targetCode: channelType.targetCode,
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
                     mediaId:msg.mediaId,
                    target_id:dataArr.data.targetId,errorCode:dataArr.success
                    };
                }else{
                    message={content:msg.oldName,msgType:msg.msgType,UploadStore:true,msgID:msg.msgID,filePath:msg.filePath,date:nows,filename:msg.oldName,fileSize:msg.fileSize,
                    message_key:dataArr.data.message_key,
                    theme_key:dataArr.data.theme_key,
                    target_id:dataArr.data.targetId,
                     mediaId:msg.mediaId,
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
        var me = this;            
        var value;  
        var getElementById='forid_video'+item.messageKeys;
        var getElement='fileMessBoxs_video'+item.messageKeys;
        var BoxforId_='BoxforId_video'+item.messageKeys;
        if(item.self==true&&item.filePath!=undefined&&item.filePath!=''){
            value=item.filePath
            shell.openExternal(value)
        }else{
            if(item.downFilePath){
                shell.openExternal(item.downFilePath)
            }else{
                const chatId = me.$store.state.selectFriendId;
                me.downVideoTips = true;
                if(sessionStorage.getItem(item.messageKeys)){
                    me.$message({
                        message: "正在下载，请稍后！",
                        duration: 1800,
                        type: 'error',
                        center: true,
                    });
                    return
                }else{
                    sessionStorage.setItem(item.messageKeys,true);
                }
                if(me.isDisable){
                     me.isDisable = false;
                     co(function* (){
                    clientiot.awss31.DownloadFile(item.filename,"/profile/images/",function(res){
                        var resData = JSON.parse(res);
                        var Uploadprogresed={upload:resData.data,msgId:item.messageKeys}; 
                        console.log(resData);
                        if(resData.errorCode == 200){
                            me.downVideoTips = false; 
                            sessionStorage.removeItem(item.messageKeys)
                            var value = {};
                            value.keys = item.messageKeys;
                            value.id = chatId;
                            value.path = resData.data.rootPath+resData.data.thisDir; 
                            me.$store.dispatch("downFilePath",value);
                            var u_sql = "update HxImMsg set localPath='" + value.path + "' where message_key='" + item.messageKeys + "'";
                            clientiot.sqllite.executeNoQuerySql(u_sql,function(res){
                                console.log(res);
                            });
                            setTimeout(function(){
                                me.$forceUpdate();
                                // shell.openExternal( value.path)
                            },200)
                        }else{
                            var Uploadprogress=JSON.parse(resData.data);
                            var num = (Uploadprogress.progressAmount / Uploadprogress.progressTotal);
                            var Updateprogress = Math.round(num * 100);
                            me.state.UploadprogNums=Updateprogress; 
                            console.log("下载进度"+Uploadprogress.key+':'+Updateprogress);  
                            me.$store.dispatch("Uploadprogress", Uploadprogresed);
                            if(Updateprogress<100){
                                var tt=document.getElementById(getElementById);
                                var dd=document.getElementById(getElement);
                                
                                if(tt!=null){ 
                                    tt.innerText=Updateprogress+'%';
                                    dd.style.zIndex=1; 
                                    me.onload(getElementById,getElement) 
                                } 
                            }
                        }
                        if(resData.errorCode == 400){
                                me.$message({
                                message:'下载失败',
                                duration:1800,
                                type:'warning',
                                center:true,
                            })
                        }
                    },item.content)
                })
                }
               
            }
        };
    },
     onload(getElementById,getElement){
        var circleBarBtn    = document.getElementById(getElementById)
        var circleBar    = document.getElementsByClassName(getElement)[0];
        var percent      = parseInt(circleBar.getElementsByClassName(getElementById)[0].firstChild.nodeValue);
        //   var percent      = parseInt(circleBar.getElementsByClassName('percent')[0].firstChild.nodeValue);
       
        var color        = circleBar.css('background-color');
        var left_circle  = circleBar.getElementsByClassName('circle-bar-left')[0];
        var right_circle = circleBar.getElementsByClassName('circle-bar-right')[0];

        if( percent <= 50 ) {
            var rotate = 'rotate('+(percent*3.6)+'deg)';
            right_circle.css3('transform',rotate);
        }else {
            var rotate = 'rotate('+((percent-50)*3.6)+'deg)';
            right_circle.css ('background-color',color);//背景色设置为进度条的颜色
            right_circle.css3('transform','rotate(0deg)');//右侧不旋转
            left_circle.css3 ('transform',rotate);//左侧旋转
        }
      }
  },
   watch: {
    // 发送信息后,让信息滚动到最下面
    messages() {
    var me=this; 
      messageDataArr= me.$store.getters.messages;
    }
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
        role: 'copy',
        enabled:false

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
        role: 'copy',
        enabled:false 
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
    };


        //封装了css3函数
    Element.prototype.css = function(property,value){
        
        if ( value ) { 
            var index = property.indexOf('-');
            if( index != -1 ) {
                var char = property.charAt(index+1).toUpperCase();
                property.replace(/(-*){1}/,char);
            }
            this.style[property] = value;
        }else{ 
            return window.getComputedStyle(this).getPropertyValue(property);
        }
    }

    //封装一个css3函数，用来快速设置css3属性
    Element.prototype.css3 = function(property,value){
        if( value ){
            property = capitalize(property.toLowerCase());
            this.style['webkit'+property] = value;
            this.style['Moz'+property] = value;
            this.style['ms'+property] = value;
            this.style['O'+property] = value;
            this.style[property.toLowerCase()] = value;
        }else{
            return window.getComputedStyle(this).getPropertyValue(
                    ('webkit'+property)||('Moz'+property)||('ms'+property)||('O'+property)||property);
                    
        }
      
        //首字母大写
        function capitalize(word){
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
    }   
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
.el-card__body {
    padding: 0px!important; 
}
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
    bottom: -1px;
    right: -14px;
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
    color: block;
}
.openVideo{
    color:block !important;
    margin-right:20px;
}
.circle-bar {margin: 20px; font-size:50px; width: 1em; height: 1em; position: relative;  background-color: #3f3f3f; }
.circle-bar-left,.circle-bar-right { width: 1em; height: 1em;  } 
.circle-bar-right { clip:rect(0,auto,auto,.5em);background-color: #fff; }
.circle-bar-left { clip:rect(0,.5em,auto,0); background-color:#fff;} 
.mask { width: 0.8em; height: 0.8em;text-align: center;line-height: 0.2em; color:rgba(0,0,0,0.5);}
.mask :first-child { font-size: 0.3em; height: 0.8em; line-height: 0.8em; display: block;  }
/*所有的后代都水平垂直居中，这样就是同心圆了*/
.circle-bar * {  position: absolute; top:0; right:0; bottom:0; left:0; margin:auto; }
/*自身以及子元素都是圆*/
.circle-bar, .circle-bar > * { border-radius: 50%; }
</style>
