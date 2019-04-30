<template>
    <el-container>
        <el-header height="209px">
            <div class="header_img">
                <img :src="obj.photoUrl">
                <span class="user_name">{{obj.employeeName}}({{obj.sex===1?'先生':'女士'}})</span>
            </div>
            <span @click="close" class="hiddenBox">x</span>
        </el-header>
        <el-main>
            <el-card class="box-card">
                <div class="text item">
                    {{'工号： ' + obj.employeeNo }}
                </div>
                <div class="text item">
                    {{'所属部门： ' + obj.departmentName }}
                </div>
                <div class="text item">
                    {{'岗位： ' + obj.postName }}
                </div>
                <div class="text item">
                    {{'移动电话： ' + obj.mobile }}
                </div>
                <div class="text item">
                    {{'办公电话： ' + obj.officePhone }}
                </div>
                <div class="text item">
                    {{'办公地址： ' + obj.workPlace }}
                </div>
                <div class="text item">
                    {{'电子邮箱： ' + obj.eMail }}
                </div>
            </el-card>

        </el-main>
    </el-container>

</template>

<script>
    import { ipcRenderer, webFrame } from 'electron'
    
    export default {
        name: 'App',
        data() {
            return {
                dialogVisible: true,
                obj: null
            };
        },
        created() {
            var me = this;
            this.setZoomLevel()
            ipcRenderer.on('USERINFOWIN:dataJson', (event, message) => { // 监听父页面定义的端口
                if (!message) {
                    return;
                }

                console.log(message)

                var obj = JSON.parse(message);
                me.obj = obj;
            });
        },
        methods: {
            setZoomLevel() {
                // 设置缩放限制
                webFrame.setZoomFactor(100)
                webFrame.setZoomLevel(0)
                webFrame.setVisualZoomLevelLimits(1, 1)
            },
            close() {
                ipcRenderer.send('USERINFOWIN:close')
            }
        }
    }
</script>

<style>
    body {
        font-family: 微软雅黑;
        -webkit-app-region: drag;
        margin:0;
    }

    .el-header, .el-footer {
        color: #333;
        text-align: center;
        line-height: 60px;
    }

    .el-header {
        padding:0;
    }

        .el-aside {
            color: #333;
            text-align: center;
            line-height: 200px;
        }

    .el-main {
        color: #333;
        text-align: center;
        line-height: 30px;
    }

    body > .el-container {
        margin-bottom: 0px;
    }

    .el-container:nth-child(5) .el-aside,
    .el-container:nth-child(6) .el-aside {
        line-height: 260px;
    }

    .el-container:nth-child(7) .el-aside {
        line-height: 320px;
    }

    .el-card {
        -webkit-app-region: no-drag;
    }

    .user_name {
        color: #fff;
        font-size: 26px;
        -webkit-app-region: no-drag;
    }

    .text {
        font-size: 14px;
    }

    .item {
        margin-bottom: 5px;
    }
    .header_img {
        background: url(http://mobileportal-test.g5air.com:8030/hxim/userinfo_bg.jpg) no-repeat;
        width: 100%;
        height: 100%;
        padding: 20px 0;
        text-align: center;
    }

    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }
    .header_img img {
        display: block;
        width: 120px;
        height: 120px;
        -moz-border-radius: 50%;
        -webkit-border-radius: 50%;
        border-radius: 50%;
        margin: 0px auto;
        margin-top: 15px;
    }

    .clearfix:after {
        clear: both
    }

    .box-card {
        width: 100%;
    }

    .image {
        width: 50px;
    }
    .hiddenBox {
        display: inline-block;
        float: right;
        position: absolute;
        right: 0px;
        top: 0px;
        width: 30px;
        text-align: center;
        line-height: 30px;
        -webkit-app-region: no-drag;
        color: #fff;
    }
        .hiddenBox:hover {
            background-color: #f45454;
            color: white;
            cursor: pointer;
        }


</style>
