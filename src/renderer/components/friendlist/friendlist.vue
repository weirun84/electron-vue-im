<!-- 好友列表 -->
<template>
 <div class="friendlist no-drag" ref="topTag">
     <!-- 搜索结果列表 -->
     
 	<ul>
         <!-- 顶级部门列表 -->
        <li v-for="(item,index) in searchedFriendlist" class="frienditem" v-show="searchGroopFriendlist.length==0">
            <div class="friend-info" :class="{ active: item.bimOrganId === selectDepartment }" @click="getDepartmentidSubdepartment($event,item,index)">
                <img class="avatar"  width="24" height="24" style="margin:6px" src="./top.png">
                <div class="remark topDep">{{item.organName}}</div>
            </div>
            <ul v-show="topShow">
                <!-- 子级部门列表 -->
                <li v-for="todo in searchedInitSubList" v-if="item.organId==todo.parentId" class="frienditem">
                    <div class="friend-info" :class="{ active: todo.bimOrganId === selectDepartment }" @click="getTopdepartment(todo)">
                        <img class="avatar"  width="24" height="24" style="margin:6px;margin-left:12px;" src="./dep.png">
                        <div class="remark">{{todo.organName}}</div>
                    </div>
                    <ul v-show="depShow">
                        <!-- 三级部门 -->
                        <li v-for="ThreeItem in searchedThreeDepList" v-if="todo.organId==ThreeItem.parentId" class="frienditem">
                            <div class="friend-info" :class="{ active: ThreeItem.bimOrganId === selectDepartment }" @click="getThreedepartment(ThreeItem)">
                            <img class="avatar"  width="24" height="24" style="margin:6px;margin-left:24px;" src="./dep.png">
                            <div class="remark">{{ThreeItem.organName}}</div>
                        </div>
                            <!-- 三级部门人员 -->
                            <ul v-show="threeShow" class="departmentList">
                                <li v-for="threst in searchedthreedepartmentList" v-if="ThreeItem.organId==threst.departmentId" class="frienditem" :class="{ noborder:!threst.initial}">
                                    <div class="list-info" :class="{ active: threst.employeeNo === selectDepartment}" @dblclick="dbClick" @click="selectFriend(threst)">
                                        <img class="avatar"  width="24" height="24"style="margin-left:36px" v-bind:src="threst.photoUrl">
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
                        <li v-for="lost in searchedsubdepartmentList" v-if="todo.organId==lost.departmentId" class="frienditem" :class="{ noborder:!lost.initial}">
                            <div class="list-info" :class="{ active: lost.employeeNo === selectDepartment}" @dblclick="dbClick" @click="selectFriend(lost)">
                                <img class="avatar"  width="24" height="24"style="margin-left:18px" v-bind:src="lost.photoUrl">
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
                <li v-for="list in searchedDepartmentList" v-if="item.organId==list.departmentId" class="frienditem" :class="{ noborder:!list.initial}">
                    <div class="list-info" :class="{ active: list.employeeNo === selectDepartment}" @dblclick="dbClick" @click="selectFriend(list)">
                        <img class="avatar"  width="24" height="24" style="margin-left:6px" v-bind:src="list.photoUrl">
                        <div class="listRemark">
                            <div class="listName">{{list.employeeName}}</div>
                            <div class="listPosname">{{list.postName}}</div>
                        </div>
                    </div>
                </li>
                <!-- <p style="text-align:center;font-size:14px;margin:15px 0" v-show="item.organId==topId&& searchedDepartmentList.length==0">暂无人员</p> -->
            </ul>
        </li>
        <ul class="departmentList" v-show="searchGroopFriendlist.length!=0">
            <!-- 搜索部门人员 -->
            <li v-for="list in searchGroopFriendlist" class="frienditem userstyle" :class="{ noborder:!list.initial}" style="padding:8px 13px">
                <div class="list-info" :class="{ active: list.employeeNo === selectDepartment}" @dblclick="dbClick" @click="selectFriend(list)">
                    <img class="avatar"  width="24" height="24" v-bind:src="list.photoUrl">
                    <div class="listRemark">
                        <div class="listName">{{list.employeeName}}</div>
                        <div class="listPosname">{{list.postName}}</div>
                    </div>
                </div>
            </li>
        </ul>
    </ul>
 </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex";
import { constants } from 'fs';
import Events from '../../api/eventBus.js'
const clientiot = require("@hxim/clientiot");
var co = require('co');
export default {
    data(){
        return{
            topId:'',
            depId:'',
            threeId:'',
            topH:'',
            depH:'',
            threeH:'',
            topShow:false,
            depShow:false,
            threeShow:false
        }
    },
  computed: {
    ...mapState(["selectFriendId", "selectDepartment","searchText","selectedSort"]),
    ...mapGetters(["searchedFriendlist","searchedDepartmentList","searchedInitSubList",'searchedsubdepartmentList','searchedthreedepartmentList','searchGroopFriendlist','searchedThreeDepList'])
  },
//   updated () {
//       if(this.searchedFriendlist.length==0){
//         this.$message({
//             message:'请输入正确的关键字',
//             duration:2500,
//             type:'error',
//             center:true,
//             showClose:true
//         })
//       }
//   },
  methods: {
    ...mapActions(["selectFriend"]),
    dbClick(){
        this.$store.dispatch('send');
        Events.$emit('clearTag','');
    },
    getDepartmentidSubdepartment(e,item,index){
        // 获取子级部门及该顶级部门的人员
        var me=this;
     

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
            var retvalue=JSON.parse(yield new_employees.searchEmployee("",false,item.organId));
            if(retvalue.success==true){
                retvalue.data.data.items.forEach(item => {
                    item.getLev=2;
                });
                me.$store.dispatch("departmentList", retvalue.data.data.items)
                if (item.organId != me.topId) {
                    me.topId = item.organId;
                    me.threeShow = false;
                    me.depShow = false;
                    me.topShow = true;
                    me.$refs.topTag.scrollTop=49*index;
                }
                else {
                    me.topShow = !me.topShow;
                }
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
        })
    },
    // 获取二级部门的三级部门及人员
    getTopdepartment(todo){
        var me=this;
        console.log("二级部门")
        console.log(todo)
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
                me.$store.dispatch("subdepartmentList", subretvalue.data.data.items)

                if (todo.organId != me.depId) {
                    me.depId = todo.organId;
                    me.depShow = true;
                    me.threeShow = false;
                } else {
                    me.depShow = !me.depShow;
                }
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
};
</script>

<style lang="stylus" scoped>
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
            padding: 6px;
            transition: background-color 0.1s;
            font-size: 0;

            &:hover {
                background-color: rgb(220, 220, 220);
            }

            &.active {
                background-color: #c4c4c4;
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
            padding: 6px;
            padding-left :30px;
            transition: background-color 0.1s;
            font-size: 0;

            &:hover {
                background-color: rgb(220, 220, 220);
            }

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
                    line-height: 20px;
                    color:#222
                }
                .listPosname{
                    font-size: 12px;
                    line-height: 16px;
                    color :#999
                }
            }
    }
.topDep{
    font-weight :600;
}
.icon{
    flex 1
    text-align right
    line-height 36px
}
</style>
