<!-- 聊天列表 -->
<template> 
<div  class="cover" >
   <div class="cont-box no-drag">
       <div class="header" >
           <div style=" flex: 1;"> 
            <search style="width:200px"></search>
           <span class="hx-group" style="font-size: .8em;">请选择要删除的群成员</span>
            </div> 
            <span class="hiddenBox" @click="closBtn">×</span>
		</div>
        <div class="flex-box"> 
        <div class="ChatList">
           <ul v-show="searchForward.length ==0">
             <li v-for="list in members"  class="frienditem" :class="{ noborder:!list.initial}">
                <label :for="list.id">
                <input type="checkbox" name="hx-item" :data-name="list.id" :value="list" :id="list.id"  class="hx-input"  >
                    <div class="friend-info "  @click="selectFriend(list)" >
                        <img class="avatar"  width="30" height="30" v-bind:src="list.images_url">
                        <div class="listRemark">
                            <div class="listName">{{list.memberName}}</div> 
                        </div>
                </div>
                </label>      
            </li>
          </ul>
          <!-- 搜索 -->
          <ul v-show="searchForward.length >0">
             <li v-for="list in searchForward"  class="frienditem" :class="{ noborder:!list.initial}">
                <label :for="list.id">
                <input type="checkbox" name="hx-item" :data-name="list.id" :value="list" :id="list.id"  class="hx-input"  >
                    <div class="friend-info "  @click="selectFriend(list)" >
                        <img class="avatar"  width="30" height="30" v-bind:src="list.images_url">
                        <div class="listRemark">
                            <div class="listName">{{list.memberName}}</div> 
                        </div>
                </div>
                </label>      
            </li>
          </ul>
        </div>
        <div class="Chatlist-As">
           <ul>
             <li v-for="(item, index) in selectFriends"  class="frienditem" :class="{ noborder:!item.initial}">
                <label :for="item.id">
                <input type="checkbox" name="hx-item" :data-name="item.id" :value="item" :id="item.id"  class="hx-input">
                    <div class="friend-info "  @click="sendFriend(index,item)" >
                        <img class="avatar"  width="30" height="30" v-bind:src="item.images_url">
                        <div class="listRemark">
                            <div class="listName">{{item.memberName}}</div> 
                        </div>
                </div>
                </label>
                 <span class="hx-dellist"  @click="sendFriend(index,item)" ><a class="aui-close" href="javascript:void(0);">×</a></span>      
            </li>
          </ul> 
        </div> 
        </div>
        <div class="footer">
            <span slot="footer" class="dialog-footer">
                <el-button size="mini" @click="delcancel">取 消</el-button>
                <el-button size="mini" type="primary" @click="DelBucket(GroupTitle.group_id)">删 除</el-button>
            </span>
        </div> 
   </div>
   </div>
</template>

<script> 
import { mapState, mapActions, mapGetters } from "vuex"; 
import moment from 'moment'
import search from '../search/search'; 
import Vue from 'vue'
const uuidv4 = require('uuid/v4');
import Events from '../../api/eventBus.js' 
Event=new Vue()
moment.locale('zh-cn')
const clientiot = require("@hxim/clientiot");
var co = require('co');
var nameKey =''
export default {
    data(){
       return{
        closeBtn:false, 
         selectFriends:[],
        IsForward:'',
        IsForwarUrl:'',
        nameKey:''
       }
    },
    components:{
        search 
    },
    computed: { 
   ...mapState(["selectId", "members","GroupTitle","selectFriendId",'selectFriendAticon','searchForward']),
    ...mapGetters(["searchedChatlist"])
    },
    mounted() {  
    },
    methods: {
        closBtn(){
        this.$emit('cancel', false);
        this.selectFriends=[];
        Events.$emit('delSearch','')
        },
       delcancel(){  
        this.$emit('cancel', false);
        this.selectFriends=[];
         Events.$emit('delSearch','')
       },
       SenMssage(value){
            this.$emit('cancel', false); 
            this.sendImage(this.IsForward,this.IsForwarUrl);
            for(var i=0;i<this.selectFriends.length;i++){
                this.send(this.IsForwarUrl||this.IsForward,this.selectFriends[i]);
            } 
            this.selectFriends=[];
             Events.$emit('delSearch','')
       },
       selectFriend(value){
           var loginUser_id=JSON.parse( sessionStorage.getItem("currentUser")).id;
           if(this.selectFriends.length!=0){
               for(let i=0;i<this.selectFriends.length;i++){
               if(this.selectFriends[i].memberEId!=value.memberEId&&value.memberEId!=loginUser_id){
                   this.selectFriends.push(value)
                   this.selectFriends=Array.from(new Set(this.selectFriends))
               }else{
                   this.selectFriends=Array.from(new Set(this.selectFriends))
               }
           }
           }else{
                if(loginUser_id!=value.memberEId){
                   this.selectFriends.push(value)
               }
           }
           
            
       },
       sendFriend(index,item){ 
           this.selectFriends.splice(index,1);  
       },
        //选择成员退群
      DelBucket(GroupId){
          let datastore=[],me=this;
           var loginUser_id=JSON.parse( sessionStorage.getItem("currentUser")).id;
          for(let i=0;i<this.selectFriends.length;i++){ 
              datastore.push(this.selectFriends[i].memberEId)
          }
          if(datastore.length<=0){
                me.$message({
                    message:'请选择要删除的的人员',
                    duration:1800,
                    type:'warning',
                    center:true,
                })
                return
           };
           let menbers={ 
                         "addMembers":[],
                        "removeMembers":datastore,
                        "operate_user_id":loginUser_id
                        };
          co(function*(){
               /*更新群组成员*/
            console.log("===========删除群组成员=============");
            var retvalue = yield clientiot.groups.updateGroupsGidMembers(GroupId,menbers);
            var dataStore=JSON.parse(retvalue);
            if(dataStore.success==true){ 
                me.selectFriends=[];
                me.$emit('cancel', false);
                Events.$emit('delSearch','')
            } 
            console.log(retvalue);
         })
      },
    }
 }
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
   .ChatList{
        background-color:none;
        width :250px; 
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
    width :249px;
    float :right;
    border-left: 1px solid #d9d9d9;
   }
   .frienditem {
       padding :10px 5px;
       position :relative;
   }
    .frienditem:hover{
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
    height: 40px
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
.hx-group{
    font-size: 0.8em;
    display: inline-block;
    padding: 10px; 
}
</style>
