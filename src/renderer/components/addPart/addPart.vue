<!-- 聊天列表 -->
<template> 
<div  class="cover" >
   <div class="cont-box no-drag">
       <div class="header" >
            <div style=" flex: 1">
               <search style="width: 207px;" :searchData="delSearch"></search>
               <span style="font-size: .8em;">请选择要添加的联系人</span>
            </div> 
            <span class="hiddenBox" @click="closBtn">×</span>
		</div>
        <div class="flex-box"> 
        <div class="ChatList ">
        <ul>
     <!-- 顶级部门列表 -->
        <li v-for="(item,index) in searchedFriendlist" class="frienditem" v-show="searchGroopFriendlist.length==0">
            <div class="friend-info" :class="{ active: item.bimOrganId === selectDepartment }" @click="getDepartmentidSubdepartment($event,item,index)">
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
                    <ul v-show="depShow">
                        <!-- 三级部门 -->
                        <li v-for="ThreeItem in searchedThreeDepList" v-if="todo.organId==ThreeItem.parentId" class="frienditem">
                            <div class="friend-info" :class="{ active: ThreeItem.bimOrganId === selectDepartment }" @click="getThreedepartment(ThreeItem)">
                            <img class="avatar"  width="30" height="30" src="../friendlist/dep.png">
                            <div class="remark">{{ThreeItem.organName}}</div>
                        </div>
                            <!-- 三级部门人员 -->
                            <ul v-show="threeShow" class="departmentList">
                                <li v-for="threst in searchedthreedepartmentList" v-if="ThreeItem.organId==threst.departmentId" class="frienditem" :class="{ noborder:!threst.initial}">
                                    <div class="list-info" :class="{ active: threst.employeeNo === selectDepartment}" @click="selectFriend(threst)">
                                        <img class="avatar"  width="30" height="30" v-bind:src="threst.photoUrl">
                                        <div class="listRemark">
                                            <div class="listName">{{threst.employeeName}}</div>
                                            <div class="listPosname">{{threst.postName}}</div>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </li>
                    </ul>
                    <!-- 子级部门人员 -->
                    <ul v-show="depShow" class="departmentList">
                        <li v-for="lost in searchedsubdepartmentList" v-if="todo.organId==lost.departmentId" class="frienditem userstyle" :class="{ noborder:!lost.initial}" style="padding:8px 13px">
                            <div class="list-info" :class="{ active: lost.employeeNo === selectDepartment}" @click="selectFriend(lost)">
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
                <li v-for="list in searchedDepartmentList" v-if="item.organId==list.departmentId" class="frienditem userstyle" :class="{ noborder:!list.initial}" style="padding:5px">
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
                <li v-for="list in searchGroopFriendlist" class="frienditem userstyle" :class="{ noborder:!list.initial}" style="padding:8px 13px">
                    <div class="list-info" :class="{ active: list.employeeNo === selectDepartment}" @click="selectFriend(list)">
                        <img class="avatar"  width="36" height="36" v-bind:src="list.photoUrl">
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
             <li v-for="(item, index) in selectFriends"  class="frienditems" :class="{ noborder:!item.initial}" style="padding:8px 13px">
                <label :for="item.id">
                <input type="checkbox" name="hx-item" :data-name="item.organId" :value="item" :id="item.organId"  class="hx-input">
                    <div class="friend-info "  @click="sendFriend(index,item)" >
                        <img class="avatar"  width="30" height="30" v-bind:src="item.photoUrl">
                        <div class="listRemark">
                            <div class="listName">{{item.employeeName}}</div> 
                        </div>
                </div>
                </label>
                 <span class="hx-dellist"  @click="sendFriend(index,item)"><a class="aui-close" href="javascript:void(0);">×</a></span>      
            </li>
          </ul> 
        </div> 
        </div>
        <div class="footer">
            <span slot="footer" class="dialog-footer">
                <el-button size="mini" @click="delcancel">取 消</el-button>
                <el-button size="mini" type="primary" @click="submit(selectFriends,selectFriendAticon)">确 定</el-button>
            </span>
        </div> 
   </div>
   </div>
