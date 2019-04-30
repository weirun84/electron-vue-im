<template>
  <div 
    class="titlebtn" 
    :id="ids"
    v-bind:style="style"
    v-on:click="click">{{mess}}</div>
</template>

<script>
    const {ipcRenderer: ipc} = require('electron');
    const ids={
        min:"window-minimize",
        max:"window-maximization",
        close:"window-close"
    };
    const style = {
        min: {
            right: '60px'
        },
        max: {
            right: '30px'
        },
        close: {
            right: '0px'
        }
    };
    const mess={
        min:"-",
        max:"□",
        close:"×"
    }
    export default {
        name: 'Titlebtn',
        props: ['type'],
        computed: {
            ids:function(){
                return ids[this.type]
            },
            style: function () {
                return style[this.type];
            },
            mess:function(){
                return mess[this.type];
            }
        },
        methods: {
            click: function () {
                ipc.send("MAINWIN:" + ids[this.type]);
            }
        }
    }
</script>
    
<style lang="stylus" scoped>
    #window-close {
        position: absolute;
        width: 30px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        color: #000;
        top: 0;
        bottom: 0;
        margin: auto 0;
        -webkit-app-region: no-drag;
        cursor pointer;
        &:hover{
        background-color:#e4393c;
        color:#ffffff;
    }
}
    #window-minimize {
        position: absolute;
        width: 30px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        color: #000;
        top: 0;
        bottom: 0;
        margin: auto 0;
        -webkit-app-region: no-drag;
        cursor pointer;
        &:hover{
        background-color:#ccc;
        color:#000;
    }
}
    #window-maximization {
        position: absolute;
        width: 30px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        color: #000;
        top: 0;
        bottom: 0;
        margin: auto 0;
        -webkit-app-region: no-drag;
        cursor pointer;
        &:hover{
        background-color:#ccc;
        color:#000;
    }
}
</style>