<template>
  <div id="app">
    <transition>
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </transition> 
  </div>
</template>
<script>
import { mapState, mapActions ,mapGetters } from 'vuex';
import { setTimeout } from 'timers'; 
var co = require('co');
const clientiot = require("@hxim/clientiot");
    export default {
      data() {
      return {
        
      }},
  computed: {
		...mapState(["chatlistText","NewPersonnel","Windowclosure"]) 
	 },
  mounted () {
    this.disableDragEvent();
    var userInfo=JSON.parse(sessionStorage.getItem('currentUser'));
    if(userInfo!=null){
      var userId=parseInt(userInfo.id);
      var me=this;
      var now = new Date();
       var getShieldNewArrs=[];
      // var chatlistData=clientiot.globalinfo.storage('$userAllGroup');
      co(function*(){
        var chatlistData =yield clientiot.groups.getGroupsByEid(userId);
        var chatlistData=JSON.parse(chatlistData);
          chatlistData.data.forEach(item=>{
            // 获取所有群组，聊天列表中没有则添加并置顶
            var results =  me.$store.state.chatlist.find(msg => msg.id && msg.id === item.group_id)
            if(!results||results==undefined){
              for(let i = 0; i < me.$store.state.chatlist.length; i++ ){
                  me.$store.state.chatlist[i].index=(i+1);
                }
                me.$store.state.chatlist.unshift({
                id: item.group_id, 
                user: {
                  name: item.group_name,
                  img: 'static/images/group.png'
                },
                messages: [ 
                  {
                    content: '已经建立会话，可以互发信息啦！',
                    date: now,
                    msgUserImg:'static/images/group.png',
                    msgType:'notic'
                  }
                ],
                index: 0,  // 当前在聊天列表中的位置,从1开始
                channelType:'G'
              })	
          } 
          });
           //var state=yield clientiot.employees.getShieldNew(userId);
           // console.log("获取免扰状态state:"+state)
           // var getShieldNewArr=JSON.parse(state).data.shield_info;
           
           // for(var i=0;i<getShieldNewArr.length;i++){
           //     getShieldNewArrs.push(parseInt(getShieldNewArr[i].shield_id));
           //     // if(parseInt(getShieldNewArr[i].shield_id)==id){ 
           //     //  sessionStorage.setItem('PerturbedStates', true);  
           //     //     break; 
           //     // }else{
           //     //    sessionStorage.setItem('PerturbedStates', false); 
           //     // } 
           // };
           //  me.$store.dispatch('PerturbedState',getShieldNewArrs);
             
      })
    };
    window.onerror = function(msg, url, line, col, error){
      // line = 3001
      var lineNum = line;
       
      console.log("错误位置："+error +parseInt(lineNum / 1000) - 1); 
     
    };
  },
  methods: { 
    disableDragEvent () {
      window.addEventListener('dragenter', this.disableDrag, false)
      window.addEventListener('dragover', this.disableDrag)
      window.addEventListener('drop', this.disableDrag)
    },
    disableDrag (e) {
      const dropzone = document.getElementById('DragUpload'); // 这个是可拖拽的上传区
      var  dropDom=document.getElementById('dropbox');
      if (dropzone === null || !dropzone.contains(e.target)) {
        e.preventDefault()
        e.dataTransfer.effectAllowed = 'none'
        e.dataTransfer.dropEffect = 'none'
      } 
    }
  },
  beforeDestroy () {
    window.removeEventListener('dragenter', this.disableDrag, false)
    window.removeEventListener('dragover', this.disableDrag)
    window.removeEventListener('drop', this.disableDrag)
  }
}
</script>

<style>
html,body,#app {
  width: 100%; 
  height: 100%;
  background-color:none;
  font-family: Microsoft YaHei;
  -webkit-user-select:none;/*webkit浏览器*/
  margin: 0px;
  padding: 0px; 
}
</style>
