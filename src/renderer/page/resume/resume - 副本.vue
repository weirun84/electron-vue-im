<template>
	<div class="resume">
		<div class="about">
            <search></search>
			<collected></collected>
		</div>
        <div class="collInfoBox">
            <collInfo></collInfo>
        </div>
	</div>
</template>

<script>
import search from '../../components/search/search'
import collected from '../../components/Collection/Collection'
import collInfo from '../../components/collectedInfo/collInfo'
import { mapState, mapGetters } from 'vuex';
	export default {
        components:{
            search,
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
        .wrapper
            width 90%       
.collInfoBox
    width calc(100% - 250px)
</style>