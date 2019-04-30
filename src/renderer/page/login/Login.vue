<template>
    <!--背景图-->
    <!--login框，表单+tab标签页的组合-->
    <div class="loginFrame"
         v-show="isShow">

        <el-form label-position="left"
                 label-width="0px"
                 class="demo-ruleForm login-container">
            <!--tab标签-->
            <el-tabs class="users"
                     :default-active="navselected"
                     :active="navselected"
                     :unique-opened=true
                     v-model="activeName">
                <el-tab-pane label="扫二维码"
                             name="students">
                    <canvas id="canvas"></canvas>
                </el-tab-pane>
                <el-tab-pane label="帐号密码登录"
                             name="teacher"
                             v-on:click="toggle()"
                             class="is-active"
                             :active="navselected">
                    <el-form-item prop="username"
                                  v-show="isShow">
                        <input id="sea_name"
                               class="sea_input"
                               type="text"
                               v-model="name"
                               auto-complete="off"
                               placeholder="请输入您的账号" />
                    </el-form-item>
                    <el-form-item prop="passwords"
                                  v-show="isShow">
                        <input id="sea_password"
                               class="password_input"
                               type="password"
                               v-model="password"
                               auto-complete="off"
                               placeholder="请输入密码" />
                    </el-form-item>
                    <el-form-item style="width:100%;"
                                  v-show="isShow">
                        <el-button type="primary"
                                   style="width:100%;"
                                   @click="login">登录</el-button>
                    </el-form-item>
                    <el-checkbox v-model="checked"
                                 @change="remember"
                                 checked
                                 class="remember"
                                 v-show="isShow">记住密码</el-checkbox>
                </el-tab-pane>
            </el-tabs>
        </el-form>

    </div>

</template>

