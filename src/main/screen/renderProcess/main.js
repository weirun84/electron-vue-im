var img = localStorage['image'];
var { ipcRenderer, clipboard, nativeImage, Tray, remote, desktopCapturer, screen, shell } = require('electron');
var fs = require('fs');
const path = require('path');
const os = require('os')

var kscreenshot = require('kscreenshot');


class Screen {

    constructor(cas, casMask, src) {
        this.canvas = document.getElementById(cas);
        this.canvasMask = document.getElementById(casMask);

        this.context = this.canvas.getContext("2d");
        this.contextMask = this.canvasMask.getContext("2d");

        this.width = screen.width;
        this.height = screen.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;


        this.image = new Image();
        this.image.src = src;

        this.cuted = false;
        this.isShowTool = false;

        this.tool = document.querySelectorAll('.tool')[0];
        this.tip = document.querySelectorAll('.tipNum')[0];

        this.leftTopCursor = document.querySelectorAll('.left_top')[0];
        this.rightTopCursor = document.querySelectorAll('.right_top')[0];
        this.leftBottomCursor = document.querySelectorAll('.left_bottom')[0];
        this.rightBottomCursor = document.querySelectorAll('.right_bottom')[0];

        const body = document.getElementsByTagName('body');


        const screenshotPath = path.join(os.tmpdir(), 'screenshot.png');

        const thumbSize = this.determineScreenShotSize()
        let options = { types: ['screen'], thumbnailSize: thumbSize }

        desktopCapturer.getSources(options,function(error, sources) {
            if (error) { return console.log(error) }

            sources.forEach(function (source) {
                if (source.name === 'Entire screen' || source.name === 'Screen 1') {
                    fs.writeFile(screenshotPath, source.thumbnail.toPNG(), function (error) {
                        if (error) return console.log(error)

                        console.log(screenshotPath);
                        //image.src = screenshotPath;
                        //body[0].appendChild(image);
                    })
                }
            })
        })

        this.image.src = screenshotPath;

        // 原本是将屏幕截图image画到this.context画布上的 
        //  不知道为何画出来的是空白的
        // 取而代之的方式是全屏一张图片
        document.getElementsByTagName('body')[0].appendChild(this.image);
        this.drawImg(this.image);


        //this.createMask();


        // 绑定this到原型链上
        this.drawImg = this.drawImg.bind(this)
        //this.getMouse = this.getMouse.bind(this)
        //this.clearCtx = this.clearCtx.bind(this)
        //this.createRect = this.createRect.bind(this)
        //this.createMask = this.createMask.bind(this)
        //this.createReatImage = this.createReatImage.bind(this)
        //this.tipShow = this.tipShow.bind(this)
        //this.showTool = this.showTool.bind(this)
        //this.hideTool = this.hideTool.bind(this)
        //this.close = this.close.bind(this)
        //this.sendMsg = this.sendMsg.bind(this)
        //this.RGBA2ImageData = this.RGBA2ImageData.bind(this)
        //this.dragEvent = this.dragEvent.bind(this)
    }

    // 画布上贴图
    drawImg(src) {
        this.context.drawImage(src, 0, 0, this.width, this.height);
    }

    // 退出截图
    close(data) {
        this.sendMsg('close', data)
    }

    // 通信
    sendMsg(type, msg) {
        ipcRenderer.send('screenshot-page', { type: type, message: msg })
    }

    determineScreenShotSize() {
        const screenSize = screen.getPrimaryDisplay().workAreaSize
        const maxDimension = Math.max(screenSize.width, screenSize.height)
        return {
            width: maxDimension * window.devicePixelRatio,
            height: maxDimension * window.devicePixelRatio
        }
    }
}


var cut = new Screen('canvas', 'canvasMask', img);

//65指键盘中的A
new kscreenshot({
    copyPath: function (base64) {
        cut.close({ path: null, base64: base64 });

        return null

    },
    endCB: function (data) {
        cut.sendMsg('close', data)
    }
}).startScreenShot();

