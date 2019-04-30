<!-- 消息框 -->
<template>
	 <div class="message" id="topTable">
		<header class="header">
			<div class="friendname" v-if="selectedChat"><span class="friendnameSpan"><p :groupinfo="setState(selectedChat.id)">{{selectedChat.user.name}} <font v-show="selectIsinputState" style="font-size:10px;margin-left:20px">正在输入....</font></p></span></div>
            <!-- 内置弹出层  -->
            <span class="detailSetting" @click="DisplayDetails(selectedChat.id)" id="detailSetting"><span >…</span></span>
		</header>
        <!--  @scroll="onScroll($event)  .slice((-10)*pgNo)":groupinfo="setState(selectedChat.id)" -->
        <div class="message-wrapper" ref="list"   @scroll="onScroll($event)" id="ForwardData">
            <!-- <div class="loading-bar" v-show="loadingShow">
                <svg class="icon icon-loading"
                     aria-hidden="true">
                    <use xlink:href="#icon-loading"></use>
                </svg>
                 查看更多消息... .slice((-10)*pgNo)
            </div> -->
            <ul v-if="selectedChat" :data="selectFriendAticon" id="news" class="news">
                <li v-if="selectedChat.messages" v-for="(item,index) in selectedChat.messages.slice((-20)*pgNo)" class="message-item" :id="item.messageKeys" :content="item.content" :aaa="JSON.stringify(item)">
                    <div class="time"><span v-if="item.isShowDate" class="hxNoCopy" onselectstart="return false" unselectable="on">{{ item.date | time}} </span></div>
                    <div class="time messageTime" v-if="item.msgType=='once'"><span class="hxNoCopy" onselectstart="return false" unselectable="on">{{item.content}}</span></div>
                    <div class="time messageTime" v-else-if="item.msgType==1||item.msgType=='notic'" onselectstart="return false" unselectable="on"><span>{{item.content}}</span></div>
                    <div class="main" v-else :class="{ self: item.self }">

                        <img class="selectUserImg avatar" oncontextmenu="return false" onselectstart="return false" ondragstart="return false" onbeforecopy="return false" oncopy="document.selection.empty()"  onselect="document.selection.empty()"   width="36" height="36" :src="GetUserInfo(item.fromId).photoUrl" @click="openUserCardWin(item.fromId,$event)"/>
                        <div>

                            <div class="msgUserName" v-if="selectedChat.channelType=='G'">{{item.msgUserName}}</div>
                            <!-- 链接 httpString(replaceFace(item.content))-->
                            <div class="content" v-if="item.msgType==='http'" :data-url="JSON.stringify(item,selectedChat)">
                                <div class="text" v-html="httpString(replaceFace(item.content))" @contextmenu="onmousecontextmenu($event)"></div>
                            </div>
                            <!-- 文字replaceFace(item.content)" @contextmenu="onmousecontextmenu($event)"-->
                            <div class="content" v-if="item.msgType==='text'" :data-url="JSON.stringify(item,selectedChat)">
                                <div class="text hx-messageBox" v-html="httpString(replaceFace(item.content))" @contextmenu="onmousecontextmenu($event)"></div>
                            </div>
                            <!-- 语音 -->
                            <div class="audio" v-if="item.msgType==='voice'" @contextmenu="onmousecontextmenu($event)">
                                <MessageAudio v-bind:message="item"></MessageAudio>
                            </div>
                            <!-- 图片  -->
                            <div class="content_image hx-Imagecontent" v-if="item.msgType==='image'" ref="dataurl" :data-url="JSON.stringify(item)">
                                <MessageImage v-bind:message='item'></MessageImage>
                            </div>
                            <!-- 视频 -->
                            <div class="content_file" v-if="item.msgType==='video'" ref="dataurl" :data-url="JSON.stringify(item)">
                                <MessageVideo v-bind:message='item'></MessageVideo>
                            </div>
                            <!-- 文件 -->
                            <div class="content_file" v-if="item.msgType==='file'" ref="dataurl" :data-url="JSON.stringify(item)">
                                <MessageFile v-bind:message='item'></MessageFile>
                            </div>
                            <!-- 位置 -->
                            <div class="content_file" v-if="item.msgType==='location'" ref="dataurl" :data-url="JSON.stringify(item)">
                                <div class="text hx-messageBox"><img src="http://api.map.baidu.com/staticimage/v2?ak=UNXSrmZ7C3eeA1lX65exWGBMycM7ytw6&;width=400&height=200&center=北京&markers=百度大厦|116.40387439.914888&zoom=10&markerStyles=l0xff0000" /></div>
                            </div>
                        </div>
                        <!-- 发送失败标志 -->
                        <img v-if="item.self==true" v-show="item.errorCode==false" src="./FailInSend.svg" alt="" width="15" height="15">
                    </div>
                </li>
            </ul>
        </div>
        <!-- @提示 -->
        <div class="atStyle" v-show="selectedChat.itemAt || selectedChat.atAll">
            有人提到了你
            <span class="atSpan" @click="cliAt">×</span>
        </div>
        <!-- 消息提示 -->
        <div class="atStyle messTips" v-show="tipsMess">
            <span class="icon iconfont icon-down" @click="cliDown" style="font-size:14px"></span>你有新消息
            <span class="atSpan" @click="tipsMess = false">×</span>
        </div>
         <!-- 查看大图 -->
        <div id="bigimg" v-show="bigimg">
            <div id="closeImg"><span>×</span></div>
            <img id="imgView" src="" alt="">
            <video id="videoView" src=""></video>
        </div>
         <!-- 转发 -->
          <el-collapse-transition>
          <ForwardDatas v-show="IsForwardData" v-on:cancel='getData'></ForwardDatas>  
         </el-collapse-transition>
        <!-- 详细资料设置  -->
          <!-- <el-collapse-transition>
          <GroupListInfo v-show="settingBox" v-on:settingBoxs='getsettingBoxs'></GroupListInfo>
          </el-collapse-transition> -->
         
	</div>
