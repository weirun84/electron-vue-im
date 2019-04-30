<!-- 好友列表 -->
<template>
 <div class="friendlist"> 
    <div class="hx-title" >已选择{{groupList.length}}个联系人</div>
      <ul>
        <li v-for="(item, index) in groupList" class="frienditem"  @click="DelListitem(index,item)">  
            <div class="friend-info ">
                <img class="avatar"  width="36" height="36" :src="item.images">
                <div class="listRemark">
                    <div class="listName">{{item.name}}</div>
                    <div class="listPosname">{{item.posname}}</div>
                </div>
            </div>      
            <span class="hx-dellist" ><a class="aui-close" href="javascript:void(0);">×</a></span> 
        </li>
    </ul> 
 </div>
</template>

<script>
import { mapState, mapActions ,mapGetters } from 'vuex'
import bus from '../../api/eventBus.js'
 
export default {
   
    data(){
       return{  
            message:""	, 
			}
    },
    computed: {
        ...mapState([
            'selectFriendId',
            'groupList',
            "members","GroupTitle"
        ]),  

    },
    methods: {  
        DelListitem:function(index,item){
            this.groupList.splice(index,1); 
             this.$store.dispatch("DelGrouplist",item)   
        },

        },
    mounted(){
          console.log(this.groupList)
    },
   
}
</script>

<style lang="stylus" scoped>
.friendlist
    height: 480px
    overflow-y: auto
    position: relative
    margin-left: 5px
    .frienditem
        position :relative;
        border-top: 0px solid #dadada
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
            padding: 12px
            transition: background-color .1s
            font-size: 0
            &:hover 
                background-color: rgb(220,220,220)
            &.active 
                background-color: #c4c4c4
            .avatar
                border-radius: 2px
                margin-right: 12px
            .remark
                font-size: 14px
                line-height: 36px
        .radio{
                display: block;
                }
.hx-dellist{
   position: absolute;
    top: 24px;
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
  .hx-title{
    height: 60px;
    line-height: 60px;
    font-size: 14px;
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
</style>
 