<script>
    import Vue from "vue";
    import { mapGetters, mapState } from "vuex";
    import QRCode from "qrcode";
    import { parse } from "babylon";
    const clientiot = require("@hxim/clientiot");
    var { ipcRenderer: ipc } = require("electron");
    var co = require("co");
    var messKey = "1111"; //消息Key
    var noticKey = "9527"; //通知Key
    var remeberName, remeberPassword;
    var isLogin = false;
    var updateSqls = [];
    export default {
        data() {
            return {
                logining: false,
                isShow: true,
                name: "",
                password: "",
                checked: false,
                navselected: "1",
                activeName: "teacher",
                messageBox: {
                    visible: false,
                    message: "", //弹窗内容
                    hasCancel: true, //弹窗是否有取消键
                    messageBoxEvent: "" // 弹窗事件名称
                }
            };
        },
        components: {
            QRCode
        },
        created: function () {
            //用于检测容量，可以去掉
            var size = 0;
            for (var i = 0; i < localStorage.length; i++) {
                size += localStorage.getItem(localStorage.key(i)).length;
            }
            console.log("当前localStorage使用容量为" + (size / 1024).toFixed(2) + "KB");
        },
        computed: {
            ...mapState(["chatlistText", "NewPersonnel", "Windowclosure"])
        },
        methods: {
            remember: function () {
                if (this.checked == true) {
                    localStorage.setItem("remeber", true);
                } else {
                    localStorage.setItem("remeber", false);
                }
            },
            toggle: function () {
                this.isShow = true;
            },
            useqrcode() {
                var canvas = document.getElementById("canvas");
                QRCode.toCanvas(canvas, "http://www.baidu.com", function (error) {
                    if (error) console.error(error);
                    console.log("success!");
                });
            },
            login() {
                this.$emit("LoginUser", false);
                var me = this;
                if (isLogin == true) {
                    return;
                }
                const loading = this.$loading({
                    lock: true,
                    text: "登录中",
                    spinner: "el-icon-loading",
                    background: "rgba(0, 0, 0, 0.7)"
                });

                isLogin = true;
                //获取项目路径
                ipc.send("MAINWIN:appPath");
                ipc.on("Pathvalue", function (event, arg) {
                    localStorage.setItem("appPath", arg);
                });

                //获取文件路径
                ipc.send("MAINWIN:developmentPath");
                ipc.on("DevelopmentPathvalue", function (event, arg) {
                    localStorage.setItem("developmentPath", arg);
                });

                let name = document.getElementsByClassName("sea_input")[0].value;
                let password = document.getElementsByClassName("password_input")[0].value;
                remeberName = name;
                remeberPassword = password;
                if (name !== "" && password !== "") {
                    name: name;
                    passw: password;
                } else {
                    const message = this.name === "" ? "请输入用户名" : "请输入密码";
                    //this.$message({
                    //  message: message,
                    //  type: "warn"
                    //  });
                    ipc.send(
                        "MAINWIN:msgWin",
                        JSON.stringify({ title: "提示", message: message, type: "warning" })
                    );
                    isLogin = false;
                    loading.close();
                    return;
                }
                co(function* () {
                    clientiot.http
                        .login(name, password)
                        .then(function (val) {
                                sessionStorage.setItem("offlineMessage", true);
                                var retvalue = JSON.parse(val);
                                if (retvalue.success == true) {
                                    isLogin = retvalue.success;
                                    loading.close();
                                    var localUserId = localStorage.getItem("userMsg");
                                    if (localUserId) {
                                        var employee_id = JSON.parse(localUserId).employee_id;
                                        if (retvalue.data.employee_id != employee_id) {
                                            var vueChat = localStorage.getItem("vue-chat");

                                            //把上次登录用户所有缓存信息存入文件(暂时只存入vue-chat)
                                            clientiot.globalinfo.SaveUserLocalStorageJson(
                                                vueChat,
                                                employee_id
                                            );

                                            var thisUserVueChat = clientiot.globalinfo.GetUserLocalStorageJson();

                                            localStorage.setItem("vue-chat",thisUserVueChat ? thisUserVueChat : "");
                                        }
                                    }

                                    var localRemeber = localStorage.getItem("remeber");
                                    if (localRemeber == "true") {
                                        localStorage.setItem("remeberName", remeberName);
                                        localStorage.setItem("remeberPassword", remeberPassword);
                                    }

                                    sessionStorage.setItem(
                                        "currentUser",
                                        JSON.stringify({
                                            id: retvalue.data.employee_id,
                                            name: retvalue.data.name,
                                            nickname: retvalue.data.post_name,
                                            avatarUrl: retvalue.data.image_url
                                        })
                                    );
                                    me.$store.dispatch("initData");
                                    sessionStorage.setItem("token", retvalue.data.token);
                                    me.$store.dispatch("userInfo", retvalue.data);
                                    localStorage.setItem("userMsg", JSON.stringify(retvalue.data));
                                    //   me.$router.push({ path: "/chat" });
                                    //   ipc.send("MAINWIN:UpdateBrowserWindow", 1050, 563, true);
                                    //   console.log("login:" + val);
                                    setTimeout(() => {
                                        //刷新会话中的群，如群已解散，从本地缓存中移除
                                        clientiot.http
                                            .getUserAllGroup(retvalue.data.employee_id)
                                            .then(val => {
                                                const $userAllGroup = JSON.parse(val);

                                                if (!$userAllGroup) return;

                                                var newChatList = [];

                                                me.$store.state.chatlist.forEach(item => {
                                                    if (item.channelType === "G") {
                                                        let groupRes = $userAllGroup.data.find(
                                                            msg => msg.group_id === item.id
                                                        );
                                                        if (groupRes) {
                                                            newChatList.push(item);
                                                        }
                                                    } else {
                                                        newChatList.push(item);
                                                    }
                                                });

                                                me.$store.state.chatlist = newChatList;

                                                clientiot.http.getAllEmployees().then(retvalue => {
                                                    console.log("获取所有用户信息：" + retvalue);
                                                    //获取离线消息
                                                    let chatlist = this.$store.state.chatlist;
                                                    var userId = JSON.parse(
                                                        sessionStorage.getItem("currentUser")
                                                    ).id;

                                                    console.log("准备开始获取用户所有群信息");
                                                    clientiot.http
                                                        .getUserAllGroup(userId)
                                                        .then(allGroup => {
                                                            console.log("allGroup:" + allGroup);
                                                            //处理更新群名称与会话名称的统一性
                                                            var allGroupObj = JSON.parse(allGroup).data;
                                                            var newChats = [];
                                                            me.$store.state.chatlist.forEach(it => {
                                                                if (it.channelType === "G") {
                                                                    var thisChat = allGroupObj.find(fn => it.id === fn.group_id);
                                                                    if (thisChat) {
                                                                        it.user.name = thisChat.group_name;
                                                                    }
                                                                }
                                                                newChats.push(it);
                                                            });

                                                            me.$store.state.chatlist = newChats;

                                                            console.log("准备开始获取离线消息");
                                                            clientiot.http
                                                                .getAllUnreadMessage(userId)
                                                                .then(retvalue => {
                                                                    console.log("获取未读消息：" + retvalue);
                                                                    sessionStorage.setItem("offlineMessage", false);
                                                                    var allUnreadInformation = JSON.parse(retvalue);
                                                                    console.log("离线消息数量为：" + allUnreadInformation.length)
                                                                    if (
                                                                        allUnreadInformation.success == true &&
                                                                        allUnreadInformation.data.msg.length > 0
                                                                    ) {
                                                                        let allInformation =
                                                                            allUnreadInformation.data.msg;

                                                                        allInformation.forEach(item => {
                                                                            processingMess(item, me);
                                                                        });

                                                                        if (me.$store.state.chatlist.length == 1) {
                                                                            me.$store.state.selectId = 0;
                                                                            me.$store.state.selectFriendId = me.$store.state.chatlist[0].id;
                                                                            me.$store.state.selectFriendAticon = me.$store.state.chatlist[0].id;
                                                                        } else {
                                                                            let position = me.$store.state.chatlist.find(
                                                                                pos => pos.underLen === 0
                                                                            );
                                                                            me.$store.state.selectId = position.index;
                                                                            me.$store.state.selectFriendId = position.id;
                                                                            me.$store.state.selectFriendAticon = position.id;
                                                                        }

                                                                        updateSqls.forEach(sql => {
                                                                            console.log("修改图片路径sql：" + sql);
                                                                            //修改数据库
                                                                            clientiot.sqllite.executeNoQuerySql(
                                                                                sql,
                                                                                function (res) {
                                                                                    console.log("修改图片路径：" + res);
                                                                                }
                                                                            );
                                                                        });
                                                                    }
                                                                });
                                                        });
                                                });
                                            });
                                    }, 10);
                                    me.$router.push({ path: "/chat" });
                                    ipc.send("MAINWIN:RegMqtt");
                                    ipc.send("MAINWIN:UpdateBrowserWindow", 1050, 650, true);
                                }
                                else {
                                    ipc.send(
                                        "MAINWIN:msgWin",
                                        JSON.stringify({
                                            title: "提示",
                                            message: retvalue.errorMessage,
                                            type: "warning"
                                        })
                                    );
                                    isLogin = false;
                                    loading.close();
                                }
                            }.bind(me)
                        )
                        .catch(function (err) { });
                });
            }
        },

        mounted() {
            this.useqrcode();
            var localRemeber = localStorage.getItem("remeber");
            if (localRemeber == "true") {
                this.checked = true;
                var sea_name = document.getElementById("sea_name");
                sea_name.value = localStorage.getItem("remeberName");
                this.name = localStorage.getItem("remeberName");
                var sea_password = document.getElementById("sea_password");
                sea_password.value = localStorage.getItem("remeberPassword");
                this.password = localStorage.getItem("remeberPassword");
            } else {
                this.checked = false;
            }

            this.bodyListener = e => {
                if (e.keyCode === 13) {
                    this.login();
                }
            };
            document.body.addEventListener("keyup", this.bodyListener, false);
        },
        beforeDestroy() {
            document.body.removeEventListener("keyup", this.bodyListener);
        }
    };

    //数组去重
    function removeDuplicatedItem(ar) {
        var tmp = {},
            ret = [];

        for (var i = 0, j = ar.length; i < j; i++) {
            var key = ar[i].id + ar[i].channelType;
            if (!tmp[key]) {
                tmp[key] = 1;
                ret.push(ar[i]);
            }
        }

        return ret;
        //return ar;
    }

    // 处理消息的方法
    function processingMess(arg, me) {
        var now = new Date();
        var userInfo = JSON.parse(sessionStorage.getItem("currentUser"));
        var userId = parseInt(userInfo.id);
        const rest = arg;
        if (rest.message_key != me.$store.state.messKey && !rest.msg_key) {
            me.$store.state.messKey = rest.message_key;
            if (rest.msgBody.msgContent.fileSize) {
                let size = rest.msgBody.msgContent.fileSize;
                if (size < 1024) {
                    rest.msgBody.msgContent.fileSize = String(size) + "B";
                } else if (size > 1024 && size < 1024 * 1024) {
                    rest.msgBody.msgContent.fileSize =
                        String((rest.msgBody.msgContent.fileSize / 1024).toFixed(2)) + "KB";
                } else if (size > 1024 * 1024) {
                    rest.msgBody.msgContent.fileSize =
                        String((rest.msgBody.msgContent.fileSize / 1024 / 1024).toFixed(2)) +
                        "MB";
                }
            }
            rest.message_time = Date.parse(rest.message_time);
            //首先过滤重复会话
            me.$store.state.chatlist = removeDuplicatedItem(me.$store.state.chatlist);

            var thisUserInfo = JSON.parse(
                clientiot.globalinfo.getUserInfoByJson(rest.fromId)
            );

            //定义会话消息体
            var msgListObj = {
                id:rest.fromType == "user"
                        ? parseInt(rest.fromId)
                        : parseInt(rest.targetId),
                Immunity: false, //免扰状态
                user: {
                    name: thisUserInfo.employeeName,
                    img:
                        rest.fromType == "user"
                            ? thisUserInfo.photoUrl
                            : "static/images/group.png"
                },
                messages: [],
                index: 0, // 当前在聊天列表中的位置,从1开始
                channelType: rest.fromType == "user" ? "P" : "G"
            };

            var msgObj = {
                content: rest.msgBody.msgContent.text,
                messageKeys: rest.message_key,
                date: rest.time_stamp,
                localTime: rest.msgBody.localTime,
                msgType: rest.msgBody.msgType,
                filePath: "",
                fileSize: rest.msgBody.msgContent.fileSize,
                msgUserName: thisUserInfo.employeeName,
                fromId: rest.fromId,
                msgUserImg: thisUserInfo.photoUrl,
                filename:
                    rest.msgBody.msgContent.mediaId === ""
                        ? rest.msgBody.msgContent.text
                        : rest.msgBody.msgContent.mediaId,
                oldname:
                    rest.msgBody.msgContent.mediaId == ""
                        ? rest.msgBody.msgContent.text
                        : rest.msgBody.msgContent.mediaId //聊天内容
            };

            if (rest.fromId != userId) {
                //个人消息
                if (rest.fromType == "user") {
                    var result = me.$store.state.chatlist.find(
                        msg => msg.id === rest.fromId && msg.channelType === "P"
                    );
                    if (!result || result == undefined) {
                        if (rest.fromId != userId) {
                            for (let i = 0; i < me.$store.state.chatlist.length; i++) {
                                me.$store.state.chatlist[i].index = i + 1;
                            }
                            if (
                                rest.msgBody.msgType == "text" ||
                                rest.msgBody.msgType == "file" ||
                                rest.msgBody.msgType == "video" ||
                                rest.msgBody.msgType == "http"
                            ) {
                                //暂时屏蔽base64字符过来进行本地处理，比如base64+文字+表情暂时不好处理
                                //if (rest.msgBody.msgContent.text.indexOf("data:image") > -1) {
                                //    var textBaseUrl = clientiot.globalinfo.base64ToLocalhost(
                                //        rest.msgBody.msgContent.text,
                                //        "/profile/images/",
                                //        "test.png"
                                //    );
                                //    msgObj.content = textBaseUrl;
                                //    msgObj.filePath = textBaseUrl;

                                //}
                                //else {
                                //                           msgObj.filename = ((rest.msgBody.msgContent.mediaId=='mediaId')?rest.msgBody.msgContent.text:rest.msgBody.msgContent.mediaId);
                                //msgObj.oldname = ((rest.msgBody.msgContent.mediaId=='mediaId')?rest.msgBody.msgContent.text:rest.msgBody.msgContent.mediaId);
                                //}
                                msgListObj.messages.push(msgObj);

                                me.$store.state.chatlist.unshift(msgListObj);
                            } else if (
                                rest.msgBody.msgType == "image" ||
                                rest.msgBody.msgType == "audio" ||
                                rest.msgBody.msgType == "voice"
                            ) {
                                /*从S3下载文件*/
                                var imgMessage;
                                if (rest.msgBody.msgType == "voice") {
                                    imgMessage =
                                        rest.msgBody.msgContent.text + rest.msgBody.msgContent.format;
                                } else {
                                    imgMessage = rest.msgBody.msgContent.mediaId;
                                }
                                msgObj.S3Key = imgMessage;

                                msgListObj.messages.push(msgObj);
                                me.$store.state.chatlist.unshift(msgListObj);
                            }
                            //将接收消息的会话上移
                            me.$store.dispatch("topMessage", me.$store.state.chatlist[0]);
                            me.$store.state.selectId++;
                        }
                    } else {
                        if (
                            rest.msgBody.msgType == "text" ||
                            rest.msgBody.msgType == "file" ||
                            rest.msgBody.msgType == "video" ||
                            rest.msgBody.msgType == "http"
                        ) {
                            //暂时屏蔽base64字符过来进行本地处理，比如base64+文字+表情暂时不好处理
                            //if (rest.msgBody.msgContent.text.indexOf("data:image") > -1) {
                            //    var textBaseUrl = clientiot.globalinfo.base64ToLocalhost(
                            //        rest.msgBody.msgContent.text,
                            //        "/profile/images/",
                            //        "test.png"
                            //    );

                            //    msgObj.content = textBaseUrl;
                            //    msgObj.msgType = "image";
                            //    msgObj.filePath = textBaseUrl;
                            //    msgObj.filename = "IM截图" + new Date().getTime();
                            //}
                            //else {

                            msgObj.filename =
                                rest.msgBody.msgContent.mediaId == ""
                                    ? rest.msgBody.msgContent.text
                                    : rest.msgBody.msgContent.mediaId;
                            msgObj.oldname =
                                rest.msgBody.msgContent.mediaId == ""
                                    ? rest.msgBody.msgContent.text
                                    : rest.msgBody.msgContent.mediaId;
                            //}
                            result.messages.push(msgObj);
                        } else if (
                            rest.msgBody.msgType == "image" ||
                            rest.msgBody.msgType == "audio" ||
                            rest.msgBody.msgType == "voice"
                        ) {
                            /*从S3下载文件*/
                            var imgMessage;
                            if (rest.msgBody.msgType == "voice") {
                                imgMessage =
                                    rest.msgBody.msgContent.text + rest.msgBody.msgContent.format;
                            } else {
                                imgMessage = rest.msgBody.msgContent.mediaId;
                            }
                            msgObj.S3Key = imgMessage;

                            //                clientiot.awss31.DownloadFile(
                            //                    imgMessage,
                            //                    "/profile/images/",
                            //                    function (res) {
                            //                        console.log(JSON.parse(res));
                            //                        var resData = JSON.parse(res);
                            //                        if (resData.errorCode == 200) {
                            //                            if(rest.msgBody.msgType == "voice"){
                            //	resData.data.thisDir = resData.data.thisDir+rest.msgBody.msgContent.format;
                            //}
                            //                            let imgPath = resData.data.rootPath + resData.data.thisDir;
                            //                            updateMessage(imgPath,rest.message_key)

                            //                            msgObj.content = resData.data;
                            //                            msgObj.filePath = resData.data;

                            //                            msgObj.msgID = rest.message_time;

                            //                            msgObj.filename = ((rest.msgBody.msgContent.mediaId=='mediaId')?rest.msgBody.msgContent.text:rest.msgBody.msgContent.mediaId);
                            // msgObj.oldname = ((rest.msgBody.msgContent.mediaId=='mediaId')?rest.msgBody.msgContent.text:rest.msgBody.msgContent.mediaId);
                            //                            result.messages.push(msgObj);
                            //                        }
                            //                    },
                            //                    rest.msgBody.msgContent.mediaId
                            //                );

                            result.messages.push(msgObj);
                        }
                        //将接收消息的会话上移
                        me.$store.dispatch("topMessage", result);
                    }
                } else {
                    var cacheKey = "$userAllGroup";
                    var userAllGroup = localStorage.getItem(cacheKey);

                    if (userAllGroup) {
                        var userAllGroupObj = JSON.parse(userAllGroup);

                        let groupInfo = userAllGroupObj.data.find(
                            it => it.group_id === rest.targetId
                        );


                        //群组消息
                        let groupRes = me.$store.state.chatlist.find(
                            msg => msg.id === rest.targetId && msg.channelType === "G"
                        );
                        // 会话列表中不存在该群
                        if (groupRes == undefined) {
                            for (let i = 0; i < me.$store.state.chatlist.length; i++) {
                                me.$store.state.chatlist[i].index = i + 1;
                            }

                            msgListObj.user.name = groupInfo ? groupInfo.group_name : "群聊";

                            let AtPoples = rest.msgBody.msgContent.AtPoples;
                            var AM = false;
                            var atAll = false;
                            if (AtPoples && AtPoples.length > 0) {
                                for (let a = 0; a < AtPoples.length; a++) {
                                    if (AtPoples[a].memberEId && AtPoples[a].memberEId == userId) {
                                        var AM = true
                                    }
                                    if (AtPoples[a].AtALL) {
                                        atAll = AtPoples[a].AtALL;
                                    }
                                }
                            };
                            msgListObj.AtPoples = AM
                            msgListObj.atAll = atAll;


                            if (
                                rest.msgBody.msgType == "text" ||
                                rest.msgBody.msgType == "file" ||
                                rest.msgBody.msgType == "video" ||
                                rest.msgBody.msgType == "http"
                            ) {
                                msgListObj.messages.push(msgObj);

                                me.$store.state.chatlist.unshift(msgListObj);
                            } else if (
                                rest.msgBody.msgType == "image" ||
                                rest.msgBody.msgType == "audio" ||
                                rest.msgBody.msgType == "voice"
                            ) {
                                /*从S3下载文件*/
                                var imgMessage;
                                if (rest.msgBody.msgType == "voice") {
                                    imgMessage =
                                        rest.msgBody.msgContent.text + rest.msgBody.msgContent.format;
                                } else {
                                    imgMessage = rest.msgBody.msgContent.mediaId;
                                }
                                msgObj.S3Key = imgMessage;
                                msgListObj.messages.push(msgObj);
                                me.$store.state.chatlist.unshift(msgListObj);
                            }
                            //将接收消息的会话上移
                            me.$store.dispatch("topMessage", me.$store.state.chatlist[0]);
                            me.$store.state.selectId++;
                        }
                        else {
                            if (rest.msgBody.msgType == "image" || rest.msgBody.msgType == "video" || rest.msgBody.msgType == "audio" || rest.msgBody.msgType == "voice") {
                                /*从S3下载文件*/
                                var imgMessage;
                                if (rest.msgBody.msgType == "voice") {
                                    imgMessage = rest.msgBody.msgContent.text + rest.msgBody.msgContent.format;
                                }
                                else {
                                    imgMessage = rest.msgBody.msgContent.mediaId;
                                }
                                msgObj.S3Key = imgMessage;
                            }

                            var AtPoples = rest.msgBody.msgContent.AtPoples;
                            var atAll = false;
                            if (groupRes.AtPoples == true) {
                                groupRes.AtPoples = true
                            } else {
                                if (AtPoples && AtPoples.length > 0) {
                                    for (let a = 0; a < AtPoples.length; a++) {
                                        if (AtPoples[a].memberEId && AtPoples[a].memberEId == userId) {
                                            groupRes.AtPoples = true
                                        }
                                        if (AtPoples[a].AtALL) {
                                            groupRes.atAll = AtPoples[a].AtALL;
                                        }
                                    }
                                };
                            }

                            var msgTime = rest.message_time;
                            groupRes.messages.push(msgObj);


                            //将接收消息的会话上移
                            me.$store.dispatch("topMessage", groupRes);
                        }
                    }
                }
            }
        }
    }
    function updateMessage(imgPath, key) {
        updateSqls.push(
            "update HxImMsg set localPath='" +
            imgPath +
            "' where message_key='" +
            key +
            "'"
        );
    }
