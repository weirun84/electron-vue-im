<template>
    <el-card class="box-card">
        <div slot="header" class="clearfix">
            <div style="width:50px;height:50px;float: left;">
                <img :src="obj.photoUrl" class="image">
            </div>
            <span style="position: absolute;margin: 15px;">{{obj.employeeName}}</span>
            <el-button style="float: right; padding: 3px 0;display:none" type="text">发送消息</el-button>
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
            ipcRenderer.on('USERCARDWIN:dataJson', (event, message) => { // 监听父页面定义的端口
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
                ipcRenderer.send('USERCARDWIN:close')
            }
        }
    }
</script>

<style>
    body {
        font-family: 微软雅黑;
    }

    .text {
        font-size: 14px;
    }

    .item {
        margin-bottom: 18px;
    }

    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
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

</style>
