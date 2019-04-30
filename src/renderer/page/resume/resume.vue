<template>
	<div class="resume">
		<div class="about">
            <div class="headName">待办事项</div>
			<collected></collected>
		</div>
        <div class="collInfoBox">
            <collInfo></collInfo>
        </div>
	</div>
</template>

<script>
import collected from '../../components/Collection/Collection'
import collInfo from '../../components/collectedInfo/collInfo'
import { mapState, mapGetters } from 'vuex';
	export default {
        components:{
            collected,
            collInfo
        },
        computed: {
            ...mapState(['collectId','searchText']),
            ...mapGetters(['searchedCollect'])
        },
        methods: {
           
        }
	}
</script>

<style lang="stylus" scoped>
@import '../../assets/fonts/iconfont.css'
.resume
    display: flex
    height: 100%
    .about
        width: 250px
        background-color: rgb(230,230,230)
        box-sizing: border-box
        .headName
            width: 100%;
            height: 50px;
            line-height: 50px;
            text-align: center;
            font-size: 18px;
            border-bottom 1px solid #ccc;
        .wrapper
            width 90%       
.collInfoBox
    width calc(100% - 250px)
</style>