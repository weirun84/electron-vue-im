<template> 
    <div class="circle-bar" style="position: absolute;top: 23px; z-index: 2; left: 31%;">
    <div class="circle-bar-left"></div>
    <div class="circle-bar-right"></div>
     <!--遮罩层，显示百分比-->
    <div class="mask">
        <span class="percent">30%</span>
    </div>
</div>
</template>
<script>
export default {
    methods:{

    },
    create(){
         window.onload = function(){

        var circleBar    = document.getElementsByClassName('circle-bar')[0];
        var percent      = parseInt(circleBar.getElementsByClassName('percent')[0].firstChild.nodeValue);
        var color        = circleBar.css('background-color');
        var left_circle  = circleBar.getElementsByClassName('circle-bar-left')[0];
        var right_circle = circleBar.getElementsByClassName('circle-bar-right')[0];

        if( percent <= 50 ) {
            var rotate = 'rotate('+(percent*3.6)+'deg)';
            right_circle.css3('transform',rotate);
        }else {
            var rotate = 'rotate('+((percent-50)*3.6)+'deg)';
            right_circle.css ('background-color',color);//背景色设置为进度条的颜色
            right_circle.css3('transform','rotate(0deg)');//右侧不旋转
            left_circle.css3 ('transform',rotate);//左侧旋转
        }
      };
    },
    watch:{

    },
    mounted(){
      window.onload = function(){

        var circleBar    = document.getElementsByClassName('circle-bar')[0];
        var percent      = parseInt(circleBar.getElementsByClassName('percent')[0].firstChild.nodeValue);
        var color        = circleBar.css('background-color');
        var left_circle  = circleBar.getElementsByClassName('circle-bar-left')[0];
        var right_circle = circleBar.getElementsByClassName('circle-bar-right')[0];

        if( percent <= 50 ) {
            var rotate = 'rotate('+(percent*3.6)+'deg)';
            right_circle.css3('transform',rotate);
        }else {
            var rotate = 'rotate('+((percent-50)*3.6)+'deg)';
            right_circle.css ('background-color',color);//背景色设置为进度条的颜色
            right_circle.css3('transform','rotate(0deg)');//右侧不旋转
            left_circle.css3 ('transform',rotate);//左侧旋转
        }
      };
       //封装了css3函数
    Element.prototype.css = function(property,value){
        
        if ( value ) { 
            var index = property.indexOf('-');
            if( index != -1 ) {
                var char = property.charAt(index+1).toUpperCase();
                property.replace(/(-*){1}/,char);
            }
            this.style[property] = value;
        }else{ 
            return window.getComputedStyle(this).getPropertyValue(property);
        }
    }

    //封装一个css3函数，用来快速设置css3属性
    Element.prototype.css3 = function(property,value){
        if( value ){
            property = capitalize(property.toLowerCase());
            this.style['webkit'+property] = value;
            this.style['Moz'+property] = value;
            this.style['ms'+property] = value;
            this.style['O'+property] = value;
            this.style[property.toLowerCase()] = value;
        }else{
            return window.getComputedStyle(this).getPropertyValue(
                    ('webkit'+property)||('Moz'+property)||('ms'+property)||('O'+property)||property);
                    
        }
      
        //首字母大写
        function capitalize(word){
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
    }
    }
}

</script>
<style scoped>
 /*支持IE9及以上*/
    .circle-bar {margin: 20px; font-size:50px; width: 1em; height: 1em; position: relative;  background-color: #999; }
    .circle-bar-left,.circle-bar-right { width: 1em; height: 1em;  } 
    .circle-bar-right { clip:rect(0,auto,auto,.5em);background-color: #E8E8FF; }
    .circle-bar-left { clip:rect(0,.5em,auto,0); background-color:#E8E8FF;} 
    .mask { width: 0.8em; height: 0.8em;text-align: center;line-height: 0.2em; color:rgba(0,0,0,0.5);}
    .mask :first-child { font-size: 0.3em; height: 0.8em; line-height: 0.8em; display: block;  }
    /*所有的后代都水平垂直居中，这样就是同心圆了*/
    .circle-bar * {  position: absolute; top:0; right:0; bottom:0; left:0; margin:auto; }
    /*自身以及子元素都是圆*/
    .circle-bar, .circle-bar > * { border-radius: 50%; }
</style>

