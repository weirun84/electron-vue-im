<template>
	 <div>
		 <section>
			 <ul> 
				<li v-for="(item, index) in data">
					<span class="hx_title"><input class="radio" type="checkbox" :id="item.wxid" :value="item.petname"></span>
					<div class="personlist_img">
						<img :src="item.headurl" alt="">
					</div>
					<div class="personlist_name ellipsis">
						<label :for="item.wxid" >{{item.remarks ? item.remarks : item.petname}}</label>
					</div>
					
				</li> 
			 </ul>
		 </section>
	 </div>
</template>

<script>  
	import {mapActions, mapGetters, mapState} from 'vuex' 
	export default{   
	computed: {
		 
    }, 
	props:['data'],
	methods:{ 
			
	}
	}
</script>
<style  scoped>
	 
</style>