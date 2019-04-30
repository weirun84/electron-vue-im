<!-- 收藏类别列表 -->
<template>
<div class="taskDiv">
    <ul class="no-drag" v-if="searchedCollect&&searchedCollect.length>0">
        <li v-for="item in searchedCollect" class="collected" :class="{active:item.StepID===collectId}" @click="chooseCollect(item)">
            <div class="hx-list-left">
                <div class="time"><span class="proName">{{item.ProcessName}}</span><b style="font-size: 10px;float: right;">{{item.CreateAt}}</b></div>
                <span class="fullName">{{item.OwnerFullName}}</span>
                <span class="description">{{item.Description}}</span>
            </div> 
        </li>
    </ul>
    <div class="NoDataTips" v-if="searchedCollect.length==0">暂无数据</div>
</div>

</template>

<script>
import { mapState, mapGetters } from 'vuex';
const clientiot = require("@hxim/clientiot");
var co = require('co');
	export default {
        components:{
            
        },
        computed: {
            ...mapState(['collectId','searchText']),
            ...mapGetters(['searchedCollect'])
        },
        methods: {
            chooseCollect(value){
                var me=this;
                co(function* (){
                    var retvalue =JSON.parse(yield new clientiot.employeesnew().getSSOToken());
                    if(retvalue.success==true){
                        let values ={
                            tid:value.StepID,
                            pid:value.TaskID,
                            key:retvalue.data.data
                        }
                        me.$store.dispatch('chooseColl',values)
                    }
                })
                // if(retvalue.success==true){

                // }
                
            }
        },
        created () {
            var me = this;
            co(clientiot.bpm.GetTaskInfoList(retValue=>{
                retValue = JSON.parse(retValue)
                if(retValue.success==true){
                    console.log(retValue)
                    if(retValue.data.GetTaskInfoListResult.Counts>0){
                        me.$store.dispatch('requestList',retValue.data.GetTaskInfoListResult.RequestList.TaskInfo);
                    }
                }
            }))
        }
	}
</script>
<style lang="stylus" scoped>
@import '../../assets/fonts/iconfont.css'
.taskDiv
    overflow-y: auto;
    width: 250px;
    height: calc(100% - 50px);
    .collected
        display: flex
        padding: 12px
        height: 48px
        &:hover 
            background-color: rgb(220,220,220)
        &.active 
            background-color: #c4c4c4
        .avatar
            border-radius: 2px
            margin-right: 12px
    .time{
        font-size :14px;
    }
    .icon{
        font-weight bold
    }
    .hx-list-left{
        width 240px
        display flex
        flex-direction column
        justify-content: space-around;
    }
    .hx-list-left .description,.hx-list-left .fullName{
        font-size 12px
        width 220px
        color #666
        white-space:nowrap;
        text-overflow:ellipsis;
        overflow:hidden;
    }
    .description{
        font-size :10px !important;
    }
    .proName{
        width :150px;
        display :inline-block
        white-space:nowrap;
        text-overflow:ellipsis;
        overflow:hidden;
    }
    .NoDataTips{
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>