</template>

<script> 
import { mapState, mapActions, mapGetters } from "vuex"; 
import moment from 'moment'
import search from '../search/searchAddPart';
import Events from '../../api/eventBus.js' 
import { returnStatement } from 'babel-types';
const uuidv4 = require('uuid/v4');  
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
        nameKey:'',
        topId:'',
        depId:'',
        threeId:'',
        topH:'',
        depH:'',
        threeH:'',
        topShow:false,
        depShow:false,
        threeShow:false,
        delSearch:false
       }
    },
    components:{ 
        search
    },
    computed: { 
    ...mapState(["selectFriendAticon", "selectDepartment","searchText","selectedSort",'selectFriendAticon',"members","GroupTitle"]),
    ...mapGetters(["searchedFriendlist","searchedDepartmentList","searchedInitSubList",'searchedsubdepartmentList','searchGroopFriendlist','searchedThreeDepList'])
    },
    mounted() { 
    },
    methods: {
        closBtn(){
        Events.$emit('delSearch', '');
        Events.$emit('addPartcancel', false);
        this.selectFriends=[];
        this.delSearch=true
        },
       delcancel(){  
        Events.$emit('delSearch', '');
        Events.$emit('addPartcancel', false);
        this.selectFriends=[];
         this.delSearch=true
       }, 
       selectFriend(value){
        var loginUser_id=JSON.parse( sessionStorage.getItem("currentUser")).id;
        var me=this;
            if(this.members.length>0){
                console.log(11111)
            }
           if(this.selectFriends.length!=0){
               for(let i=0;i<this.selectFriends.length;i++){
               if(this.selectFriends[i].employeeNo!=value.employeeNo&&value.employeeNo!=loginUser_id){
                   if(me.$store.state.GroupDisplay==true){
                    var rest= this.selectFriends.find((values) => (values.employeeNo==value.employeeNo))
                    if(rest==undefined){
                        this.selectFriends.push(value)
                        return false;
                    }else{
                        me.$message({
                            message:'该成员已存在',
                            duration:1200,
                            type:'warning',
                            center:true,
                        })
                    }  
                   }else{
                    var rest= this.members.find((values) => (values.memberEId==value.employeeNo))
                    if(rest==undefined){
                        this.selectFriends.push(value)
                    }else{ 
                        me.$message({
                            message:'该成员已存在',
                            duration:1200,
                            type:'warning',
                            center:true,
                        })
                    } 
                   }
               
                   this.selectFriends=this.selectFrienduniq(this.selectFriends)
               }else{
                //    this.selectFriends=Array.from(new Set(this.selectFriends))
                 this.selectFriends=this.selectFrienduniq(this.selectFriends)
               }
           }
           }else{
               if(loginUser_id!=value.employeeNo){ 
                 var rest= this.members.find((values) => (values.memberEId==value.employeeNo));
                 if(me.$store.state.GroupDisplay==true){
                      this.selectFriends.push(value)
                 }else{
                      if(rest==undefined){
                        this.selectFriends.push(value)
                        }else{ 
                            me.$message({
                                message:'该成员已存在',
                                duration:1800,
                                type:'warning',
                                center:true,
                            })
                        } 
                 }
               
               }
                
           }
           
            
       },
        selectFrienduniq(ar){
           // var temp = []; //一个新的临时数组
           // for(var i = 0; i < array.length; i++){
           //     if(temp.indexOf(array[i]) == -1){
           //         temp.push(array[i]);
           //     }
           // }
           //return temp;

           var tmp = {},
               ret = [];

           for (var i = 0, j = ar.length; i < j; i++) {
               var key = ar[i].code;
               if (!tmp[key]) {
                   tmp[key] = 1;
                   ret.push(ar[i]);
               }
           }

           return ret;



        },
       sendFriend(index,item){ 
           this.selectFriends.splice(index,1);  
       },
        //提交选择成员
      submit:function(data,selectFriendAticon){ 
            var members=[];
            var groupName='群聊';
            var me=this;
            var loginUser_id=JSON.parse( sessionStorage.getItem("currentUser")).id;
            var loginUser_name=JSON.parse( sessionStorage.getItem("currentUser")).name;
           if(data.length<=0){
                me.$message({
                    message:'请选择需要添加的人员',
                    duration:1800,
                    type:'warning',
                    center:true,
                })
                return
           }
            for(var i=0;i<data.length;i++){
                members.push(parseInt(data[i].employeeNo));
                // groupName.push(data[i].employeeName)
            };
            //  groupName.push(loginUser_name)
            if(selectFriendAticon>100000||selectFriendAticon==0){
            if(members.length>0){ 
                 var me=this;
                  this.$emit('showToggle',false) 
                    if(selectFriendAticon!=''){
                        members.push(parseInt(selectFriendAticon))
                    } 
                    console.log("===========新增群组=============");
                    var data = {
                        admit_mode: "1", //入群验证(0>需要管理员同意,1>不需要管理员同意,2>不允许加入) ,
                        group_name: groupName,//groupName.join('、'),
                        group_range: "暂无描述",
                        group_theme: "暂无描述",
                        group_type: "custom", //群组类别:organization>按组织架构 flight>按航班沟通 conference>按会议 project>按项目 lives>图文直播 custom>自定义
                        invite_mode: "1", //邀请方式(0>群主邀请;1>群员可邀请)
                        members:Array.from(new Set(members)) ,//members
                        owner_id: parseInt(loginUser_id), //群主的工牌号
                        proclamation:"暂无描述",
                        description:'暂无描述'
                    };
                    co(function*() {
                        var retvalue = yield clientiot.groups.addGroups(data);
                        var jsonRet = JSON.parse(retvalue).data;
                        // var obj = eval("(" + jsonRet + ")");
                        // console.log(obj)
                        // me.$store.dispatch("addGroups", jsonRet);
                        Events.$emit('delSearch', '');
                        me.$emit('showToggle',false);
                        me.selectFriends=[];
                        me.$store.dispatch('search', '');
                        me.$store.dispatch('searchFriendValue', '');
                        me.$store.dispatch('chatSearch','');
                        me.$store.dispatch('messSearch', '')
                        me.$store.state.selectFriendAticon=0;
                    });
                }else{
                    console.log('请选择需要添加的人员')
                }
            }else{
                    var me=this;
                    var menbers={
                        "operate_user_id":loginUser_id,
                        "addMembers":members,
                        "removeMembers": []
                        };
                    var data={selectFriendAticon,members};
                     co(function*() {
                        var retvalue = yield clientiot.groups.updateGroupsGidMembers(selectFriendAticon,menbers);
                        var jsonRet = JSON.parse(retvalue).data; 
                        console.log(jsonRet)
                        Events.$emit('delSearch', ''); 
                        me.$emit('showToggle',false); 
                        me.$store.dispatch("addGroups", '');
                        me.selectFriends=[];
                        
                });
            }
                
        }, 
       getDepartmentidSubdepartment(e,item,index){
        // 获取子级部门及该顶级部门的人员
        var user= JSON.parse(localStorage.getItem("userMsg"));
        var me=this;
        
        if(item.organId != me.topId){
            me.topId = item.organId;
            this.threeShow = false;
            this.depShow = false;
            this.topShow = true;
            // this.$refs.topTag.scrollTop=49*index;
        }else{
            this.topShow = !this.topShow;
        }
        console.log("顶级部门")
        console.log(item)
        this.$store.state.selectedSort=3;
        me.$store.dispatch("chooseDepment",item.bimOrganId);
        co(function* (){
            // 二级部门
            var new_organization = new clientiot.organizationnew();
            var subDep =JSON.parse(yield new_organization.getOrganizations(item.organId));
            if(subDep.success==true){
                me.$store.dispatch("initSubList",subDep.data.data.items)
            }
             // 该顶级部门下的人员
            var new_employees = new clientiot.employeesnew();
            var retvalue=JSON.parse(yield new_employees.searchEmployee("",true,item.organId));
            if(retvalue.success==true){
                retvalue.data.data.items.forEach(item => {
                    item.getLev=2;
                });
                me.$store.dispatch("departmentList",retvalue.data.data.items)
            }
            if(retvalue.success==false||subDep.success==false){
                me.$message({
                    message:retvalue.errorMessage,
                    duration:1800,
                    type:'warning',
                    center:true,
                })
            }
            if(retvalue.data.data.items.length==0&&subDep.data.data.items.length==0){
                me.$message({
                    message:'该部门暂无人员',
                    duration:1800,
                    type:'warning',
                    center:true,
                })
            }
            if((item.organId==466||item.organId==24)&&retvalue.data.data.items.length==0&&subDep.data.data.items.length==0){
                me.$message({
                    message:'暂无添加权限',
                    duration:1800,
                    type:'warning',
                    center:true,
                })
                return
            };
        })
    },
    getTopdepartment(todo){
        var me=this;
        console.log("二级部门")
        console.log(todo)
        if(todo.organId != me.depId){
            me.depId = todo.organId;
            this.depShow = true;
            this.threeShow = false;
        }else{
            this.depShow = !this.depShow;
        }
        this.$store.state.selectedSort=2;
        me.$store.dispatch("chooseDepment",todo.bimOrganId);
        co(function* (){
            // 三级部门
            var new_organization = new clientiot.organizationnew();
            var threeDep =JSON.parse(yield new_organization.getOrganizations(todo.organId));
            if(threeDep.success==true&& threeDep.data.data.items.length>0){
                me.$store.dispatch("threeDepList",threeDep.data.data.items)
            };
            var new_employees = new clientiot.employeesnew();
            var subretvalue=JSON.parse(yield new_employees.searchEmployee("",true,todo.organId));
            if(subretvalue.success==true){
                subretvalue.data.data.items.forEach(item => {
                    item.getLev=1;
                });
                me.$store.dispatch("subdepartmentList",subretvalue.data.data.items)
            };
            if(subretvalue.success==false||threeDep.success==false){
                me.$message({
                    message:subretvalue.errorMessage,
                    duration:1800,
                    type:'warning',
                    center:true,
                })
            }
            if(subretvalue.data.data.items.length==0 && threeDep.data.data.items.length==0){
                me.$message({
                    message:'该部门暂无人员',
                    duration:1800,
                    type:'warning',
                    center:true,
                })
            }
        })
    },
    // 获取三级部门下的人员 
    getThreedepartment(three){
        var me=this;
        console.log("三级部门");
        console.log(three);
        if(three.organId != me.threeId){
            me.threeId = three.organId;
            this.threeShow = true;
        }else{
            this.threeShow = !this.threeShow;
        }
        me.$store.dispatch("chooseDepment",three.bimOrganId);
        co(function* (){
            var new_employees = new clientiot.employeesnew();
            var threeRetvalue=JSON.parse(yield new_employees.searchEmployee("",true,three.organId));
            if(threeRetvalue.success==true){
                threeRetvalue.data.data.items.forEach(item => {
                    item.getLev=3;
                });
                me.$store.dispatch("threedepartmentList",threeRetvalue.data.data.items)
            };
            if(threeRetvalue.success==false){
                me.$message({
                    message:threeRetvalue.errorMessage,
                    duration:1800,
                    type:'warning',
                    center:true,
                })
            }
            if(threeRetvalue.data.data.items.length==0){
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
   .list-info{
       vertical-align: middle;
    display: flex;
    align-items: center;
   }
   .ChatList{
        background-color:none;
        width :250px; 
        overflow: hidden;
        overflow-y: auto;
        height: 400px;
        float :left;
   } 
   .userstyle{
       padding:8px 13px;
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
            padding: 5px
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
    height: 47px
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
.listPosname{
    font-size: .9em;
    color: #999;
    padding: 3px;
}
</style>
