<!-- 收藏类别列表 -->
<template>
<ul class="no-drag">
    <li v-for="item in searchedCollect" class="collected" :class="{active:item.id===collectId}" @click="chooseCollect(item.id)">
        <div class="hx-list-left">
            <span class="icon iconfont" :class="item.icon"  width="42" height="42"></span>
            <span class="time">{{item.name}}</span> 
        </div> 
    </li>
</ul>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
	export default {
        components:{
            
        },
        computed: {
            ...mapState(['collectId','searchText']),
            ...mapGetters(['searchedCollect'])
        },
        methods: {
            chooseCollect(value){
                this.$store.dispatch('chooseColl',value)
            }
        }
	}
</script>
<style lang="stylus" scoped>
@import '../../assets/fonts/iconfont.css'
.collected
            display: flex
            padding: 12px
            transition: background-color .1s
            &:hover 
                background-color: rgb(220,220,220)
            &.active 
                background-color: #c4c4c4
            .avatar
                border-radius: 2px
                margin-right: 12px
.time{
    font-size :15px;
}
.icon{
    font-weight bold
}
</style>

