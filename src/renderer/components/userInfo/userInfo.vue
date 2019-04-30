<!-- 好友信息 -->
<template>
   <div class="Info-wrapper" style="-webkit-user-select:text;">
       <div class="versionTitle">
            <p class="userTitle">个人信息</p>
        </div>
       <div class="friendInfo">
           <div class="esInfo">
               <div class="left no-drag">
                   <div class="people">
                       <div class="nickname" style="font-weight:600;">{{user.name}}</div>
                       <!-- 性别 -->
                       <!-- <div :class="[user.sex=='1'?'gender-male':'gender-female']"></div> -->
                   </div>
               </div>
               <div class="right">
                   <img class="avatar" width="100" height="100" v-bind:src="user.image_url">
               </div>
           </div>
           <div class="detInfo">
               <div class="remark no-drag"><span>岗位</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{user.post_name}}</div>
               <div class="area no-drag"><span>移动电话</span>{{user.mobilephonenum}}</div>
               <div class="area no-drag"><span>办公电话</span>{{user.officephonenum?user.officephonenum:"暂无"}}</div>
               <div class="area no-drag"><span>办公地址</span>{{user.addr?user.addr:"暂无"}}</div>
               <div class="wxid no-drag"><span>电子邮箱</span>{{user.email}}</div>
           </div>
           <div class="thisBut" @click="loginOut">
               <span class="no-drag">退出登录</span>
           </div>
           <div class="thisBut" @click="clearLocalStorage">
               <span class="no-drag">清空聊天</span>
           </div>
       </div>
   </div>
</template>

<script>
import router from '../../router'
import { mapGetters,mapState } from 'vuex'
const ipcRenderer = require('electron').ipcRenderer;
export default {  
    computed: {
        ...mapState(['user']),
		...mapGetters(['selectedFriend'])

    },
    methods: {
    	send () {
    		this.$store.dispatch('send')
    		this.$store.dispatch('search', '')
        },

        loginOut() {
            //ipc.send("MAINWIN:LoginOut", 420, 326, false);
            sessionStorage.clear();
            //router.push({ path: "/login" });
            ipcRenderer.send('MAINWIN:restart')
        },
        clearLocalStorage() {
            localStorage.removeItem("vue-chat");
            ipcRenderer.send('MAINWIN:restart')
        }

    }
}
</script>

<style lang="stylus" scoped>
.friendInfo
    padding: 0 90px
	.esInfo
	    display: flex
	    align-items: center
	    padding: 50px 0 50px 0
	    .left
	        flex: 1
	        .people
	            .nickname
	                display: inline-block
	                font-size: 24px
	                margin-bottom: 16px
	            .gender-male,.gender-female
	                display: inline-block
	                width: 18px
	                height: 18px
	                vertical-align: top
	                margin-top: 2px
	            .gender-male
	                background-image: url(man.png)
	                background-size: cover
	            .gender-female
	                background-image: url(woman.png)
	                background-size: cover
	    .right
	        .avatar
	            border-radius: 3px
	.detInfo
	    padding: 60px 0
	    border-top: 1px solid #e7e7e7
	    border-bottom: 1px solid #e7e7e7
	    .remark,.area,.wxid
	        font-size: 14px
	        margin-top: 20px
	        span
	            font-size: 14px
	            color: rgba(153,153,153,.8)
	            margin-right: 40px
	    .remark
	        margin-top: 0
	.send
        text-align: center
        width: 140px
        height: 36px
        line-height: 36px
        font-size: 14px
        color: #fff
        background-color: #1aad19
        cursor: pointer
        border-radius: 2px
        &:hover
            background: rgb(18,150,17)
.thisBut
        text-align: center
        width: 140px
        height: 36px
        line-height: 36px
        font-size: 14px
        margin: 10px
        float: left
        color: #fff
        background-color: #00549f
        cursor: pointer
        border-radius: 2px
        &:hover
            background: #00549f
		span 
			margin-right :0px
.Info-wrapper{
    width :100%;
    height :100%
}
.versionTitle{
        height: 50px;
        line-height: 50px;
        padding-left: 15px;
		border-bottom 1px solid #e7e7e7
}
.userTitle{
	font-size :large;
}
.esinfo{
	position relative
}
.left{
	height :100px
}
.right{
	position: absolute;
    right: 100px
}
</style>

