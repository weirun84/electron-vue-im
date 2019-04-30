<!-- 公共头部+关闭按钮 -->
<template>
	<div class="hx-closeBtn"  @click="showToggle">
        <a class="aui-close" href="javascript:void(0);">×</a>
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
export default {
    computed: { 
         ...mapState([ 
            'groupList','selectFriendId'
        ])
    }, 
    methods:{
        showToggle:function(){
            this.isShow = !this.isShow;
            this.$store.state.groupList='';
            this.$store.dispatch("addGroups", '');
            if(this.isShow){
               this.$emit('showToggle',true)
            }else{
                this.$emit('showToggle',false)
            }
        }
	}

}
</script>

<style lang="stylus">
  .hx-closeBtn{
    text-align: center;
    width: 20px;
    height: 20px; 
    position: absolute;
    right: 0px; 
    z-index: 99;
  }
  .aui-close{
     width: 20px;
    height: 20px;
    line-height: 20px;
    display: block;
    position: absolute;
    left:0px;
    top:0px;
    font-family: Helvetica, STHeiti;
    _font-family: '\u9ed1\u4f53', 'Book Antiqua', Palatino;
    font-size: 18px;
    border-radius: 0px;
    background: #999;
    color: #FFF;
    box-shadow: 0 1px 3px rgba(0, 0, 0, .3);
    -moz-transition: linear .06s;
    -webkit-transition: linear .06s;
    transition: linear .06s;
    padding: 0;
    text-align: center;
    text-decoration: none;
    outline: none;
    cursor: pointer;
  }
   .aui-close:hover {
    width: 20px;
    height: 20px;
    line-height: 20px;
    left:0px;
    top:0px;
    color: #FFF;
    box-shadow: 0 1px 3px rgba(209, 40, 42, .5);
    background: #d1282a;
    border-radius:0px;
    transition: all 0.2s ease-out;
    opacity: 0.8;
        }
</style>
