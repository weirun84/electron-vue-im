<!-- 聊天列表 -->
<template>
    <div class="msglist msglists no-drag " style="background-color:white;">
       <!-- 详细设置  -->
       <div style="height:60px;background-color:#F2F2F2;"></div>
        <div class="settingGroupBox">
        <div class="settingBox" >
            <ul>
                <li class="addUser"> 
                    <div @click="newAddGroup">+</div>
                    <span>添加</span>
                </li>
                 <li class="addUser" @click="delAddGroup" v-if="members.length>1?true:false" v-show="getprohibiton()"> 
                    <div >-</div>
                    <span>删除</span>
                </li>
                <li class="userMessage" v-for="item in members" >
                    <img :src="item.images_url" alt="0.0" >
                    <span>{{item.memberName}}</span>
                </li> 
            </ul>
            
            <div class="weui-cells settingSwitch" v-if="members.length>1?true:false">
                <div class="weui-cell">
                    <div class="weui-cell__bd">群名称</div>
                    <div class="weui-cell">
                        <div class="getprohibiton" v-show="getprohibiton()" type="botton" @click="open3(GroupTitle)">{{GroupTitle.group_name}}<i class="el-icon-edit"></i></div>
                        <!--<el-input v-model="input" placeholder="请输入内容" maxlength="36" size="mini" suffix-icon="el-icon-edit"></el-input>-->
                        <!-- <input id="hx_groupDescribe"  v-show="getprohibiton()" @blur.prevent="changeGroupName(GroupTitle.group_id)" :data="GroupTitle.group_id" :autofocus="true" clearable :value="GroupTitle.group_name" style="background:none !important;outline:none;"/> -->
                        <input id="hx_groupDescribe" v-show="Delprohibiton()" readonly="readonly" :data="GroupTitle.group_id" :autofocus="true" clearable :value="GroupTitle.group_name" style="background:none !important;outline:none;" />
                    </div>
                </div>
            </div>
            <div class="weui-cells settingSwitch" v-if="members.length>1?true:false">
                <div>
                    <div class="weui-cell__bd">群公告</div>
                    <div class="weui-cell"> 
                         <div class="getprohibiton"  v-show="getprohibiton()" @click="openGroupNotic(GroupTitle)"><textarea name="" id="hx_groupinput" cols="20" rows="2" readonly="readonly" :value="GroupTitle.proclamation" style="background:none !important;outline:none;border:none;"></textarea></div>
                         <!-- <div class="getprohibiton"  v-show="getprohibiton()" type="botton" @click="openGroupNotic(GroupTitle.group_id)">{{GroupTitle.proclamation}}<i class="el-icon-edit"></i></div> -->
                        <!-- <input id="hx_groupinput"  v-show="getprohibiton()"  @blur.prevent="changeGroupNotic(GroupTitle.group_id)" :data="GroupTitle.group_id" :autofocus="true" clearable :value="GroupTitle.proclamation" style="background:none !important;outline:none;"/> -->
                        <textarea name="" id="hx_groupinput" cols="20" rows="2" v-show="Delprohibiton()" readonly="readonly" :value="GroupTitle.proclamation" style="background:none !important;outline:none;border:none;"></textarea>
                        <!-- <input id="hx_groupinput" v-show="Delprohibiton()" readonly="readonly"  @blur.prevent="changeGroupNotic(GroupTitle.group_id)" :data="GroupTitle.group_id" :autofocus="true" clearable :value="GroupTitle.proclamation" style="background:none !important;outline:none;"/>   -->
                    </div>
                </div>
            </div>
            <div class="settingSwitch">
                <p>消息免打扰</p>
                 <div>
                    <el-switch
                    v-model="value1"
                    active-color="#1aad19"
                    inactive-color="#d1d1d1" @change="toggle(value1,selectedChat)" :datas="getValue()">
                    </el-switch>  
                </div>
                <!-- <p>置顶聊天</p>
                <div>
                 <el-switch
                    v-model="value2"
                    active-color="#1aad19"
                    inactive-color="#d1d1d1" @change="togglesSetTop(value2,selectedChat)">
                    </el-switch> 
                </div> -->
                <div v-show="getprohibiton()" v-if="members.length>1">
                 <p>禁言</p>
                <div > 
                <el-switch
                    v-model="value3"
                    active-color="#1aad19"
                    inactive-color="#d1d1d1" @change="ProhibitionSpeech(value3,selectedChat)" :dataS="GainBan()">
                    </el-switch>
                </div>
                </div>
            </div>
            <div class="settingSwitch" style="border-bottom: 1px solid #d1d1d1;padding:5px 0px;" v-if="members.length>1?true:false"></div>
             <div class="settingSwitch" style="text-align: center;" v-if="members.length>=1&&this.members[0].NoGroup==undefined">
                <p class="settingBtn" @click="RetreatGroup" v-show="Delprohibiton()">删除并退出</p> 
                <p class="settingBtn" @click="transferBtn(selectedChat.id)" v-show="getprohibiton()">转让群主</p>
                <p class="settingBtn"  @click="DeleBtn" v-show="getprohibiton()">解散群组</p>
            </div> 
             </div> 
        </div>
        <!-- 解散群 -->
         <el-dialog :visible.sync="dialogVisibles" :lock-scroll="false" :append-to-body="true" width="340px" :close-on-click-modal="false" custom-class="login-dialog">
            <div class="login-body">
                <!-- <i class="icon el-icon-service"></i> -->
                <div class="from">
                    <div class="input-items">
                       确定要解散此群？
                    </div>
                     
                </div>
            </div>
             <span slot="footer" class="dialog-footer">
                <el-button size="mini" @click="dialogVisibles = false">取 消</el-button>
                <el-button size="mini" type="primary" @click="addBucket(GroupTitle.group_id,selectedChat)">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 退群 -->
         <el-dialog :visible.sync="dialogVisible" :lock-scroll="false" :append-to-body="true" width="340px" :close-on-click-modal="false" custom-class="login-dialog">
            <div class="login-body">
                <!-- <i class="icon el-icon-service"></i> -->
                <div class="from">
                    <div class="input-items">
                       确定删除并退出群？
                    </div>
                     
                </div>
            </div>
             <span slot="footer" class="dialog-footer">
                <el-button size="mini" @click="dialogVisible = false">取 消</el-button>
                <el-button size="mini" type="primary" @click="delFgBucket(GroupTitle.group_id,selectedChat)">确 定</el-button>
            </span>
        </el-dialog>
       
         <!-- 转让群主 -->
        <el-dialog title="转让群主" :visible.sync="dialogFormVisible"  :lock-scroll="false">
            <el-form > 
                <el-form-item label="选择新群主" :label-width="formLabelWidth">
                <el-select v-model="form.region"  placeholder="请选择人员" @change="selectGet">
                    <el-option v-for="(item,index) in transfermembers" :key="index" :label="item.memberName"  :value="item.memberEId"></el-option> 
                </el-select>
                </el-form-item>
            </el-form> 
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="TransferGroupOwners(GroupTitle.group_id)">确 定</el-button>
            </div>
        </el-dialog>
        
         <!-- 删除群指定人员 -->
        <div v-show="delAddGroups">
            <div class="lightbox"></div>
            <delGroup v-show="delAddGroups" v-on:cancel='getData' class="hx-main"></delGroup>
        </div> 
       
    </div>
