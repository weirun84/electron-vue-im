<template>
	<div class="hx-content no-drag" >
         <header class="header" style="-webkit-app-region:drag">
            <div></div>
        </header>
		<div class="hx-friend-wrapper" style="-webkit-app-region: no-drag" id="hx-contentdrag">
         <div v-if="newEmailUrl=''" style="width:100%;height:100%;text-align: center;" :data-url="url"></div>  
		 <webview id="hx-iframe" v-else :src="newEmailUrl" width="100%" height="100%" ></webview >
         
		</div> 
	</div>
</template>

<script> 
import { mapState, mapActions ,mapGetters } from 'vuex'
import { setTimeout } from 'timers';
const clientiot = require("@hxim/clientiot");
var co = require('co');
var ret=false; 
export default{  
    computed: {
      	...mapState(['newEmailUrl'])
    },
     data(){
        return{
            url:null,
        }
    },
    methods:{
        // getUrl(){
        //     var self = this;
        //     var loginUser_name=JSON.parse(localStorage.getItem("userMsg")).account;
        //     co(function*(){
        //      var retvalue = yield clientiot.hxapp.PostUrl("http://10.151.21.102:8099/webapi/AppAuthApi/GetMailUrl", { LoginName:loginUser_name});
        //      console.log(retvalue)
        //      var GetMailUrl=JSON.parse(retvalue);
        //      if(GetMailUrl.data.success==true){
        //          self.showDiv=false;
        //          self.url= (GetMailUrl.data.data).replace('https:','http:');
        //          sessionStorage.setItem('emailUrl',self.url);
        //      } 
        //     })
        // }
    },
  
    mounted(){
        if(ret==false){
             ret=true
        }
    // let url= sessionStorage.getItem('emailUrl');
       const that = this;
    //    that.url=url;
    //    const webview = document.querySelector('webview')
        window.onresize = () => {
            return (() => {
                if(this.$route.path=="/email"){
                    window.screenWidth = document.body.clientWidth;
                    window.screenHeight = document.body.clientHeight;
                    that.screenHeight=window.screenHeight
                    that.screenWidth = window.screenWidth
                     let iHeight = document.getElementById("hx-iframe");
                    let dHeight = document.getElementById("hx-contentdrag");
                    iHeight.style.height=that.screenHeight-20+"px";
                    iHeight.style.width=that.screenWidth-60+"px";
                    dHeight.style.height=that.screenHeight-20+"px";
                    dHeight.style.width=that.screenWidth-60+"px";
                }
        })()
        };
        setTimeout(()=>{
             ret=false
        },50000) 
    },
     updated () {
         if(this.$route.path=="/email"){
             var winHeight=document.body.clientHeight;
             var winWidth=document.body.clientWidth;
             let iHeight = document.getElementById("hx-iframe");
             let dHeight = document.getElementById("hx-contentdrag");
             iHeight.style.height=winHeight-20+"px";
             iHeight.style.width=winWidth-60+"px";
             dHeight.style.height=winHeight-20+"px";
             dHeight.style.width=winWidth-60+"px";
         }
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
 
.header{
    height:20px
    line-height: 20px
    font-size :18px
    padding-left: 20px 
    background-color :#0072C6
}
 webview {
    display:inline-flex;
    width:640px;
    height:480px;
  }
  webview.hide {
    visibility: hidden;
  }     
</style>