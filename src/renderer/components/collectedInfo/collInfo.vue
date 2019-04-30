<!-- 收藏详情 -->
<template>
    <div class="collInfo">
        <header class="header">
            <div>{{selectedColl&&selectedColl.ProcessName}}</div>
        </header>
        <div id="iframeP">
            <webView id="iframe" :src="selectedColl&&selectedColl.jumpUrl"></webView>
            <!-- <iframe id="iframe" :src="selectedColl.jumpUrl" frameborder="0" scrolling="yes"></iframe>  -->
            <!-- <webview id="iframe" :src="selectedColl.jumpUrl" width="100%" height="100%"></webview > -->
        </div>
    </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex';
import { setTimeout } from 'timers';
export default {
    data () {
        return {
        }
    },
    computed: {
        ...mapState(["collectId"]),
        ...mapGetters(["searchedCollectedInfo","selectedColl"])
    },
    created () {
        
    },
    mounted () {
        window.onresize=function(){
            var winHeight=document.body.clientHeight;
            var winWidth=document.body.clientWidth;
            let iHeight = document.getElementById("iframe");
            let dHeight = document.getElementById("iframeP");
            if(iHeight&&dHeight){
                iHeight.style.height=winHeight-50+"px";
                iHeight.style.width=winWidth-310+"px";
                dHeight.style.height=winHeight-50+"px";
                dHeight.style.width=winWidth-310+"px";
            }
        }
        
    }
}
</script>

<style lang="stylus" scoped>
@import '../../assets/fonts/iconfont.css'
.collInfo
    width 100%
    height 100%
    background-color #f6f6f6
    .header
        height 50px
        line-height 50px
        font-size 18px
        padding-left 20px
        border-bottom 1px solid #e7e7e7
        div
            width: 80%;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden
.collItem
    width: 86%;
    margin-left: 7%;
    height: 80px;
    display: flex;
    border-bottom: 1px solid #ccc;
    .collLeft
        display: block;
        flex: 1;
        line-height: 80px;
    .collRight
        width 120px 
        display: flex;
        font-size 13px
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
        color: #999;
        .collTime
            margin-bottom 15px
        .collName
            width: 120px;
            text-align: right;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
.collImg{
    width: 100%;
    height: 70px;
    padding-top: 10px;
}
.collImg img,.collfile img{
    height 60px
}
.collfileLeft{
    height 70px
    padding-top 10px
    display flex
}
.collfileDetail{
        display flex
        flex 1
        height 60px
        flex-direction column
        justify-content space-around
        margin-left 15px
}
.collfileDetail span{
    height 20px
    line-height 20px
}
.cillfiLeName{
    width 300px
    font-size 16px
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color #333
}
.collfileSize{
    color #999
    font-size 14px
}
.voiceImg{
    height 80px
    padding-top 0
    display flex
    align-items center
}
.icon{
    font-size 36px
}
.collVoice{
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    flex: 1;
    height: 40px
    margin-left 15px
}
.collVoice span {
    height 20px
    line-height 20px
}
.collVoiceName{
    color #333
    font-size 15px
}
.collVoiceTime{
    color #999
    font-size 13px
}
#iframeP{
    -webkit-app-region:no-drag;
    height 512px
}
#iframe{
    width 100%
    height 512px
}
</style>