</template>

<script>
 import {mapActions, mapGetters, mapState} from 'vuex' ;
    import my_switch from "./../switch/switch";  
    import delGroup from './DelGroupInfo.vue';
    import Events from '../../api/eventBus.js' ; 
    import Vue from 'vue';
    Event=new Vue();
    const clientiot = require("@hxim/clientiot");
    var co = require("co"); 
    let name='';
    var selectedChatID,groupName;
    var memberinputID=null;
    var upLoadClicktag = 0;
 export default{
        components: {
            my_switch,  
            delGroup 
        },
     data() {
        return {
            value1: false,
            value2: false,
            value3:false,
            settingBox: false,
            chooseUser: false,  
            dialogVisible: false,
            dialogVisibles:false, 
            delAddGroups:false, 
            GroupOwners:false,
            channelModel:[],
            read:false,  
        dialogFormVisible: false,
        form: {
          name: '',
          region: null,
          date1: '',
          date2: '',
          delivery: false,
          type: [],
          resource: '',
          desc: ''
        },
        formLabelWidth: '120px'
            }
        },
     props: ['childMsg'],
   
  computed: { 
    ...mapGetters(["selectedChat", "messages"]),
    ...mapState(["members","GroupTitle",'transfermembers']), 
    },
     
  methods: { 
      openGroupNotic(group){ 
        this.$prompt('群公告', '提示', {
          confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: group.proclamation,
          inputPattern: '',
          lockScroll:false, 
          inputErrorMessage: '群公告格式不正确'
        }).then(({ value }) => {
            this.changeGroupNotic(group.group_id,value)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消修改'
          });       
        });
      },
       open3(group) {
        this.$prompt('群名称', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
            inputPattern: '',
            inputValue: group.group_name,
          lockScroll:false,
            inputErrorMessage: '群名称超出限制，最大字数为20位！',
            inputValidator: (res)=>{
                if (res.length > 20) {
                    return false;
                }
            }
        }).then(({ value }) => {
        //   this.$message({
        //     type: 'success',
        //     message: '你的群名称是: ' + value
        //   });
        this.changeGroupName(group.group_id,value);
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '取消修改'
          });       
        });
      },
      transferBtn(id){
          var me=this;
          me.dialogFormVisible=true; 
           me.form.region='';
          memberinputID = null;
          me.$store.dispatch("transferGroupInfo", this.members);
      },
      selectGet(vId){
       let obj = {};
      obj = this.members.find((item)=>{//这里的selectList就是上面遍历的数据源
          return item.memberEId == vId;//筛选出匹配数据
      });
        memberinputID=obj.memberEId
      console.log(obj.memberName);//我这边的name就是对应label的
      console.log(obj.memberEId); 
    }, 
      TransferGroupOwners(group_id){
          var me=this;
           var userInfo=JSON.parse(sessionStorage.getItem('currentUser'));
           var userId=parseInt(userInfo.id);
          var store={
              gId:group_id,
              operator:userId,
              owner:memberinputID
          };
         
          if(store.owner==userId){
               me.$message({
                message:'不能转让给自己',
                duration:1800,
                type:'warning',
                center:true,
            })  
              return
          }
           if(store.owner!=undefined){
             co(function*(){
              var data=yield clientiot.groups.groupsGidOwner(group_id,userId,memberinputID);
              me.form.region='';
              console.log("移交群主操作:"+data)
          })
          }else{
               me.$message({
                message:'请选择移交人员',
                duration:1800,
                type:'warning',
                center:true,
            }) 
          }
          
          this.dialogFormVisible=false;
      },
      getprohibiton(){
          var userInfo=JSON.parse(sessionStorage.getItem('currentUser'));
          var userId=parseInt(userInfo.id);
          if(userId==this.GroupTitle.owner_eid){
              return true
          }
      },
      Delprohibiton(){
           var userInfo=JSON.parse(sessionStorage.getItem('currentUser'));
          var userId=parseInt(userInfo.id);
          if(userId!=this.GroupTitle.owner_eid){
              return true
          }
      },
       getData(greetMsg){
        this.delAddGroups=greetMsg; 
        Events.$on('cancel',data=>{
            this.delAddGroups=data
        })
         Events.$emit('Pertur',false)
       },
       transferGroups(){
          Events.$on('fordata',data=>{
            this.GroupOwners=data
        })
       },
       GainBan(selectedChat){ 
           var me=this;
           var ProhibitionSpeech=sessionStorage.getItem('GainBan'); 
            me.value3= JSON.parse(ProhibitionSpeech); 
       }, 
       getValue(){
           var me=this;
           var PerturbedStates=sessionStorage.getItem('PerturbedStates'); 
            me.value1= JSON.parse(PerturbedStates) 
       },
      newAddGroup(){ 
          var me=this; 
        Events.$emit('addPartcancel',true)
         this.$store.state.groupList=[];
         me.$store.state.GroupDisplay=false;
      },
      delAddGroup(){
          this.delAddGroups=true
      },
      changeGroupName(GroupId,Describe){
         let userId=parseInt(JSON.parse(sessionStorage.getItem('currentUser')).id);
         let oldName = this.GroupTitle.group_name;
        //  let Describe=document.getElementById("hx_groupDescribe").value;
         let Notice=document.getElementById("hx_groupinput").value;
         if(oldName!=Describe){
            var data = {
                    "admit_mode": "",
                    "description":"",
                    "group_id": GroupId,
                    "group_name": Describe,
                    "invite_mode": "",
                    "manager_count": 0,
                    "proclamation": "",
                    "operate_user_id":userId
            };
            co(function*(){
                var retvalue = yield clientiot.groups.updateGroupsByGid(data);
                console.log("群组修改公告标题:"+retvalue);
                var groupName = JSON.parse(retvalue); 
                Events.$emit('DisplayDetails', false);
            })
         }
            
      },
      changeGroupNotic(GroupId,value){
          let userId=parseInt(JSON.parse(sessionStorage.getItem('currentUser')).id);
          let Notice= value;
          let oldProclamation = this.GroupTitle.proclamation;
          if(Notice!=oldProclamation){
              var data = {
                "admit_mode": "",
                "description":"",
                "group_id": GroupId,
                "group_name": "",
                "invite_mode": "",
                "manager_count": 0,
                "proclamation": Notice,
                "operate_user_id":userId
           };
            co(function*(){
                var retvalue = yield clientiot.groups.updateGroupsByGid(data);
                console.log("群组修改公告标题:"+retvalue);
                var groupName=JSON.parse(retvalue); 
            })
          }
            
      },
      //个人退群
      RetreatGroup(GroupId){
           this.dialogVisible = true; 
      },
      delFgBucket(GroupId,selectedChat){
        let GroupID=GroupId,me=this;
        this.dialogVisible = false;

          var userInfo = JSON.parse(sessionStorage.getItem('currentUser'))
          co(function* (){
              clientiot.http.exitGroup(GroupId, userInfo.id).then(res => {
                var retvalue = JSON.parse(res);

                if (retvalue.success == true) {
                    me.$store.dispatch("exitGroup", GroupId);
                }
                me.delAddGroups = false;
                console.log("retreatGroup:" + JSON.stringify(retvalue));
                 var detailSetting=document.getElementById('detailSetting');
                Events.$emit('DisplayDetails',false);
                if(detailSetting!=null){
                        detailSetting.style.right='15px'
                }
            })
          })
          


         // co(function*(){
         //      /*更新群组成员*/
         //   console.log("===========个人退群=============");
         //   var retvalue =JSON.parse(yield clientiot.groups.retreatGroup(GroupId,userInfo));
         //   if(retvalue.success==true){
         //       me.$store.dispatch("exitGroup",GroupId);
         //   }
         //     me.delAddGroups = false;
         //     console.log("retreatGroup:" + JSON.stringify(retvalue));
         //})
      },
      //解散群
    DeleBtn(GroupId){
           this.dialogVisibles = true; 
      },
    addBucket(GroupId,selectedChat){
          let GroupID=GroupId,me=this;
        co(function*(){
            var retvalue = yield clientiot.groups.deleteGroups(GroupID);
            console.log("删除群组:"+retvalue); 
             me.dialogVisibles = false;  
             me.$store.dispatch("delChatlist",selectedChat);
              var detailSetting=document.getElementById('detailSetting');
            Events.$emit('DisplayDetails',false);
            if(detailSetting!=null){
                    detailSetting.style.right='15px'
            }
        })
      },
      //选择成员退群
      DelBucket(GroupId){
          let datastore=[],me=this;
           var userInfo=JSON.parse(sessionStorage.getItem('currentUser')).id;
          for(let i=0;i<this.channelModel.length;i++){ 
              datastore.push(this.channelModel[i].id)
          }
           let menbers={ 
                         "addMembers":[],
                        "removeMembers":datastore,
                        "operate_user_id":userInfo
                        };
          co(function*(){
               /*更新群组成员*/
            console.log("===========删除群组成员=============");
            var retvalue = yield clientiot.groups.updateGroupsGidMembers(GroupId,menbers);
            me.delAddGroups=false;
            me.channelModel=[];
            console.log(retvalue);
         })
      },
      toggle(value,selectedChat) {
          var userInfo=JSON.parse(sessionStorage.getItem('currentUser'));
          var userId=userInfo.id;
          var me=this;
          var getShieldNewArrs=[];
          if(selectedChat.id<100000){
              var flag=1;
          }else{
              var flag=0;
          }
          if(value==true){ 
               this.value1=true;
                 var data={
                "flag": flag,
                "set_or_cancel": true,
                "shield_id":selectedChat.id, 
                "user_id":parseInt(userId),
                }; 
               co(function*(){
                   /*免打扰设置*/
                console.log("===========免打扰设置=============");
                var retvalue = yield clientiot.employees.setShieldNew(data); 
                sessionStorage.setItem('PerturbedStates', true);
                me.value1=true;
                me.$store.dispatch('PerturbedState',selectedChat.id)
                Events.$emit('setState',true);
               })
          }else{  
                var data={
                "flag": flag,
                "set_or_cancel": false,
                 "shield_id":selectedChat.id, 
                "user_id":parseInt(userId),
                };
                 var getShieldNewArrs=[]; 
               co(function*(){
                   /*免打扰设置*/
                    console.log("===========取消免打扰设置=============");
                    var retvalue = yield clientiot.employees.setShieldNew(data); 
                    sessionStorage.setItem('PerturbedStates', false);
                    me.value1=false; 
                    me.$store.dispatch('PerturbedStateFalse',selectedChat.id);
                    Events.$emit('setState',true);
               })
          }

      },
      
       togglesSetTop(value,selectedChat) {
          var userInfo=JSON.parse(sessionStorage.getItem('currentUser'));
          var userId=userInfo.id;
          var me=this;
          if(value==true){ 
               me.$store.dispatch("topChatlist",selectedChat);
               co(function*(){
                   /*免打扰设置*/
                console.log("===========置顶设置=============");
                var retvalue = yield clientiot.employees.getEmployeesEidNodistrub(userId, "group ",selectedChat.id);
                console.log(retvalue);
                 this.value2=true;
               })
          }else{ 
               this.value2=false
          }
        // this.me_checked = !this.me_checked;
      },
      ProhibitionSpeech(value,selectedChat){
           var me=this;
           var userInfo=JSON.parse(sessionStorage.getItem('currentUser'));
          var userId=userInfo.id;
           //第一次进来为true
    if(upLoadClicktag==0){
        //改版变量
        upLoadClicktag = 1;
        if(value==true){  
                var data={
                "group_id": selectedChat.id ,
                "operator_id": parseInt(userId),
                "set_or_cancel": true,
                "set_time": new Date(),
                "user_id": 0,
                "user_or_group": 1
                }
               co(function*(){
                   /*免打扰设置*/
                console.log("===========禁言设置=============");
                var retvalue = yield clientiot.groups.setNotAllowedSend(data);
                console.log("禁言设置数据"+retvalue);
                 sessionStorage.setItem('GainBan', true);
                 me.value3=true;
                  
               })
          }else{
               var data={
                "group_id": selectedChat.id ,
                "operator_id": parseInt(userId),
                "set_or_cancel": false,
                "set_time": new Date(),
                "user_id": 0,
                "user_or_group": 1
                }
               co(function*(){
                   /*免打扰设置*/
                console.log("===========解除禁言设置=============");
                var retvalue = yield clientiot.groups.setNotAllowedSend(data);
                console.log("解除禁言设置"+retvalue);
                sessionStorage.setItem('GainBan', false);
                 me.value3=false
                 
               }) 
              
          }

        //3秒过后可以再次点击
        setTimeout(function () { upLoadClicktag = 0 }, 3000);
    }else{
         me.$message({
            message:'请勿频繁操作！',
            duration:1800,
            type:'warning',
            center:true,
        }) 
    } 
          
      },
        selectUser(user, index) {
            this.channelModel.push(
                {
                id: user.memberEId,
                nickname: user.memberName,
                images_url:user.images_url,
                index: index
                }
            )
        this.members.splice(index, 1)
        },
        unselectUser(user, index) {
            if(user.id !== this.myId) {
                this.$store.state.members.push({
                memberEId: user.id,
                memberName: user.nickname ,
                images_url:user.images_url,
                })
                this.channelModel.splice(index, 1)
            }
        }
    },
     watch: { 
      me_checked(val) {
        this.$emit('input', val);
      }
     
    },
    created(){
        var me=this;  
        me.form.region=null;
    },
    mounted(){
    var userInfo=JSON.parse(sessionStorage.getItem('currentUser'));
    var userId=userInfo.id;
    var me=this; 
    me.value1=this.data ;
    me.form.region=null; 
    Event.$on("cancel",data=>{
         this.delAddGroups=data
    });
    }, 
}
</script>

