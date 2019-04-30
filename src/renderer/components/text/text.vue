<!-- 文本输入框 -->
<template>
    <div class="text" ref="text" id="text">
        <div style="height: 5px;cursor: s-resize;" ref="lineDiv" id="lineDiv">
            <div style="background-color:#e7e7e7;height: 1px;"></div>
        </div>
        <!-- <textarea  id="dropbox" ref="text" @focus="handleFocus" @blur="handleBlur" v-model="content" @keyup="onKeyup" @click="showEmoji=false" @drop="drop($event)" @dragenter="dragenter($event)" @dragover="dragover($event)"></textarea> -->
        <div v-show="!this.getUserAllowedSendStatus" style="color: #a89f9f;font-size: 13px;margin: 67px;text-align: center;"><span>全员禁言中，只允许群主发言</span></div>
        <VueQuillEditor class="dropboxs" :config="config" ref="ue1" v-show="this.getUserAllowedSendStatus">
        </VueQuillEditor>
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex' 
import Events from '../../api/eventBus.js' 
const clientiot = require("@hxim/clientiot");
var co = require("co"); 
const { ipcRenderer } = require('electron')
const electron = require('electron')
const desktopCapturer = electron.desktopCapturer
const electronScreen = electron.screen
const shell = electron.shell
const fs = require('fs')
const os = require('os')
const path = require('path')
import VueQuillEditor  from './InputFile'
// import VueQuillEditor  from './UploadFile'
import moment from 'moment'
import { stringify } from 'querystring';
moment.locale('zh-cn')
const uuidv4 = require('uuid/v4'); 
var groupName;
export default {
    components: { 
        VueQuillEditor 
    },
  created () {
     // 点击其他不在的区域触发事件
      document.addEventListener('click', (e) => {
        if (!this.$el.contains(e.target)){
            this.showMessage = false;
            this.showEmoji = false; 
        }
      }) 

      window.onresize = function () {
          var tableDiv = document.getElementById("topTable");
          var dtable = document.getElementById("text");
          var oDiv = document.getElementById("lineDiv");
          var DragUpload = document.getElementById("DragUpload");

          dtable.style.height = DragUpload.clientHeight - tableDiv.clientHeight + "px"
      }
  },
  data() {
    return {
      content: "",
      reply: '未找到',
      frequency: 0,
      warn: true,
      showEmoji: false,
      focusClass:false,
      showMessage: false,
      getUserAllowed:false,
       files: [],
       postFileData: {
        channelId: this.channelId,
        imageWidth: 0,
        imageHeight: 0,
        size: 0
      },   
      uploadFileUrl: process.env.BASE_API + '/messages/files',
      uploadRequestHeaders: {
        'X-Token': sessionStorage.getItem('token')
      },
      defaultMsg: '这里是UE测试',
        config: {
          initialFrameWidth: null,
          initialFrameHeight: 350
        }  
    };
  },

  computed: {
    ...mapState(["user", "selectId", "emojis","selectFriendId",'selectFriendAticon','getUserAllowedSendStatus']),
    ...mapGetters(["selectedChat", "messages"])
  },
  methods: { 
     
  DragUploads(fileList) {
     var now=new Date().getTime();
    let file = fileList;
    for (let i = 0; i < file.length; i++) {
      //判断是否为文件夹
      if (file) {
        let me=this;
      var item = {
                name: file[i].name,
                uploadPercentage: 0
            };
        this.files.push(item);
        var msgtype=''
        let fileName=file[i].name;
        var result = fileName.substring((fileName).indexOf("."),(fileName).indexOf(".")+5);
          const nameKey=uuidv4()+result;
          let localPath=file[i].path;
          const fileType=(file[i].type.split('/')[0]);
          var fileSize=file[0].size;
        if(fileSize>100*1024*1024){
             me.$message({
              message:'发送文件限制在100M内',
              duration:1800,
              type:'warning',
              center:true,
              }) 
              return
          };
            if(fileType=="text"||file[i].type==''||fileType=="application"){
              var msgtype='file'
            }else{
              var msgtype=fileType
            }
             let self = this;
         // 看支持不支持FileReader
            if (!file || !window.FileReader) return;
          
            if (/^image/.test(file[0].type)) { 
                var msg={content: file[0].path,msgType:msgtype,msgID:file[0].lastModified,target_id:me.$store.state.selectFriendAticon,filePath:localPath,filename:fileName,date:now,fileSize:fileSize};
               
                  // self.$store.dispatch("sendMessage", msg);
                Events.$emit('sendInputMessage',file[i])
              
            }else{
               var msg={content:fileName,msgType:msgtype,msgID:file[0].lastModified,target_id:me.$store.state.selectFriendAticon,filePath:localPath,filename:fileName,date:now,fileSize:fileSize};
              //  self.$store.dispatch("sendMessage", msg);
               Events.$emit('sendInputMessage',file[i])
            }
            //  setTimeout(function(){
            //        Events.$emit('sendMessage',msg)
            // },1000) 
           
      } else {
        //文件夹处理
        this.folders(fileList.items[i]);
      }
    }
  }
  },
  
  // 在进入的时候 聚焦输入框
  mounted() {
    // this.$refs.text.focus();
    var me=this; 
     me.$refs.text.ondragleave = (e) => {
      e.preventDefault();  //阻止离开时的浏览器默认行为
      };
      me.$refs.text.ondrop = (e) => {
      e.preventDefault();    //阻止拖放后的浏览器默认行为
      const data = e.dataTransfer.files;  // 获取文件对象
      if (data.length < 1) {
        return;  // 检测是否有文件拖拽到页面     
      }else{
           me.DragUploads(data);
      }
       
    };
    me.$refs.text.ondragenter = (e) => {
      e.preventDefault();  //阻止拖入时的浏览器默认行为
      me.$refs.text.border = '2px dashed red';
    };
    me.$refs.text.ondragover = (e) => {
      e.preventDefault();    //阻止拖来拖去的浏览器默认行为
      };  

      //////////////////////////////////////////////////////////上下拖动
      var tableDiv = document.getElementById("topTable");
      var dtable = document.getElementById("text");
      var oDiv = document.getElementById("lineDiv");
      var textDiv = document.getElementById("textDiv");
      var inputFiles = document.getElementById("inputFiles");
      var ql_editor = document.querySelector(".ql-editor");

            oDiv.onmousedown = function (ev) {
                var theight = parseInt(tableDiv.offsetHeight)//parseInt为了不指向对象
                var dheight = parseInt(dtable.offsetHeight)
                oDiv.style.cursor = 's-resize'
                var ev = ev || event;

                //鼠标按下坐标
                var mouseDownX = ev.clientX;
                var mouseDownY = ev.clientY;
                // IE8 取消默认行为-设置全局捕获
                if (oDiv.setCapture) {
                    oDiv.setCapture();
                }

                document.onmousemove = function (ev) {
                    var ev = ev || event;
                    // 鼠标移动时的鼠标位置
                    var mouseMoveX = ev.clientX;
                    var mouseMoveY = ev.clientY;

                    if ((theight + (mouseMoveY - mouseDownY)) <= 150 || (dheight + (mouseDownY - mouseMoveY)) <= 150)
                        return;

                    tableDiv.style.height = theight + (mouseMoveY - mouseDownY) + "px"
                    dtable.style.height = dheight + (mouseDownY - mouseMoveY) + "px"


                    //45的高度是目前输入框表情与上边框的总高度
                    textDiv.style.maxHeight = dheight + (mouseDownY - mouseMoveY) + "px"
                    textDiv.style.height = dheight + (mouseDownY - mouseMoveY) - 45 + "px"

                    //设置编辑器与文件列表的高度
                    ql_editor.style.maxHeight = dheight + (mouseDownY - mouseMoveY) - 45 - inputFiles.clientHeight + "px"
                    ql_editor.style.height = dheight + (mouseDownY - mouseMoveY) - 45 - inputFiles.clientHeight + "px"
                }

            }

            document.onmouseup = function () {
                document.onmousemove = null;
                // 释放全局捕获
                if (oDiv.releaseCapture) {
                    oDiv.releaseCapture();
                }
            }
            return false;

    }  
};
</script>
 
