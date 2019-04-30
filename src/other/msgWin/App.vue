<template>
    <el-dialog :title="obj.title"
               :visible.sync="dialogVisible"
               width="100%"
               :modal="false"
               :fullscreen="true"
               :showClose="!obj.progress"
               :before-close="handleClose">
        <span v-if="!obj.progress"><i class="el-message__icon" v-bind:class="icoClass"></i>{{obj.message}}</span>
        <span v-if="obj.progress">{{obj.message}}<el-progress :text-inside="true" :stroke-width="32" :percentage="percentageValue" status="success" :show-text="false"></el-progress></span>
        <span v-if="!obj.progress" slot="footer" class="dialog-footer" :center="true">
            <el-button type="primary" @click="close">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
    import { ipcRenderer, webFrame } from 'electron'
    
    export default {
        name: 'App',
        data() {
            return {
                dialogVisible: true,
                obj: null,
                icoClass: '',
                percentageValue:''
            };
        },
        created() {
            var me = this;
            this.setZoomLevel()
            //ipcRenderer.send('online', navigator.onLine)
            //window.addEventListener('online', () => ipcRenderer.send('online', navigator.onLine))
            ipcRenderer.on('dataJson', (event, message) => { // 监听父页面定义的端口
                if (!message) {
                    return;
                }

                var obj = JSON.parse(message);
                this.obj = obj;
                this.icoClass = "el-icon-" + obj.type;
            });

            ipcRenderer.on("FILEMOVE:Progress", (event, arg)=> {
                this.percentageValue = arg;
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
                if (this.obj.loginOut == true) {
                    sessionStorage.clear();
                    ipcRenderer.send('MAINWIN:restart')
                }
                ipcRenderer.send('MSGWIN:close')
            },
            handleClose(done) {
                done();
                ipcRenderer.send('MSGWIN:close')
            }
        }
    }
</script>

<style>

    button, .el-dialog__close, .el-dialog__headerbtn, .el-dialog__header {
        -webkit-app-region: no-drag
    }
    .el-dialog__wrapper {
        -webkit-app-region: drag;
        border: 1px solid #ebebeb;
        border-radius: 6px;
        padding-bottom: 1px;
    }
    ..el-dialog__header {
        padding: 10px 20px 10px;
    }
    .el-dialog__footer {
        text-align: center;
    }
    ..el-dialog__headerbtn {
        top: 2px;
        right: 5px;
    }
</style>
