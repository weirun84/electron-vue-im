<!-- 聊天列表 -->
<template> 
<div  class="cover" >
   <div class="cont-box no-drag">
       <div class="header" >
           <div style=" flex: 1">
               <search style="width: 207px;"></search>
           <span style="font-size: .8em;">请选择要添加的联系人</span>
            </div> 
            <span class="hiddenBox" @click="closBtn">×</span>
		</div>
        <div class="flex-box"> 
        <div class="ChatList">
           <ul v-if="searchForward.length===0 && searchGroopFriendlist.length==0">
             <li v-for="list in searchedChatlist"  class="hx-frienditem" :class="{ noborder:!list.initial}">
                <label :for="list.id">
                <input type="checkbox" name="hx-item" :data-name="list.id" :value="list" :id="list.id"  class="hx-input"  >
                    <div class="friend-info "  @click="selectFriend(list)" >
                        <img class="avatar"  width="30" height="30" v-bind:src="list.user.img">
                        <div class="listRemark">
                            <div class="listName">{{list.user.name}}</div> 
                        </div>
                </div>
                </label>      
            </li>
          </ul>
          <!--  搜索本地 -->
           <ul v-show="searchForward.length!=0">
             <li v-for="list in searchForward"  class="hx-frienditem" :class="{ noborder:!list.initial}">
                <label :for="list.id">
                <input type="checkbox" name="hx-item" :data-name="list.id" :value="list" :id="list.id"  class="hx-input"  >
                    <div class="friend-info "  @click="selectFriend(list)" >
                        <img class="avatar"  width="30" height="30" v-bind:src="list.user.img">
                        <div class="listRemark">
                            <div class="listName">{{list.user.name}}</div> 
                        </div>
                </div>
                </label>      
            </li>
          </ul> 

            <div style="padding: 10px;background: #d9d9d9;">通讯录</div>
                <ul>
                <!-- 顶级部门列表 -->
                    <li v-for="item in searchedFriendlist" class="frienditem"  v-show="searchGroopFriendlist.length==0">
                        <div class="friend-info" :class="{ active: item.bimOrganId === selectDepartment }" @click="getDepartmentidSubdepartment(item)">
                            <img class="avatar"  width="30" height="30" src="../friendlist/top.png">
                            <div class="remark topDep">{{item.organName}}</div>
                        </div>
                        <ul v-show="topShow">
                            <!-- 子级部门列表 -->
                            <li v-for="todo in searchedInitSubList" v-if="item.organId==todo.parentId" class="frienditem">
                                <div class="friend-info" :class="{ active: todo.bimOrganId === selectDepartment }" @click="getTopdepartment(todo)">
                                    <img class="avatar"  width="30" height="30" src="../friendlist/dep.png">
                                    <div class="remark">{{todo.organName}}</div>
                                </div>
                                <!-- 子级部门人员 -->
                                <ul v-show="depShow" class="departmentList">
                                    <li v-for="lost in searchedsubdepartmentList" v-if="todo.organId==lost.departmentId" class="frienditem " :class="{ noborder:!lost.initial}">
                                        <div class="hx-list-info" :class="{ active: lost.employeeNo === selectDepartment}" @click="selectFriend(lost)">
                                            <img class="avatar"  width="30" height="30" v-bind:src="lost.photoUrl">
                                            <div class="listRemark">
                                                <div class="listName">{{lost.employeeName}}</div>
                                                <div class="listPosname">{{lost.postName}}</div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                        <ul v-show="topShow" class="departmentList">
                            <!-- 顶级部门人员 -->
                            <li v-for="list in searchedDepartmentList" v-if="item.organId==list.departmentId" class="frienditem userstyle" :class="{ noborder:!list.initial}" style="padding:8px 13px">
                                <div class="list-info" :class="{ active: list.employeeNo === selectDepartment}" @click="selectFriend(list)">
                                    <img class="avatar"  width="30" height="30" v-bind:src="list.photoUrl">
                                    <div class="listRemark">
                                        <div class="listName">{{list.employeeName}}</div>
                                        <div class="listPosname">{{list.postName}}</div>
                                    </div>
                                </div>
                            </li>
                        </ul> 
                    </li> 
                <ul class="departmentList" v-show="searchGroopFriendlist.length!=0">
                    <!-- 搜索部门人员 -->
                    <li v-for="list in searchGroopFriendlist" class="frienditem userstyle" :class="{ noborder:!list.initial}" style="padding:5px">
                        <div class="list-info" :class="{ active: list.employeeNo === selectDepartment}" @click="selectFriend(list)">
                            <img class="avatar"  width="30" height="30" v-bind:src="list.photoUrl">
                            <div class="listRemark">
                                <div class="listName">{{list.employeeName}}</div>
                                <div class="listPosname">{{list.postName}}</div>
                            </div>
                        </div>
                    </li>
                </ul>  
          </ul>
        </div>
        <div class="Chatlist-As">
           <ul>
             <li v-for="(item, index) in selectFriends"  class="hx-frienditem" :class="{ noborder:!item.initial}">
                <label :for="item.id">
                <input type="checkbox" name="hx-item" :data-name="item.id" :value="item" :id="item.id"  class="hx-input">
                    <div class="friend-info "  @click="sendFriend(index,item)" >
                        <img class="avatar"  width="30" height="30" v-bind:src="item.user.img">
                        <div class="listRemark">
                            <div class="listName">{{item.user.name}}</div> 
                        </div>
                </div>
                </label>
                 <span class="hx-dellist" @click="sendFriend(index,item)"><a class="aui-close" href="javascript:void(0);">×</a></span>      
            </li>
          </ul> 
        </div> 
        </div>
        <div class="footer">
            <span slot="footer" class="dialog-footer">
                <el-button size="mini" @click="delcancel">取 消</el-button>
                <el-button size="mini" type="primary" @click="SenMssage(selectFriends)">确 定</el-button>
            </span>
        </div> 
   </div>
   </div>
