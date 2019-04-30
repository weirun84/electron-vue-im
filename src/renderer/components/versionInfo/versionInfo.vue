<template>
    <div class="logoimg">
        <div class="versionTitle">
            <p class="vesionHead">版本信息</p>
        </div>
        <div class="content">
            <div class="logo">
                <img src="./HxLogo.png" alt="">
                <p class="version">当前版本为 {{version}}</p>
            </div>
            <div class="addr no-drag"><a href="http://www.g5air.com" target="_blank">http://www.g5air.com</a></div>
        </div>
    </div>
</template>
<script>
    import {
        webFrame,
        ipcRenderer,
        shell
    } from 'electron'
var packjson = require("../../../../package.json");
    export default {
        data() {
            return {
                version: packjson.version
            }
        },
        methods: {

        }
    }
</script>

<style lang="stylus" scoped>
.content{
    height: calc(100% - 52px);
}
.logoimg
    flex 1
    text-align center
    position relative
    .versionTitle
        height: 50px;
        text-align left 
        line-height: 50px;
        padding-left: 15px;
        border-bottom: 1px solid #e7e7e7;
	.sends
        text-align: center
        width: 140px
        height: 36px
        line-height: 36px
        font-size: 14px
        color: #fff
        background-color: #00549f
        cursor: pointer
        border-radius: 2px
        &:hover
            background: #00549f
		span 
			margin-right :0px
.addr{
    color #00549F
}
.version{
    margin-top 10px
    color #666
}
.logo{
    height: calc(100% - 120px);
}
.logo img{
    margin-top 20%
}
.vesionHead{
    font-size: large;
}
</style>