</template>

<script>

import ForwardDatas from "./ForwardData";
import { mapGetters, mapState, mapActions } from "vuex";
import GroupListInfo from "../chatlist/GroupListInfo";
import VideoPlayer from 'vue-video-player';
import formatDate from "../switch/filters.js";
import MessageAudio from'./messageAudio';
import moment from 'moment'
import path from 'path';
import Events from '../../api/eventBus.js'
import { setTimeout } from 'timers';
import MessageFile from './messageFile';
import MessageImage from './messageImage';
import MessageVideo from './messageVideo';
moment.locale('zh-cn')
require('video.js/dist/video-js.css');
require('vue-video-player/src/custom-theme.css');
const electron = require("electron");
const clipboard = require('electron').clipboard
const ipcRenderer = electron.ipcRenderer;
var { ipcRenderer: ipc } = require("electron");
const clientiot = require("@hxim/clientiot");
var co = require("co");
var winWidth=window.screen.width;
var winHeight=window.screen.height;
const { BrowserWindow } = require("electron").remote;
const {shell} = require("electron").remote;
const uuidv4 = require('uuid/v4');
var remote=require('electron').remote
//图片弹窗地址
var newTel=remote.getGlobal('sharedObject').newTel
//视频弹窗地址
var videoUrl=remote.getGlobal('sharedObject').video
var mediaWin=null;
var videoWin=null;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
const SendMenu = new Menu();
const AcceptMenu=new Menu();
const OvertimeMenu=new Menu();
var  dataARR;
var messageDataArr=[];
var channelType,txtEditorNum=0;
var changePgItem;
export default {
  components: {
    GroupListInfo,
    VideoPlayer,
    ForwardDatas,
    MessageFile,
    MessageImage,
    MessageVideo,
    MessageAudio
  },
  data() {
    return {
      value1: false,
      value2: true,
      settingBox: false,
      chooseUser: false,
      bigimg: false,
      myfilepath:'',
      ForwardData:'',
      IsForwardData:false,
      Revoke:false,
      setPerturbedState:false,
      items:[],
      pgSize:20,
      rawItems:[],
      pgNo:1,
      loadingShow:false,
      tipsMess:false,
      DisplayDetail:true,
      startT: ''
    };
  },

  computed: {
    ...mapGetters(["selectedChat", "messages"]),
    ...mapState(["user", "emojis", "chatlist", "UploadprogNum", "selectId",'GroupTitle',"members",'selectFriendId','selectIsinputState','selectFriendAticon'])
  },
  mounted() {
     var me=this;
     Events.$on("messagePlay",data=>{
        me.$forceUpdate();
    });
     Events.$on("newMess",data=>{
         var messBoxList = document.getElementById('ForwardData');
        let currChat = me.$store.state.chatlist.find(currs=>currs.id==data);
         if(currChat&&currChat.id == me.selectFriendId){
             me.tipsMess = messBoxList.scrollHeight-(messBoxList.scrollTop + messBoxList.clientHeight) >20;
         }
    });
      Events.$on('DisplayDetails',data=>{
          me.DisplayDetail=true
      });
    // document.oncontextmenu=new Function('event.returnValue=false;');
    // document.onselectstart=new Function('event.returnValue=false;');
      //  在页面加载时让信息滚动到最下面(),
    // setTimeout(function(){
    //     if(me.$refs.list!=undefined){
    //         me.$refs.list.scrollTop = me.$refs.list.scrollHeight
    //     }
    // });
    setTimeout(function(){
     if(me.$refs.list!=undefined){
        me.$refs.list.ondragleave = (e) => {
        e.preventDefault();  //阻止离开时的浏览器默认行为
        };
        me.$refs.list.ondrop = (e) => {
        e.preventDefault();    //阻止拖放后的浏览器默认行为
        const data = e.dataTransfer.files;  // 获取文件对象
        if (data.length < 1) {
            return;  // 检测是否有文件拖拽到页面
        }else{
            me.DragUploads(data);
        }

        };
        me.$refs.list.ondragenter = (e) => {
        e.preventDefault();  //阻止拖入时的浏览器默认行为
        me.$refs.list.border = '2px dashed red';
        };
        me.$refs.list.ondragover = (e) => {
        e.preventDefault();    //阻止拖来拖去的浏览器默认行为
        };
     }
    },1000)

    // require('./messageMenu.js');
    Events.$on('IsForwardData',data=>{
        me.IsForwardData=data
    });
     var txtEditor = document.getElementById('ForwardData');
    if(txtEditorNum==0){
      txtEditorNum++;
     SendMenu.append(new MenuItem(
    {
        label: '复制',
        role: 'copy',
        enabled:true
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
            if(me.selectedChat.channelType=="P"){
                var flag=0;
            }else{
                 var flag=1;
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
             var me=this;
            Events.$emit('IsForwardData', true);
        }
     }));
     OvertimeMenu.append(new MenuItem(
    {
        label: '复制',
        role: 'copy',
        enabled:true
     }
    ))
      OvertimeMenu.append(new MenuItem({
        label: '转发',
        click: function (e) {
             var me=this;
            Events.$emit('IsForwardData', true);
        }
     }));
     AcceptMenu.append(new MenuItem(
    {
        label: '复制',
        role: 'copy',
        enabled:true
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
    }
  },
  watch: {
    // 发送信息后,让信息滚动到最下面
    messages() {
        var me=this;
        // scrollTop + clientHeight == scrollHeight。
        me.DisplayDetail=true;
        me.$nextTick(() => {
            if(me.tipsMess != true){
                me.$refs.list.scrollTop = me.$refs.list.scrollHeight;
            }
        })
        messageDataArr= me.$store.getters.messages;
    }
  },
  methods: {
      ...mapActions(["selectSession"]),
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
    cliAt() {
          this.$store.dispatch("cliAt",this.selectedChat);
          this.$forceUpdate();
      },
    cliDown(){
          this.$refs.list.scrollTop = this.$refs.list.scrollHeight;
          this.tipsMess = false;
      },
    copyMsg(){
          alert(111111111111111111)
      },
    onScroll(event){
        this.loadingShow=true;
          var _self=this;
          var offsetHeight = event.currentTarget.offsetHeight,
          scrollHeight = event.target.scrollHeight,
          scrollTop = event.target.scrollTop,
          scrollBottom = offsetHeight + scrollTop,
          windowHeight = event.target.clientHeight ;
        if(scrollTop===0)
            {
            if(_self.pgNo>=Math.round(_self.selectedChat.messages.length/_self.pgSize)+1)
            {
                return
            }

                var lastDocumentId = document.getElementsByClassName("message-item")[0].id;

                _self.pgNo++

                _self.$nextTick(function () {
                    var lastDocument = document.getElementById(lastDocumentId);
                    if (lastDocument && lastDocument.offsetTop) {
                        event.target.scrollTop = lastDocument.offsetTop - event.target.clientHeight+80
                    }
                });

            }
            if(scrollBottom===scrollHeight || scrollBottom===scrollHeight+2)
            {
            if(_self.pgNo==Math.round(_self.selectedChat.messages.length/_self.pgSize))
            {
                return
            }
            // setTimeout(function(){
                _self.pgNo++;
            // },2000)
            }
            if((scrollTop+windowHeight)==scrollHeight){
                _self.pgNo=1
                _self.tipsMess = false;
            }

        this.loadingShow=false;


        },

    showImg(item){
          if(item.httpImg){
              return item.httpImg
          }else{
              return item.content.rootPath+item.content.thisDir
          }
      },
    DisplayDetails(value){
        if(this.DisplayDetail==true){
            Events.$emit('DisplayDetails',true);
            document.getElementById('detailSetting').style.right='-235px';
            this.DisplayDetail=false;
            //this.setState(value)
        }else{
            Events.$emit('DisplayDetails',false);
            document.getElementById('detailSetting').style.right='15px';
            this.DisplayDetail=true;
        }
    },
    getsettingBoxs(value){
        Events.$on('Pertur',datas=>{
            this.settingBox= datas
        })
    },
    getData(greetMsg){
        this.IsForwardData=greetMsg
    },
    openn:function(item){
        var el = event.target;
        shell.openItem(item)
    },
     showMenu(index) {
        this.transferIndex=index
      event.preventDefault();
      var x = event.clientX;
      var y = event.clientY;
      // Get the current location
      this.contextMenuData.axios = {x,y};
    },
    ForwardDatas(item){
        this.IsForwardData=true;
        this.ForwardData=item;
    },
    //下载文件
    downFile:function(item) {
      /*从S3下载文件*/
      var me=this;
      var el = event.target;//复杂的click哈哈
      var e2 = event.currentTarget
      const itemFileCode = item.content;
      const itemFilename = item.oldname;
      const chatId = me.$store.state.selectFriendId;
      let downChat = me.$store.state.chatlist.find(chats=>chats.id===chatId);
      let saveDown = downChat;
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
                    saveDown.messages.forEach(list=>{
                        if(list.messageKeys==item.messageKeys){
                            item.downFilePath=resData.data.rootPath+resData.data.thisDir;
                        }
                    })
                }
            },itemFilename);
        })
      }
    },
    //下载视频
    downVideo:function(event){
        //下载视频
      var me=this;
      var el = event.target;//复杂的click哈哈
      var e2 = event.currentTarget
      const itemFileCode = el.dataset.content;
      const itemFilename = el.dataset.oldname;
      co(function*(){
        clientiot.awss31.DownloadFile(itemFileCode,"/profile/images/",function(res) {
          var resData = JSON.parse(res);
          console.log(resData)
          if (resData.errorCode == 200) {
              me.myfilepath=resData.data;
              var fileMessBox=document.getElementsByClassName('myOpenFile');
              var messfiled=me.selectedChat.messages.find(mes=>mes.content===itemFileCode);
              //获取文件总数
              var fileBox=[];
              for(var i=0;i<me.selectedChat.messages.length;i++){
                  if(me.selectedChat.messages[i].msgType=="file"&&!me.selectedChat.messages[i].self){
                      fileBox.push(me.selectedChat.messages[i].content)
                  }
              };
              //获取当前文件在第几
              var fileIndex;
              for(var j=0;j<fileBox.length;j++){
                  if(fileBox[j]==itemFileCode){
                      fileIndex=j
                  }
              };
              //获取文件信息DOM集合
              fileMessBox[fileIndex].style.display="inline-block"
          }
        },itemFilename);
      })
    },
    realAvatarUrl() {
      var user_image = JSON.parse(sessionStorage.getItem("currentUser")).avatarUrl;
      if (user_image) {
        return user_image;
      }
    },

    //打开网址链接
    openWindow(url){
        shell.openExternal(url);
    },
    openUserCardWin(id,event){
        var e = event || window.event;
        var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
        var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
        var x = e.pageX || e.clientX + scrollX;
        var y = e.pageY || e.clientY + scrollY;

        var sendx=e.screenX+25;
        var sendy=y+60;

        if(sendx+370>screen.width){
            sendx=e.screenX-28-370;
        }

        if(sendy+336>screen.height){
            sendy=sendy-60-336;
        }

        var xAndY= {'x':sendx,'y':sendy};

       //打开人员信息查看窗体
        ipc.send("MAINWIN:userCardWin", id,xAndY);
    },
    //人员详情状态
    setState(id){
        var userId=JSON.parse(sessionStorage.getItem('currentUser')).id;
        var me=this;
        var getShieldNewArrs=[];
         co(function*(){
            var state=yield clientiot.employees.getShieldNew(userId);
            console.log("获取免扰状态state:"+state)
            var getShieldNewArr=JSON.parse(state).data.shield_info;
            if(!getShieldNewArr){
                return;
            }

            for(var i=0;i<getShieldNewArr.length;i++){
                getShieldNewArrs.push(parseInt(getShieldNewArr[i].shield_id));
                if(parseInt(getShieldNewArr[i].shield_id)==id){
                 sessionStorage.setItem('PerturbedStates', true);
                    break;
                }else{
                   sessionStorage.setItem('PerturbedStates', false);
                }
            };
            me.$store.dispatch('PerturbedState',getShieldNewArrs);
            var retvalue = yield clientiot.groups.getUserAllowedSendStatus(userId);
            console.log("获取禁言数据:"+retvalue);
            var groupName=JSON.parse(retvalue).data.be_ban;
            if(groupName.length==0){
                me.$store.state.getUserAllowedSendStatus=true
            }else{
                for(var k=0;k<groupName.length;k++){
                    if(groupName[k].group_id == id){
                        if(me.GroupTitle.owner_eid==userId){
                             me.$store.state.getUserAllowedSendStatus=true
                        }else{
                             me.$store.state.getUserAllowedSendStatus=false
                        }
                        sessionStorage.setItem('GainBan',true) ;

                        break;
                    }else{
                        sessionStorage.setItem('GainBan',false);
                        me.$store.state.getUserAllowedSendStatus=true
                    }
                }
            }
        })
        if(me.selectedChat.channelType=="G"){
            co(function*(){
                var retvalue = yield clientiot.groups.getGroupsByGid(id);
                console.log("获取群详情:"+retvalue)
                me.$store.dispatch("GroupInfo", retvalue);
            })
        }else{
            co(function*(){
                var retvalue = yield clientiot.employees.getEmployeesEid(id);
                console.log("获取个人详情:"+retvalue)
                me.$store.dispatch("GroupInfo", retvalue);
            })
        }
    },
    GetUserInfo(id){
        if(!id){
            return;
        }
        return JSON.parse(clientiot.globalinfo.getUserInfoByJson(id))
    },
    SelectedChat(data,id,msgUserImg){
        var itemId=data;
        var itemNname=id;
        var me=this;
        if(me.selectedChat.channelType=="P"){
        // co(function*(){
        //     var retvalue = yield clientiot.groups.getGroupsByGid(id);
        //     console.log("获取群详情:"+retvalue)
        //      me.$store.dispatch("GroupInfo", retvalue);
        // })
        return msgUserImg
        }else{
        //      co(function*(){
        //     var retvalue = yield clientiot.employees.getEmployeesEid(id);
        //      console.log("获取个人详情:"+retvalue)
        //      me.$store.dispatch("GroupInfo", retvalue);
        // })
         return itemId
        }
    },
    //  在发送信息之后，将输入的内容中属于表情的部分替换成emoji图片标签
    //  再经过v-html 渲染成真正的图片
    replaceFace(con) {
          if (!con && typeof con == "object") {
              return con
          }
          if (typeof con != "string") {
              return con
          }

     if(con==="undefined"){
            return ''
        }

        if (con.includes("/:")) {
            // var con=con.replace('<br>', '');
            var emojis = this.emojis;
            for (var i = 0; i < emojis.length; i++) {
                con = con.replace(
                    emojis[i].reg,
                    '<img src="static/emoji/' +
                    emojis[i].file +
                    '"  alt="" style="vertical-align: middle; width: 20px; height: 20px" />'
                );
            }
          return con.replace(/,/g, "").replace(/<\/?p[^>]*>/gi, '');
        }
        return con;
    //   replace(/style\s*?=\s*?([‘"])[\s\S]*?\1/, '') .replace(/\s/g,"&nbsp;&nbsp;")
    },
    httpString(s) {
        var reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|;|#|,|&amp;|%|$|#|!|:|_|-)+)/g;
        //var reg = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        //var reg=/(http(s)?\:\/\/)?(www\.)?(\w+\:\d+)?(\/\w+)+\.(swf|gif|jpg|bmp|jpeg)/gi;
        //var reg=/(http(s)?\:\/\/)?(www\.)?(\w+\:\d+)?(\/\w+)+\.(swf|gif|jpg|bmp|jpeg)/gi;
        //var reg= /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
        //var reg= /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/;
        var imgName=s.substr(s.lastIndexOf('.')+1);
        let imgFormat = ['jpg','jpge','png','gif','tiff','bmp','tga','psd','ai','raw','webp'];
        let isImg = imgFormat.find(imgs=>imgs==imgName);
        if(isImg == undefined){
            s = s.replace(reg, "<a style='text-decoration:underline;color:#423fd8' target='_blank' href='$1$2'>$1$2</a>"); //这里的reg就是上面的正则表达式
        }else{
            s = "<img style='width: 100%' src='"+s+"'>"
        }
                //替换“图片={xxxx}”
        var imgUrlReg = /图片={<a[^>]*href=['"]([^"]*)['"][^>]*>(.*?)<\/a>}/g;
        s = s.replace(imgUrlReg, "<img style='max-width: 100%;' src='$1'>");
        //图片替换完成
        // if(imgName=="jpg"){

        //     console.log(imgName)
        // }
        //s = s.replace(reg, "$1$2"); //这里的reg就是上面的正则表达式
        //s = s.match(reg);
        console.log("httpString:"+s)
        return s
    },

    getFileUrl(filePath, fileName, mimetype) {
      const fullPath = filePath + "/" + fileName;
      return (process.env.BASE_API +"/messages/files?fileName=" +encodeURIComponent(fileName) +
        "&fullPath=" +encodeURIComponent(fullPath) +"&mimetype=" +encodeURIComponent(mimetype)
      );
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
    button_choose_file(item){
            var el = event.target;
            shell.showItemInFolder(item);
    },
   GroupListInfo(){
       this.settingBox=false
   },
    DragUploads(data){
     var me=this;
        var now=new Date().getTime();
        var file = data;

            //if(file.length>=2){
            //me.$message({
            //message:'暂时支持拖拽1个文件',
            //duration:1800,
            //type:'warning',
           // center:true,
          //  })
         //   return
        //}

        for (var i = 0; i < file.length; i++) {
      //判断是否为文件夹
      if (file) {
        var me=this;
        var msgtype=''
        var fileName=file[0].name;
        var result = fileName.substring((fileName).indexOf("."),(fileName).indexOf(".")+5);
        const nameKey=uuidv4()+result;
        var localPath=file[0].path;
        const fileType=(file[0].type.split('/')[0]);
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
            if(fileType=="text"||file[0].type==''||fileType=="application"){
              var msgtype='file'
            }else if(fileType=="video"){
            var msgtype="video"
            }
            else{
              var msgtype=fileType
            }
         // 看支持不支持FileReader
            if (!file || !window.FileReader) return;

            if (/^image/.test(file[0].type)) {
                 // 获取光标所在位置
               var msg={content:localPath,msgType:msgtype,msgID:file[0].lastModified,target_id:this.$store.state.selectFriendAticon,filePath:localPath,filename:fileName,date:now,fileSize:fileSize};
                // me.$store.dispatch("sendMessage", msg);
                Events.$emit('sendInputMessage',file[i])
            }else{
               var msg={content:fileName,msgType:msgtype,msgID:file[0].lastModified,target_id:this.$store.state.selectFriendAticon,filePath:localPath,filename:fileName,date:now,fileSize:fileSize};
            //    me.$store.dispatch("sendMessage", msg);
               Events.$emit('sendInputMessage',file[i])
            }
            //  setTimeout(function(){
            //        Events.$emit('sendMessage',msg)
            // },1000)


      }
    }
   },        // 点击发送按钮发送图片文件
    sendImage(msg) {
     var me=this;
      var nows = new Date().getTime();
      var loginUser_id=JSON.parse( sessionStorage.getItem("currentUser")).id;
       channelType= this.selectFriendId;
        var now=new Date().getTime();
       if(this.selectedChat.channelType=="G"){
          if (typeof(msg.msgType)!='undefined'){
          const msgType=msg.msgType;
          const contentText = msg.content;
         var data = {
             fromId: parseInt(loginUser_id),
                fromType: "group",
                  msgContent: {
                    arn: "arn",
                    durationTime: nows,
                    extras: "extras",
                    fileSize: 2,
                    format: "format",
                    height: 5,
                    mediaCrc32: "mediaCrc32",
                    mediaId: msg.oldName,
                    text: msg.content,
                    width: 5
                  },
                msgType: msg.msgType,
                targetId:parseInt(channelType),
                targetType: "custom",
                 model: 1,
                version: 0
              }
          }
          co(function*() {
            var retvalue = yield clientiot.messages.messagesPublic(JSON.stringify(data));
             console.log("群发文件:"+retvalue);
               var dataArr=JSON.parse(retvalue);
             if(msg.msgType=='image'){
                var message={content:msg.filePath,msgType:msg.msgType,UploadStore:true,msgID:msg.msgID,filePath:msg.filePath,date:nows,filename:msg.oldName,fileSize:msg.fileSize,
                message_key:dataArr.data.message_key,
                theme_key:dataArr.data.theme_key,target_id:dataArr.data.targetId
              }
             }else{
                var message={content:msg.oldName,msgType:msg.msgType,UploadStore:true,msgID:msg.msgID,filePath:msg.filePath,date:nows,filename:msg.oldName,fileSize:msg.fileSize,
                message_key:dataArr.data.message_key,
                theme_key:dataArr.data.theme_key,target_id:dataArr.data.targetId
              }
             }

            if(dataArr.success==true){
               me.$store.dispatch("sendMessage", message);
            }
          })

       }else{
          if (typeof(msg.msgType)!='undefined'){
          const msgType=msg.msgType;
          const contentText = msg.content;
         var data = {
              fromId: parseInt(loginUser_id),
              fromType: "user",
              msgType:msgType,
              targetId: parseInt(channelType),
              targetType: "single",
              dataUrl:'',
               model: 1,
              msgContent: {
                  arn: "arn",
                  durationTime:nows,
                  extras: "extras",
                  fileSize: 2,
                  format: "format",
                  height: 5,
                  mediaCrc32: "mediaCrc32",
                  mediaId: msg.oldName,
                  text: contentText,
                  width: 5
              }
          }
          co(function*() {
            var retvalue = yield clientiot.messages.messagesPrivate(JSON.stringify(data));
             var dataArr=JSON.parse(retvalue);
             console.log("个人发文件:"+retvalue);
              if(msg.msgType=='image'){
                var message={content:msg.filePath,msgType:msg.msgType,UploadStore:true,msgID:msg.msgID,filePath:msg.filePath,date:nows,filename:msg.oldName,fileSize:msg.fileSize,
                message_key:dataArr.data.message_key,
                theme_key:dataArr.data.theme_key,target_id:dataArr.data.targetId
              }
             }else{
                var message={content:msg.oldName,msgType:msg.msgType,UploadStore:true,msgID:msg.msgID,filePath:msg.filePath,date:nows,filename:msg.oldName,fileSize:msg.fileSize,
                message_key:dataArr.data.message_key,
                theme_key:dataArr.data.theme_key,target_id:dataArr.data.targetId
              }
             }

            if(dataArr.success==true){
               me.$store.dispatch("sendMessage", message);
            }
          })

        }
       }
    },
  },
  filters: {
       time(value){
            if (!value) {
                return value
            }

            if(parseInt(value).toString() != "NaN")
            {
                value=parseInt(value);
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
  created() {
    var me=this;
    me.$nextTick(() => {
        me.$refs.list.scrollTop = me.$refs.list.scrollHeight;
    });
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
.message {
    width: 100%;
    height: 75%;
    box-sizing: border-box;
    -webkit-user-select:text;/*webkit浏览器*/
    .header {
        height: 60px;
        width: 100%;
        line-height:60px;
        padding-left:30px;
        box-sizing: border-box;
        border-bottom: 1px solid #e7e7e7;
        .friendname {
            font-size: 18px;
            max-width:600px;
            height:100%;
            /*-webkit-app-region:drag;*/
            .friendnameSpan{
                width: 100%;
                font-weight :300;
                display: inline-block;
                p{
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }
        }

        .detailSetting {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 20px;
            cursor: pointer;
            -webkit-app-region: no-drag;
            -webkit-user-select:none;
        }
    }

    .message-wrapper {
        width: 100%;
        height: calc(100% - 60px);
        padding: 10px 15px;
        box-sizing: border-box;
        overflow-y: auto;
        -webkit-app-region: no-drag;
        .message {
            margin-bottom: 15px;
        }

        .time {
            width: 100%;
            font-size: 12px;
            margin: 7px auto;
            min-height: 20px;
            text-align: center;

            span {
                display: inline-block;
                padding: 4px 6px;
                color: #fff;
                border-radius: 3px;
                background-color: #dcdcdc;
                 max-width: 35%;
                word-spacing: initial;
                word-wrap: break-word;
            }
        }

        .main {
                display: flex; 
                flex-direction: row;
            .avatar {
                float: left;
                margin-left: 15px;
                border-radius: 3px;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            .hxNoCopy{
                -moz-user-select: none;  
                -webkit-user-select: none;  
                -ms-user-select: none;
                user-select: none;
            }
            .audio {
                display: inline-block;
                margin-left: 10px;
                position: relative;
                max-width: 300px;
                min-height: 36px;
                line-height: 24px;
                box-sizing: border-box;
                font-size: 14px;
                text-align: left;
                word-break: break-all;
                border-radius: 4px;
                &:before {
                    content: ' ';
                    position: absolute;
                    top: 12px;
                    right: 100%;
                    border: 6px solid transparent;
                    border-right-color: #fafafa;
                }
            }

            .content {
                display: inline-block;
                margin-left: 10px;
                position: relative;
                padding: 6px 10px;
                max-width: 300px;
                min-height: 36px;
                line-height: 24px;
                box-sizing: border-box;
                font-size: 14px;
                text-align: left;
                word-break: break-all;
                background-color: #fafafa;
                border-radius: 4px;

                &:before {
                    content: ' ';
                    position: absolute;
                    top: 12px;
                    right: 100%;
                    border: 6px solid transparent;
                    border-right-color: #fafafa;
                }
            }
             .content_image {
                display: inline-block;
                margin-left: 10px;
                position: relative;
                padding: 6px 10px;
                max-width: 300px;
                min-height: 36px;
                line-height: 24px;
                box-sizing: border-box;
                font-size: 14px;
                text-align: left;
                word-break: break-all;
                background-color: #fafafa;
                border-radius: 4px;

                &:before {
                    content: ' ';
                    position: absolute;
                    top: 12px;
                    right: 100%;
                    border: 6px solid transparent;
                    border-right-color: #fafafa;
                }
            }
             .content_file {
                display: inline-block;
                margin-left: 10px;
                position: relative;
                padding: 6px 10px;
                max-width: 300px;
                min-height: 36px;
                line-height: 24px;
                box-sizing: border-box;
                font-size: 14px;
                text-align: left;
                word-break: break-all;
                background-color: white;
                border-radius: 4px;

                &:before {
                    content: ' ';
                    position: absolute;
                    top: 12px;
                    right: 100%;
                    border: 6px solid transparent;
                    border-right-color: white;
                }
                &:hover{
                     background-color:  #fafafa;
                }
            }
        }

        .self {
            text-align: right;
            flex-direction: row-reverse;
            .avatar {
                float: right;
                margin: 0 10px;
            }

            .content {
                background-color: #b2e281;

                &:before {
                    right: -12px;
                    vertical-align: middle;
                    border-right-color: transparent;
                    border-left-color: #b2e281;
                }
            }
             .content_image {
                background-color: #fafafa;

                &:before {
                    right: -12px;
                    vertical-align: middle;
                    border-right-color: transparent;
                    border-left-color: #fafafa;
                }
            }
            .content_file {
                background-color: white;

                &:before {
                    right: -12px;
                    vertical-align: middle;
                    border-right-color: transparent;
                    border-left-color:white;
                }
                 &:hover{
                     background-color:  #fafafa;
                }
            }
        }
    }
}

.settingBox {
    position: absolute;
    width: 200px;
    height: 92%;
    background-color: #f5f5f5;
    top: 8%;
    right: 0px;
    z-index: 1;
    border: 1px solid #d1d1d1;
    box-shadow: 0 2px 4px 2px #d1d1d1;
    padding: 30px 20px;

    ul {
        float: left;
        width: 100%;
        border-bottom: 1px solid #d1d1d1;
        padding-bottom: 20px;

        li {
            float: left;
            width: 25%;
            text-align: center;

            span {
                display: inline-block;
                margin-top: 8px;
                font-size: 12px;
            }
        }

        .userMessage {
            img {
                width: 36px;
            }
        }

        .addUser {
            cursor: pointer;

            div {
                text-align: center;
                width: 36px;
                height: 36px;
                font-size: xx-large;
                border: 1px solid #d1d1d1;
                margin: 0 auto;
            }
        }
    }

    .settingSwitch {
        float: left;
        width: 100%;

        p {
            margin: 10px 0 10px 0;
        }
    }

    .userList {
        position: absolute;
        left: -400px;
        background-color: white;
    }
}

.el-icon-download {
    &:hover {
        color: #1aad19;
        cursor: pointer
    }
}

.attach-file {
    margin-top: 3px;
    margin-left: 2px;
    width: 280px;
    /*height: 64px;*/
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
        height: 64px;
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

.messageImg {
    max-width: 150px;
    max-height :113px;
    &:hover {
        cursor: pointer
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

#bigimg {
    position: fixed;
    box-sizing: border-box;
    top: 8%;
    left: 10%;
    background-color: #ccc;
    z-index: 2;
    width: 400px;
    border: 1px solid #ccc;
    overflow: hidden;

    img {
        width: 100%;
    }

    #closeImg {
        width: 100%;
        height: 25px;
        background-color: rgba(196, 196, 196, 0.4);

        &:hover {
            background-color: rgba(196, 196, 196, 0.4);
        }

        span {
            float: right;
            display: inline-block;
            width: 25px;
            height: 25px;
            line-height: 25px;
            color: #000;
            text-align: center;
            font-size: xx-large;
            background-color: rgba(196, 196, 196, 0);

            &:hover {
                background-color: #e4393c;
                color: white;
                cursor: pointer;
            }
        }
    }
    
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
.msgUserName{
    color: #999;
    position: relative;
    left: 10px;
    bottom: 5px;
    font-size :.8em;
}
.Setimagesize{  
    max-height: 113px;
}
.Setimagesize:nth-child(0){
    max-width:200px;
    background:red
} 
.hx-FailedtoBox{
    display:inline-block; 
}
.FailedtoSend{
    background: #d9d9d9;
    width: 30px;
    height: 30px;
    display: inline-block;
    text-align: center;
    /* margin: auto; */
    line-height: 30px;
    border-radius: 50%;
}
.filename{
    width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.openVideo{
    margin-right 15px
    &:hover {
        color: #1aad19;
        cursor: pointer
    }
}
.hx-video{
    &:hover {
        cursor: pointer
    }
}
.messageTime{
    font-size:13px !important;
    span{
        font-family: unset;
        padding: 5px 10px !important;
    }
}
._v-container{
    -webkit-tap-highlight-color: rgba(0,0,0,0);
    width: 100%;
    height: 100%; 
    overflow: hidden;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
}
 .slide-right-enter-active,
    .slide-right-leave-active,
    .slide-left-enter-active,
    .slide-left-leave-active {
        will-change: transform;
        transition: all .3s;
        position: absolute;
        width:100%;
        left:0;
    }
    .slide-right-enter {
        transform: translateX(-100%);
    }
    .slide-right-leave-active {
        transform: translateX(100%);
    }
    .slide-left-enter {
        transform: translateX(100%);
    }
    .slide-left-leave-active {
        transform: translateX(-100%);
    }
.getShou{
    &:hover {
        color: #1aad19;
        cursor: pointer
    }
} 
.hx-viedo{
    &:hover {
        cursor: pointer
    }
}
.openVideoParent{
    position: absolute;
    color: white;
    bottom: 15px;
    right: 0;
    margin-right 2s0px
}
.audioTag{
    width:265px
}
    .text {
        white-space: pre-line;
    }
.hx-messageBox{
    word-wrap: break-word;
    word-break: normal;
}
.hx-messageBox span:nth-child(1){
    display:none;
}
.hx-messageBox >>> span{
  background-color: inherit!important;
}
.hx-messageBox >>>img{
    vertical-align:middle; 
}
.hx-messageBox >>>myblot{
    display: inline-flex;
}
.atStyle{
    position: absolute;
    bottom:180px;
    right: 40px;
    width: 130px;
    height: 30px;
    text-align: center;
    line-height: 30px;
    color: green;
    background-color: white;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
}
.atStyle span.atSpan{
        border-left: 1px solid #ccc;
        padding-left: 8px;
        margin-left: 8px;
}
.element::-webkit-scrollbar { width: 0 !important }
.messTips{
    width:155px;
}
</style>
