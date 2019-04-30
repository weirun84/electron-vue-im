<template>
	<div class="content">
		<div class="msglist">
			<div style="display:flex;align-items:center;height:60px;">
				<chatSearch></chatSearch>
				<!-- 添加群组 -->
				<div class="search-addPart no-drag" @click="controlShow"></div>
					<!-- 下拉框 -->
				<div class="selectpart" v-show="addthing||NewPersonnel">
					
				</div>
				<div class="hx-selectpart" v-show="addthing||NewPersonnel">
					<addPart @showToggle="isShow"></addPart>
				</div>
			</div>
		<!-- 会话列表 --> 
				<chatlist @groupList="groupData"></chatlist> 
		</div>
		<!-- 消息框 -->
		<div class="chatbox" id="DragUpload" v-if="disPlayChatboxs">
			<message></message>
			<v-text></v-text> 
		</div> 
		<div class="chatbox" v-else>
			<version></version>
		</div>
		<div class="msglist" v-show="getGoupdisplay" style="background-color:white;border-left: 1px solid rgb(242, 242, 242);">
			 <Groupinfo></Groupinfo>
		</div>
	</div>
</template>

<script>
import chatSearch from '../../components/search/chatSearch'
import chatlist from '../../components/chatlist/chatlist'
import Groupinfo from '../../components/chatlist/partlist'
import message from '../../components/message/message'
import vText from '../../components/text/text'
import addPart from '../../components/addPart/addPart'
import version from '../../components/LandingPage/LandingPage' 
import { mapState, mapActions ,mapGetters } from 'vuex';
import { setTimeout, setInterval } from 'timers';  
import Events from '../../api/eventBus.js';
const clientiot = require("@hxim/clientiot");
var co = require('co');
var messKey='1111';//消息Key
var noticKey='9527';//通知Key
const ipcRenderer = require('electron').ipcRenderer;
    import { MessageBox } from 'element-ui';
