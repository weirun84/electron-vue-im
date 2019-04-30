<template>
    <div class="logoimg"> 
        <div class="content">
            <div></div>
             <img src="./HxLogo.png" alt="" style="opacity: 0.1;" draggable="false"> 
        </div>
    </div>
</template>
<script>
var packjson = require("../../../../package.json");
export default {
    data () {
        return {
            version:packjson.version
        }
    }
}
</script>

<style lang="stylus" scoped>
 
.logoimg
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    .versionTitle
        height: 50px;
        text-align left 
        line-height: 50px;
        margin-left: 15px;
        font-weight:bold !important;
    hr
        margin 0
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
    font-weight: 600;
}
.hx_HxLogo{
    background-image :'./HxLogo.png'
}
</style>

