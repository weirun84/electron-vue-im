<!-- 聊天列表 -->
<template>
    <div class="msglist msglists no-drag" ref="chatList">
        <ul>
            <li v-for="(item,index)  in searchedChatlist" class="sessionlist" :class="{ active: item.index === selectId }" @click="selectSession(item)" @contextmenu="showMenu(index)" :getUserdata="getUserAllowedSend()">
                <div class="msg-header">
                    <div class="list-left">
                        <!--<div :class="getWrapperClass(item)" :id="forId(item)" v-if="item.channelType==='G'||showMembers(item).length>0">
                            <div v-for="(header,index) in showMembers(item)" class="box"  v-if='index<9'>
                                <img :src="showHeader(header.member_id).photoUrl" alt="" style="width:100%;height:100%" />
                            </div>
                        </div>

                        <img v-else class="avatar" width="42" height="42" :alt="item.user.name" :src="item.user.img">-->
                         <img class="avatar" width="42" height="42" :alt="item.user.name" :src="item.user.img"> 
                    </div>
                    <div class="this_msg_list_underLen" style="display:none">{{item.underLen}}</div>
                     <i class="weui-badge" v-show="item.underLen >0 && item.underLen <99">{{item.underLen}}</i>
                     <i class="weui-badge" v-show="item.underLen >99">99+</i>
                     <i class="weui-badge weui-badge_dot" v-show="item.newMsgCount == 0"></i>
                   </div>
                <div class="list-right">
                    <p class="name">{{item.user.name}}</p>
                    <span class="time">{{item.messages[item.messages.length-1].date | time}}</span>
                    <p class="lastmsg"><span style='color:#e4393c;width:100px;' v-show="item.AtPoples||item.atAll">[有人@我]</span><span v-html="showMessageLast(item.messages,item.channelType)"></span></p>
                    <!-- <p class="lastmsg" v-if="item.messages[item.messages.length-1].msgType == 'file'"><span class="messageListPd" v-if="item.channelType=='G'&& item.messages[item.messages.length-1].self!=true">{{item.messages[item.messages.length-1].msgUserName}} :</span>[文件]</p>
                    <p class="lastmsg" v-else-if="item.messages[item.messages.length-1].msgType == 'image'"><span class="messageListPd" v-if="item.channelType=='G' && item.messages[item.messages.length-1].self!=true">{{item.messages[item.messages.length-1].msgUserName}} :</span>[图片]</p>
                    <p class="lastmsg" v-else-if="item.messages[item.messages.length-1].msgType == 'video'"><span class="messageListPd" v-if="item.channelType=='G' && item.messages[item.messages.length-1].self!=true">{{item.messages[item.messages.length-1].msgUserName}} :</span>[视频]</p>
                    <p class="lastmsg" v-else-if="item.messages[item.messages.length-1].msgType == 'audio'"><span class="messageListPd" v-if="item.channelType=='G' && item.messages[item.messages.length-1].self!=true">{{item.messages[item.messages.length-1].msgUserName}} :</span>[音频]</p>
                    <p class="lastmsg" v-else >
                        <span class="messageListPd" v-show="item.channelType=='G' && item.messages[item.messages.length-1].self!=true&&item.messages[item.messages.length-1].msgUserName">{{item.messages[item.messages.length-1].msgUserName}}:</span>
                        <span class="hx-msgHtmlBox" v-html="replaceFace(item.messages[item.messages.length-1].content)"></span><img width="19" height="19" src="./Immunity.svg">
                    </p> -->
                    <span class="Exempting" v-if="item.Immunity" :style="backgroundDiv"></span>
                </div>
                <VueContextMenu :contextMenuData="contextMenuData" :transferIndex="transferIndex" @savedata="savedata(item)" @deldata="deldata(item)">
                </VueContextMenu>
            </li>
        </ul>

    </div>
</template>