</template>

<script> 
import { mapState, mapActions, mapGetters } from "vuex";
import img from "../../assets/logo.png";
import search from '../search/searchAddPart';
import moment from 'moment' 
const uuidv4 = require('uuid/v4'); 
import Events from '../../api/eventBus.js'  
moment.locale('zh-cn')
const clientiot = require("@hxim/clientiot");
var co = require('co'); 
var nameKey ='';
var message_id;
var selectFriends=[];
export default {
    data(){
       return{
        closeBtn:false,
        selectFriends:[] ,
        IsForward:'',
        IsForwarUrl:'',
        nameKey:'',
        topShow:false,
        depShow:false
       }
    },
    components:{
        search
    },
    computed: { 
   ...mapState(["selectId", "searchText","searchForward","chatlist","selectDepartment","msgCounting","selectFriendId",'selectFriendAticon','chatlist']),
    ...mapGetters(["searchedChatlist","searchedFriendlist","searchedDepartmentList","searchedInitSubList",'searchedsubdepartmentList','searchGroopFriendlist','selectedChat'])
    },
    mounted() {
     var me=this; 
     Events.$on('setForData',data=>{
        me.IsForward=data;
        me.IsForwarUrl=data.itemsUrl;
    })
    },
    methods: {
        closBtn(){
        var _self=this;
        Events.$emit('delSearch','')
        _self.$emit('cancel', false);
        _self.selectFriends=[];
        },
       delcancel(){  
        this.$emit('cancel', false);
         Events.$emit('delSearch','')
        this.selectFriends=[];
       },
       SenMssage(value){
            this.$emit('cancel', false);
            Events.$emit('delSearch','')
            var res=[],me=this; 
            var num = Math.floor(Math.random()*(100 - 1000) + 1000);
            if(this.IsForward.itemsUrl.msgType!='file'&&this.IsForward.itemsUrl.msgType!='http'&&this.IsForward.itemsUrl.msgType!='video'){
             this.sendImage(this.IsForward,this.IsForwarUrl); 
            } 
            for(var i=0;i<this.selectFriends.length;i++){  
                if(i==this.selectFriends.length){
                    return;
                }
                if(this.selectFriends[i].index==undefined &&this.selectFriends[i].id!=this.$store.state.chatlist[i].id){
                    for(var j=0;j<this.$store.state.chatlist.length;j++){
                        this.$store.state.chatlist[j].index=j+1;
                    }
                    me.$store.state.chatlist.unshift({
                        id: this.selectFriends[i].id,
                        user: {
                            name: this.selectFriends[i].user.name,
                            img:  this.selectFriends[i].user.img,
                            code:this.selectFriends[i].user.code
                        },
                        messages: [{
                            content: '已经建立会话，可以互发信息啦！',
                            date: new Date().getTime(),
                            userName:this.selectFriends[i].user.name,
                            msgType:'once'
                        }],   
                        index:0,
                        channelType:'P'
                    });
                    // this.$store.state.chatlist=Array.from(new Set(this.$store.state.chatlist))
                }  
                this.send(this.IsForwarUrl||this.IsForward,this.selectFriends[i]);
               
            } 
           
            this.selectFriends=[];
       },
        selectFriend(value) {
            if (!value.employeeNo) {
                var findSelectObj = this.selectFriends.find(it => it.id === value.id);
                if (!findSelectObj) {
                    this.selectFriends.push(value)
                }
            }
            else {
                var chatID = this.$store.state.chatlist.find(items => items.id === value.employeeNo);
                var selectObj = {
                    id: value.employeeNo,
                    channelType: 'P',
                    messages: [],
                    user: {
                        img: value.photoUrl,
                        name: value.employeeName,
                        code: value.code
                    }
                };
                if (this.selectFriends.length > 0) {
                    var selectDep = this.selectFriends.find(items => items.id === value.employeeNo);
                    if (selectDep == undefined) {
                        this.selectFriends.push(selectObj)
                    }
                    //    for(let i=0;i<this.selectFriends.length;i++){
                    //         if(this.selectFriends[i].id!=value.employeeNo){ 
                    //             this.selectFriends.push(values)
                    //             this.selectFriends=Array.from(new Set(this.selectFriends))
                    //         }else{
                    //             this.selectFriends=Array.from(new Set(this.selectFriends))
                    //         }
                    //   }
                } else {
                    if (chatID != undefined) {
                        this.selectFriends.push(chatID)
                    } else {
                        this.selectFriends.push(selectObj)
                    }

                }

            }
            
       },
       sendFriend(index,item){ 
           this.selectFriends.splice(index,1);  
       },

// 点击发送按钮发送信息
send(value,selectID) {
    var me=this; 
    var msgtype=value.msgType; 
    var msgCont=value.filename; 
    var msgContents=value.filePath;  
      var loginUser_id=JSON.parse( sessionStorage.getItem("currentUser")).id;
      var channelType= selectID.id;
      var now=new Date().getTime();
      if(value.downFilePath!=undefined){
            var filePath=value.downFilePath
      }else if(value.filePath!=undefined){
          if(value.filePath.rootPath!=undefined){
               var filePath= value.filePath.rootPath+ value.filePath.thisDir
          }else{
               var filePath= value.filePath
          } 
        }else{
            var filePath= value.filePath
        } 
      
      if(msgtype=='text'){
          var msgtype='text'
          var msgConts=value.content;
          var msgCont=value.content;
          var sendConts=value.content;
          var fileSize=2;
      }else if(msgtype=='image'){
         var msgConts=filePath;
          var sendConts=value.filename;
          var fileSize=value.fileSize
         if(msgConts==undefined){
              var msgConts=value.content;
         } 
      }else if(msgtype=='file'){
           var msgConts=value.content;
           var sendConts=value.content;
            var msgCont=value.mediaId!=undefined?value.mediaId:value.filename;
             if(isNaN(value.fileSize)==true){
                 if(value.fileSize.indexOf('KB')>-1){
                      var fileSize=parseInt(value.fileSize)*1024
                 }else if(value.fileSize.indexOf('MB')>-1) {
                      var fileSize=parseInt(value.fileSize)*1024*1024
                 }else{
                      var fileSize=parseInt(value.fileSize)
                 }
              
           }else{
                var fileSize=value.fileSize 
           } 
       
      }
      else if (msgtype == 'video') {
           var msgConts=value.content;
            var sendConts=value.content;
             var msgCont=value.mediaId!=undefined?value.mediaId:value.filename;
           if(isNaN(value.fileSize)==true){
               var fileSize = value.fileSize ? parseInt(value.fileSize):0
           }else{
                var fileSize=value.fileSize
           } 
      }
      else if (msgtype == 'http') {
           var msgConts=(value.content).replace(/(<\/?a.*?>)|(<\/?span.*?>)/g, '');
           var msgCont=(value.content).replace(/(<\/?a.*?>)|(<\/?span.*?>)/g, '');
           var msgtype='text';
           var sendConts=(value.content).replace(/(<\/?a.*?>)|(<\/?span.*?>)/g, '');
      };
       if(parseInt(channelType)<10000){//channelType=='G'
       
        var msg = {content:msgConts,mediaId:msgCont,reply: this.reply,forwardKey:value.content,msgType:msgtype,msgID:now,date:now,fileSize: value.fileSize,sendID:channelType,filePath:filePath,filename:value.filename};
          const contentText = this.content;
           me.$store.dispatch('sendMessage', msg);
          var data = {
                fromId: parseInt(loginUser_id),
                model:1,
                fromType: "group", 
                  msgContent: {
                    arn: "arn",
                    durationTime: now,
                    extras: "extras",
                    fileSize: fileSize,
                    format: "format",
                    height: 5,
                    mediaCrc32: "mediaCrc32",
                    text: sendConts,
                    mediaId: nameKey!=''?nameKey:msgCont,
                    width: 5
                  }, 
                msgType: msgtype, 
                targetId:parseInt(channelType),
                targetType: "custom",
                version: 0
              };
            clientiot.http.sendMessage(JSON.stringify(data),filePath).then(function(retvalue){
             console.log("群发图片文件:"+retvalue);
             var retvalueCode=JSON.parse(retvalue);
             var msg = {content:msgConts,
             fileSize: value.fileSize,
             reply: value.self,
             forwardKey:value.content,
             msgType:msgtype,UploadStore:true,
             msgID:now,date:now,sendID:channelType,
             filePath:value.downFilePath?value.downFilePath:filePath,
             filename:value.filename,
             message_key:retvalueCode.data.message_key,
            theme_key:retvalueCode.data.theme_key,
            target_id:retvalueCode.data.targetId,
            mediaId:value.mediaId,
            }; 
            if(retvalueCode.success==true){
               me.$store.dispatch("sendMessage", msg);
                me.$store.dispatch('ForwarDtopChatlist',selectID);
                nameKey=''  
            } 
          })  
       }
       else { 
          var messageId= uuidv4()+now;
          var msg = {content:msgConts,mediaId:msgCont,reply: this.reply,forwardKey:value.content,msgType:msgtype,fileSize: value.fileSize, msgID:messageId,date:now,sendID:channelType,filePath:filePath,filename:value.filename};
          var data = {
             fromId: parseInt(loginUser_id),
             model:1,
              fromType: "user",
              msgType: msgtype,
              targetId:  parseInt(channelType),
              targetCode: selectID.user.code,
              targetType: "single",
              model: 0,
              msgContent: {
                  arn: "arn",
                  durationTime: now,
                  extras: "extras",
                  fileSize: fileSize,
                  format: "format",
                  height: 5,
                  mediaCrc32: "mediaCrc32",
                  text: sendConts,
                mediaId: nameKey!=''?nameKey:msgCont,
                  width: 5
              }
          };  
            me.$store.dispatch('sendMessage', msg)
          clientiot.http.sendMessage(JSON.stringify(data),filePath).then(function(retvalue){
             var retvalueCode=JSON.parse(retvalue);
                message_id=retvalueCode.data;
                var msg = {
                content:msgConts,
                reply: value.self,
                fileSize: value.fileSize,
                msgType:msgtype,
                UploadStore:true,
                msgID:messageId,
                date:now,
                forwardKey:value.content,
                sendID:channelType,
                filePath:value.downFilePath?value.downFilePath:filePath,
                filename:value.filename,
                message_key:retvalueCode.data.message_key,
                theme_key:retvalueCode.data.theme_key,
                target_id:retvalueCode.data.targetId,
                mediaId:value.mediaId,
                };
                if(retvalueCode.success==true){
                    me.$store.dispatch('sendMessage', msg)
                    me.$store.dispatch('ForwarDtopChatlist',selectID);
                    nameKey=''  
                }
          }) 
            
      } 
    },
          // 点击发送按钮发送图片文件
    sendImage(msg,url) {
     const me=this; 
     if(url!=undefined&& typeof(url.filename)!='undefined'&&(url.msgType)!='text'){
          if(url.downFilePath!=undefined){
            var filePath=url.downFilePath
            }else if(url.filePath.rootPath!=undefined){
            var filePath= url.filePath.rootPath+ url.filePath.thisDir
            }else{
            var filePath= url.filePath
            }
         var result = (url.filename).substring((url.filename).indexOf("."),(url.filename).indexOf(".")+5);
          nameKey=uuidv4()+result;
          var msgID=uuidv4();
        //   var message={content:url.content,msgType:url.msgType,UploadStore:null,target_id:this.$store.state.selectFriendAticon,msgID:msgID,filePath:url.filePath,date:url.date,filename:url.filename,fileSize:null};
        //  setTimeout(function(){
        //     Events.$emit('sendMessage',message)
        // },1000) 
        clientiot.awss31.UploadFile(nameKey, filePath, function (res) {
                let data=JSON.parse(res);  
                var Uploadprogress={upload:data.data,msgId:msgID}  
                if(data.errorCode==200){ 
                console.log('上传成功')
                 let value={};
                value.keys=msgID; 
                value.id=url.target_id;
                me.$store.dispatch('uploadFilePath',value)
                }else{ 
                me.$store.dispatch("Uploadprogress", Uploadprogress);
                }
        })
     } 
     
    },
  getDepartmentidSubdepartment(item){
        // 获取子级部门及改顶级部门的人员
        var me=this;
        this.topShow=!this.topShow
        console.log("顶级部门")
        console.log(item)
        this.$store.state.selectedSort=3;
        me.$store.dispatch("chooseDepment",item.bimOrganId);
        co(function* (){
            // 该顶级部门下的子级部门
            var new_organization = new clientiot.organizationnew();
            var subDep =JSON.parse(yield new_organization.getOrganizations(item.organId));
            if(subDep.success==true){
                console.log(subDep.data.data.items);
                me.$store.dispatch("initSubList",subDep.data.data.items)
            }
        })
        co(function* (){
            // 该顶级部门下的人员
            var new_employees = new clientiot.employeesnew();
            var retvalue=JSON.parse(yield new_employees.searchEmployee("",true,item.organId));
            if(retvalue.success==true){
                retvalue.data.data.items.forEach(item => {
                    item.getLev=2;
                });
                me.$store.dispatch("departmentList",retvalue.data.data.items)
            }
        })
        
    },
    getTopdepartment(todo){
        var me=this;
        console.log("子级部门")
        console.log(todo)
        this.depShow=!this.depShow;
        this.$store.state.selectedSort=2;
        me.$store.dispatch("chooseDepment",todo.bimOrganId);
        co(function* (){
            var new_employees = new clientiot.employeesnew();
            var subretvalue=JSON.parse(yield new_employees.searchEmployee("",true,todo.organId));
            if(subretvalue.success==true){
                subretvalue.data.data.items.forEach(item => {
                    item.getLev=1;
                });
                me.$store.dispatch("subdepartmentList",subretvalue.data.data.items)
            };
            if(subretvalue.data.data.items.length==0){
                me.$message({
                    message:'该部门暂无人员',
                    duration:1800,
                    type:'warning',
                    center:true,
                })
            }
        })
     } 
    
    }
  };
