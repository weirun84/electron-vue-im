<!-- 聊天列表 -->
<template>
  <div class="msglist no-drag">
    <ul>
        <li v-for="item in searchedSetting" class="sessionlist" :class="{ active: item.id === settingid }" @click="chooseSetting(item.id)">
            <div class="hx-list-left">
            	<span class="icon iconfont" :class="item.icon"  width="42" height="42"></span>
                <span class="time">{{item.name}}</span> 
            </div> 
        </li>
        
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions ,mapGetters } from 'vuex'
export default {
    computed: {
   	    ...mapState(['settingid','searchText']),
        ...mapGetters(['searchedSetting'])
    },
    methods: {
    	chooseSetting(value){
            this.$store.state.settingid=value;
        }
    }
}
</script>

<style lang="stylus" scoped>
@import '../../assets/fonts/iconfont.css'
.msglist
  height: 540px
  overflow-y: auto
  .hx-list-left 
      width :100% 
      padding :5px 
  .sessionlist
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
    .list-right
        position: relative
        flex: 1
        margin-top: 4px
	    .name
	        display: inline-block
	        vertical-align: top
	        font-size: 14px
	    .time 
	        font-size: 15px
        .lastmsg
            position: absolute
            font-size: 12px
            width: 130px
            height: 15px
            line-height: 15px
            color: #999
            bottom: 4px
            overflow: hidden
            white-space:nowrap
            text-overflow:ellipsis

.active{
    background-color: #c4c4c4;
}
.icon{
    font-weight bold
}
</style>
