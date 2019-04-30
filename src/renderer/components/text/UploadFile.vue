

<template>
    <div >
     <div class="emoji">
          <i class="icon iconfont icon-xiaolian"  @click="showEmoji=!showEmoji"></i> 
          <!-- 图片 -->
          <label><i class="icon iconfont icon-wenjian1" @click="imgHandler"> </i>
          </label>
            <i class="icon iconfont icon-jiandao"  @click="screenshot"></i>
            <!-- 消息记录 -->
          <span class="messageRecode" @click="showMessages">聊天记录<i class="icon iconfont icon-down-trangle"></i></span>
          
    </div>
     <messageRecord v-show="this.messagesPlay"></messageRecord> 
     <transition name="showbox">
             <div class="emojiBox" v-show="showEmoji">
                 <li v-for="(item, index) in emojis">
                    <img :src="'static/emoji/'+item.file" :data="item.code" @click="cliEmoji(item)">
                 </li>
             </div>
     </transition> 
     <transition name="showbox">
             <div class="AtPople" v-show="AtPople">
               <ul>
                 <li v-for="list in members"  class="hx-frienditems" :class="{ noborder:!list.initial}">
                  <label :for="list.id">
                  <input type="checkbox" name="hx-item" :data-name="list.id" :value="list" :id="list.id"  class="hx-input"  >
                      <div class="friend-info "  @click="selectFriend(list)" >
                      <img class="avatar"  width="30" height="30" v-bind:src="list.images_url" style="vertical-align: middle;">
                      <div style="display:inline-block;">
                          <div class="hx-listNames">{{list.memberName}}</div> 
                      </div>
                  </div>
                  </label>      
              </li>
              </ul>
             </div>
     </transition>   
    <!-- quill-editor插件标签 分别绑定各个事件-->
    <quill-editor @keyup.enter="onKeyup" v-model="content"  ref="myQuillEditor" v-on:paste.native="paste" :options="editorOption" @blur="onEditorBlur($event)" @focus="onEditorFocus($event)"  @change="onEditorChange($event)">
    </quill-editor>
    <!-- 文件上传input 将它隐藏-->
    <el-upload  class="upload-demo" :action="this.photoUrl" :before-upload='beforeUpload' :data="uploadData"  
          ref="upload" style="display:none">
    <el-button size="small" type="primary" id="imgInput" element-loading-text="">点击上传</el-button>
    </el-upload>
    <video src="" id="hx-video" style="display:none;"></video>
    <div :data="selectFriendAticon" class="send" @click="send">
    	<span>发送(S)</span>
    </div>
    <transition name="appear">
	    <div class="warn" v-show="warn">
	    	<div class="description">不能发送空白信息</div>
	    </div>
	</transition>
    </div>
   