</script>

<style lang="stylus" scoped>

   .cont-box{
       position: fixed;
       top: 51px;
       z-index: 99;
       width :500px;
       height :500px;
       background-color:#fff;
       z-index :9999;
       border: 1px solid #d9d9d9;
    box-shadow: 2px 4px 6px #999;
   }
   .flex-box{   
        flex-direction: row;
        justify-content: space-around;
        align-items:baseline;
        width: 100%;
       height: 100%;
    overflow: hidden;    
   }
   .list-info{
    vertical-align: middle;
    display: flex;
    align-items: center;
   }
   .hx-list-info{
    vertical-align: middle;
    display: flex;
    align-items: center;
    padding:8px 10px;
   }
    .hx-list-info:hover{
        background:#F0F0F0;
    }
   .ChatList{
        background-color:none;
        width :250px; 
        overflow: hidden;
        overflow-y: auto;
        height: 400px;
        float :left;
   } 
  
   .userstyle:hover{
        background-color:#F0F0F0;
   }
    .frienditem
        border-top: 1px solid #dadada
        &:first-child,&.noborder
            border-top: none
        .list_title
            box-sizing: border-box
            width: 100%
            font-size: 12px
            padding: 15px 0 3px 12px
            color: #999
        .friend-info
            display: flex
            padding: 6px
            transition: background-color .1s
            font-size: 0.9em 
            &:hover 
                background-color: rgb(220,220,220)
            &.active 
                background-color: #c4c4c4
            .avatar{
                border-radius: 2px 
                width: 30px!important;
                height: 30px!important;
                display: inline-block;
                }
            .remark
                font-size: 14px
                line-height: 36px
                padding-left: 10px;
        .radio{
                display: block;
                } 
   .Chatlist-As{
    position: relative;
    background-color:none; 
    overflow: hidden;
    overflow-y: auto;
    height: 380px;
    width :249px;
    float :right;
    border-left: 1px solid #d9d9d9;
   }
   .frienditems {
       padding :10px 5px;
       position :relative;
   }
    .frienditems:hover{
        background :#F0F0F0;
    }
   .friend-info {
    align-items: center;
    display: flex;
   }
   .hx-input{
       display :none;
   }
   .listRemark{
       display :inline-block;
       padding-left :10px;
       font-size: .8em;
        width: 0;
    flex: 1;
   }
   .hx-dellist{
   position: absolute;
    top: 15px;
    right: 34px; 
 }
 .aui-close {
    width: 20px;
    height: 20px;
    line-height: 20px;
    display: block;
    position: absolute;
    left: 10px;
    top: -3px;
    font-family: Helvetica, STHeiti;
    _font-family: 'u9ed1u4f53', 'Book Antiqua', Palatino;
    font-size: 18px;
    border-radius: 20px;
    background: #999;
    color: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    -moz-transition: linear 0.06s;
    -webkit-transition: linear 0.06s;
    transition: linear 0.06s;
    padding: 0;
    text-align: center;
    text-decoration: none;
    outline: none;
    cursor: pointer;
}
.aui-close:hover {
    width: 24px;
    height: 24px;
    line-height: 24px;
    left:8px;
    top:-3px;
    color: #FFF;
    box-shadow: 0 1px 3px rgba(209, 40, 42, .5);
    background: #d1282a;
    border-radius: 24px;
    transition: all 0.2s ease-out;
    opacity: 0.8;
    }
