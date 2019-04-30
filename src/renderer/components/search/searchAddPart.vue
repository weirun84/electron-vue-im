<!-- 搜索框 -->
<template>
  <div class="wrapper">
    <div class="search-wrapper no-drag">
      <input
        type="text"
        class="searchInput"
        v-model="search"
        @keyup="change"
        placeholder="搜索"
      >
      <i
        class="icon iconfont icon-sousuo"
        v-show="noText"
      ></i>
      <div
        class="searchInput-delete"
        v-show="haveText"
        @click="del"
      ></div>
    </div>

  </div>
</template>

<script>
import chatlist from "../../components/chatlist/chatlist";
import message from "../../components/message/message";
const clientiot = require("@hxim/clientiot");
import { mapState, mapActions, mapGetters } from "vuex";
import Events from "../../api/eventBus.js";
import { setTimeout } from "timers";
var co = require("co");
// 节流函数
const delay = (function() {
  let timer = 0;
  return function(callback, ms) {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
})();
export default {
  props: ["searchData"],
  ...mapState(["chatlist", "searchForward"]),
  data() {
    return {
      searchRouter: ""
    };
  },
  methods: {
    change() {
      var me = this;
      // this.$store.dispatch('search', me.search)
      if (me.search != "") {
        me.$route.path == "/chat"
          ? (me.searchRouter = true)
          : (me.searchRouter = false);
        co(function*() {
          // 该顶级部门下的人员
          var new_employees = new clientiot.employeesnew();
          var retvalue = JSON.parse(
            yield new_employees.searchEmployee(me.search, me.searchRouter, -1)
          );
          if (retvalue.success == true) {
            if (
              retvalue.data.data.items.length > 0 ||
              me.$store.state.searchForward.length > 0
            ) {
              retvalue.data.data.items.forEach(element => {
                element.getLev = 4;
              });
              if (retvalue.data.data.items.length == 0) {
                me.$store.dispatch("searchFriendValue", []);
                me.$store.dispatch("getTopdepartment", []);
              } else {
                me.$store.dispatch(
                  "searchFriendValue",
                  retvalue.data.data.items
                );
                me.fuzzyQuery(me.$store.state.chatlist, me.search);
              }
            } else {
              me.$store.dispatch("searchFriendValue", []);
              me.$store.dispatch("getTopdepartment", []);
              me.$message({
                message: "该搜索条件下暂无人员",
                duration: 2500,
                type: "error",
                center: true,
                showClose: true
              });
            }
          } else {
            me.$message({
              message: retvalue.errorMessage,
              duration: 2500,
              type: "error",
              center: true,
              showClose: true
            });
          }
        });
        this.fuzzyQuery(this.$store.state.chatlist, me.search);
      } else {
        me.$store.dispatch("searchFriendValue", []);
        me.$store.state.searchForward = [];
        co(function*() {
          var new_organization = new clientiot.organizationnew();
          var newFriend = JSON.parse(yield new_organization.getOrganizations());
          if (newFriend.success == true) {
            me.$store.dispatch("getTopdepartment", newFriend.data.data.items);
          } else {
            me.$message({
              message: newFriend.errorMessage,
              duration: 2500,
              type: "error",
              center: true,
              showClose: true
            });
          }
        });
      }
    },
    del() {
      var me = this;
      this.search = "";
      if (me.search != "") {
        me.change();
      } else {
        me.$store.dispatch("searchFriendValue", []);
        me.$store.state.searchForward = [];
        co(function*() {
          var new_organization = new clientiot.organizationnew();
          var newFriend = JSON.parse(yield new_organization.getOrganizations());
          if (newFriend.success == true) {
            me.$store.dispatch("getTopdepartment", newFriend.data.data.items);
          } else {
            me.$message({
              message: newFriend.errorMessage,
              duration: 2500,
              type: "error",
              center: true,
              showClose: true
            });
          }
        });
      }
    },
    fuzzyQuery(list, keyWord) {
      var me = this;
      var reg = new RegExp(keyWord);
      var arr = [];
      for (var i = 0; i < list.length; i++) {
        if (reg.test(list[i].user.name)) {
          arr.push(list[i]);
        }
      }
      me.$store.state.searchForward = arr;
    }
  },
  mounted() {
    var _self = this;
    Events.$on("delSearch", data => {
      _self.search = "";
      _self.del();
      _self.$store.dispatch("searchFriendValue", []);
    });
  },
  data() {
    return {
      search: "",
      active: false,
      addthing: false,
      datas: this.searchData
    };
  },
  computed: {
    noText() {
      if (this.search === "") return true;
      return false;
    },
    haveText() {
      if (this.search === "") return false;
      return true;
    }
  },
  components: {
    chatlist,
    message
  }
};
</script>

<style lang="stylus" scoped>
@import '../../assets/fonts/iconfont.css';

.wrapper {
  padding: 12px 12px 12px 12px;
  display: inline-block;
}

.search-addPart {
  align-items: center;
  text-align: center;
  justify-content: center;
  display: flex;
}

.search-wrapper {
  position: relative;
  display: flex;
  box-sizing: border-box;
  height: 26px;
  width: 100%;
  background-color: #e5e3e2;
  border: 1px solid #d9d7d6;
  border-radius: 2px;
  flex: 2;
}

.searchInput {
  font-size: 12px;
  padding: 6px;
  background-color: #e5e3e2;
  outline: none;
  width: 100%;
}

&:focus {
  background-color: #f2efee;
  width: 100%;
}

.icon-sousuo {
  display: inline-block;
  width: 24px;
  height: 24px;
  font-size: 14px;
  line-height: 24px;
  text-align: center;
  margin-right: 0;
}

.searchInput-delete {
  display: block;
  position: absolute;
  outline: none;
  top: 0;
  right: 0;
  width: 24px;
  height: 100%;
  background-image: url('delete.png');
  background-size: 26px;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
}

.content {
  min-width: 500px;
  max-width: 100%;
}
</style>