<style lang="stylus" scoped>
@import "../../assets/icon/iconfont.css";
.text
    -webkit-app-region:no-drag
    position: absolute
    bottom :0
    width 100%
    height: 160px
    background: #fff
    .emoji
        position: relative
        width: 100%
        height: 40px
        line-height: 40px
        font-size: 12px
        padding: 0 30px
        box-sizing: border-box
        color: #7c7c7c 
        .icon
            font-weight bold
            font-size 18px
            margin-right 15px
            cursor: pointer
        .emojiBox
            position: absolute
            display: flex
            flex-wrap: wrap
            top: -210px
            left: -100px
            width: 300px
            height: 200px
            padding: 5px
            background-color: #fff
            border: 1px solid #d1d1d1
            border-radius: 2px
            box-shadow:0 1px 2px 1px #d1d1d1
            &.showbox-enter-active, &.showbox-leave-active
                transition: all .5s
            &.showbox-enter,&.showbox-leave-active
                opacity: 0
        .messageBox
            position absolute
            top -550px
            left 0px
            width 450px
            height 700px
            background-color #f5f5f5
            border 1px solid #d1d1d1
            border-radius 5px
            box-shadow 0 2px 4px 2px #d1d1d1
            &.showMessageBox-enter-active, &.showMessageBox-leave-active
                transition: all .5s
            &.showMessageBox-enter,&.showMessageBox-leave-active
                opacity: 0
            .wrapper
                padding 0px
                width 80%
                margin-left 10%
            .header
                height: 50px
                width :400px
                padding-left 20px
                box-sizing: border-box
                .friendname
                    font-size 16px
                    font-weight bold
                    color #333
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
            .messageSort
                float left
                width 75%
                margin 0 12.5%
                margin-bottom 10px
                li
                    float left
                    width 25%
                    height 34px
                    text-align center
                    font-size larger
                    font-weight bold
                    &:hover
                        border-bottom :2px solid #1AAD19
                        color #1AAD19
                        cursor pointer
            hr
                border none 
                height 1px
                background-color #dddddd
                width 100%
                margin-top 10px
            .messageRecodeBox
                padding 10px 30px
                height 550px
                overflow hidden
                overflow-y scroll
                li
                    border-bottom 1px solid #ccc
                    margin-bottom 10px
            .messageRecodeBox ::-webkit-scrollbar
                display: none;
            .messageTextBox
                display inline-block
                width 86%
                heigth 100%
                padding-left 2%
                .messageTextName
                    height 18px
                    line-height 18px
                    color #adaeaf
                    span
                        float right 
                .messageTextContent
                    height 18px
                    overflow hidden
                    line-height 18px
                    color:#333
                    font-size 14px
    textarea
        box-sizing: border-box
        padding: 0 30px
        height: 110px
        width: 100%
        border: none
        outline: none
        font-family: "Micrsofot Yahei"
        resize: none
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
.userImg
    vertical-align:top
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
.dropboxs{
  display: inline-block;
    border: 0px solid #999;
    width: 100%;
    height: 100%;
    overflow: hidden;
}
   
</style>
