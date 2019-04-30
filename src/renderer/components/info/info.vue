<!-- 好友信息 -->
<template>
   <div class="Info-wrapper">
        <div class="newfriend" v-if="selectedFriend!=undefined">
			<div class="nickname">{{selectedFriend.employeeName}}</div>
		</div>
        <div class="friendInfo" v-if="selectedFriend!=undefined">
	   	    <div class="esInfo" >
	   	    	<div class="left no-drag">
	   	    		<div class="people">
	   	    			<div class="nickname">{{selectedFriend.employeeName}}</div>
	   	    			<div :class="[selectedFriend.sex=='1'?'gender-male':'gender-female']"></div>
	   	    		</div>
	   	    		<div class="signature">{{selectedFriend.code}}</div>
	   	    	</div>
	   	    	<div class="right">
	   	    	    <img class="avatar"  width="60" height="60" v-bind:src="selectedFriend.photoUrl">
	   	    	</div>
	   	    </div>
	   	    <div class="detInfo">
	   	    	<div class="remark no-drag"><span class="posname">岗位</span>{{selectedFriend.postName}}</div>
	   	    	<div class="area no-drag"><span>移动电话</span>{{selectedFriend.mobile}}</div>
	   	    	<div class="wxid no-drag"><span>办公电话</span>{{selectedFriend.officePhone==''?'暂无':selectedFriend.officePhone}}</div>
	   	    	<div class="wxid no-drag"><span>办公地址</span>{{selectedFriend.workPlace}}</div>
	   	    	<div class="wxid no-drag"><span>电子邮箱</span><a href="mailto:selectedFriend.eMail" target="_blank">{{selectedFriend.eMail}}</a></div>
	   	    </div>
	   	    <div class="sends no-drag" style="margin:50px auto" @click="send">
    	        发消息
            </div>
	   	</div>
   </div>
</template>

<script>
import router from '../../router'
import { mapGetters,mapState } from 'vuex'
import Events from '../../api/eventBus.js'
export default {
    computed: {
		...mapGetters(['selectedFriend'])

    },
    methods: {
    	send () {
			this.$store.dispatch('send');
			this.$store.state.disPlayChatboxs = true;
			 Events.$emit('delSearch', '');
			 Events.$emit('clearTag','');
    	}
    }
}
</script>

<style lang="stylus" scoped>
.newfriend
    height: 60px
    padding: 28px 0 0 30px
    box-sizing: border-box
    border-bottom: 1px solid #e7e7e7
    .nickname
        font-size: 18px
.friendInfo
    -webkit-user-select:text;/*webkit浏览器*/
    padding: 0 60px
	.esInfo
	    display: flex
	    align-items: center
	    padding: 10% 0 45px 0
	    .left
	        flex: 1
	        .people
	            .nickname
	                display: inline-block
	                font-size: 20px
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
	        .signature
	            font-size: 14px
	            color: rgba(153,153,153,.8)
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
			span 
				margin-right :66px
	.sends
        text-align: center
        width: 140px
        height: 36px
        line-height: 36px
        font-size: 14px
        color: #fff
        background-color: #00549f
        cursor: pointer
        border-radius: 2px
        &:hover
            background: #00549f
.posname{
	margin-right :66px !important;
}
</style>

