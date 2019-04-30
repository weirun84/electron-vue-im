
<template>
    <div>
        <div class="emoji">
            <i class="icon iconfont icon-xiaolian" @click="emojisHandler"></i>
            <!-- 图片 @click="showEmoji=!showEmoji"-->
            <label>
                <i class="icon iconfont icon-wenjian1" @click="imgHandler"> </i>
            </label>
            <i class="icon iconfont icon-jiandao" @click="screenshot"></i>
            <!-- 消息记录 -->
            <span class="messageRecode" @click="showMessages" oncopy="document.selection.empty()" onselect="document.selection.empty()">聊天记录<i class="icon iconfont icon-down-trangle"></i></span>

        </div>
        <messageRecord v-show="this.messagesPlay"></messageRecord>
        <transition name="showbox">
            <div class="emojiBox" v-show="showEmoji">
                <li v-for="(item, index) in emojis">
                    <img :src="'static/emoji/'+item.file" :data="item.code" :title="item.title" @click="cliEmoji(item)">
                </li>
            </div>
        </transition>
        <!--斗图啦-->
        <transition name="showbox">
            <div class="emojiBox" v-show="showDtlEmoji" style="height: 110px;top: -121px;width: 210px;">
                <li v-for="(item, index) in doutula_emojis">
                    <img :src="item.file" :data="item.code" :title="item.title" @click="cliDoutulaEmoji(item)" style="width:100px;">
                </li>
            </div>
        </transition>

        <transition name="showbox">
            <div class="AtPople" v-show="AtPople&&this.atmembersList.length>0" tabindex="0" id="hxAtPople">
                <ul style="width:100%;">
                    <li v-for="list in atmembersList" class="hx-frienditems" :class="{ noborder:!list.initial}">
                        <label :for="list.id">
                            <input type="checkbox" name="hx-item" :data-name="list.id" :value="JSON.stringify(list)" :id="list.id" class="hx-input">
                            <div class="friend-info " @click="selectFriend(list)" style="display: flex;align-items: center;font-size: .8em;">
                                <img class="avatar" width="25" height="25" v-bind:src="list.images_url" style="vertical-align: middle;">
                                <div style="display:inline-block;padding-left: 10px;">
                                    <div class="hx-listNames">{{list.memberName}}</div>
                                </div>
                            </div>
                        </label>
                    </li>
                </ul>
                <!--<ul style="width:100%;">
                <li class="hx-frienditems" @click="selectFriend(Atmembers)">全体成员</li>
            </ul>-->
            </div>

        </transition>
        <div id="textDiv" style="overflow-y: scroll;overflow-x: hidden;">
            <transition name="showbox" title="文件框">
                <el-row :gutter="20" id="inputFiles">
                    <el-col :span="15" v-for="list in readyFileList">
                        <div class="hx-readyFileList" shadow="hover" v-if="list.type=='file'||list.type=='audio'||list.type=='video'">
                            <i class="el-icon-document" style="font-size: 2em;"></i>
                            <div style="display: inline-block;">
                                <p style="width: 250px; overflow: hidden;text-overflow: ellipsis;  white-space: nowrap;">{{list.name}}</p>
                                <span style="font-size: .7em;" v-html="showSize(list.size)"></span>
                            </div>
                        </div>
                        <div shadow="hover" v-if="list.type=='image'">
                            <img width="20%" height="20%" :src="list.path" />
                        </div>
                    </el-col>
                </el-row>
            </transition>
            <!-- quill-editor插件标签 分别绑定各个事件-->
            <quill-editor @keyup.enter="onKeyup" v-model="content" ref="myQuillEditor" v-on:paste.native="paste" :options="editorOption" @blur="onEditorBlur($event)" @focus="onEditorFocus($event)" @change="onEditorChange($event)">
            </quill-editor>
        </div>
        <!-- 文件上传input 将它隐藏-->
        <el-upload class="upload-demo" :action="this.photoUrl" :before-upload='beforeUpload' :data="uploadData"
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
import { clipboard, session } from 'electron'
import Events from '../../api/eventBus.js'
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
const clientiot = require("@hxim/clientiot");
var co = require("co");
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
const uuidv4 = require('uuid/v4');
import Quill from 'quill';
import { setTimeout } from 'timers';
import {transform,dealFaceImage,CompositeMessage,getFileBlotData,getAtPopleBlotData,getFileIco} from'./SendMessage'
var message_id;
var ImageDatas=[];
var em0jisArr='';
var quilIndex=0;
var selectedChatID;
var AtNewPople = [];
var quillIndex = 0;
const Embed = Quill.import('blots/embed');
const FileEmbed = Quill.import('blots/embed');

class myBlot extends Embed {
  static blotName = 'myblot';
  static tagName = 'myblot';
  static create(value) {
    const node = super.create(value.memberName);
    node.innerHTML = '@'+value.memberName;
    node.setAttribute('id', value.memberEId);
    node.setAttribute('class',"myblot-input");
    node.setAttribute('data',JSON.stringify(value));
    return node;
  }
}

class fileBlot extends FileEmbed {
  static blotName = 'fileBlot';
  static tagName = 'fileBlot';
  static create(value) {
    const node = super.create(value.msgID);
    node.innerHTML = '<div shadow="hover" class="hx-readyFileList" style="width: 45%"><img data-v-050d77a5="" src="'+getFileIco(value.filename)+'" alt="" srcset="" style="width: 30px;"><div style="display: inline-block;margin-left: 10px;"><span style="width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;">'+value.filename+'</span><span style="font-size: 1.1em;">'+showSize(value.fileSize)+'</span></div></div>';
    node.setAttribute('id', value.msgID);
    node.setAttribute('class',"file");
    node.setAttribute('data',JSON.stringify(value));
    return node;

  }
}
// 注册
Quill.register(myBlot);
Quill.register(fileBlot);

    function  showSize(value){
        if(value<10000){
          return (value/1024).toFixed(2)+'KB'
        }else{
           return (value/1024/1024).toFixed(2)+'M'
        }
      }

    //数组去重
    function removeReadyFileListDuplicatedItem(ar) {
        var tmp = {},
            ret = [];

        for (var i = 0, j = ar.length; i < j; i++) {
            var key = ar[i].path + ar[i].path;
            if (!tmp[key]) {
                tmp[key] = 1;
                ret.push(ar[i]);
            }
        }

        return ret;
        //return ar;
    }

    //数组去重
    function removeReadyFileMessageListDuplicatedItem(ar) {
        var tmp = {},
            ret = [];

        for (var i = 0, j = ar.length; i < j; i++) {
            var key = ar[i].filePath + ar[i].filePath;
            if (!tmp[key]) {
                tmp[key] = 1;
                ret.push(ar[i]);
            }
        }

        return ret;
        //return ar;
    }

