<template>
  <div id="index"> 
    <div class="sidebar">
      <mycard></mycard>
    </div>
    <div class="main">
      <router-view></router-view> 
    </div> 
  </div>
</template>
<script>
import mycard from '../../components/mycard/mycard' 
import { mapActions } from 'vuex'
import '../../../../static/css/reset.css' ; 
export default {
  data(){
    return{
      isShow:true
    }
  },
   components: {
     mycard,  
   },

}
</script>

<style lang="stylus" scoped>
#index{
  display: flex
  margin: 0px auto
  width: 100%
  height :100%
  background-color: #fff
   -webkit-app-region:drag;
   #mytitle{
	    position: absolute;
      width: 100%;
      height: 20px;
      z-index :999;
      -webkit-app-region: drag;
    }
}

  .sidebar{
    width: 60px 
    height :100%
    background: #0072C6
  }
   
  .main{ 
    flex 1
    background: #f2f2f2
  }
   
.succ-pop h3.title{
    text-align: center;
    font-size: 22px;
    color: #ce002c;
}
</style>  