<style lang="stylus" scoped>
.settingGroupBox{
    position: fixed;
    width: 209px;
    height: 80%;
    background-color: #fff;
    right: 0px;
    z-index: 1;
    padding: 20px 20px 0 20px;
    overflow-y: auto;
}
.settingGroupBox::-webkit-scrollbar {
        display: none;
    }
.msglists {
    overflow-y: auto;
    box-sizing: border-box;
    height: calc(100% - 60px);
} 
.sessionlist {
    display: flex;
    padding: 12px;
    transition: background-color 0.1s;
    font-size: 0;
}

.sessionlist:hover {
    background-color: rgb(220, 220, 220);
    cursor:default
}

.sessionlist.active {
    background-color: #c4c4c4;
}

.sessionlist.topping {
    background-color: #999;
}

.avatar {
    border-radius: 2px;
    margin-right: 12px;
    margin-top: 5px;
}

.list-right {
    position: relative;
    flex: 1;
    margin-top: 4px;
}

.name {
    display: inline-block;
    vertical-align: top;
    line-height: 18px;
    font-size: 13px;
    width: 96px;
    font-weight: 300;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.time {
    float: right;
    color: #999;
    font-size: 11px;
    vertical-align: top;
}

.lastmsg {
    position: absolute;
    font-size: 12px;
    width: 130px;
    display:flex;
    color: #999;
    bottom: 4px;
    overflow: hidden;
    white-space: nowrap; 
    padding: 3px 0px;
}

.imgstyle {
    display: flex;
    justify-content: center;
    flex-flow: row wrap;
    align-items: flex-start;
    align-content: flex-start;
    overflow: hidden;
    background: #dddbdb;

    img {
        width: 10%;
        height: auto;
        border: 0;
        flex-grow: 2;
    }
}

.imgstyletwo {
    img {
        width: 50%;
        height: 50%;
        flex-grow: 0;
    }
}

.msg-header {
    position: relative;
    width: 50px;
    height: 50px;
    margin-right: 10px;
}

.weui-badge {
    position: absolute;
    top: -0.4em;
    right: -0.5em;
    display: inline-block;
    padding: 2px 5px;
    min-width: 6px;
    border-radius: 18px;
    background-color: #f43530;
    color: #fff;
    line-height: 1.2;
    text-align: center;
    font-size: 10px;
    vertical-align: middle;
}

.weui-badge_dot {
    position: absolute;
    top: -0.3em;
    right: -0.3em;
}

i {
    font-style: normal;
}

.weui-badge_dot {
    position: absolute;
    top: -0.3em;
    right: -0.3em;
}

i {
    font-style: normal;
}

.multi-header {
    height: 100%;
    border-radius: 5px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    display: -webkit-flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-box-align: start;
    -webkit-align-items: flex-start;
    -ms-flex-align: start;
    align-items: flex-start;
    overflow: hidden;
    background: #dddbdb;
}

.messageListPd {
    padding-right: 5px;
}

.Exempting {
    position: absolute;
    top: 21px;
    display: inline-block;
    right: -4px;
    color: #f00;
    font-size: 12px;
    width: 26px;
    height: 23px;
    background-repeat: no-repeat;
}

.hx-msgHtmlBox >>> p {
    display:inline-block
}
.lastmsg >>> span {
    background-color: inherit!important;
    width: 120px;
    display: inline;
    align-items: end;
    height:20px;
    line-height:20px;
    flex-direction: row; 
}
.lastmsg >>> b{
    display: inline-block;
    height: 20px;
    line-height: 20px;
}
.lastmsg >>> p{
    width: 140px;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    height:20px;
    line-height:20px;
}
.lastmsg >>> img{
    vertical-align :bottom;
    width: 19px;
}
.settingBox {
   
    width: 209px;
    height: 100%;
    background-color: #fff;   
    ul {
        float: left;
        width: 100%;
        border-bottom: 1px solid #d1d1d1;
        padding-bottom: 5px;

        li {
            float: left;
            width: 25%;
            text-align: center;
            padding-bottom: 8px;
            span {
                display: inline-block;
                margin-top: 8px;
                font-size: 12px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                width: 50px;
            }
        }

        .userMessage {
            img {
                width: 36px;
                overflow: hidden;
                height: 36px;
                border: 1px solid #d9d9d9;
                border-radius: 5px;
                display: inline-block;
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
            font-size: 0.9em;
        }
    }

    .userList {
        position: absolute;
        left: -400px;
        background-color: white;
    }
}
.weui-cells{
    padding: 8px 0px;
}
.weui-cell__bd{
    color :#999;
    font-size: .9em;
}
.weui-cell{
    padding-top :5px;
    width: 180px;
    overflow: hidden; 
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.9em;
}
.settingBtn{
    color:red;
    padding:10px;
    cursor: pointer;
}
 .weui-switch {
    display: block;
    position: relative;
    width: 52px;
    height: 22px;
    border: 1px solid #DFDFDF;
    outline: 0;
    border-radius: 11px;
    box-sizing: border-box;
    background-color: #DFDFDF;
    transition: background-color 0.1s, border 0.1s;
    cursor: pointer;
  }
  .weui-switch:before {
    content: " ";
    position: absolute;
    top: 0;
    left: 0;
    width: 50px;
    height: 20px;
    border-radius: 10px;
    background-color: #d1d1d1;
    transition: transform 0.35s cubic-bezier(0.45, 1, 0.4, 1);
  }
  .weui-switch:after {
    content: " ";
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    border-radius: 10px;
    background-color: #FFFFFF;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    transition: transform 0.35s cubic-bezier(0.4, 0.4, 0.25, 1.35);
  }
  .weui-switch-on {
    border-color: #1AAD19;
    background-color: #1AAD19;
  }
  .weui-switch-on:before {
    border-color: #1AAD19;
    background-color: #1AAD19;
  }
  .weui-switch-on:after {
    transform: translateX(30px);
  }
 .form {
  padding: 2px 0 0 16px;
  border-bottom: solid 1px #F0EEEA;
}
.user-list-container {
  border: solid 1px #D4D1CC;
  width: 48%;
  .title {
    height: 32px;
    text-align: center;
    font-weight: bold;
    background-color: #F0F0F0;
    border-bottom: solid 1px #F0F0F0;
  }
  .search-container {
    text-align: center;
    padding: 0;
    margin: 0;
    border-bottom: solid 1px #F0F0F0;
    input {
      margin: 0 0 0 4px;
      height: 22px;
      line-height: 22px;
      width: 110px;
      outline: 0;
      border: none;
      background-color: transparent;
      -webkit-appearance: textfield;
      -webkit-rtl-ordering: logical;
      cursor: text;
    }
    i {
      cursor: pointer;
      height: 22px;
      line-height: 22px;
    }    
    input::-webkit-input-placeholder {
      color: #DDDBD7;
    }
    input::-moz-placeholder {   /* Mozilla Firefox 19+ */
      color: #DDDBD7;
    }
    input:-moz-placeholder {    /* Mozilla Firefox 4 to 18 */
      color: #DDDBD7;
    }
    input:-ms-input-placeholder {  /* Internet Explorer 10-11 */ 
      color: #DDDBD7;
    }      
  }
  ul {
    padding: 0;
    margin: 0;
    overflow-y: auto;
    list-style-type: none;
    .load-more {
      text-align: center;
      font-size: 11px;
    }
    li {
      display: list-item;
      padding: 0 5px;
      margin: 0;
      span {
        font-weight: bold;
        float: right;
        display: none;
      }
    }
    li:hover {
      background-color: #F1EFEE;
      cursor: pointer;
    }
    li:hover span {
      display: block;
    }    
  }
}
.left-list {
  float: left;
  ul {
    height: 232px;
  }
}
.right-list {
  float: right;
  ul {
    height: 232px;
  }  
}
.el-col-16 {
    width: 100%;
}
.el-dialog__body {
    padding: 5px 20px;
    color: #606266;
    font-size: 14px;
}
#myarticle{
width:210px;
height:196px;
overflow-y:hidden;
border:1px solid green; 
}
.lightbox{
	 position: absolute;
    top: 0px;
    bottom: 0px;
    left: -310px;
    right: 0px;
    background-color: rgb(0, 0, 0);
    opacity: 0.3;
    z-index: 10;
}
.hx-box{
	position: relative;
	background-color: #fff;
	z-index: 15;
}
.getprohibiton{
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 190px;
} 
</style>
