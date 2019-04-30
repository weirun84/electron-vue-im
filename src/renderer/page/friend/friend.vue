<template>
	<div class="content">
		<div class="friend-wrapper">
      <div style="height:65px;display:flex;align-items:center;">
			  <search></search>
      </div>
      <friendlist></friendlist>
		</div>
		<div class="friendinfo">
			<info v-if="selectedSort==1"></info>
		</div>
    
	</div>
</template>

<script>
import search from '../../components/search/searchAddPart'
import friendlist from '../../components/friendlist/friendlist'
import info from '../../components/info/info'
import { mapState, mapActions ,mapGetters } from 'vuex'
const clientiot = require("@hxim/clientiot");
var co = require('co');
var ret=false;
export default{
    components: {
        search,
        friendlist,
        info
    },
    computed: {
      	...mapState(['selectedSort'])
    },
    beforeCreate () {
      var me=this;
      //获取所有顶级部门
      co(function*(){
          var new_organization = new clientiot.organizationnew();
          var newFriend =JSON.parse(yield new_organization.getOrganizations());
            if(newFriend.success==true){
              me.$store.dispatch("getTopdepartment",newFriend.data.data.items)
            }
      })
    },
    mounted(){
      
    }
}
</script>

<style lang="stylus" scoped>
.content
  display: flex
  height :100%
  .friend-wrapper
    width: 250px
    background: rgb(230,230,230)
    display flex
    flex-direction column
    .friendlist
      width :250px
      height:100%
    .wrapper
      width:226px
  .friendinfo
    flex: 1
</style>