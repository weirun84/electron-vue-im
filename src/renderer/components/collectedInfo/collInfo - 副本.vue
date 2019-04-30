<!-- 收藏详情 -->
<template>
    <div class="collInfo no-drag">
        <header class="header">
            {{selectedColl.name}}
        </header>
        <ul>
            <li class="collItem" v-for="item in searchedCollectedInfo" v-show="item.contentType===selectedColl.type||selectedColl.type=='all'">
                <!-- 聊天文本 -->
                <div v-if="item.contentType==='text'" class="collLeft">{{item.content}}</div>
                <!-- 图片视频 -->
                <div v-if="item.contentType==='video'" class="collLeft">
                    <div class="collImg">
                        <img v-bind:src="item.content" alt="" srcset="">
                    </div>
                </div>
                <!-- 文件 -->
                <div v-if="item.contentType==='file'" class="collLeft collfile">
                    <div class="collfileLeft">
                        <img src="static/images/file.png" alt="" srcset="">
                        <div class="collfileDetail">
                            <span class="cillfiLeName">{{item.content}}</span>
                            <span class="collfileSize">大小：10.5MB</span>
                        </div>
                    </div>
                </div>
                <!-- 语音 -->
                <div v-if="item.contentType==='voice'" class="collLeft">
                    <div class="collImg voiceImg">
                        <span class="icon iconfont icon-yuyin1"></span>
                        <div class="collVoice">
                            <span class="collVoiceName">语音</span>
                            <span class="collVoiceTime">00:15</span>
                        </div>
                    </div>
                </div>
                <div class="collRight">
                    <span class="collTime">{{item.time}}</span>
                    <span class="collName">来自：{{item.fromName}}</span>
                </div>
            </li>
        </ul>
    </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
export default {
    data () {
        return {
            
        }
    },
    computed: {
        ...mapState(["collectId"]),
        ...mapGetters(["searchedCollectedInfo","selectedColl"])
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
</style>


