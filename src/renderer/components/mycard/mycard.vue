<!-- 最左边的选择框 -->
<template>
  <div class="mycard">
    <header class="no-drag">
      <img
        v-if="realAvatarUrl"
        :src="realAvatarUrl"
        class="avatar"
        @click="openUserInfoWin()"
      >
    </header>
    <div
      class="navbar"
      @click="clearSearch()"
    >
      <router-link to="/chat" class="no-drag" exact>
        <span id="chat" class="icon iconfont icon-liaotian-xz"></span>
        <span class="messCount" style="display:none" ></span>
      </router-link>
      <router-link to="/friend" class="no-drag">
        <span id="friend" class="icon iconfont icon-tongxunlu-wx"></span>
      </router-link>
      <router-link to="/email" class="no-drag">
        <span id="email" class="icon iconfont icon-youjian-wx"></span>
      </router-link>
      <router-link to="/resume" class="no-drag">
        <span id="todoList" class="icon iconfont icon-daiban_wx"></span>
      </router-link>
    </div>
    <footer class="no-drag" @click="clearSearch()">
      <router-link to="/footer"  class="no-drag">
        <span id="setting" class="icon iconfont icon-shezhi-wx"></span>
      </router-link>
    </footer>
  </div>
</template>

<script>
import { mapState, mapMutations, mapGetters } from "vuex";
import { session, remote } from "electron";
import Events from '../../api/eventBus.js'
const clientiot = require("@hxim/clientiot");
var { ipcRenderer: ipc } = require("electron");
var co = require("co");
import { setTimeout } from "timers";
export default {
  data() {
    let currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    return {
      userInfo: {
        id: currentUser.id,
        nickname: currentUser.nickname,
        avatarUrl: currentUser.avatarUrl
      },
    };
  },
  computed: {
    ...mapState(["user"]),
    ...mapGetters(["messCount"]),
    realAvatarUrl() {
      let user_image = JSON.parse(sessionStorage.getItem("currentUser"))
        .avatarUrl;
      if (this.userInfo.avatarUrl == null) {
        return "static/images/UserAvatar.jpg";
      } else {
        return user_image;
      }
    }
  },
  methods: {
      openUserInfoWin() {
          //打开人员信息查看窗体
          var userinfo = JSON.parse(localStorage.getItem("*&_userInfo")).data

          ipc.send("MAINWIN:userInfoWin", userinfo.employee_id, userinfo);
      },
   
    iconTag(){
      var currTag = this.$route.path,
          chatDom = document.getElementById("chat"),
          friendDom = document.getElementById("friend"),
          emailDom = document.getElementById("email"),
          todoDom = document.getElementById("todoList"),
          settDom = document.getElementById("setting");
      // 聊天列表
      if(currTag == "/chat"){
          chatDom.classList.remove("icon-liaotian-wx");
          chatDom.classList.add("icon-liaotian-xz");
      }else{
          chatDom.classList.remove("icon-liaotian-xz");
          chatDom.classList.add("icon-liaotian-wx")
      };
      // 通讯录
      if(currTag == "/friend"){
          friendDom.classList.remove("icon-tongxunlu-wx");
          friendDom.classList.add("icon-tongxunlu-xz");
      }else{
          friendDom.classList.remove("icon-tongxunlu-xz");
          friendDom.classList.add("icon-tongxunlu-wx")
      };
      // 邮箱
      if(currTag == "/email"){
          emailDom.classList.remove("icon-youjian-wx");
          emailDom.classList.add("icon-youjian-xz");
      }else{
          emailDom.classList.remove("icon-youjian-xz");
          emailDom.classList.add("icon-youjian-wx")
      };
      // 待办事项
       if(currTag == "/resume"){
          todoDom.classList.remove("icon-daiban_wx");
          todoDom.classList.add("icon-daiban_xz");
      }else{
          todoDom.classList.remove("icon-daiban_xz");
          todoDom.classList.add("icon-daiban_wx")
      };
      // 设置
      if(currTag == "/footer"){
          settDom.classList.remove("icon-shezhi-wx");
          settDom.classList.add("icon-shezhi-xz");
      }else{
          settDom.classList.remove("icon-shezhi-xz");
          settDom.classList.add("icon-shezhi-wx")
      };
    },
    clearSearch() {
      this.iconTag();
      console.log(this.$route.path);
      if (this.$route.path == "/email") {
          var me = this;
          var loginUser_name=JSON.parse(localStorage.getItem("userMsg")).account;
          co(function*(){
            var GetMailUrl =JSON.parse(yield clientiot.hxapp.PostUrl("http://10.151.21.102:8099/webapi/AppAuthApi/GetMailUrl", { LoginName:loginUser_name}));
            if(GetMailUrl.data.success==true){
                sessionStorage.setItem('emailUrl',(GetMailUrl.data.data).replace('https:','http:'));
                // 获取最新的邮件链接
                me.$store.dispatch("newEmailUrl",(GetMailUrl.data.data).replace('https:','http:'))
            } 
          })
      }
      this.$store.dispatch("search", "");
      this.$store.dispatch("searchFriendValue", "");
      this.$store.dispatch("chatSearch", "");
      this.$store.dispatch("messSearch", "");
      this.$store.state.selectdeplev = 2;
      this.$store.state.selectDepartment = 0;
    }
  },
  mounted() {
    Events.$on("clearTag",data=>{
        this.iconTag();
    });
    const that = this;
  },
  updated() {
  }
};
</script>

<style lang="stylus" scoped>
@import '../../assets/fonts/iconfont.css';

.mycard {
  position: relative;
  width: 100%;
  height: 100%;

  .avatar {
    width: 36px;
    height: 36px;
    margin: 20px 12px 0 12px;
    border-radius: 2px;
  }

  .navbar {
    width: 100%;
    text-align: center;
	display: flex;
    flex-direction: column;
    height: 255px;
    justify-content: space-around;
  }

  .icon {
    display: inline-block;
    font-size: 26px;
    margin-top: 28px;
    margin-right:0px !important;
    padding: 0 16px;
    box-sizing: border-box;
    color: rgb(173, 174, 175);
    cursor: pointer;
    font-weight:200 !important;

    &.active {
      color: rgb(255, 255, 255);
    }

    &:hover {
      color: white;
    }
  }

  .icon-msg, .icon-more {
    font-size: 22px;
  }

  .icon-msg {
    padding: 0 19px;
  }
}

footer {
  position: absolute;
  bottom: 20px;
  width: 100%;
  text-align: center;
}

.emailDiv {
  position: absolute;
  top: 20px;
  left: 60px;
  width: 500px;
  height: 500px;
  z-index: 2;
  background: #ccc;
}

.messCount {
  position: absolute;
  font-size: 10px;
  color:white;
  background-color: #e4393c;
  width: 15px;
  height: 15px;
  right: 12px;
  top: 82px;
  line-height: 15px;
  border-radius: 50%;
  text-align: center;
  color: #fff;
}
.icon-liaotian-xz,.icon-tongxunlu-xz,.icon-youjian-xz,.icon-daiban_xz,.icon-shezhi-xz{
  color:white !important;
}
</style>