<script>
import VueContextMenu from "./VueContextMenu";
import { mapState, mapActions, mapGetters } from "vuex";
import img from "../../assets/logo.png";
import moment from "moment";
import Events from '../../api/eventBus.js';
moment.locale("zh-cn");
const clientiot = require("@hxim/clientiot");
var co = require("co");
var UserSendstatusID;
export default {
  data() {
    return {
      transferIndex: null,
        userData: [],
      contextMenuData: {
        menuName: "name",
        axios: { x: null, y: null },
        menulists: [
        //   {
        //     fnHandler: "savedata", // Binding events(绑定事件)
        //     icoName: "fa fa-home fa-fw", // icon (icon图标 )
        //     btnName: "置顶" // The name of the menu option (菜单名称)
        //   },
          {
            fnHandler: "deldata",
            icoName: "fa fa-home fa-fw",
            btnName: "删除"
          }
        ]
      },
      backgroundDiv: {
        backgroundImage: 'url(' + require('./Immunity.svg') + ')'
      },
      Exempting:localStorage.getItem('Exempting'), 
    };
  },
  components: {
    VueContextMenu
  },
  computed: {
    ...mapState([
      "selectId",
      "searchText",
      "chatlist",
      "msgCounting",
      "selectFriendId",
      "PerturbedStates",
      "emojis", 
      "atMe"
    ]),
    ...mapGetters(["searchedChatlist"])
  },
  methods: {
    ...mapActions(["selectSession"]),
     showMessageLast(value,type){
         let userId = JSON.parse(localStorage.getItem("userMsg")).employee_id;
        var me=this;
        if( value!=''){  
           for(var i=0;i<value.length;i++){
               if(i==value.length-1){
                   if(type=='G'&& value[i].self==undefined&&value[i].msgUserName!=undefined){
                    if(value[i].msgType=='image'){
                        var con=value[i].msgUserName+":<span>[图片]</span>"
                        return con
                    }else if(value[i].msgType=='file'){
                        var con=value[i].msgUserName+":<span>[文件]</span>"
                        return con
                    }else if(value[i].msgType=='video'){
                        var con=value[i].msgUserName+":<span>[视频]</span>"
                        return con
                    } else if (value[i].msgType =='voice'){
                        var con=value[i].msgUserName+":<span>[语音]</span>"
                        return con
                    }
                    else if (value[i].msgType == 'location') {
                        var con = value[i].msgUserName + ":<span>[位置]</span>"
                        return con
                    }
                    else if (value[i].msgType == 'text' || value[i].msgType == 'http' || value[i].msgType == 'notic' || value[i].msgType == 'once') {
                        var con = value[i].msgUserName + ":<span>" + me.replaceFace(value[i].content) + "</span>"  
                        if (value[i].content.indexOf('图片={') > -1) {
                            con = value[i].msgUserName + ":<span>[图片]</span>"
                        }
                        return con
                    }
                    else{ 
                        var con = value[i].msgUserName+":<span>[不支持的类型]</span>"  
                        return con
                    } 
                   }else{
                        if(value[i].msgType=='image'){
                        var con="<span>[图片]</span>"
                        return con
                    }else if(value[i].msgType=='file'){
                        var con="<span>[文件]</span>"
                        return con
                    }else if(value[i].msgType=='video'){
                        var con="<span>[视频]</span>"
                            return con
                        } else if (value[i].msgType == 'voice') {
                            var con = "<span>[语音]</span>"
                            return con
                        } else if (value[i].msgType == 'location') {
                            var con = "<span>[位置]</span>"
                            return con
                        } else if (value[i].msgType == 'text' || value[i].msgType == 'http' || value[i].msgType == 'notic' || value[i].msgType =='once') {
                            var con = "<span>" + me.replaceFace(value[i].content) + "</span>"  
                            if (value[i].content.indexOf('图片={') > -1) {
                                con = "<span>[图片]</span>"
                            }
                            return con
                    }else{ 
                            var con = "<span>[不支持的类型]</span>"
                        return con
                    } 
                   }
                   
               }
           }
        }
    }, 
     forId:function(index){
		return "forid_chatlist" +index.id
    },
    // forId_box(index){
    //     return "forid_chat_box" +index.id
    // },
    showMenu(index) {
      this.transferIndex = index;
      event.preventDefault();
      var x = event.clientX;
      var y = event.clientY;
      // Get the current location
      this.contextMenuData.axios = { x, y };
    },
    savedata(item) {
      this.$store.dispatch("topChatlist", item);
      this.$nextTick(function() {
        console.log(this.searchedChatlist);
      });
      },
      showMembers(item) {
          var allGroupObj = JSON.parse(localStorage.getItem("$userAllGroup")).data;
          var thisGroupMembers = allGroupObj.find(ob => ob.group_id === item.id);

          if (thisGroupMembers) {
                  if (thisGroupMembers.members.length < 5) {
                      // chat_list.setAttribute('class',"wrapper2"); 
              }

              return thisGroupMembers.members;
          }
          else {
              return [];
          }
      },
      getWrapperClass(item) {
          return "wrapper wrapper"+this.showMembers(item).length
      },
      showHeader(fromId) {
          return JSON.parse(clientiot.globalinfo.getUserInfoByJson(fromId));
      },
      getHeaderColumns(length) {
          var cell = Math.ceil(length / 3);

          if (cell > 3) {
              cell = 3;
          }

          return cell;
      },
    deldata(item) {
      this.$store.dispatch("delChatlist", item);
      co(function*() {
        console.log("===========删除聊天列表=============");
        var sql =
          "delete from HxImMsgList where messageList_id='1033bfb9-d64a-43bc-83ff-b338cd664bf3'";
        clientiot.sqllite.executeNoQuerySql(sql, function(res) {
          console.log(res);
        });
      });
    },
    getUserAllowedSend(){
        //获取禁言数据
        //  var _self=this;
        //  sessionStorage.setItem('getUserAllowedSendStatus',UserSendstatusID);
        //  _self.$store.dispatch('getUserAllowedSend',UserSendstatusID)
    },
      replaceFace(con) {
          if (!con && typeof con == "object") {
             return con
          }
          if (typeof con != "string") {
              return con
          }

        if (con.includes("/:")) {
            var emojis = this.emojis;
            for (var i = 0; i < emojis.length; i++) {
                con = con.replace(/<\/?p[^>]*>/gi,'').replace(
                    emojis[i].reg,
                    '<img src="static/emoji/' +
                    emojis[i].file +
                    '"  alt="" style="vertical-align: middle; width: 20px; height: 20px" />'
                );
            }
            return con;
        }
        var con=con.replace(/<\/?p[^>]*>/gi,'');
        return con.replace(/style\s*?=\s*?([‘"])[\s\S]*?\1/, '');
    },
  },
  filters: {
    // 将日期过滤为 hour:minutes
      time(dateTime) {
          var result = "";
        if (typeof dateTime == "object") {
            dateTime = Date.parse(dateTime);
        };
          if (typeof dateTime == "string"){
              dateTime = parseInt(dateTime);
        }

        var minute = 1000 * 60;
        var hour = minute * 60;
        var day = hour * 24;
        var month = day * 30;

          var tempTime = dateTime ? dateTime : new Date().getTime();

        var now = new Date().getTime();
        var diffValue = now - tempTime;

        var monthTemp = diffValue / month;
        var weekTemp = diffValue / (7 * day);
        var dayTemp = diffValue / day;
        var hourTemp = diffValue / hour;
          var minTemp = diffValue / minute;
          //获取当天0点时间戳
          var thisDayUx = new Date(new Date(new Date().toLocaleDateString()).getTime()).getTime();
          var diffHourTemp = (now - thisDayUx) / hour;

          //获取星期一0点时间戳
          var tempDay = new Date(dateTime).getDay() || 7;
          var thisWeekUx = new Date(new Date(dateTime).getFullYear(), new Date(dateTime).getMonth(), new Date(dateTime).getDate() + 1 - tempDay).getTime();
          var diffWeekTemp = (now - thisWeekUx) / (7 * day);

          if (monthTemp >= 1) {
              result = moment(dateTime).format('YYYY-MM-DD');
          }
          else if (weekTemp > 1 || diffWeekTemp > 1) {
              result = moment(dateTime).format('YYYY-MM-DD');
          }
          else if (dayTemp >= 1 && dayTemp < 2 || hourTemp >= diffHourTemp && (hourTemp - diffHourTemp) <= 24) {
              result = "昨天";
          }
          else if ((hourTemp - diffHourTemp) > 24 && weekTemp<1) {
              //展示星期几
              var timedat = new Date(dateTime);
              switch (timedat.getDay()) {
                  case 0: result = "星期日"; break;
                  case 1: result = "星期一"; break;
                  case 2: result = "星期二"; break;
                  case 3: result = "星期三"; break;
                  case 4: result = "星期四"; break;
                  case 5: result = "星期五"; break;
                  case 6: result = "星期六"; break;
              }
          }
          else {
              result = moment(dateTime).format('HH:mm');
          }
        return result;
    }
  },

  mounted() {
    
    //     co(function*(){ 
    //     var loginUser_id=JSON.parse( sessionStorage.getItem("currentUser")).id;
    //     var getUserAllowedSendStatus=yield clientiot.groups.getUserAllowedSendStatus(loginUser_id);
    //     console.log("获取禁言数据:"+getUserAllowedSendStatus)
    //         return getUserAllowedSendStatus
    //     }).then(function(getUserAllowedSendStatus){
    //          var UserSendstatus=JSON.parse(getUserAllowedSendStatus);
    //     if(UserSendstatus.success==true){
    //          UserSendstatusID= getUserAllowedSendStatus; 
           
    //     }
    // })
  },
  watch:{
      searchedChatlist(){
          this.$refs.chatList.scrollTop = 0
          if(this.searchedChatlist.length==0){
              this.$store.state.disPlayChatboxs=false; 
          }
      }
  }
};
</script>

<style lang="stylus" scoped>
.msglists {
    overflow-y: auto;
    box-sizing: border-box;
    height: calc(100% - 60px);
} 
.sessionlist {
    display: flex;
    padding: 12px;
    transition: background-color 0.1s;
    font-size: 0;
}

.sessionlist:hover {
    background-color: rgb(220, 220, 220);
    cursor:default
}

.sessionlist.active {
    background-color: #c4c4c4;
}

.sessionlist.topping {
    background-color: #999;
}

.avatar {
    border-radius: 2px;
    margin-right: 12px;
    margin-top: 5px;
}

.list-right {
    position: relative;
    flex: 1;
    margin-top: 4px;
}

.name {
    display: inline-block;
    vertical-align: top;
    line-height: 18px;
    font-size: 13px;
    width: 96px;
    font-weight: 300;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.time {
    float: right;
    color: #999;
    font-size: 11px;
    vertical-align: top;
}

.lastmsg {
    position: absolute;
    font-size: 12px;
    width: 130px;
    display:flex;
    color: #999;
    bottom: 4px;
    overflow: hidden;
    white-space: nowrap; 
    padding: 3px 0px;
}

.imgstyle {
    display: flex;
    justify-content: center;
    flex-flow: row wrap;
    align-items: flex-start;
    align-content: flex-start;
    overflow: hidden;
    background: #dddbdb;

    img {
        width: 10%;
        height: auto;
        border: 0;
        flex-grow: 2;
    }
}

.imgstyletwo {
    img {
        width: 50%;
        height: 50%;
        flex-grow: 0;
    }
}

.msg-header {
    position: relative;
    width: 50px;
    height: 50px;
    margin-right: 10px;
}

.weui-badge {
    position: absolute;
    top: -0.4em;
    right: -0.5em;
    display: inline-block;
    padding: 2px 5px;
    min-width: 6px;
    border-radius: 18px;
    background-color: #f43530;
    color: #fff;
    line-height: 1.2;
    text-align: center;
    font-size: 10px;
    vertical-align: middle;
}

.weui-badge_dot {
    position: absolute;
    top: -0.3em;
    right: -0.3em;
}

i {
    font-style: normal;
}

.weui-badge_dot {
    position: absolute;
    top: -0.3em;
    right: -0.3em;
}

i {
    font-style: normal;
}

.multi-header {
    height: 100%;
    border-radius: 5px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    display: -webkit-flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-box-align: start;
    -webkit-align-items: flex-start;
    -ms-flex-align: start;
    align-items: flex-start;
    overflow: hidden;
    background: #dddbdb;
}

.messageListPd {
    padding-right: 5px;
}

.Exempting {
    position: absolute;
    top: 21px;
    display: inline-block;
    right: -4px;
    color: #f00;
    font-size: 12px;
    width: 26px;
    height: 23px;
    background-repeat: no-repeat;
}

.hx-msgHtmlBox >>> p {
    display:inline-block
}
.lastmsg >>> span {
    background-color: inherit!important;
    width: 120px;
    display: inline;
    align-items: end;
    height:20px;
    line-height:20px;
    flex-direction: row; 
}
.lastmsg >>> b{
    display: inline-block;
    height: 20px;
    line-height: 20px;
}
.lastmsg >>> p{
    width: 140px;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    height:20px;
    line-height:20px;
}
.lastmsg >>> img{
    vertical-align :bottom;
    width: 19px;
}

    .wrapper {
        padding: 1px;
        background: #dadada;
        width: 42px;
        height: 42px;
        display: grid;
        grid-gap: 1px;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        grid-auto-flow: row;
    }

    .box {
        background-color: #ccc;
        color: #000;
        border-radius: 2px;
        padding: 1px;
        width: 11px;
        height: 11px;
    }
    .columns2 {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
    }

    /**2人图片排列*/
    .wrapper2 {
        grid-template-columns: repeat(1, 1fr);
        grid-template-rows: repeat(1, 1fr);
        overflow: hidden;
    }
    .wrapper2 .box {
        width: 42px;
        height: 42px;
        padding:0px;
    }

    /**3、4人的时候*/
    .wrapper3, .wrapper4 {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(2, 1fr);
    }
    .wrapper3 .box,.wrapper4 .box {
        width: 21px;
        height: 21px;
        padding:0px;
    }

        /**5、6人的时候*/
    .wrapper5, .wrapper6 {
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(2, 1fr);
    }
    .wrapper5 .box,.wrapper6 .box {
        width: 11px;
        height: 11px;
        padding:0px;
        margin:10px 0 0 0
    }
        .wrapper5 .box:nth-child(4), .wrapper5 .box:nth-child(5), .wrapper6 .box:nth-child(4), .wrapper6 .box:nth-child(5), .wrapper6 .box:nth-child(6) {
            width: 11px;
            height: 11px;
            padding: 0px;
            margin: 0px 0px 5px 0
        }
</style>