</script>

<style>
    #mytitle {
        position: absolute;
        top: 0;
        width: 100%;
        height: 20px;
        z-index: 999;
        -webkit-app-region: drag;
    }

    .loginFrame {
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        -webkit-app-region: drag;
    }

    .login-container {
        box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);
        -webkit-border-radius: 5px;
        border-radius: 5px;
        -moz-border-radius: 5px;
        background-clip: padding-box;
        width: 350px;
        padding: 35px 35px 15px 35px;
        background: #fff;
        border: 1px solid #eaeaea;
        box-shadow: 0 0 25px #cac6c6;
    }

    .el-tabs__nav {
        white-space: nowrap;
        position: relative;
        -webkit-transition: -webkit-transform 0.3s;
        transition: -webkit-transform 0.3s;
        transition: transform 0.3s;
        transition: transform 0.3s, -webkit-transform 0.3s;
        /* float: left; */
        z-index: 2;
        width: 100%;
    }

    .el-tabs__active-bar {
        position: absolute;
        bottom: 0;
        height: 2px;
        background-color: #409eff;
        z-index: 1;
        -webkit-transition: -webkit-transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        transition: -webkit-transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1), -webkit-transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        list-style: none;
    }

    #canvas {
        width: 221px !important;
        height: 221px !important;
    }

    .el-tabs__nav-wrap::after {
        content: "";
        position: absolute;
        left: 85px;
        bottom: 0;
        width: 51%;
        height: 2px;
        background-color: #fff;
        z-index: 1;
    }

    .password_input {
        width: 90%;
        padding: 15px;
        border: 1px solid lightblue;
    }

    .sea_input {
        width: 90%;
        padding: 15px;
        border: 1px solid lightblue;
    }

    .el-tabs__active-bar {
        margin-left: 85px;
    }

    .el-tabs__nav-wrap,
    input,
    button,
    label,
    canvas {
        -webkit-app-region: no-drag;
    }
</style>