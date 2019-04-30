<template>
    <div>
        <link rel="stylesheet" href="../../static/imgWin/photoGallery.css" />
            <div class="gallerys">
                <img class="gallery-pic" src="file:///D:/Desktop/jquery-photo-gallery-master/img/1.jpg" index="0">
                <img class="gallery-pic" src="file:///D:/Desktop/jquery-photo-gallery-master/img/2.jpg" index="1">
                <img class="gallery-pic" src="file:///D:/Desktop/jquery-photo-gallery-master/img/3.jpg" index="2">
            </div>
            <div class="box">
                <header drag>
                    <div class="winControl" noDrag>
                        <span class="closeWin" title="关闭"><i class="icon_close-big"></i></span>
                    </div>
                </header>
                <div class="gallery"></div>
            </div>
        </div>
</template>

<script>
    import { ipcRenderer, webFrame } from 'electron'
    import "../../../static/imgWin/jquery.js"
    import "../../../static/imgWin/jquery.photo.gallery.js"

    
    export default {
        name: 'App',
        data() {
            return {
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
                ipcRenderer.send('NEWIMGWIN:close')
            }
        }
    }
</script>