var data;  
export default { 
   components: {chatSearch,chatlist,message,vText,addPart,version,Groupinfo},
   
	 computed: {
		...mapState(["chatlistText","NewPersonnel","Windowclosure","banId",'disPlayChatboxs','disPlayVersion']), 
		...mapGetters(["searchedChatlist"])
	 },
	 mounted() {
		var me = this;
		var now = new Date();
		var userInfo=JSON.parse(sessionStorage.getItem('currentUser'));
        var userId = parseInt(userInfo.id);
       
		 Events.$on('DisplayDetails',data=>{
               me.getGoupdisplay=data
                var detailSetting=document.getElementById('detailSetting');
			   if(data==false&&detailSetting!=null){
				    detailSetting.style.right='15px'
			   }
         })

         //本地服务器消息
         clientiot.globalinfo.regNetServer(function (res) {
             console.log(res);
         });

         //乔园的接口
         clientiot.socketService.instance();
         clientiot.socketService.subscribeEvent('online', function (msg) {
             console.log("socketService:" + msg);
             if (msg === "out") {
                 //todo:被踢下线
                 ipcRenderer.send("MAINWIN:msgWin", JSON.stringify({ title: "下线通知", message: "该账号已在另一台设备登录，请确认是否本人操作", type: "warning", loginOut: true }));
             }
         })

         ipcRenderer.on('MqttContent', function (event, arg, topic) {
			console.log("MqttContent"+arg);
			const rest=JSON.parse(arg)
             if (rest.msg_type && rest.msg_key != me.$store.state.noticKey) {
                 if (rest.operate_user_id != userId) {
                     var chatID = me.$store.state.chatlist.find((values) => (values.id === rest.operate_user_id))
                     if (chatID != undefined) {
                         if (chatID.Immunity == false) {
                             ipcRenderer.send('MAINWIN:flashFrame', chatID.user.name)
                         }
                     }
                 }
                 me.$store.state.noticKey = rest.msg_key;
                 rest.operate_time = Date.parse(rest.operate_time);
                 //通知消息 - 建群
                 if (rest.msg_type == 1) {

                     co(function* () {
                         let userName = JSON.parse(yield clientiot.employees.getEmployeesEid(rest.operate_user_id));
                         if (userName.success == true) {
                             var result = {
                                 Immunity: false,//免扰状态
                                 id: rest.msg_content.group_info.group_id,
                                 user: {
                                     name: rest.msg_content.group_info.group_name,
                                     img: 'static/images/group.png'
                                 },
                                 messages: [{
                                     content: userName.data.fullname + '建立了群聊',
                                     date: rest.operate_time,
                                     msgType: 'notic'
                                 }],
                                 index: 0,  // 当前在聊天列表中的位置,从1开始
                                 channelType: 'G'
                             };
                             me.$store.state.chatlist.unshift(result);
                             for (let i = 0; i < me.$store.state.chatlist.length; i++) {
                                 me.$store.state.chatlist[i].index = i;
                             }
                             me.$store.state.selectId = me.$store.state.selectId + 1;
                             ////将接收消息的会话上移
                             //me.$store.dispatch("topMessage", result);
                         }
                     })
                     setTimeout(function () {
                         console.log("准备开始获取用户所有群信息");
                         clientiot.http.getUserAllGroup(userId).then(allGroup => {
                             console.log("allGroup:" + allGroup);
                         })
                     }, 200)

                 } else if (rest.msg_type == 2) {
                     //通知消息--邀请入群
                     let syGroup = me.$store.state.chatlist.find(syGroups => syGroups.id === rest.msg_content.add_mem.group_id);
                     let addIdArr = rest.msg_content.add_mem.members;
                     if (syGroup == undefined) {
                         co(function* () {
                             let retvalue = JSON.parse(yield clientiot.groups.getGroupsByGid(rest.msg_content.add_mem.group_id));
                             if (retvalue.success == true) {
                                 var result = {
                                     id: retvalue.data.group_id,
                                     Immunity: false,//免扰状态
                                     user: {
                                         name: retvalue.data.group_name,
                                         img: 'static/images/group.png'
                                     },
                                     messages: [{
                                         content: '你加入了群聊',
                                         date: rest.operate_time,
                                         msgType: 'notic'
                                     }],
                                     index: 0,  // 当前在聊天列表中的位置,从1开始
                                     channelType: 'G'
                                 };

                                 me.$store.state.chatlist.unshift(result);
                                 for (let i = 0; i < me.$store.state.chatlist.length; i++) {
                                     me.$store.state.chatlist[i].index = i;
                                 }
                                 me.$store.state.selectId = me.$store.state.selectId + 1;

                                 //将接收消息的会话上移
                                 me.$store.dispatch("topMessage", result);
                             }
                         })
                     } else {
                         var getNameArr = [];
                         let operateUser;
                         co(function* () {
                             for (let i = 0; i < addIdArr.length; i++) {
                                 let userName = JSON.parse(yield clientiot.employees.getEmployeesEid(addIdArr[i]));
                                 if (userName.success == true) {
                                     getNameArr.push(userName.data.fullname);
                                 }
                                 let operateName = JSON.parse(yield clientiot.employees.getEmployeesEid(rest.operate_user_id));
                                 if (operateName.success == true) {
                                     operateUser = operateName.data.fullname;
                                 }
                             }
                             let addNameStr = getNameArr.join("，");
                             syGroup.messages.push({
                                 content: '"' + operateUser + '"' + '邀请' + '"' + addNameStr + '"' + '进入了群聊',
                                 date: rest.operate_time,
                                 msgType: "notic"
                             })
                         })

                         //将接收消息的会话上移
                         me.$store.dispatch("topMessage", syGroup);
                     }

                     setTimeout(function () {
                         console.log("准备开始获取用户所有群信息");
                         clientiot.http.getUserAllGroup(userId).then(allGroup => {
                             console.log("allGroup:" + allGroup);
                         })
                     }, 200)

                 } else if (rest.msg_type == 3) {
                     // 通知消息 -- 踢出群成员
                     let rmDatas = rest.msg_content.remove_mem.members.find(rmDatas => rmDatas === userId);
                     let rmGroup = me.$store.state.chatlist.find(syGroups => syGroups.id === rest.msg_content.remove_mem.group_id);
                     if (rmDatas == undefined) {
                         let removeIdArr = rest.msg_content.remove_mem.members;
                         var reNameArr = [];
                         co(function* () {
                             for (let i = 0; i < removeIdArr.length; i++) {
                                 let userName = JSON.parse(yield clientiot.employees.getEmployeesEid(removeIdArr[i]));
                                 if (userName.success == true) {
                                     reNameArr.push(userName.data.fullname)
                                 }
                             }
                             let removeNameStr = reNameArr.join(",");
                             rmGroup.messages.push({
                                 content: '"' + removeNameStr + '"' + '已被移出群聊',
                                 date: rest.operate_time,
                                 msgType: "notic"
                             })
                         })
                     } else {
                         me.$store.dispatch("delChatlist", rmGroup);
                     }

                     //将接收消息的会话上移
                     me.$store.dispatch("topMessage", rmGroup);

                     setTimeout(function () {
                         console.log("准备开始获取用户所有群信息");
                         clientiot.http.getUserAllGroup(userId).then(allGroup => {
                             console.log("allGroup:" + allGroup);
                         })
                     }, 200)

                 } else if (rest.msg_type == 4) {
                     // 通知消息 -- 主动退群
                     let initiativeGroup = me.$store.state.chatlist.find(syGroups => syGroups.id === rest.msg_content.group_id);
                     co(function* () {
                         let getFormInfo = JSON.parse(yield clientiot.employees.getEmployeesEid(rest.operate_user_id));
                         if (getFormInfo.success && initiativeGroup != undefined) {
                             // 获取本地数据，名称
                             initiativeGroup.messages.push({
                                 content: '"' + getFormInfo.data.fullname + '"' + '退出了群聊',
                                 date: rest.operate_time,
                                 msgType: "notic"
                             })
                         }
                     })

                     //将接收消息的会话上移
                     me.$store.dispatch("topMessage", initiativeGroup);

                     setTimeout(function () {
                         console.log("准备开始获取用户所有群信息");
                         clientiot.http.getUserAllGroup(userId).then(allGroup => {
                             console.log("allGroup:" + allGroup);
                         })
                     }, 200)

                 } else if (rest.msg_type == 5) {
                     // 通知消息 -- 禁言，与页面互动
                     let banGroup = me.$store.state.chatlist.find(syGroups => syGroups.id === rest.msg_content.ban_mem.group_id);
                     let banIdArr = rest.msg_content.ban_mem.members;
                     let banNameStr = banIdArr.join(",");
                     //将接收消息的会话上移
                     me.$store.dispatch("topMessage", banGroup);
                     // 获取本地数据，名称
                     if (rest.msg_content.ban_mem.flag == 0) {
                         banGroup.messages.push({
                             content: "禁言已解除",
                             date: rest.operate_time,
                             msgType: "notic"
                         })
                         // Events.$emit('Banned',false)
                     } else {
                         banGroup.messages.push({
                             content: "本群已开启禁言",
                             date: rest.operate_time,
                             msgType: "notic"
                         })
                         // Events.$emit('Banned',true)
                     }

                 } else if (rest.msg_type == 6) {
                     // 群公告修改，与页面互动________[success]
                     let infoGroup = me.$store.state.chatlist.find(syGroups => syGroups.id === rest.msg_content.group_info.group_id);
                     var infoStrs = rest.msg_content.group_info.proclamation;
                     // 获取本地数据，修改群公告
                     co(function* () {
                         let getFormInfo = JSON.parse(yield clientiot.employees.getEmployeesEid(rest.operate_user_id));
                         if (getFormInfo.success) {
                             infoGroup.messages.push({
                                 content: '"' + getFormInfo.data.fullname + '"' + '将群公告修改为:' +  infoStrs,
                                 date: rest.operate_time,
                                 msgType: "notic"
                             })

                         }

                     })

                     //将接收消息的会话上移
                     me.$store.dispatch("topMessage", infoGroup);

                 } else if (rest.msg_type == 7) {
                     // 群名称修改，与页面互动_____[success]
                     let modifyGroupName = me.$store.state.chatlist.find(syGroups => syGroups.id === rest.msg_content.group_info.group_id);
                     let infoStr = rest.msg_content.group_info.group_name;
                     // 获取本地数据，修改群名称
                     co(function* () {
                         let getFormInfo = JSON.parse(yield clientiot.employees.getEmployeesEid(rest.operate_user_id));
                         if (getFormInfo.success) {
                             me.$store.dispatch('modifyName', rest);
                             modifyGroupName.messages.push({
                                 content: '"' + getFormInfo.data.fullname + '"' + '将群名称修改为' + '"' + infoStr + '"',
                                 date: rest.operate_time,
                                 msgType: "notic"
                             })
                         }
                     })

                     //将接收消息的会话上移
                     me.$store.dispatch("topMessage", modifyGroupName);

                 } else if (rest.msg_type == 8) {
                     // 群主转让，走接口
                     let lordTransfer = me.$store.state.chatlist.find(syGroups => syGroups.id === rest.msg_content.group_info.group_id);
                     let oldOwn = rest.msg_content.group_info.old_own_id;
                     let newOwn = rest.msg_content.group_info.new_own_id;
                     // 获取本地数据，修改群名称
                     co(function* () {
                         let oldGetFormInfo = JSON.parse(yield clientiot.employees.getEmployeesEid(oldOwn));
                         if (oldGetFormInfo.success == true) {
                             let newGetFormInfo = JSON.parse(yield clientiot.employees.getEmployeesEid(newOwn));
                             if (newGetFormInfo.success == true) {
                                 lordTransfer.messages.push({
                                     content: '"' + oldGetFormInfo.data.fullname + '"' + '将群主转让给' + '"' + newGetFormInfo.data.fullname + '"',
                                     date: rest.operate_time,
                                     msgType: "notic"
                                 })
                             }
                         }
                     })

                     //将接收消息的会话上移
                     me.$store.dispatch("topMessage", lordTransfer);

                 } else if (rest.msg_type == 9) {
                     // 文件下载失败
                     let fileErr = me.$store.state.chatlist.find(syGroups => syGroups.id === rest.msg_content.err_file_info.target_id);
                     let errFileName = rest.msg_content.err_file_info.file_name;
                     fileErr.messages.push({
                         content: "文件" + '"' + errFileName + '"' + "下载失败，请重试",
                         date: rest.operate_time,
                         msgType: "notic"
                     })
                 } else if (rest.msg_type == 10) {
                     // 消息撤回
                     let operateId;
                     rest.msg_content.target_type == "USER" ? operateId = rest.msg_content.user_id : operateId = rest.msg_content.target_id;
                     let retract = me.$store.state.chatlist.find(items => items.id === operateId);
                     if (retract != undefined) {
                         co(function* () {
                             let getFormInfo = JSON.parse(yield clientiot.employees.getEmployeesEid(rest.msg_content.user_id));
                             if (getFormInfo.success == true) {
                                 let noticName;
                                 if (userId == rest.operate_user_id) {
                                     noticName = '你'
                                 } else {
                                     noticName = getFormInfo.data.fullname
                                 }

                                 clientiot.localData.messageRevoke(rest.msg_content.msg.message_key).then(function (res) {
                                     console.log(res);
                                 })


                                 rest.noticName = noticName;
                                 me.$store.dispatch("delMessage", rest)
                             }
                         })
                     }
                 } else if (rest.msg_type == 11) {
                     // 登录挤下线消息
                     //me.$alert('该账号已在另一台设备登录，请确认是否本人操作', '下线通知', {
                     //	confirmButtonText: '确定',
                     //	callback: action => {
                     //		me.$router.push({ path: "/login" });
                     //		sessionStorage.clear();
                     //	}
                     //});
                     ipcRenderer.send("MAINWIN:msgWin", JSON.stringify({ title: "下线通知", message: "该账号已在另一台设备登录，请确认是否本人操作", type: "warning", loginOut: true }));
                 } else if (rest.msg_type == 12) {
                     // 解散群
                     let disbandGroup = me.$store.state.chatlist.find(syGroups => syGroups.id === rest.msg_content.msg.group_id);
                     if (disbandGroup == undefined) {
                         console.log("群解散了");
                     } else {
                         me.$store.dispatch("delChatlist", disbandGroup)
                     }
                 }
             }
             else if (rest.message_key&&me.$store.state.messKey != rest.message_key && !rest.msg_key) {
                 me.$store.state.messKey = rest.message_key;
                 if (rest.msgBody.msgContent.fileSize) {
                     let size = rest.msgBody.msgContent.fileSize;
                     if (size < 1024) {
                         rest.msgBody.msgContent.fileSize = String(size) + "B";
                     } else if (size > 1024 && size < (1024 * 1024)) {
                         rest.msgBody.msgContent.fileSize = String((rest.msgBody.msgContent.fileSize / 1024).toFixed(2)) + "KB";
                     } else if (size > (1024 * 1024)) {
                         rest.msgBody.msgContent.fileSize = String((rest.msgBody.msgContent.fileSize / 1024 / 1024).toFixed(2)) + "MB";
                     }
                 }
                 if (rest.msgBody.msgContent.text.indexOf("http:") != -1 || rest.msgBody.msgContent.text.indexOf("https:") != -1) {
                     // if (rest.msgBody.msgContent.text.indexOf(".gif") != -1 || rest.msgBody.msgContent.text.indexOf(".bmp") != -1 || rest.msgBody.msgContent.text.indexOf(".jpg") != -1 || rest.msgBody.msgContent.text.indexOf(".jpge") != -1 || rest.msgBody.msgContent.text.indexOf(".png") != -1) {
                     // 	rest.msgType = 'image';
                     // } else { 
                     rest.msgType = 'http';
                     // }   
                 } else {
                     rest.msgType = rest.msgType;
                 }
                 // if(rest.msgType!="text"&&rest.msgType != "http"){
                 // 	var restText = rest.msgBody.msgContent.text;
                 // 	var restMedia = rest.msgBody.msgContent.mediaId;
                 // 	rest.msgBody.msgContent.text = restMedia;
                 // 	rest.msgBody.msgContent.mediaId = restText;
                 // }
                 rest.message_time = Date.parse(rest.message_time)

                 if (rest.fromId != userId) {
                     var iconFlash = null;

                     if (rest.targetType === "custom") {
                         iconFlash = me.$store.state.chatlist.find(icons => icons.id === rest.targetId && icons.channelType === "G");
                     }
                     else {
                         iconFlash = me.$store.state.chatlist.find(icons => icons.id === rest.fromId && icons.channelType === "P");
                     }
                     if (iconFlash) {
                         if (iconFlash.Immunity == false && (rest.msgType == "text" || rest.msgType == "file" || rest.msgType == "http")) {
                             ipcRenderer.send('MAINWIN:flashFrame', iconFlash.user.name)
                         }
                     } else {
                         ipcRenderer.send('MAINWIN:flashFrame')
                     }


                     //个人消息
                     if (rest.fromType == 'user') {
                         Events.$emit("newMess", rest.fromId);
                         var result = me.$store.state.chatlist.find(msg => msg.id === rest.fromId)
                         if (!result || result == undefined) {
                             if (rest.fromId != userId) {
                                 co(function* () {
                                     var getFormInfo = JSON.parse(yield clientiot.employees.getEmployeesEid(rest.fromId));
                                     if (getFormInfo.success == true) {
                                         for (let i = 0; i < me.$store.state.chatlist.length; i++) {
                                             me.$store.state.chatlist[i].index = (i + 1);
                                         }
                                         if (rest.msgType == "text" || rest.msgType == "file" || rest.msgType == "video" || rest.msgType == "http") {
                                             me.$store.state.chatlist.unshift({
                                                 id: parseInt(getFormInfo.data.employeeNo),
                                                 Immunity: false,//免扰状态  
                                                 user: {
                                                     name: getFormInfo.data.fullname,
                                                     img: getFormInfo.data.images_url,
                                                     code: getFormInfo.data.username
                                                 },
                                                 messages: [
                                                     {
                                                         fromId: rest.fromId,
                                                         content: rest.msgBody.msgContent.text,
                                                         date: rest.message_time,
                                                         messageKeys: rest.message_key,
                                                         localTime: rest.msgBody.localTime,
                                                         msgType: rest.msgType,
                                                         fileSize: rest.msgBody.msgContent.fileSize,
                                                         filename: (rest.msgBody.msgContent.mediaId == 'mediaId') ? rest.msgBody.msgContent.text : rest.msgBody.msgContent.mediaId,
                                                         oldname: (rest.msgBody.msgContent.mediaId == 'mediaId') ? rest.msgBody.msgContent.text : rest.msgBody.msgContent.mediaId,  //聊天内容
                                                     }
                                                 ],
                                                 index: 0,  // 当前在聊天列表中的位置,从1开始
                                                 channelType: 'P'
                                             })
                                         } else if (rest.msgType == "image" || rest.msgType == "audio" || rest.msgType == "voice") {
                                             /*从S3下载文件*/
                                             var imgMessage = '';
                                             if (rest.msgType == "voice") {
                                                 imgMessage = rest.msgBody.msgContent.mediaId + rest.msgBody.msgContent.format;
                                             } else {
                                                 imgMessage = rest.msgBody.msgContent.mediaId;
                                             }

                                             me.$store.state.chatlist.unshift({
                                                 Immunity: false,//免扰状态
                                                 id: parseInt(getFormInfo.data.employeeNo),
                                                 user: {
                                                     name: getFormInfo.data.fullname,
                                                     img: getFormInfo.data.images_url,
                                                     code: getFormInfo.data.username
                                                 },
                                                 messages: [
                                                     {
                                                         fromId: rest.fromId,
                                                         content: rest.msgBody.msgContent.text,
                                                         S3Key: imgMessage,
                                                         messageKeys: rest.message_key,
                                                         date: rest.message_time,
                                                         localTime: rest.msgBody.localTime,
                                                         msgType: rest.msgType,
                                                         msgID: rest.message_time,
                                                         filePath: "",
                                                         filename: rest.msgBody.msgContent.text,
                                                         oldname: rest.msgBody.msgContent.text
                                                     }
                                                 ],
                                                 index: 0,  // 当前在聊天列表中的位置,从1开始
                                                 channelType: 'P'
                                             })

                                         }
                                         //将接收消息的会话上移
                                         me.$store.dispatch("topMessage", me.$store.state.chatlist[0]);
                                         me.$store.state.selectId++;
                                     }
                                 });
                             }

                         }
                         else {
                             if (rest.msgType == "text" || rest.msgType == "file" || rest.msgType == "video" || rest.msgType == "http") {
                                 result.messages.push({
                                     fromId: rest.fromId,
                                     content: rest.msgBody.msgContent.text,  //聊天内容
                                     messageKeys: rest.message_key,
                                     date: rest.message_time,  //时间
                                     msgType: rest.msgType,
                                     fileSize: rest.msgBody.msgContent.fileSize,
                                     filename: (rest.msgBody.msgContent.mediaId == 'mediaId') ? rest.msgBody.msgContent.text : rest.msgBody.msgContent.mediaId,
                                     oldname: (rest.msgBody.msgContent.mediaId == 'mediaId') ? rest.msgBody.msgContent.text : rest.msgBody.msgContent.mediaId,  //聊天内容
                                 })
                             } else if (rest.msgType == "image" || rest.msgType == "audio" || rest.msgType == "voice") {
                                 /*从S3下载文件*/
                                 if (rest.msgBody.msgContent.text.indexOf("http:") != -1 || rest.msgBody.msgContent.text.indexOf("https:") != -1) {
                                     result.messages.push(
                                         {
                                             fromId: rest.fromId,
                                             content: rest.msgBody.msgContent.text,
                                             httpImg: rest.msgBody.msgContent.text,
                                             messageKeys: rest.message_key,
                                             date: rest.message_time,
                                             msgID: rest.message_time,
                                             msgType: rest.msgType,
                                             filePath: rest.msgBody.msgContent.text,
                                             filename: (rest.msgBody.msgContent.mediaId == 'mediaId') ? rest.msgBody.msgContent.text : rest.msgBody.msgContent.mediaId,
                                         }
                                     )
                                 } else {
                                     var imgMessage = '';
                                     if (rest.msgType == "voice") {
                                         imgMessage = rest.msgBody.msgContent.mediaId + rest.msgBody.msgContent.format;
                                     } else {
                                         imgMessage = rest.msgBody.msgContent.mediaId;
                                     }

                                     result.messages.push(
                                         {
                                             fromId: rest.fromId,
                                             content: rest.msgBody.msgContent.text,
                                             S3Key: imgMessage,
                                             messageKeys: rest.message_key,
                                             date: rest.message_time,
                                             msgID: rest.message_time,
                                             msgType: rest.msgType,
                                             filePath: '',
                                             filename: rest.msgBody.msgContent.text,
                                             oldname: rest.msgBody.msgContent.text
                                         }
                                     )
                                 }
                             }
                             //将接收消息的会话上移
                             me.$store.dispatch("topMessage", result);

                         }
                     }
                     else {
                         Events.$emit("newMess", rest.targetId);
                         //群组消息
                         let groupRes = me.$store.state.chatlist.find(msg => msg.id === rest.targetId)
                         // 会话列表中不存在该群
                         if (groupRes == undefined) {
                             let AtPoples = rest.msgBody.msgContent.AtPoples;
                             var AM = false;
                             var atAll = false;
                             if (AtPoples && AtPoples.length > 0) {
                                 for (let a = 0; a < AtPoples.length; a++) {
                                     if (AtPoples[a].memberEId && AtPoples[a].memberEId == userId) {
                                         var AM = true
                                     }
                                     if (AtPoples[a].AtALL) {
                                         atAll = AtPoples[a].AtALL;
                                     }
                                 }
                             };
                             co(function* () {
                                 let getGroupInfo = JSON.parse(yield clientiot.groups.getGroupsByGid(rest.targetId));
                                 if (getGroupInfo.success == true) {
                                     let groupFromName;
                                     let groupFromImg;
                                     for (let j = 0; j < getGroupInfo.data.members.length; j++) {
                                         if (getGroupInfo.data.members[j].memberEId == rest.fromId) {
                                             groupFromName = getGroupInfo.data.members[j].memberName;
                                             groupFromImg = getGroupInfo.data.members[j].images_url;
                                         }
                                     }
                                     for (let i = 0; i < me.$store.state.chatlist.length; i++) {
                                         me.$store.state.chatlist[i].index = (i + 1);
                                     }
                                     if (rest.msgType == "text" || rest.msgType == "file" || rest.msgType == "video" || rest.msgType == "http") {
                                         me.$store.state.chatlist.unshift({
                                             id: getGroupInfo.data.group_id,
                                             Immunity: false,//免扰状态
                                             AtPoples: AM,
                                             atAll: atAll,
                                             user: {
                                                 name: getGroupInfo.data.group_name,
                                                 img: 'static/images/group.png'
                                             },
                                             messages: [{
                                                 fromId: rest.fromId,
                                                 content: rest.msgBody.msgContent.text,
                                                 messageKeys: rest.message_key,
                                                 date: rest.message_time,
                                                 msgType: rest.msgType,
                                                 fileSize: rest.msgBody.msgContent.fileSize,
                                                 msgUserName: groupFromName,
                                                 msgUserImg: groupFromImg,
                                                 filePath: rest.data,
                                                 filename: (rest.msgBody.msgContent.mediaId == 'mediaId') ? rest.msgBody.msgContent.text : rest.msgBody.msgContent.mediaId,
                                                 oldname: (rest.msgBody.msgContent.mediaId == 'mediaId') ? rest.msgBody.msgContent.text : rest.msgBody.msgContent.mediaId,  //聊天内容
                                             }],
                                             index: 0,  // 当前在聊天列表中的位置,从1开始
                                             channelType: 'G'
                                         })
                                     } else if (rest.msgType == "image" || rest.msgType == "audio" || rest.msgType == "voice") {
                                         /*从S3下载文件*/
                                         var imgMessage = '';
                                         if (rest.msgType == "voice") {
                                             imgMessage = rest.msgBody.msgContent.mediaId + rest.msgBody.msgContent.format;
                                         } else {
                                             imgMessage = rest.msgBody.msgContent.mediaId;
                                         }

                                         me.$store.state.chatlist.unshift({
                                             id: getGroupInfo.data.group_id,
                                             Immunity: false,//免扰状态
                                             AtPoples: AM,
                                             atAll: atAll,
                                             user: {
                                                 name: getGroupInfo.data.group_name,
                                                 img: 'static/images/group.png'
                                             },
                                             messages: [{
                                                 fromId: rest.fromId,
                                                 S3Key: imgMessage,
                                                 content: rest.msgBody.msgContent.text,
                                                 messageKeys: rest.message_key,
                                                 date: rest.message_time,
                                                 msgType: rest.msgType,
                                                 msgID: rest.message_time,
                                                 msgUserName: groupFromName,
                                                 msgUserImg: groupFromImg,
                                                 filePath: "",
                                                 filename: rest.msgBody.msgContent.text,
                                                 oldname: rest.msgBody.msgContent.text
                                             }],
                                             index: 0,  // 当前在聊天列表中的位置,从1开始
                                             channelType: 'G'
                                         })


                                     }
                                     //将接收消息的会话上移
                                     me.$store.dispatch("topMessage", me.$store.state.chatlist[0]);
                                 }
                             })

                         } else {
                             var AtPoples = rest.msgBody.msgContent.AtPoples;
                             var atAll = false;
                             if (groupRes.AtPoples == true) {
                                 groupRes.AtPoples = true
                             } else {
                                 if (AtPoples && AtPoples.length > 0) {
                                     for (let a = 0; a < AtPoples.length; a++) {
                                         if (AtPoples[a].memberEId && AtPoples[a].memberEId == userId) {
                                             groupRes.AtPoples = true
                                         }
                                         if (AtPoples[a].AtALL) {
                                             groupRes.atAll = AtPoples[a].AtALL;
                                         }
                                     }
                                 };
                             }
                             co(function* () {
                                 let getGroupInfo = JSON.parse(yield clientiot.groups.getGroupsByGid(rest.targetId));
                                 if (getGroupInfo.success == true) {
                                     let groupFromName;
                                     let groupFromImg;
                                     for (let j = 0; j < getGroupInfo.data.members.length; j++) {
                                         if (getGroupInfo.data.members[j].memberEId == rest.fromId) {
                                             groupFromName = getGroupInfo.data.members[j].memberName;
                                             groupFromImg = getGroupInfo.data.members[j].images_url;
                                         }
                                     }
                                     if (rest.msgType == "text" || rest.msgType == "file" || rest.msgType == "video" || rest.msgType == "http") {
                                         groupRes.messages.push({
                                             fromId: rest.fromId,
                                             AtPoples: rest.msgBody.msgContent.AtPoples,
                                             content: rest.msgBody.msgContent.text,
                                             messageKeys: rest.message_key,
                                             localTime: rest.msgBody.localTime,
                                             date: rest.message_time,  //时间
                                             msgType: rest.msgType,
                                             fileSize: rest.msgBody.msgContent.fileSize,
                                             msgUserImg: groupFromImg,
                                             msgUserName: groupFromName,
                                             filePath: rest.data,
                                             filename: (rest.msgBody.msgContent.mediaId == 'mediaId') ? rest.msgBody.msgContent.text : rest.msgBody.msgContent.mediaId,
                                             oldname: (rest.msgBody.msgContent.mediaId == 'mediaId') ? rest.msgBody.msgContent.text : rest.msgBody.msgContent.mediaId,  //聊天内容
                                         })
                                     } else if (rest.msgType == "image" || rest.msgType == "audio" || rest.msgType == "voice") {
                                         /*从S3下载文件*/
                                         var imgMessage = '';
                                         if (rest.msgType == "voice") {
                                             imgMessage = rest.msgBody.msgContent.mediaId + rest.msgBody.msgContent.format;
                                         } else {
                                             imgMessage = rest.msgBody.msgContent.mediaId;
                                         }
                                         groupRes.messages.push({
                                             fromId: rest.fromId,
                                             S3Key: imgMessage,
                                             AtPoples: rest.msgBody.msgContent.AtPoples,
                                             content: rest.msgBody.msgContent.text,
                                             messageKeys: rest.message_key,
                                             localTime: rest.msgBody.localTime,
                                             date: rest.message_time,
                                             msgID: rest.message_time,
                                             msgType: rest.msgType,
                                             msgUserImg: groupFromImg,
                                             msgUserName: groupFromName,
                                             filePath: '',
                                             filename: rest.msgBody.msgContent.text,
                                             oldname: rest.msgBody.msgContent.text,  //聊天内容
                                         })

                                     }
                                     //将接收消息的会话上移
                                     me.$store.dispatch("topMessage", groupRes);
                                 }
                             })

                         }
                     }
                 }
             }
             else if(rest.message!=undefined) {
                 if (rest.message.state) {
                     //正在输入状态
                     if (rest.message.state < 10) {
                         Events.$emit("otherData", rest);
                     }
                     else if (rest.message.state == 10 && rest.targetId === userId) {
                         //发动消息给客户端
                         var netData = {
                             state: 11,
                             message: { ip: clientiot.utils.getIP(), local_ip: clientiot.utils.getLocalIP() }
                         };
                         clientiot.globalinfo.sendActiveMqState(rest.fromId, netData);
                     }
                     else if (rest.message.state == 11 && rest.targetId === userId) {
                         console.log("与对方建立连接")
                         //与对方建立连接
                         clientiot.globalinfo.regNetClient(rest.message.message.ip, function (res) {
                             console.log("本地消息客户端：" + res);
                         });
                     }
                 }
             }
		}) 
		//接受传值
		 Events.$on("addPartcancel",data=>{
         me.addthing=data
        });
	 
	},
	 methods:{
		 
		controlShow(){
			var me=this;
			this.addthing=true;
			this.$store.dispatch("AddGroups",'')  
			me.$store.state.selectFriendAticon=0;
			me.$store.state.GroupDisplay=true;
			},
		controlhide(){
			this.addthing=false;
		},
		isShow(msg,data){
			this.addthing=msg
			console.log('父组件接受00001'+msg)
		}, 
		 groupData:function(data) {
			this.userData = data
			this.$emit('chatlist',data)
			console.log('父组件接受000'+JSON.stringify(data))
		}
	 },
	  data () {
     	return { 
     		active: false,
			addthing:false,
			userData:'',
			disPlayChatbox:false,
			getGoupdisplay:false
     	}
	 },
	  beforeCreate () {
       var me=this;
      //获取所有顶级部门
      co(function*(){
          var new_organization = new clientiot.organizationnew();
		  var newFriend =JSON.parse(yield new_organization.getOrganizations());
		  var newFriendArr=yield new_organization.getOrganizations();
            if(newFriend.success==true){
			  localStorage.setItem('newFriendArrs',newFriendArr);
              me.$store.dispatch("getTopdepartment",newFriend.data.data.items)
            }
	  })
	},
	
	created(){
	var me=this; 
	}
}
</script>

<style lang="stylus" scoped>
.content{
	display: flex
	height :100%
}
  .hx-search{
		display :inline-block
	}
  .msglist{
		width:250px
		height :100%
    	background: rgb(230,230,230)
	}
	.wrapper{
		width :185px
	}
  .search-addPart{
		background :url("../../../../static/images/addPart.png");
		background-repeat: round;
		display :inline-block;
		background-color: #DCD9D8;
		width:20px;
		height:20px;
		padding: 4px 5px;
		border-radius: 5px;
		cursor: pointer;
	} 
  .chatbox {
			position relative
			width :100% 
			height :100%
	}
	.selectpart{
	 position: absolute;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    background-color: rgb(0, 0, 0);
    opacity: 0.3;
    z-index: 10;
	}
	.hx-selectpart{
	position: relative;
	background-color: #fff;
	z-index: 15;
	}
</style>
