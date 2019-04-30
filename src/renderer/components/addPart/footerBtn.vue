<!-- 公共 -->
<template>
	<div class="hx-cont">
        <div class="hx-cancel"  @click="showToggle">取消</div>
        <div class="hx-ascertain"  @click="submit(groupList,selectFriendId)" :data="selectFriendId">确定</div>
    </div>
</template>

<script> 
import { mapState, mapActions ,mapGetters } from 'vuex'
const clientiot = require("@hxim/clientiot");
var co = require("co"); 
export default { 
     computed: {
        ...mapState([ 
            'groupList','selectFriendId'
        ])
    }, 
   methods:{
        showToggle:function(){
            var me=this;
            this.isShow = !this.isShow;
             me.$store.dispatch("addGroups", '');
             me.$store.state.groupList=[]
            if(this.isShow){
               this.$emit('showToggle',true)
            }else{
                this.$emit('showToggle',false)
               
            }
        },
        submit:function(data,selectFriendId){ 
            var members=[];
            var groupName=[];
            var me=this;
            var loginUser_id=JSON.parse( sessionStorage.getItem("currentUser")).id;
           
            for(var i=0;i<data.length;i++){
                members.push(parseInt(data[i].employeeid));
                groupName.push(data[i].name)
            }
            if(selectFriendId>10000||selectFriendId==0){
            if(members.length>0){ 
                 var me=this;
                  this.$emit('showToggle',false) 
                    if(selectFriendId!=''){
                        members.push(parseInt(selectFriendId))
                    } 
                    console.log("===========新增群组=============");
                    var data = {
                        admit_mode: "1", //入群验证(0>需要管理员同意,1>不需要管理员同意,2>不允许加入) ,
                        group_name: groupName.join('、'),//groupName.join('、'),
                        group_range: "暂无描述",
                        group_theme: "暂无描述",
                        group_type: "custom", //群组类别:organization>按组织架构 flight>按航班沟通 conference>按会议 project>按项目 lives>图文直播 custom>自定义
                        invite_mode: "1", //邀请方式(0>群主邀请;1>群员可邀请)
                        members:Array.from(new Set(members)) ,//members
                        owner_eid: parseInt(loginUser_id), //群主的工牌号
                        proclamation:"暂无描述",
                        description:'暂无描述'
                    };
                    co(function*() {
                        var retvalue = yield clientiot.groups.addGroups(data);
                        var jsonRet = JSON.parse(retvalue).data;
                        // var obj = eval("(" + jsonRet + ")");
                        // console.log(obj)
                        // me.$store.dispatch("addGroups", jsonRet);
                        me.$emit('showToggle',false);
                        me.$store.state.groupList=[];
                        me.$store.state.selectFriendId=0;
                    });
                }else{
                    console.log('请选择需要添加的人员')
                }
            }else{
                    var me=this;
                    var menbers={
                        "addMembers":members,
                        "removeMembers": [0]
                        };
                    var data={selectFriendId,members};
                     co(function*() {
                        var retvalue = yield clientiot.groups.updateGroupsGidMembers(selectFriendId,menbers);
                        var jsonRet = JSON.parse(retvalue).data; 
                        console.log(jsonRet) 
                        me.$emit('showToggle',false); 
                        me.$store.dispatch("addGroups", '');
                        me.$store.state.groupList=[];
                        // me.$store.state.selectFriendId=0
                });
                }
                
                }, 
            }

        }
</script>
<style lang="stylus">
    .hx-cont{ 
        text-align :right
    }
    .hx-cancel{
        display :inline-block;
        width :100px;
        text-align :center;
        padding: 5px;
        border: 1px solid #d8d8d8;
        cursor: pointer;
    }
  .hx-cancel:hover{
      background :#d9d9d9;
  }
    .hx-ascertain{ 
        width :100px;
         display :inline-block;
        text-align :center;
        padding: 5px;
        color :white
        border: 1px solid #d8d8d8;
        background :green;
        cursor: pointer;
    }
</style>
 