.header
    height: 60px
    width :100%
    display flex
    padding-left 20px
    box-sizing: border-box
    .friendname
        font-size 16px
        font-weight bold
        color #333
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height 60px
        flex 1
    .hiddenBox
        display inline-block
        width 30px
        height 30px
        text-align center
        line-height 30px
        &:hover
            background-color #e4393c
            color white
.footer{ 
    position: absolute;
    right: 27px;
    bottom: 3px;
}
.cover{ 
    position:absolute;left:0px;top:0px; 
    width:100%;  /*宽度设置为100%，这样才能使隐藏背景层覆盖原页面*/
    height:100%;  
    z-Index:999;  
}
.listName{
    width: 196px; 
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 1em;
    padding: 5px 0px;
}
.hx-group{
    font-size: 0.8em;
    display: block;
    padding: 10px;
    margin-left:140px;
}
.friendlist::-webkit-scrollbar {
        display: none;
    }
   .cont-box{
       position: fixed;
       top: 51px;
       z-index: 99;
       width :500px;
       height :500px;
       background-color:#fff;
       z-index :9999;
       border: 1px solid #d9d9d9;
    box-shadow: 2px 4px 6px #999;
   }
   .flex-box{   
        flex-direction: row;
        justify-content: space-around;
        align-items:baseline;
        width: 100%;
       height: 100%;
    overflow: hidden;    
   }
   .ChatList{
        background-color:none;
        width :249px; 
        overflow: hidden;
        overflow-y: auto;
        height: 400px;
        float :left;
   }
   .Chatlist-As{
    position: relative;
    background-color:none; 
    overflow: hidden;
    overflow-y: auto;
    height: 380px;
    width :250px;
    float :right;
   }
   .hx-frienditem {
       padding :10px 5px;
       position :relative;
   }
    .hx-frienditem:hover{
        background :#d9d9d9;
    }
   .friend-info {
    align-items: center;
    display: flex;
   }
   .hx-input{
       display :none;
   }
   .listRemark{
       display :inline-block;
       padding-left :10px;
       font-size: .8em;
   }
   .hx-dellist{
   position: absolute;
    top: 15px;
    right: 34px; 
 }
 .aui-close {
    width: 20px;
    height: 20px;
    line-height: 20px;
    display: block;
    position: absolute;
    left: 10px;
    top: -3px;
    font-family: Helvetica, STHeiti;
    _font-family: 'u9ed1u4f53', 'Book Antiqua', Palatino;
    font-size: 18px;
    border-radius: 20px;
    background: #999;
    color: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    -moz-transition: linear 0.06s;
    -webkit-transition: linear 0.06s;
    transition: linear 0.06s;
    padding: 0;
    text-align: center;
    text-decoration: none;
    outline: none;
    cursor: pointer;
}
.aui-close:hover {
    width: 24px;
    height: 24px;
    line-height: 24px;
    left:8px;
    top:-3px;
    color: #FFF;
    box-shadow: 0 1px 3px rgba(209, 40, 42, .5);
    background: #d1282a;
    border-radius: 24px;
    transition: all 0.2s ease-out;
    opacity: 0.8;
    }
