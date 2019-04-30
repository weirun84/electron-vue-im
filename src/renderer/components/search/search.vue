<!-- 搜索框 -->
<template>
<div class="wrapper">
	<div class="search-wrapper no-drag">
		<input type="text" class="searchInput" v-model="search" @keyup="change" placeholder="搜索">
		<i class="icon iconfont icon-sousuo" v-show="noText"></i>
		<div class="searchInput-delete" v-show="haveText" @click="del"></div>
	</div>
</div>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex"; 
import Events from '../../api/eventBus.js'
export default {
	props: ['add'],
	 ...mapState([ "members"]),
	 methods: {
        change () {
        	// this.$store.dispatch('search', this.search)
			this.fuzzyQuery(this.$store.state.members,this.search); 
        },
        del () {
            this.search= ''
            this.change()
        },
		fuzzyQuery(list, keyWord) {
			var me=this;
			var reg =  new RegExp(keyWord);
			var arr = [];
			for (var i = 0; i < list.length; i++) {
				if (reg.test(list[i].memberName)) {
					arr.push(list[i]);
				}
			} 
			me.$store.state.searchForward=arr
		} 
		
     },
     data () {
     	return {
     		search: '',
     		active: false,
			addthing:false,
     	}
     },
	  mounted(){
		 var _self=this;
		 Events.$on('delSearch',data=>{
			_self.search=''; 
			_self.$store.state.searchForward=[]
		});
	 },
     computed: {
        noText () {
   	      if(this.search  === '') return true
   	      return false
        },
        haveText () {
   	      if(this.search  === '') return false
   	      return true
        }
     },
	  components: { 
   }
}
</script>

<style lang="stylus" scoped>
@import '../../assets/fonts/iconfont.css'
	.wrapper{
	 	padding: 12px 12px 12px 12px 
		display: inline-block;
	}	
   
	.search-addPart{
		align-items: center;
		text-align: center;
		justify-content:center;
		display:flex;
	}
		
	.search-wrapper{
		position: relative
	  display: flex
	  box-sizing: border-box
	  height: 26px
	  background-color: #e5e3e2
	  border: 1px solid #d9d7d6
	  border-radius: 2px
	  flex:2
	}
	 
	  .searchInput{
		  flex: 1
	    font-size: 12px
	    padding: 6px
	    background-color: #e5e3e2
	    outline: none
	  }
	    
	    &:focus{
			background-color: #f2efee
		}
	    	
	  .icon-sousuo{
		  
	    display: inline-block
			margin-right: 0px
	    width: 24px
	    height: 24px
	    font-size: 14px
	    line-height: 24px
	    text-align: center
	  }
	  .searchInput-delete{
		  display: block
	    position: absolute
	    outline: none
	    top: 0;
	    right: 0;
	    width: 24px
	    height: 100%
	    background-image: url(delete.png)
	    background-size: 26px
	    background-position: center
	    background-repeat: no-repeat
	    cursor: pointer
	  }
	    
	
	.content{
		min-width: 500px;
    	max-width: 100%;
	}	
</style>