export default {
  components:{
    messageRecord
  },
    data () {
      return {
        content: '', // 文章内容
        prop: "action",
        doutula_emojis:[],
        showEmoji: false,
        showDtlEmoji:false,
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
        atmembersList: [],
        addRange: [],
        uploadData: {},
        photoUrl: '', // 上传图片地址
        uploadType: '', // 上传的文件类型（图片、视频）
        pasteImageData: "",
        base64Data: "",
        originalBase64: "",
        messagesPlay:false,
        AtPople: false,
        atSearchValue: '',
        watch_readyFileList:[],
        watch_readyFileMessageList:[],
        readyFileList: [],
        readyFileMessageList: [],
      }
        },
        created(){
            this.atmembersList = this.filterMembers();
        },

computed: {
     ...mapState(["user", "selectId", "emojis","selectFriendAticon",'selectSendmessageAticon','selectSession','Atmembers','members','clearInputTxte','GroupTitle']),
    ...mapGetters(["selectedChat", "messages"])
        },
        mounted() {
            this.atmembersList=this.filterMembers();
        },
    watch: {
          a(){
            if(this.clearInputTxte==true){
              this.content=''
            }

        },
        watch_readyFileList() {
            this.readyFileList = removeReadyFileListDuplicatedItem(this.watch_readyFileList);
        },
        watch_readyFileMessageList() {
            this.readyFileMessageList = removeReadyFileMessageListDuplicatedItem(this.readyFileMessageList);
        }
     },
    methods: {
       showFaceBox: function() {
        this.showEmoji = !this.showEmoji;
      },
      showSize(value){
        if(value<10000){
          return (value/1024).toFixed(2)+'KB'
        }else{
           return (value/1024/1024).toFixed(2)+'M'
        }
      },
      filterMembers() {
          var loginUser_id = JSON.parse(sessionStorage.getItem("currentUser")).id;
          var shoppingList = this.Atmembers;
          for (var k = 0; k < shoppingList.length; k++) {
              if (shoppingList[k].memberEId == loginUser_id) {
                  shoppingList.splice(k, 1);
              }
               else if (shoppingList[k].memberEId == 0) {
                  shoppingList.splice(k, 1);
              }
          }

          var userInfo=JSON.parse(sessionStorage.getItem('currentUser'));
          var userId=parseInt(userInfo.id);
          if(userId==this.GroupTitle.owner_eid){
                     shoppingList.push({
                        images_url: "static/images/头像.png",
                        memberEId: 0,
                        memberLevel: "2",
                        memberName: "所有人",
                        no_speak: false,
                    })
          }

          return shoppingList;
      },

   // 按回车发送信息
    onKeyup(e) {
      if (e.keyCode == 13) {
        e.returnValue=false;
        this.send();
      }else{
        return
      }
    },
    cliDoutulaEmoji(item){
    var me=this;
    var emojis=this.replaceFace(item.code);
      em0jisArr += item.code;
      me.$refs.myQuillEditor.quill.focus();
    // me.content+=emoji;
        // 获取光标所在位置
    const quill = me.$refs.myQuillEditor.quill.getSelection()
    var qutt=me.$refs.myQuillEditor.quill;
    qutt.deleteText(0, quill.index);
     qutt.insertEmbed(0, "image", item.file);
           qutt.setSelection(quill.index+1);

      // me.$refs.myQuillEditor.quill.insertEmbed(quill.index, "image", this_emoji_path);
      // // 调整光标到最后
      // me.$refs.myQuillEditor.quill.setSelection(quill.index+1);

    //this.content +=item.code;
    me.showEmoji=false;
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
     var qutt=me.$refs.myQuillEditor.quill;
      var this_emoji_path = "static/emoji/" + item.file;
      var range = qutt.getSelection();
        if (range) {
          if (range.length == 0) {
           qutt.insertEmbed(quill.index, "image", this_emoji_path);
           qutt.setSelection(quill.index+1);
          } else {
            var text = qutt.getText(range.index, range.length);
              qutt.deleteText(0, range.length+1);
              qutt.insertEmbed(quill.index, "image", this_emoji_path);
              qutt.setSelection(quill.index+1);
          }
        } else {
          console.log('User cursor is not in editor');
        };

      // me.$refs.myQuillEditor.quill.insertEmbed(quill.index, "image", this_emoji_path);
      // // 调整光标到最后
      // me.$refs.myQuillEditor.quill.setSelection(quill.index+1);

    //this.content +=item.code;
    me.showEmoji=false;
  },
  // @人员
  selectFriend(value){
      //检查是否有相同人员
        var _self=this;
         _self.$refs.myQuillEditor.quill.focus();
        var quill = _self.$refs.myQuillEditor.quill.getSelection() ;
        var quillText = _self.$refs.myQuillEditor.quill.getText(0, _self.$refs.myQuillEditor.quill.getLength());
        var atIndex = quillText.lastIndexOf('@');
        var thisDataLength=1;
        // @完之后自动删除@字符
            if (window.getSelection) {
                var range = window.getSelection();
                if (range.rangeCount > 0) {
                    var startOffset = range.extentOffset;
                    thisDataLength=range.extentNode.data.lastIndexOf('@');
                    range.extentNode.replaceData(thisDataLength, startOffset, '');
                }
            }

      _self.$refs.myQuillEditor.quill.insertEmbed(quill.index-(quillText.length-atIndex-1),'myblot',value);
      _self.$refs.myQuillEditor.quill.setSelection(quill.index+value.memberName.length+1);

        if(value.memberEId===0){
           AtNewPople.push({AtALL:true});
        }else{
           AtNewPople.push({memberEId:value.memberEId,memberName:value.memberName});
        }

    _self.AtPople=false;

        },
    //转换表情
        dealFaceImage: function (str) {
            var me = this;
            var reg = /(<img [^>]*src=['"]([^'"]+)[^>]*>)/gi;
            return str.replace(reg, me.findCodeInJson.bind(this));
        },
        findCodeInJson: function () {
            var me = this;
            var data = me.emojis;
            var imgTag = arguments[0];
            var src = arguments[1];
            var code = "";
            for (var i = 0; i < data.length; i++) {
                if (src.indexOf(data[i].file) >= 0) {
                    code = data[i].code;
                }
            }
            return (code || (((imgTag.indexOf('data:image/')>-1)||(imgTag.indexOf('src')>-1))?'':imgTag));
        },

 // 点击发送按钮发送信息
send() {
  var msgCont,me=this;
  var msgType;
  var dataImage=[];
  var now=new Date().getTime();
  var backspace=transform(this.content)
  var clearRec=(this.content).indexOf("<br>") != -1;
  var checkImage=(this.content).indexOf("img") != -1;
  // var backspace=(this.content).replace(/<[^>]+>/g, "").replace(/,/g, "");
    var files=getFileBlotData(this.content);
    AtNewPople=getAtPopleBlotData(this.content);
  var backspace=transform(this.content);
    this.showDtlEmoji=false;
    if ((clearRec == true && backspace.replace(/[\r\n]/g, "") == '' && checkImage != true) && (this.readyFileMessageList.length==0)){
          this.warn = true;
          setTimeout(() => {
              this.warn = false;
          }, 1000);
          this.content='';
        return
      }
    else {
        var timestamp = new Date().getTime();
        var imgName = "hxim_" + timestamp + ".png"
      var imgReg = /<img.*?(?:>|\/>)/gi;
      var nameReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
        var arr = this.content.match(imgReg);
      if(arr){
           for (let i = 0; i < arr.length; i++) {
                let names = arr[i].match(nameReg)
                // 获取图片地址
                if (names && names[1]) {
                    msgCont=names[1];
                    if(msgCont.indexOf('http')===-1){
                        dataImage.push(names[1])
                    }
                }
            }
      }else{
        if(backspace!=''){
          msgCont=backspace;
          msgType='text'
        }
      }
    };

        if (files.length > 0) {
            files.forEach(item => {
                me.$store.dispatch("sendMessage", item);
               setTimeout(function(){
                   Events.$emit('sendMessage', item)
                },1000)
            })
    };


//if (this.readyFileMessageList.length > 0) {
//    this.readyFileMessageList.forEach(item => {
//        me.$store.dispatch("sendMessage", item);
//        setTimeout(function () {
//            Events.$emit('sendMessage', item)
//        }, 1000)
//    })

//    this.watch_readyFileList = [];
//    this.watch_readyFileMessageList = [];
//    this.readyFileList = [];
//    this.readyFileMessageList = [];
//};


    if (this.content.replace(/[\r\n]/g, "") == ''&&(backspace&&backspace.replace(/[\r\n]/g, "")!='')) {
        this.warn = true;
          setTimeout(() => {
              this.warn = false;
          }, 1000);
        return;
    }
    // else{
    //     CompositeMessage(this.content,me);
    //     this.content=''
    //     return
    // };

    // if(this.content.indexOf(':\\')>-1||this.content.indexOf('data:image')>-1||msgCont.indexOf('static/emoji/') > -1||this.content.indexOf('file:///')>-1||(this.content.indexOf(':/')>-1&&this.content.indexOf('http://')!=-1)){
      if(this.content!=''&&backspace.replace(/[\r\n]/g, "")!=''||(arr&&arr.length)>0){
         var img=Array.from(new Set(ImageDatas));
         var content= this.content.replace(/<(?!img).*?>/g,"")
         var  getGif='';
        var data={};
         if(dataImage.length>0){
          var file=[];
          for(var i=0;i<dataImage.length;i++){
            var dataIm=dataImage[i].split('///')[1];
            var dataImages=dataIm!=undefined?decodeURI(dataIm.replace(/%/g, '%25')):dataImage[i]
            if(dataImage[i]!=undefined && dataImages.indexOf(':\\')>-1||((dataImages.indexOf(':/')>-1&&dataImages.search('static/emoji/')==-1)&& dataImages.indexOf('http:/')==-1)){
              // for(var j=0;j<img.length;j++){
                  var data={
                 lastModified:now,
                 lastModifiedDate:now,
                 name: uuidv4()+imgName,
                 path:dataImage[i],
                 size:102400,
                 type:"image/png",
                 uid:uuidv4()+now,
                 webkitRelativePath:''
                };
                // if(dataImage[i]==img[j].path){ decodeURI(dataIm)
                   me.PasteUpload(data);
                // }
              // }
            }else{
              if (dataImage[i] != undefined && dataImage[i].indexOf('data:image') > -1) {
             var filePaths = clientiot.globalinfo.base64ToLocalhost(dataImage[i], "/profile/images/", imgName);
             var data={
                lastModified:now,
                 lastModifiedDate:now,
                 name: imgName,
                 path:filePaths,
                 size:102400,
                 type:"image/png",
                 uid:uuidv4()+now,
                 webkitRelativePath:''
             };
             file.push(data);
              }
            }
          }
           getGif=me.dealFaceImage(backspace);
          // 转换表情获取code码
          // getGif=me.dealFaceImage(me.content)
            data={
            msgCont:getGif,
            msgType:'text'
              } ;
           if(backspace.replace(/\s/g,"").replace(/&nbsp;/ig, "")!=''&&me.content!=''){
                me.TextMessage(data)
            }else if(backspace.replace(/\s/g,"").replace(/&nbsp;/ig, "")!=''){
               me.TextMessage(data)
            }else if(getGif.replace(/<[^>]+>/g,"").replace(/&nbsp;/ig, "").replace(/\s/g,"")!=''){
               me.TextMessage(data)
            }
          for(var k=0;k<file.length;k++){
             me.PasteUpload(file[k]);
          }
           this.file=[];
           ImageDatas=[]
        }else{
           data={
            msgCont:backspace,
            msgType:'text'
              } ;
         me.TextMessage(data)
        }

        me.content='';
        return
    }else{
        me.content='';
      return
    };
    },
    sendUrlMessage(value){
        var values=[];
        if(value<10){
            values.push(value)
        }else{

        }

    },
     TextMessage(value){
       var loginUser_id=JSON.parse( sessionStorage.getItem("currentUser")).id;
      var channelType= this.selectedChat.id;
      this.$store.state.selectFriendAticon = channelType;
      var channelType=this.$store.state.selectSendmessageAticon;
      var now=new Date().getTime();
      var msgCont=value.msgCont;
      var msgType=value.msgType;
       if(channelType.channelType=='G'){//channelType=='G'
          const contentText = this.content;
          var data = {
                fromId: parseInt(loginUser_id),
                model:1,
                fromType: "group",
                  msgContent: {
                    arn: "arn",
                    durationTime: now,
                    extras: "extras",
                    fileSize: 2,
                    format: "format",
                    height: 5,
                    mediaCrc32: "mediaCrc32",
                    mediaId: "mediaId",
                    text: msgCont,
                    AtPoples:AtNewPople,
                    width: 5
                  },
                msgType:msgType,
                targetId:channelType.targetID,
                targetType: "custom",
                version: 0
              };
               var msg = {
                 content: msgCont,
                 reply: this.reply,
                 UploadStore:null,
                 msgType:msgType,
                 date:now,
                 target_id:this.$store.state.selectFriendAticon,
                msgID:now};
               this.$store.dispatch('sendMessage', msg)
            clientiot.http.sendMessage(JSON.stringify(data))
            .then(function(retvalue) {
               var self=this;
              console.log("发送消息"+retvalue);
              var retvalueCode=JSON.parse(retvalue);
                var msg = {content: msgCont,reply: this.reply,msgType:msgType,date:now, msgID:now,UploadStore:true,
                message_key:retvalueCode.data.message_key,theme_key:retvalueCode.data.theme_key,target_id:retvalueCode.data.targetId,errorCode:retvalueCode.success};
              if(retvalueCode.success==true){
                 self.$store.dispatch('sendMessage', msg);
                 self.$store.dispatch('topChatlist',self.selectedChat);
                 AtNewPople=[]
                  ImageDatas=[]
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
      }else{
      if (this.content.length <= 1) {
        this.warn = true;
        this.content = "";
        setTimeout(() => {
          this.warn = false;
        }, 1000);
      } else {
          var data = {
             fromId: parseInt(loginUser_id),
             model:1,
              fromType: "user",
              msgType: msgType,
              targetId:channelType.targetID,
              targetCode: channelType.targetCode,
              targetType: "single",
              model: 0,
              msgContent: {
                  arn: "arn",
                  durationTime: now,
                  extras: "extras",
                  fileSize: 2,
                  format: "format",
                  height: 5,
                  mediaCrc32: "mediaCrc32",
                  mediaId: "mediaId",
                  text: msgCont,
                  width: 5
              }
          };
            var msg = {content: msgCont,reply: this.reply,msgType:msgType,UploadStore:null,date:now,target_id:this.$store.state.selectFriendAticon,
                msgID:now};
            this.$store.dispatch('sendMessage', msg)
           clientiot.http.sendMessage(JSON.stringify(data))
            .then(function(retvalue) {
              console.log("发送消息"+retvalue);
              var self=this;
              var retvalueCode=JSON.parse(retvalue);
                message_id=retvalueCode.data;
              var msg = {content: msgCont,reply: this.reply,msgID:now,msgType:msgType,date:now, message_key:retvalueCode.data.message_key,theme_key:retvalueCode.data.theme_key,target_id:retvalueCode.data.targetId,errorCode:retvalueCode.success};
              if(retvalueCode.success==true){
                self.$store.dispatch('sendMessage', msg)
                self.$store.dispatch('topChatlist',self.selectedChat);
                 ImageDatas=[]
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
      }
       }
    },
// 图片上传之前调取的函数
// 这个钩子还支持 promise
    beforeUpload (file) {
       return this.qnUpload(file)
    },
    // 粘贴图片上传前获得数据 .replace(/%/g, '%25')
    PasteUpload (file) {
        var _self=this;
          var nows = new Date().getTime();
          this.fullscreenLoading = true
          const suffix = file.name.split('.')
          const ext = suffix.splice(suffix.length - 1, 1)[0]
          console.log(this.uploadType)
          const nameKey=uuidv4()+'.'+ext;
          let file_Path=file.path;

          if(file_Path.indexOf('file://')>-1){
               var filePath= file_Path;
          }else{
             var filePath= file.path;
          }
          if(filePath.indexOf('/%')>-1){
             var filePath=decodeURI(file.path.replace('%20',' '));
          }
          if(filePath.indexOf('%20')>-1){
            var filePath=unescape(file.path);
          }
          var localPath= filePath;
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
             var me=this;
          if (this.uploadType === 'file'||this.uploadType =='') { // 如果是点击插入图片
          // TODO 图片格式/大小限制
          console.log('上传图片')
            if(localPath.indexOf('///')>-1){
              var localPath=localPath.split('///')[1]
            }
             if(fileType=='image'){
                if(localPath.indexOf('https://')>-1||localPath.indexOf('http://')>-1){
                  var  data={
                    msgCont:localPath,
                    msgType:'image'
                      }
                  me.TextMessage(data);
                  return
                }
                // 获取光标所在位置
               var message={content:file.path,msgType:fileType,UploadStore:null,target_id:this.$store.state.selectFriendAticon,msgID:file.uid,filePath:file.path,date:nows,filename:file.name,fileSize:fileSize};
                me.$store.dispatch("sendMessage", message);
                  // Events.$emit('sendMessage',message)
                }else{
                  var message={content:file.name,msgType:fileType,UploadStore:null,target_id:this.$store.state.selectFriendAticon,msgID:file.uid!=undefined?file.uid:file.lastModified,filePath:file.path,date:nows,filename:file.name,fileSize:fileSize};
                    Events.$emit('sendMessage',message)
                }

                 clientiot.awss31.UploadFile(nameKey, localPath, function (res) {
                  let data=JSON.parse(res);
                  var Uploadprogress={upload:data.data,msgId:file.uid};
                  if(data.errorCode==200){
                    var message={content:nameKey,msgType:fileType,msgID:file.uid,filePath:file.path,oldName:file.name,date:nows,fileSize:fileSize,errorCode:data.success};
                    me.sendImage(message)
                  }else if(data.errorCode==400){
                     var message={content:file.path,msgType:fileType,msgID:file.uid,filePath:file.path,oldName:file.name,date:nows,fileSize:fileSize,errorCode:data.success};
                    me.$store.dispatch("sendMessage", message);
                  }
                });

      }
},
   // 拖拽文件图片上传接受
    DragUpload (file) {
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
            }else if(fileTypes=='audio'){
               var fileType="file"
            }
            else{
            var fileType=fileTypes
            }
             var me=this;
              var imageUpload={
              size:file.size,
              name:file.name,
              path:file.path,
              type:fileType,
              uid:uuidv4()+file.lastModified,
              fileType:fileType
            };
          if (this.uploadType === 'file'||this.uploadType =='') { // 如果是点击插入图片
          // TODO 图片格式/大小限制
          console.log('上传文件')
            if(localPath.indexOf('///')>-1){
              var localPath=localPath.split('///')[1]
            }
                if(!_self.$refs.myQuillEditor){
                    return;
                }

                ImageDatas.push(imageUpload);
                _self.$refs.myQuillEditor.quill.focus();
                const quill = _self.$refs.myQuillEditor.quill.getSelection()

             if(fileType=='image'){
                // 获取光标所在位置
               var message={content:file.path,msgType:fileType,UploadStore:null,target_id:this.$store.state.selectFriendAticon,channelType:this.$store.state.selectSendmessageAticon,msgID:imageUpload.uid,filePath:file.path,date:nows,filename:file.name,fileSize:fileSize};

                 // 插入图片  res.url为服务器返回的图片地址
                _self.$refs.myQuillEditor.quill.insertEmbed(quill.index, 'image', file.path)
                    // 调整光标到最后
                _self.$refs.myQuillEditor.quill.setSelection(quill.index+1)
                }
    else{
                 var message = { content: file.name, msgType: fileType, UploadStore: null, target_id: this.$store.state.selectFriendAticon,channelType:this.$store.state.selectSendmessageAticon, msgID: file.uid != undefined ? file.uid : uuidv4()+file.lastModified, filePath: file.path, date: nows, filename: file.name, fileSize: fileSize };

                _self.$refs.myQuillEditor.quill.insertEmbed(quill.index,'fileBlot',message);
                _self.$refs.myQuillEditor.quill.setSelection(quill.index+1);


                }
      }
},
    // 图片上传前获得数据token数据
    qnUpload (file) {
        var _self=this;
          var nows = new Date().getTime();
          this.fullscreenLoading = true
          const suffix = file.name.split('.')
          const ext = suffix.splice(suffix.length - 1, 1)[0]
          console.log(this.uploadType)
          const nameKey=uuidv4()+'.'+ext;
          const localPath=file.path;
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
            else if(fileTypes=='audio'){
               var fileType="file"
            }
            else{
            var fileType=fileTypes
            }
          if (this.uploadType === 'file'||this.uploadType =='') { // 如果是点击插入图片
          // TODO 图片格式/大小限制
          console.log('上传图片')
            var me=this;
              var imageUpload={
              size:file.size,
              name:file.name,
              path:file.path,
              type:fileType,
              uid:uuidv4()+file.uid,
              fileType:fileType
            };
                   // 获取光标所在位置
                  me.$refs.myQuillEditor.quill.focus();
                const quill = me.$refs.myQuillEditor.quill.getSelection();
           var message={
                    content:file.name,
                    msgType:fileType,
                    UploadStore:null,
                    channelType:this.$store.state.selectSendmessageAticon,
                    target_id:this.$store.state.selectFriendAticon,
                    msgID:file.uid,
                    filePath:file.path,
                    date:nows,
                    filename:file.name,
                    fileSize:fileSize
                };

            if(fileType=='image'){
                // me.$store.dispatch("sendMessage", message);
                  // Events.$emit('sendMessage',message)
                   ImageDatas.push(imageUpload);
                 // 插入图片  res.url为服务器返回的图片地址
                me.$refs.myQuillEditor.quill.insertEmbed(quill.index, 'image', file.path)
                    // 调整光标到最后
                me.$refs.myQuillEditor.quill.setSelection(quill.index+1)
                }else{
                  //  me.$store.dispatch("sendMessage", message);
                    // Events.$emit('sendMessage',message)
                 me.$refs.myQuillEditor.quill.insertEmbed(quill.index,'fileBlot',message);
                me.$refs.myQuillEditor.quill.setSelection(quill.index+1);
                }
                // setTimeout(function(){
                //    Events.$emit('sendMessage',message)
                // },1000)
                // clientiot.awss31.UploadFile(nameKey, localPath, function (res) {
                //   let data=JSON.parse(res);
                //   var Uploadprogress={upload:data.data,msgId:file.uid};
                //   if(data.errorCode==200){
                //     let message={content:nameKey,msgType:fileType,msgID:file.uid,filePath:file.path,oldName:file.name,date:nows,fileSize:fileSize};
                //     me.sendImage(message)
                //   }else{
                //      var Update=JSON.parse(data.data);
                //      var num = (Update.progressAmount / Update.progressTotal);
                //       var Updateprogressed = Math.round(num * 100);
                //       console.log("上传进度"+Update.key+':'+Updateprogressed);
                //       localStorage.setItem(file.uid,Updateprogressed);
                //     me.$store.dispatch("Uploadprogress", Uploadprogress);
                //   }
                // });
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

// 点击图片ICON触发事件
imgHandler (state) {
    this.addRange = this.$refs.myQuillEditor.quill.getSelection()
    if (state) {
    let fileInput = document.getElementById('imgInput')
    fileInput.click() // 加一个触发事件
    }
    this.uploadType = 'file'
},
emojisHandler(state){
     this.addRange = this.$refs.myQuillEditor.quill.getSelection()
    if (state) {
    this.showEmoji = !this.showEmoji;
    }
},
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
    this.showEmoji=false;
     //this.AtPople=false
      //发送正在输入状态
      var isInputData = {
          state: 0,
          message: ""
      };
       clientiot.globalinfo.sendActiveMqState(this.selectedChat.id, isInputData);
  },

  // 编辑器获得光标
  onEditorFocus(editor) {
    var _self=this;
    var detailSetting=document.getElementById('detailSetting');
    Events.$emit('DisplayDetails',false);
         _self.showEmoji=false;
    _self.showDtlEmoji=false;
    if(detailSetting!=null){
			detailSetting.style.right='15px'
		}
    editor.enable(true)   // 实现达到上限字符可删除
      //_self.AtPople=false
  },

  // 编辑器文本发生变化
    onEditorChange({ editor, html, text }) {
     var _self=this;
     var images_url=null;
    var reg = new RegExp("(<img.*src=\"\.*?\>)");
    var textContents=html.match(reg);
    let textLength = text.length;
    _self.showEmoji=false;
     _self.AtPople=false;
    var Atstore = text.split(' ');
    var imgReg = /<img.*?(?:>|\/>)/gi;
    var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
    var arr = html.match(imgReg),selectImgArr=[];
     setTimeout(() => {
       _self.warn = false;
      }, 1000);
    if(arr!=null){
       for (var i = 0; i < arr.length; i++) {
      var src = arr[i].match(srcReg);
        if(arr[i].indexOf('://appportalserver.g5air.com')==-1&&arr[i].indexOf('localhost:9080/static/images/')==-1){
           selectImgArr.push(arr[i])
        }
      }
    };
    // 复制文件开发中
    if(textContents!=null){
       if(textContents[0].indexOf('http://appportalserver.g5air.com')>-1){
           var description = html.replace(/<[^img][^>]+>/g,"");
        // const quill = _self.$refs.myQuillEditor.quill.getSelection()
        // _self.$refs['myQuillEditor'].quill.insertEmbed(0, 'myblot', description);.replace(/\s+/g, "")
       _self.content=text.replace(/\n/g,'<br>')+selectImgArr;
     }else{
        _self.content=html;
     }
    };
    if(Atstore[0].indexOf(':/')>-1){
        if( Atstore[0].includes('http://')||Atstore[0].includes('https://')){
          if(Atstore[0].indexOf('.jpg')>-1||Atstore[0].indexOf('.gif')>-1){
            _self.content=selectImgArr+'<img src='+Atstore[0]+'/>';
          }
           const quill = _self.$refs.myQuillEditor.quill.getSelection()
        }
        const quill = _self.$refs.myQuillEditor.quill.getSelection()
        // 调整光标到最后
        _self.$refs.myQuillEditor.quill.setSelection( _self.content.length + 1)
    };

      if (Atstore[Atstore.length-1].indexOf('@')>-1 && this.$store.state.selectFriendAticon<100000) {
              _self.AtPople = true
          }else{
            _self.AtPople=false;
            var search_text=text.replace(/(^\s*)|(\s*$)/g, "");
            if(search_text.length>=1&&search_text.length<=3)
            {
                var e_keyword=search_text.length>2?search_text.substring(search_text.length-2,search_text.length):search_text;
            //搜索远程图片
            _self.showDtlEmoji=true;
            clientiot.http.searchEmojis(e_keyword).then(function (res) {
                 var resObj= JSON.parse(res);
                _self.showDtlEmoji=resObj.data.length>0;
                  var min=_self.randomNum(0,resObj.data.length-2);
                  _self.doutula_emojis=resObj.data.slice(min,min+2);
            })
            }else{
                 _self.showDtlEmoji=false;
            }
       };
        //获取最后一个@后的值
        if (text.lastIndexOf('@') > -1) {
            this.atSearchValue = text.substring(text.lastIndexOf('@') + 1, text.length - 1);
            this.atSearchValue = this.atSearchValue.split(' ')[0];
        }

        var selectMembersLsit = this.filterMembers().filter(it => it.memberName.indexOf(this.atSearchValue.replace(/[\r\n]/g, "")) > -1);

        this.atmembersList = selectMembersLsit;

        console.log('lastAtValue', this.atSearchValue);

        //发送正在输入状态
        var isInputData = {
            state: text.length > 1?1:0,
            message: text
        };

         clientiot.globalinfo.sendActiveMqState(_self.selectedChat.id, isInputData);
  },
    //生成从minNum到maxNum的随机数
randomNum(minNum,maxNum){
    switch(arguments.length){
        case 1:
            return parseInt(Math.random()*minNum+1,10);
        break;
        case 2:
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
        break;
            default:
                return 0;
            break;
    }
},

  // 清除编辑器内容
  callMethod() {
    this.content = ''
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
        const pasnamesuffix = ext.split('.');
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
        };
        var imageUpload={
          size:filePaths.data.size,
          name:ext,
          path:filePath,
          type:pType,
          uid:uuidv4()+filePaths.data.ino,
          fileType:pType,
          channelType:this.$store.state.selectSendmessageAticon,
        };
         if(filePaths.data.size>100*1024*1024){
             me.$message({
              message:'发送文件限制在100M内',
              duration:1800,
              type:'warning',
              center:true,
              })
              return
          };
              //    // 获取光标所在位置
            me.$refs.myQuillEditor.quill.focus();
          const quill = me.$refs.myQuillEditor.quill.getSelection()
        if(pType=='image'){
          ImageDatas.push(imageUpload);
            // 插入图片  res.url为服务器返回的图片地址
          me.$refs.myQuillEditor.quill.insertEmbed(quill.index, 'image', filePath)
              // 调整光标到最后
          me.$refs.myQuillEditor.quill.setSelection(quill.index+1)
        }else{
          var message = { content: fileName, UploadStore: null, msgType: imageUpload.fileType,channelType:this.$store.state.selectSendmessageAticon, target_id: this.$store.state.selectFriendAticon, filename: imageUpload.name, msgID: imageUpload.uid, filePath: imageUpload.path, oldName: imageUpload.name, date: nows, fileSize: imageUpload.size };


                me.$refs.myQuillEditor.quill.insertEmbed(quill.index,'fileBlot',message);
                me.$refs.myQuillEditor.quill.setSelection(quill.index+1);
        }
            return;

        };

        //const readyFilePath = clipboard.readText('file');
        //if (readyFilePath.indexOf('[file]') > -1) {
        //    let Atstore = readyFilePath.split('[file]')[1];
        //    this.pasteFile(Atstore);
        //    return;
        //};
        const readyFilePath = clipboard.readText('file');
        if(readyFilePath){
            var filePathText=readyFilePath;
            if (readyFilePath.indexOf('[file]') > -1) {
                filePathText = readyFilePath.split('[file]')[1];
            }
            if(filePathText==="undefined"){
                clipboard.clear();
			        return;
            }
            var fileInfo=clientiot.utils.getFileInfo(decodeURI(filePathText));
            if(fileInfo.success){
                    const suffix = fileInfo.data.path.split('\\');
                    const ext = suffix.splice(suffix.length - 1, 1)[0];
                        var imageUpload={
                          size:fileInfo.data.size,
                          name:ext,
                          path:fileInfo.data.path,
                          type:'',
                          uid:uuidv4()+fileInfo.data.ino,
                          fileType:pType,
                          channelType:this.$store.state.selectSendmessageAticon,
                        };
                  //    // 获取光标所在位置
                    me.$refs.myQuillEditor.quill.focus();
                  const quill = me.$refs.myQuillEditor.quill.getSelection()
                    /*图片类型正则验证*/
		        var imgStr = /(.*).(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$/;
		        if(!imgStr.test(fileInfo.data.path)) {
                    imageUpload.type='file';
                  var message = { content: fileName, UploadStore: null, msgType: imageUpload.fileType,channelType:this.$store.state.selectSendmessageAticon, target_id: this.$store.state.selectFriendAticon, filename: imageUpload.name, msgID: imageUpload.uid, filePath: imageUpload.path, oldName: imageUpload.name, date: nows, fileSize: imageUpload.size };

                        me.$refs.myQuillEditor.quill.insertEmbed(quill.index,'fileBlot',message);
                        me.$refs.myQuillEditor.quill.setSelection(quill.index+10);

                    clipboard.clear();
			        return;
		        } else {
                    imageUpload.type='image';
			        ImageDatas.push(imageUpload);
                    // 插入图片  res.url为服务器返回的图片地址
                  me.$refs.myQuillEditor.quill.insertEmbed(quill.index, 'image', fileInfo.data.path)
                      // 调整光标到最后
                  me.$refs.myQuillEditor.quill.setSelection(quill.index+10)
                    clipboard.clear();
                    return;
                }
            }
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

    var this_content_length=me.content.length;

        for (let i = 0; i < e.clipboardData.items.length; i++) {
          let item = e.clipboardData.items[i];
            if(!item){return;}
            if (item.kind === "file") {
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

          }
        };

    },
    pasteFile(filePath){
        var me=this;
        var nows = new Date().getTime();
        var filePaths = clientiot.utils.getFileInfo(filePath);
        const suffix = filePath.split('\\');
        const ext = suffix.splice(suffix.length - 1, 1)[0];
        const pasnamesuffix = ext.split('.');
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
        };
        var imageUpload={
          size:filePaths.data.size,
          name:ext,
          path:filePath,
          type:pType,
          uid:uuidv4()+filePaths.data.ino,
          fileType:pType,
          channelType:this.$store.state.selectSendmessageAticon,
        };
         if(filePaths.data.size>100*1024*1024){
             me.$message({
              message:'发送文件限制在100M内',
              duration:1800,
              type:'warning',
              center:true,
              })
              return
          };
        if(pType=='image'){
          ImageDatas.push(imageUpload);
          //    // 获取光标所在位置
            me.$refs.myQuillEditor.quill.focus();
          const quill = me.$refs.myQuillEditor.quill.getSelection()
            // 插入图片  res.url为服务器返回的图片地址
          me.$refs.myQuillEditor.quill.insertEmbed(quill.index, 'image', filePath)
              // 调整光标到最后
          me.$refs.myQuillEditor.quill.setSelection(quill.index+1)
        }else{
          var message = { content: fileName, UploadStore: null, msgType: imageUpload.fileType,channelType:this.$store.state.selectSendmessageAticon, target_id: this.$store.state.selectFriendAticon, filename: imageUpload.name, msgID: imageUpload.uid, filePath: imageUpload.path, oldName: imageUpload.name, date: nows, fileSize: imageUpload.size };
            this.readyFileList.push(imageUpload)
            this.readyFileMessageList.push(message)
            this.watch_readyFileList.push(imageUpload)
            this.watch_readyFileMessageList.push(message)
        }
          clipboard.clear();
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
         // 点击发送按钮发送图片文件
    sendImage(msg) {
      var me=this;
      var nows = new Date().getTime();
      var loginUser_id=JSON.parse( sessionStorage.getItem("currentUser")).id;
      // var channelType= this.selectedChat.id;
      var channelType=this.$store.state.selectSendmessageAticon;
      this.$store.state.selectFriendAticon = channelType;
      var now=new Date().getTime();
       if(channelType.channelType=='G'){
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
                targetId:channelType.targetID,
                targetType: "custom",
                version: 0
              }
          }
         clientiot.http.sendMessage(JSON.stringify(data),msg.filePath)
            .then(function(retvalue) {
             console.log("群发图片文件:"+retvalue);
             var dataArr=JSON.parse(retvalue);
             if(msg.msgType=='image'){
                var message={content:msg.filePath,msgType:msg.msgType,msgID:msg.msgID,filePath:msg.filePath,date:nows,filename:msg.oldName,fileSize:msg.fileSize,
                message_key:dataArr.data.message_key,
                theme_key:dataArr.data.theme_key,target_id:dataArr.data.targetId,errorCode:dataArr.success
              }
             }else{
                var message={content:msg.oldName,msgType:msg.msgType,msgID:msg.msgID,filePath:msg.filePath,date:nows,filename:msg.oldName,fileSize:msg.fileSize,
                message_key:dataArr.data.message_key,
                theme_key:dataArr.data.theme_key,target_id:dataArr.data.targetId,errorCode:dataArr.success
              }
             }

            if(dataArr.success==true){
               me.$store.dispatch("sendMessage", message);
               me.$store.dispatch('topChatlist',me.selectedChat);

            }else{
               me.$store.dispatch("sendMessage", message);
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
             targetId:channelType.targetID,
              targetCode: channelType.targetCode,
              targetType: "single",
              dataUrl:'',
              msgContent: {
                  arn: "arn",
                  durationTime:nows,
                  extras: "extras",
                  fileSize: msg.fileSize,
                  format: "",
                  height: 5,
                  mediaCrc32: "mediaCrc32",
                  mediaId: msg.content,
                  text: msg.oldName,
                  width: 5
              }
          }
          clientiot.http.sendMessage(JSON.stringify(data),msg.filePath)
            .then(function(retvalue) {
             console.log("inputFile.vue个人发图片文件:"+retvalue);
              var dataArr=JSON.parse(retvalue);
              var message;

              if(msg.msgType=='image'){
                message={content:msg.filePath,msgType:msg.msgType,msgID:msg.msgID,filePath:msg.filePath,date:nows,filename:msg.oldName,fileSize:msg.fileSize,
                message_key:dataArr.data.message_key,
                theme_key:dataArr.data.theme_key,
                target_id:dataArr.data.targetId,errorCode:dataArr.success
                };
              }else{
                  message={content:msg.oldName,msgType:msg.msgType,msgID:msg.msgID,filePath:msg.filePath,date:nows,filename:msg.oldName,fileSize:msg.fileSize,
                  message_key:dataArr.data.message_key,
                  theme_key:dataArr.data.theme_key,
                  target_id:dataArr.data.targetId,
                  errorCode:dataArr.success
                  };
              }
              if(dataArr.success==true){
                 me.$store.dispatch("sendMessage", message);
                 me.$store.dispatch('topChatlist',me.selectedChat);
              }else{
                 me.$store.dispatch("sendMessage", message);
              }


          })
        }
       }


    },
       //显示聊天记录
    showMessages(){
        //弹出新窗体
        //localStorage.setItem("messBoxId",this.selectFriendAticon)
        this.$store.dispatch("showMessRecode", this.selectFriendAticon);

        var syncData = {
            selectFriendAticon: JSON.parse(localStorage.getItem("getMess")),
            userInfo: JSON.parse(clientiot.globalinfo.GetUserLocalJson()).data
        }

        ipc.send("MAINWIN:msgLogWin", syncData);
    },
    getContant(){
      var me=this;
      if(me.content.length!=0){
           var data={
        selectedChatID:me.selectFriendAticon,
        textContent:me.content
      }
       sessionStorage.setItem('SaveDraft',JSON.stringify(data))
       me.content=''
      }
    }
},

created () {


    //var store = clientiot.localForageHelper.createInstance();
    //store.setItem("key", "value");

    this.$refs = {
    myQuillEditor: HTMLInputElement,
    imgInput: HTMLInputElement
    };

    ImageDatas=[];
    var me = this;
     me.$store.state.clearInputTxte=false
     // 点击其他不在的区域触发事件
    window.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)){
        //  me.getContant()
        var selecData=sessionStorage.getItem('SaveDraft');
        if(selecData&&selecData!=''&& selecData.length>2){
          var selecData=selecData.replace(/[\r\n]/g, "");
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
          if(me.clearInputTxte){
            me.content=''
          }
          setTimeout(function(){
            me.$store.state.clearInputTxte=false
          },1000)
        }
         Events.$on("readyFileListSet", data=>{
            if (data) {
            if (this.readyFileList.length > 0) {
                this.readyFileList.splice(this.readyFileList[this.readyFileList.length - 1], 1);
                this.readyFileMessageList.splice(this.readyFileMessageList[this.readyFileMessageList.length - 1], 1);

                this.watch_readyFileList.splice(this.watch_readyFileList[this.watch_readyFileList.length - 1], 1);
                this.watch_readyFileMessageList.splice(this.watch_readyFileMessageList[this.watch_readyFileMessageList.length - 1], 1);
            }
           }
         });

        me.showEmoji=false;
        me.AtPople=false
      }
    });
     Events.$on('sendInputMessage',data=>{
            me.DragUpload(data)
    })


},
// 页面加载后执行 为编辑器的图片图标和视频图标绑定点击事件
mounted () {
   var me=this;
  var index=-1;
  Event.$on("messagePlay",data=>{
    this.messagesPlay=data;
    this.$forceUpdate();
  });
    // 为图片ICON绑定事件 getModule 为编辑器的内部属性
    console.log(this.$refs.myQuillEditor.quill)
    this.$refs.myQuillEditor.quill.getModule('toolbar').addHandler('image', this.imgHandler)
    this.$refs.myQuillEditor.quill.getModule('toolbar').addHandler('link', this.emojisHandler)
    this.$refs.myQuillEditor.quill.getModule('toolbar').addHandler('video', this.onKeyup) // 为视频ICON绑定事件
      this.bodyListener = (e) => {
        var box=document.getElementById('hxAtPople'),
            as = box.getElementsByTagName('li');//as是一个集合
          var quillHasFocus = this.$refs.myQuillEditor.quill.hasFocus();
        if(e.keyCode===13&&e.ctrlKey===true){
               this.$refs.myQuillEditor.quill.focus();
             // 调整光标到最后
             const quill = me.$refs.myQuillEditor.quill.getSelection()
            me.$refs.myQuillEditor.quill.insertEmbed(quill.index, 'text', "\n\n")
            me.$refs.myQuillEditor.quill.setSelection(me.content.length + 1);
             return
           };


          if (e.keyCode === 13){
              e.returnValue = false;
              if (quillHasFocus) {
                  this.send();
              }
              else if (this.AtPople === true) {
                  var thisLI = document.getElementsByClassName("hxAtPople_li_selected")[0];
                  if (thisLI) {
                      var jsonValue = thisLI.getElementsByTagName("input")[0].getAttribute("value");
                      if (jsonValue) {
                          var valueObj = JSON.parse(jsonValue);
                          this.selectFriend(valueObj);
                      }
                  }
                  if (index > as.length - 1) {
                       index = as.length - 1;
                  };
                for(var i=0;i<as.length;i++){
                    as[i].style.backgroundColor = null;
                    as[i].classList.remove("hxAtPople_li_selected");
                };
              }
        }
        if(this.cashierDialog){
          if (e.keyCode === 27 && e.target === document.body){
            document.getElementById('cashier-dialog-cancel').click()
          }
          }

          //上下箭头
          if (event.keyCode === 38 || event.keyCode === 40) {
               me.$refs.myQuillEditor.quill.setSelection(this.content.length + 1);
                this.$refs.myQuillEditor.quill.blur();
          }


          if (event.keyCode === 40) {
              console.log("index:" + index)
              index++;
              if (index > as.length - 1) {
                  index = as.length - 1;
              };
            for(var i=0;i<as.length;i++){
                as[i].style.backgroundColor = null;
                as[i].classList.remove("hxAtPople_li_selected");
            };
              as[index].style.backgroundColor = "#ccc";
              as[index].classList.add("hxAtPople_li_selected");

              box.scrollTop = as[index].offsetTop;
        };
        if(event.keyCode===38){
            console.log("index:" + index)

            index--;

            if (index < 0) {
                index = 0;
            }
            for(var i=0;i<as.length;i++){
                as[i].style.backgroundColor = null;
                as[i].classList.remove("hxAtPople_li_selected");
            };
            as[index].style.backgroundColor = "#ccc";
            as[index].classList.add("hxAtPople_li_selected");

            box.scrollTop = as[index].offsetTop;

        };

        //   //退格
          if (e.keyCode == 8) {
             var quill = me.$refs.myQuillEditor.quill.getSelection();
              //删除文件
              if (me.content.length === 0) {
                ImageDatas=[];
                  if (me.readyFileList.length > 0) {

                      me.readyFileList.splice(me.readyFileList[me.readyFileList.length - 1], 1);
                      me.readyFileMessageList.splice(me.readyFileMessageList[me.readyFileMessageList.length - 1], 1);
                      me.watch_readyFileList.splice(me.watch_readyFileList[me.watch_readyFileList.length - 1], 1);
                      me.watch_readyFileMessageList.splice(me.watch_readyFileMessageList[me.watch_readyFileMessageList.length - 1], 1);

                  }
              }
              else {
                  //获取当前光标所在位置的@字符串 .substring(0, quillIndex)
                  var selectStr = me.content;
                  //查看是否存在@人员，存在则退格一次删除@到人员名称
                  var newContent = this.content.replace(/<\/?.+?>/g, "");
                  if (newContent.lastIndexOf('@') > -1) {
                      var lastAtName = newContent.substring(newContent.lastIndexOf('@') + 1, newContent.length);
                      var selectMembersLsit = me.filterMembers().filter(it => it.memberName === lastAtName);
                      if (selectMembersLsit.length ==0) {
                           var stores= newContent.replace('@'+lastAtName, '');
                          //  me.content= "";
                          for (var i = 0; i < AtNewPople.length; i++) {
                              if (AtNewPople[i].memberName == lastAtName.replace(/(^\s*)|(\s*$)/g, "")) {
                                  AtNewPople.splice(i, 1)
                              }
                          }
                          // me.$refs.myQuillEditor.quill.focus();
                          // me.$refs.myQuillEditor.quill.insertEmbed(stores.length, 'text', '')
                          // me.$refs.myQuillEditor.quill.setSelection(quill.index + 10);
                      }


                  }else{
                     AtNewPople=[]
                      me.$refs.myQuillEditor.quill.focus();
                      me.$refs.myQuillEditor.quill.setSelection(quill.index);
                  }

              }

         };

      }
      document.body.addEventListener('keyup', this.bodyListener, false);

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
   bottom: 112px; 
    max-height: 150px;
    padding: 5px;
    border: 1px solid rgb(209, 209, 209);
    z-index: 99;
    background:white;
    left: 26px;
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
  -moz-user-select: none; /*火狐*/
  -webkit-user-select: none;  /*webkit浏览器*/
  -ms-user-select: none;   /*IE10*/
  -khtml-user-select: none; /*早期浏览器*/
  user-select: none;
  text-align:center;
  float:right;
  margin-top:8px;
  cursor :pointer
  width: 90px;
  height: 30px;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
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
 
.ql-editor a{
   background:none!important;
}
.ql-editor ul li{ 
  list-style:none!important;
 }
 .ql-editor .ql-align-right{
   text-align: left ;
 }
.hx-readyFileList{
    padding: 11px;
    border: 1px solid #ccc;
    width: 76%;
    padding-left: 10px;
    margin-left: 10px;
    color: #999;
}  
.hx-readyFileList:active
{  
  border: 1px solid blue;
}
.ql-editor >>> ul,li{
   padding:0;
   margin:0;
   list-style:none;
  text-align: left;
   } 
  .ql-editor >>> li{
    text-align: left;
    
  }
  .myblot-input{
    padding-right:5px;
  }

    .ql-editor p {
        display:inherit;
    }
</style>