.header
    height: 60px
    width :100%
    display flex
    padding-left 20px
    box-sizing: border-box
    .friendname
        font-size 16px
        font-weight bold
        color #333
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height 60px
        flex 1
    .hiddenBox
        display inline-block
        width 30px
        height 30px
        text-align center
        line-height 30px
        &:hover
            background-color #e4393c
            color white
.footer{ 
    position: absolute;
    right: 27px;
    bottom: 3px;
}
.cover{ 
    position:absolute;left:0px;top:0px; 
    width:100%;  /*宽度设置为100%，这样才能使隐藏背景层覆盖原页面*/
    height:100%;  
    z-Index:999;  
}
.listName{
    width: 196px; 
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.friendlist {
    overflow-y: auto;
    box-sizing :border-box;

    .frienditem {
        border-top: 1px solid #dadada;

        &:first-child, &.noborder {
            border-top: none;
        }

        .list_title {
            box-sizing: border-box;
            width: 100%;
            font-size: 12px;
            padding: 15px 0 3px 12px;
            color: #999;
        }

        .friend-info {
            display: flex;
            padding: 12px;
            transition: background-color 0.1s;
            font-size: 0; 
            &.active {
                background-color: #c4c4c4;
            }
            &:hover {
                background-color: rgb(220, 220, 220);
            }
            .avatar {
                border-radius: 2px;
                margin-right: 12px;
            }

            .remark {
                font-size: 14px;
                line-height: 36px;
            }
        }
    }
}
.list-info{
            display: flex; 
            transition: background-color 0.1s;
            font-size: 0; 
            &.active {
                background-color: #c4c4c4;
            }

            .avatar {
                border-radius: 2px;
                margin-right: 12px;
            }

            .listRemark {
               
                .listName{
                    font-size: 14px;
                    line-height: 10px;
                    color:#222
                }
                .listPosname{
                    font-size: 12px;
                    line-height: 16px;
                    color :#999
                }
            }
    }

.icon{
    flex 1
    text-align right
    line-height 36px
}
</style>