</template>
<script>
import { mapGetters, mapState } from 'vuex'  
import { clipboard } from 'electron' 
import Events from '../../api/eventBus.js'
const clientiot = require("@hxim/clientiot"); 
const { ipcRenderer:ipc} = require('electron')
const electron = require('electron')
const desktopCapturer = electron.desktopCapturer
const electronScreen = electron.screen
const shell = electron.shell
const fs = require('fs')
const os = require('os')
const path = require('path')
import messageRecord from '../../components/message/messageRecord'
import moment from 'moment'
import Vue from 'vue';
Event=new Vue();
moment.locale('zh-cn')
var co = require("co");
const uuidv4 = require('uuid/v4');
import Quill from 'quill';
import { setTimeout } from 'timers';
var message_id;
var ImageDatas=[];
var em0jisArr='';
var quilIndex=0;
var selectedChatID;
var AtNewPople=[];
export default {
  components:{
    messageRecord
  },
   data () {
      return {
        content: '', // 文章内容
        prop: "action",
        showEmoji: false,
        focusClass:false,
        showMessage: false,
        warn: false,
        editorOption: {
        placeholder: '',
        modules: { // 配置富文本
            toolbar: [  
                ['link', 'image', 'video']//'link', 'image', 'video'
            ]
            }, 
        },
        addRange: [],
        uploadData: {},
        photoUrl: '', // 上传图片地址
        uploadType: '', // 上传的文件类型（图片、视频）
        pasteImageData: "",
        base64Data: "", 
        originalBase64: "",
        messagesPlay:false,
        AtPople:false
      }
    },
computed: {
     ...mapState(["user", "selectId", "emojis","selectFriendAticon",'selectSession','members']),
    ...mapGetters(["selectedChat", "messages"])
},
methods:{
     // 按回车发送信息
    onKeyup(e) {
      if (e.keyCode == 13) {
        e.returnValue=false;
        this.send();
      }else{
        return
      }
    },
  cliEmoji(item){
    var me=this; 
    var emojis=this.replaceFace(item.code);  
      em0jisArr += item.code;
      me.$refs.myQuillEditor.quill.focus();
    // me.content+=emoji;
        // 获取光标所在位置
    const quill = me.$refs.myQuillEditor.quill.getSelection() 
      // 插入图片  res.url为服务器返回的图片地址 

      var this_emoji_path = "static/emoji/" + item.file;

      me.$refs.myQuillEditor.quill.insertEmbed(quill.index, "image", this_emoji_path);
      // 调整光标到最后
      me.$refs.myQuillEditor.quill.setSelection(quill.index+1);
     
    //this.content +=item.code; 
    me.showEmoji=false;
  },
  selectFriend(value){
        var _self=this; 
          _self.$refs.myQuillEditor.quill.focus();
    // me.content+=emoji;
        // 获取光标所在位置
    const quill = _self.$refs.myQuillEditor.quill.getSelection() 
      // 插入图片  res.url为服务器返回的图片地址  
      _self.$refs.myQuillEditor.quill.insertEmbed(quill.index, "text", value.memberName+'  ');
      // 调整光标到最后
      _self.$refs.myQuillEditor.quill.setSelection(quill.index+5);
     
    //this.content +=item.code; 
    _self.AtPople=false;
    AtNewPople.push(value);
  },
 // 点击发送按钮发送信息
 send(){
  var msgCont,me=this;
  var msgType;
  var dataImage=[];
  var clearRec=(this.content).indexOf("<br>") != -1;
  var checkImage=(this.content).indexOf("img") != -1;
  var backspace=(this.content).replace(/<[^>]+>/g, "");
  if((clearRec==true&& backspace==''&&checkImage!=true)||this.content==''){
          this.warn = true;
          setTimeout(() => {
              this.warn = false;
          }, 1000);
          this.content='';
        return
      }
     else {   
      var imgReg = /<img.*?(?:>|\/>)/gi;
      var nameReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
      var arr = this.content.match(imgReg);
      if(arr!=null){
           for (let i = 0; i < arr.length; i++) {
                let names = arr[i].match(nameReg)
                // 获取图片地址
                if (names && names[1]) {
                    msgCont=names[1]
                  dataImage.push(names[1])
                }
            } 
      }else{
        var data={
            msgCont=backspace,
            msgType='text'
        } 
      } 
      };
     if(msgCont.indexOf('data:image')>-1){
       var _self=this;
      
        var img=ImageDatas;

        if(img.length>0){
          var file=[];
          for(var i=0;i<img.length;i++){ 
              var filePaths = clientiot.globalinfo.base64ToLocalhost(dataImage[i],"/profile/images/","screenshot.png"); 
           file.push({
                lastModified:img[i].lastModified,
                 lastModifiedDate:img[i].lastModifiedDate,
                 name:img[i].name,
                 path:filePaths,
                 size:img[i].size,
                type:img[i].type,
                 uid:img[i].lastModified,
                 webkitRelativePath:img[i].webkitRelativePath
                }); 
          }
          for(var k=0;k<file.length;k++){
             _self.PasteUpload(file[k]); 
          }
           this.file=[]; 
        } 
         ImageDatas=[]
       
         var data={
         msgCont:backspace, 
         msgType:'text'
          }
          if(backspace!=''){
              me.Sendmessage(data)
          } 
        _self.content='';
        return
      }
     else if (msgCont.indexOf('static/emoji/') > -1) { 
       
        //  em0jisArr='';
        var emojiArr=[];
        var emojis = this.emojis;
        for (let i = 0; i < arr.length; i++) { 
                let names = arr[i].match(nameReg) 
                for(let k=0;k<emojis.length;k++){
                  if (names[1].indexOf('static/emoji/'+ emojis[k].file)>-1) { 
                    emojiArr.push(emojis[k].code);
                }
                }
                
            }
          //msgCont=emojiArr.join('')+backspace;
          msgCont=this.content.replace(/<br>/g, "")
         var msgType='text' 
        emojiArr=[];
     }
     else if (msgCont.indexOf('https://') > -1 || msgCont.toLowerCase().indexOf(".png") > -1 || msgCont.toLowerCase().indexOf(".bmp") > -1 || msgCont.toLowerCase().indexOf(".gif") > -1 || msgCont.toLowerCase().indexOf(".jpg") > -1 || msgCont.toLowerCase().indexOf(".jpge") > -1) { 
        if(msgCont.indexOf('///')>-1){
            var msgC=msgCont.split('///')[1];
            var msgCont=msgC.replace('%20',' ')
             var file={
                lastModified:new Date().getTime(),
                lastModifiedDate:new Date().getTime(),
                name:'img.png',
                path:msgCont,
                size:323210,
                type:'image/png',
                uid:new Date().getTime(), 
              };
              this.PasteUpload(file);
               var data={
                msgCont:backspace, 
                msgType:'text'
              }
              if(backspace!=''&& backspace!="&nbsp;"&&backspace!="&nbsp; "){
                  this.Sendmessage(data)
              }
              this.content='';
              return
          }else if(msgCont.indexOf('.png')>-1|| msgCont.indexOf('.jpg')>-1|| msgCont.indexOf('.jepg')>-1|| msgCont.indexOf('bmp')>-1|| msgCont.indexOf('.gif')>-1){
               var file={
                lastModified:new Date().getTime(),
                lastModifiedDate:new Date().getTime(),
                name:'img.png',
                path:msgCont,
                size:323210,
                type:'image/png',
                uid:new Date().getTime(), 
              };
              this.PasteUpload(file); 
              this.content='';
              return
          }
          else{
            var msgCont=msgCont;
          };
       var  msgType='image'; 
      }else if(msgCont.indexOf(':///')>-1){
        var msgCont=msgCont;
        var  msgType='image'; 
         if(msgCont.indexOf('///')>-1){
            var localPath=msgCont.split('///')[1]
          }  
        var file={
          lastModified:new Date().getTime(),
          lastModifiedDate:new Date().getTime(),
          name:'img.png',
          path:localPath,
          size:323210,
          type:'image/png',
          uid:new Date().getTime(), 
        };
        this.PasteUpload(file);
         this.content='';
        return
      };
    this.Sendmessage(data)
 },
 Sendmessage(value){
      var loginUser_id=JSON.parse( sessionStorage.getItem("currentUser")).id;
      var channelType= this.selectedChat.id;
      this.$store.state.selectFriendAticon = channelType;
      var now=new Date().getTime();
     if(channelType>100000){
         var fromType='user'
     }else{
         var fromType='group'
     };
      var data = {
        fromId: parseInt(loginUser_id),
        model:1,
        fromType: fromType, 
            msgContent: {
            arn: "arn",
            durationTime: now,
            extras: "extras",
            fileSize: 2,
            format: "format",
            height: 5,
            mediaCrc32: "mediaCrc32",
            mediaId: "mediaId",
            text: value.msgCont,
            AtPoples:AtNewPople,
            width: 5
            }, 
        msgType:value.msgType, 
        targetId:parseInt(channelType),
        targetType: "custom",
        version: 0
        };
        this.content="";
        var msg = {content: value.msgCont,reply: this.reply,msgType:value.msgType,date:now,target_id:this.$store.state.selectFriendAticon, filePath:filePaths,filename:filePaths,
        msgID:now}; 
        this.$store.dispatch('sendMessage', msg);
         clientiot.http.sendMessage(JSON.stringify(data))
        .then(function(retvalue) {
            var self=this;
            console.log("发送消息"+retvalue);
            var retvalueCode=JSON.parse(retvalue);
            var msg = {content: value.msgCont,reply: this.reply,msgType:value.msgType,date:now, msgID:now, filePath:filePaths,filename:filePaths,
            message_key:retvalueCode.data.message_key,theme_key:retvalueCode.data.theme_key,target_id:retvalueCode.data.targetId,errorCode:retvalueCode.success}; 
            if(retvalueCode.success==true){
                self.$store.dispatch('sendMessage', msg);
                self.$store.dispatch('topChatlist',self.selectedChat);
                AtNewPople=[]
            }else{
                self.$store.dispatch('sendMessage', msg);
            }
            
        }.bind(this))
        .catch(function(retvalue) {
            me.$message({
                message:'消息发送失败',
                duration:1800,
                type:'warning',
                center:true,
            })
        });
 },

 // 图片上传之前调取的函数
// 这个钩子还支持 promise
    beforeUpload (file) {
       return this.qnUpload(file)
    },
    // 粘贴图片上传前获得数据
    PasteUpload (file) {
        var _self=this;
          var nows = new Date().getTime();
          this.fullscreenLoading = true
          const suffix = file.name.split('.')
          const ext = suffix.splice(suffix.length - 1, 1)[0]
          console.log(this.uploadType)
          const nameKey=uuidv4()+'.'+ext;
          var localPath=file.path;
          const fileTypes=(file.type.split('/')[0]);
          const fileSize=file.size;
          const svideoURL = null;
          var video, output;
          var scale = 0.8; 
          if(fileSize>100*1024*1024){
             _self.$message({
              message:'发送文件限制在100M内',
              duration:1800,
              type:'warning',
              center:true,
              }) 
              return
          };
          if(fileTypes=="text"||fileTypes==''||fileTypes=='application'){
               var fileType='file'
            }else if(fileTypes=="video"){
            var fileType="video"
            }
            else{
            var fileType=fileTypes
            }
          if (this.uploadType === 'file'||this.uploadType =='') { // 如果是点击插入图片
          // TODO 图片格式/大小限制
          console.log('上传图片')
            var me=this; 
            if(localPath.indexOf('///')>-1){
              var localPath=localPath.split('///')[1]
            }
             if(fileType=='image'){
                // 获取光标所在位置
               var message={content:file.path,msgType:fileType,UploadStore:null,target_id:this.$store.state.selectFriendAticon,msgID:file.uid,filePath:file.path,date:nows,filename:file.name,fileSize:fileSize};
                me.$store.dispatch("sendMessage", message); 
                  // Events.$emit('sendMessage',message)
                }else{
                  var message={content:file.name,msgType:fileType,UploadStore:null,target_id:this.$store.state.selectFriendAticon,msgID:file.uid,filePath:file.path,date:nows,filename:file.name,fileSize:fileSize};
                   me.$store.dispatch("sendMessage", message);
                    // Events.$emit('sendMessage',message)
                } 
                clientiot.awss31.UploadFile(nameKey, localPath, function (res) {
                  let data=JSON.parse(res);  
                  var Uploadprogress={upload:data.data,msgId:file.uid}; 
                  if(data.errorCode==200){ 
                    var message={content:nameKey,msgType:fileType,msgID:file.uid,filePath:file.path,oldName:file.name,date:nows,fileSize:fileSize};
                    me.sendImage(message) 
                  }else{ 
                    //  var Update=JSON.parse(data.data).be_ban[0];
                    //  var num = (Update.progressAmount / Update.progressTotal);
                    //   var Updateprogressed = Math.round(num * 100); 
                    //   console.log("上传进度"+Update.key+':'+Updateprogressed); 
                    //   localStorage.setItem(file.uid,Updateprogressed); 
                    // me.$store.dispatch("Uploadprogress", Uploadprogress);
                  }
                }); 
      } 
},
  screenshot() {
    var me = this;
    var imgData;
    ipc.send("MAINWIN:Screenshot");
    ipc.on("capture", function (event, dataURL, bound) {
        if (imgData) {
            return;
        }

        imgData = dataURL;//clientiot.globalinfo.base64ToLocalhost(dataURL, "/shortcutCapture/", "shortcutCapture.png");
        //    // 获取光标所在位置
        const quill = me.$refs.myQuillEditor.quill.getSelection()
        // 插入图片  res.url为服务器返回的图片地址 
        me.$refs.myQuillEditor.quill.insertEmbed(0, 'image', imgData)
        // 调整光标到最后
        me.$refs.myQuillEditor.quill.setSelection(length + 1)

    });

    imgData = null
  },
 // paste 粘贴图片事件
    paste(e) {
       var me=this;
        const rawFilePath = clipboard.readBuffer('FileNameW').toString('ucs2');
        let filePath = rawFilePath.replace(new RegExp(String.fromCharCode(0), 'g'), '');
        if(rawFilePath!=''){
            if (process.platform === 'darwin') {
            // mac
            filePath = clipboard.read('public.file-url').replace('file://', '');
        } 
        console.log(filePath);
        var nows = new Date().getTime();
        var filePaths = clientiot.utils.getFileInfo(filePath);
        const suffix = filePath.split('\\');
        const ext = suffix.splice(suffix.length - 1, 1)[0];
        const pasnamesuffix = filePath.split('.');
        const pastnameext = suffix.splice(pasnamesuffix.length - 1, 1)[0];
        const nameKey=uuidv4()+'.'+pastnameext;
        if(pasnamesuffix[1]=='png'||pasnamesuffix[1]=='iamge'||pasnamesuffix[1]=='jpg'||pasnamesuffix[1]=='gif'||pasnamesuffix[1]=='svg'){
            var pType='image';
            var  fileName=filePath;
        }else if(pasnamesuffix[1]=='mp4'){
          var pType='video';
          var fileName=ext;
        }
        else{
          var pType='file';
          var fileName=ext;
        }
        var imageUpload={
          size:filePaths.data.size,
          name:ext,
          path:filePath,
          type:pType,
          uid:filePaths.data.ino,
          fileType:pType
        };
        
        let message={content:fileName,UploadStore:null,msgType:imageUpload.fileType,msgID:imageUpload.uid,filePath:imageUpload.path,oldName:imageUpload.name,date:nows,fileSize:imageUpload.size};
          me.$store.dispatch("sendMessage", message);
         clientiot.awss31.UploadFile(nameKey, filePath, function (res) {
            let data=JSON.parse(res);  
            var Uploadprogress={upload:data.data,msgId:imageUpload.uid}  
            if(data.errorCode==200){ 
              let message={content:nameKey,msgType:imageUpload.fileType,msgID:imageUpload.uid,filePath:imageUpload.path,oldName:imageUpload.name,date:nows,fileSize:imageUpload.size};
              me.sendImage(message) 
            }else{ 
              me.$store.dispatch("Uploadprogress", Uploadprogress);
            }
        }); 
        }
      
        var ua = window.navigator.userAgent;
        var cbd = e.clipboardData;
        this.markdownImgSate = ""
        if (!(e.clipboardData && e.clipboardData.items)) {
          return;
          }

         // Mac平台下Chrome49版本以下 复制Finder中的文件的Bug Hack掉
        if(cbd.items && cbd.items.length === 2 && cbd.items[0].kind === "string" && cbd.items[1].kind === "file" &&
            cbd.types && cbd.types.length === 2 && cbd.types[0] === "text/plain" && cbd.types[1] === "Files" &&
            ua.match(/Macintosh/i) && Number(ua.match(/Chrome\/(\d{2})/i)[1]) < 49){
            return;
        }
        
        for (let i = 0, len = e.clipboardData.items.length; i < 1; i++) {
          let item = e.clipboardData.items[i];
            if (item&&item.kind === "file") {
            // pasteFile就是获取到的文件 (blob 对象)          
            let pasteFile = item.getAsFile();
            if (pasteFile.size > 0 && pasteFile.type.match('^image/')) {
              console.log('图片')
              this.blobToBase64(pasteFile, (data) => {
                ImageDatas.push(pasteFile);
                this.originalBase64 = data 
                //    // 获取光标所在位置
                  me.$refs.myQuillEditor.quill.focus();
                const quill = me.$refs.myQuillEditor.quill.getSelection() 
                 // 插入图片  res.url为服务器返回的图片地址 
                me.$refs.myQuillEditor.quill.insertEmbed(quill.index, 'image', this.originalBase64)
                    // 调整光标到最后
                me.$refs.myQuillEditor.quill.setSelection(quill.index+1) 
               
              })
            }
          } 
          else {
            item.getAsString(function (messages) {
              var _self=this;
                console.log('粘贴的不是文件'+messages)
              //   me.content='';
              //     me.$refs.myQuillEditor.quill.focus();
              //     const quill = me.$refs.myQuillEditor.quill.getSelection() 
              // if(messages!=''){
              //     if( messages.indexOf('.png')>-1|| messages.indexOf('.jpg')>-1|| messages.indexOf('.jepg')>-1|| messages.indexOf('bmp')>-1){
             
              //      me.content='';
              //     me.$refs.myQuillEditor.quill.insertEmbed(quill.index, 'image', messages)
              //         // 调整光标到最后
              //     me.$refs.myQuillEditor.quill.setSelection(quill.index+1) 
              // }else if(messages.indexOf('static/emoji')>-1){
              //   console.log(messages)
              //    me.$refs.myQuillEditor.quill.insertEmbed(quill.index, 'html', messages)
              //         // 调整光标到最后
              //     me.$refs.myQuillEditor.quill.setSelection(quill.index+1) 
              // }
              // else{
              //    me.$refs.myQuillEditor.quill.insertEmbed(quill.index, 'text', messages)
              //         // 调整光标到最后
              //     me.$refs.myQuillEditor.quill.setSelection(quill.index+1) 
              // }
              //  clipboard.writeText('')
              // }
            })
               
          }
        };
       
    },
      // blob 对象转为 base64 编码
      blobToBase64(blob, callback) {
        let reader = new FileReader();
        reader.onload = function (e) {
          callback(e.target.result);
        }
        reader.readAsDataURL(blob);
      },
 
    replaceFace(con) {
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
 // 点击图片ICON触发事件
imgHandler (state) {
    this.addRange = this.$refs.myQuillEditor.quill.getSelection()
    if (state) {
    let fileInput = document.getElementById('imgInput')
    fileInput.click() // 加一个触发事件
    }
    this.uploadType = 'file'
},
onEditorChange ({ editor, html, text }) {
    console.log('editor change!', html)
    this.content = html
},
// 点击视频ICON触发事件
videoHandler (state) {
    this.addRange = this.$refs.myQuillEditor.quill.getSelection()
    if (state) {
    let fileInput = document.getElementById('imgInput')
    fileInput.click() // 加一个触发事件
    }
    this.uploadType = 'video'
},
// 编辑器光标离开 将编辑器内容发射给父组件
  onEditorBlur(editor) {
    this.$emit('incre', this.content) 
    let textLength = (editor.editor.delta.ops[0].insert).length; 
    if (textLength!=0) { 
      var data={
        selectedChatID:this.selectFriendAticon,
        textContent:this.content
      }
       localStorage.setItem('SaveDraft',JSON.stringify(data)) 
    };
    var selectedID =JSON.parse(localStorage.getItem('SaveDraft'));
    if(selectedID.selectedChatID == this.selectFriendAticon){
      this.content= selectedID.textContent;

    }else{
      this.content=''
    }
    this.showEmoji=false;
     this.AtPople=false
  },

  // 编辑器获得光标
  onEditorFocus(editor) {
    var _self=this;
    editor.enable(true)   // 实现达到上限字符可删除
     _self.showEmoji=false;
      _self.AtPople=false
  },

  // 编辑器文本发生变化
  onEditorChange({ editor, html, text }) {
     var _self=this;
    let textLength = text.length;
    _self.showEmoji=false;
     _self.AtPople=false
    if (textLength > 10000) { 
      // editor.enable(false)
      console.log("输入大于1000") 
    } 
    localStorage.setItem('SaveDraft',text)
  },

  // 清除编辑器内容
  callMethod() {
    this.content = ''
  },
},
created () {
    this.$refs = {
    myQuillEditor: HTMLInputElement,
    imgInput: HTMLInputElement
    };
    var me = this;
     // 点击其他不在的区域触发事件
    window.addEventListener('click', (e) => { 
      if (!this.$el.contains(e.target)){ 
        //  me.getContant() 
        var selecData=localStorage.getItem('SaveDraft');
        var selecData=selecData.replace(/[\r\n]/g, "");
        if(selecData&&selecData!=''&& selecData.length>2){
          if(selecData.indexOf('selectedChatID')>-1){
             var selectedID =JSON.parse(selecData);
          } 
        } 
        if(selectedID!=undefined){
           if(selectedID.selectedChatID == me.selectFriendAticon){
              me.content= selectedID.textContent;

            }else{
              
                me.content='' 
             
            }
        }else{
           me.content='' 
        }
        me.showEmoji=false;
        me.AtPople=false
      }
    });  
},
// 页面加载后执行 为编辑器的图片图标和视频图标绑定点击事件
mounted () {
  Event.$on("messagePlay",data=>{
    this.messagesPlay=data;
    this.$forceUpdate();
  });
    // 为图片ICON绑定事件 getModule 为编辑器的内部属性
    console.log(this.$refs.myQuillEditor.quill)
    this.$refs.myQuillEditor.quill.getModule('toolbar').addHandler('image', this.imgHandler)
    this.$refs.myQuillEditor.quill.getModule('toolbar').addHandler('video', this.onKeyup) // 为视频ICON绑定事件
      this.bodyListener = (e) => {
        if (e.keyCode === 13){
          e.returnValue=false;
          this.send();
        }
        if(this.cashierDialog){
          if (e.keyCode === 27 && e.target === document.body){
            document.getElementById('cashier-dialog-cancel').click()
          }
        }
        if(e.keyCode==50 && e.shiftKey){
          if(this.members.length>2){
             this.AtPople=true
          }
          
        }
      }
      document.body.addEventListener('keyup', this.bodyListener, false)
    },
   beforeDestroy() {
      document.body.removeEventListener('keyup', this.bodyListener)
    },
}
</script>
<style lang="stylus">
@import "../../assets/fonts/iconfont.css";
.quill-editor{
        max-height: 150px
        background:#fff}
.ql-container{
        max-height: 100px }
.quill-editor.ql-editor {
    box-sizing: border-box;
    line-height: 1.42;
    max-height: 80px;
    outline: none;
    overflow-y: auto;
    padding: 12px 15px;
    tab-size: 4;
    -moz-tab-size: 4;
    text-align: left;
    white-space: pre-wrap;
    word-wrap: break-word; 
}
.quill-editor.ql-container.ql-snow {
    border: 0px solid #ccc;
}
.ql-toolbar.ql-snow {
    border: 0px solid #ccc;
    box-sizing: border-box;
    font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
    padding: 5px;
    display:none
}
.ql-container.ql-snow {
    border: 0px !important;
    height: 150px;
}
.ql-editor {
    box-sizing: border-box;
    line-height: 1.42;
    max-height: 80px;
    outline: none;
    overflow-y: auto;
    padding: 12px 15px;
    tab-size: 4;
    -moz-tab-size: 4;
    text-align: left;
    white-space: pre-wrap;
    word-wrap: break-word;
}
.ql-snow .ql-editor img {
    max-width: 100px;
    max-height: 200px;
}
 .send
        position: absolute
        bottom: 10px
        right: 30px
        width: 75px
        height: 28px
        line-height: 28px
        box-sizing: border-box
        text-align: center
        border: 1px solid #e5e5e5
        border-radius: 3px
        background: #f5f5f5
        font-size: 14px
        color: #7c7c7c
        &:hover
            background: rgb(18,150,17)
            color: #fff
            cursor:pointer
.emoji{
    position: relative
    width: 100%
    height: 40px
    line-height: 40px
    font-size: 12px
    padding: 0 30px
    box-sizing: border-box
    color: #7c7c7c 
}
        
.icon{
    font-weight bold
    font-size 18px
    margin-right 15px
    cursor: pointer
}
.emojiBox{
    position: absolute;
    width: 300px;
    display: flex;
    flex-wrap: wrap;
    top: -213px;
    height: 200px;
    padding: 5px;
    border: 1px solid rgb(209, 209, 209);
    z-index: 99;
    background:white;
     left: -1px
}
.AtPople{
   position: absolute;
    width: 110px;
    display: flex;
    flex-wrap: wrap;
    top: -213px;
    height: 200px;
    padding: 5px;
    border: 1px solid rgb(209, 209, 209);
    z-index: 99;
    background:white;
    left: 28px;
   overflow-y: scroll; 
}
.hx-listNames{
  width: 50px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
} 
.hx-input {
  display:none
}
.hx-frienditems{
  padding: 5px;
}
.hx-frienditems:hover{
  background-color:#d9d9d9;
}
.messageRecode
  text-align:center;
  float:right;
  margin-top:8px;
  cursor :pointer
  width: 90px;
  height: 30px;
  line-height: 30px;
  border-radius: 5px;
  &:hover
    background-color:#eee;
    boder-radius:5px
  .icon
    margin-right:0 !important 
.warn
    position: absolute
    bottom: 50px
    right: 10px
    width: 110px
    height: 30px
    line-height: 30px
    font-size: 12px
    text-align: center
    border: 1px solid #bdbdbd
    border-radius: 4px
    box-shadow:0 1px 5px 1px #bdbdbd
    &.appear-enter-active, &.appear-leave-active
      transition: all 1s
    &.appear-enter,&.appear-leave-active
      opacity: 0
    &:before
      content: " "
      position: absolute
      top: 100%
      right: 20px
      border: 7px solid transparent
      border-top-color: #fff
      filter:drop-shadow(1px 3px 2px #bdbdbd) 
.ql-editor p, .ql-editor ol, .ql-editor ul, .ql-editor pre, .ql-editor blockquote, .ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor h4, .ql-editor h5, .ql-editor h6 {
    margin: 0;
    padding: 0;
    counter-reset: list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9;
    display: inline;
} 
.ql-editor span{
     background:none!important;
}         
</style>
