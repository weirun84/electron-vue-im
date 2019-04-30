<template lang="pug">
.dt-file
  .dt-file-title {{ title }}
  .dt-file-value
    input(
      type="text",
      :disabled="disabled",
      :readonly="true",
      :value="values",
      @click="btnClickFun('dir')",
      @blur="blur",
      @change="change"
    )
  .dt-file-lable
    lable {{ lable_title }}
</template>

<script>
    export default {
        name: 'dt-file',
        props: {
            value: {
                type: String,
                default: ''
            },
            title: {
                type: [String, Number],
                default: ''
            },
            disabled: {
                type: Boolean,
                default: false
            },
            lable_title: {
                type: [String, Number],
                default: ''
            }
        },
        data() {
            return {
                values: ''
            }
        },
        mounted() {
            this.setValue()
        },
        watch: {
            value() {
                this.setValue()
            }
        },
        methods: {
            delInputs: function () {
                var inputs = document.querySelectorAll("input[type=file]#_ef");
                for (var i = 0; i < inputs.length; i++) {
                    document.body.removeChild(inputs[i]);
                }
            },
            /**
               *按钮事件实现函数
               *原理：利用input标签的file类别，打开选择文件对话框
               *通过change事件，将选择的文件返回。为了使每次选择的文件都得到更新，
               *在input对象用完后每次都移除出html中，下次使用时再重新创建并添加到html中
               */
            btnClickFun: function (dir) {
                ////暂时禁用
                ////alert("暂不支持切换")
                //return;

                this.delInputs();
                // 创建input标签
                var inputObj = document.createElement('input')
                // 设置属性
                inputObj.setAttribute('id', '_ef');
                inputObj.setAttribute('type', 'file');
                inputObj.setAttribute("style", 'visibility:hidden');
                if (dir) { // 如果要选择路径，则添加以下两个属性
                    inputObj.setAttribute('webkitdirectory', "");
                    inputObj.setAttribute('directory', "");
                }
                // 添加到DOM中
                document.body.appendChild(inputObj);
                // 添加事件监听器
                inputObj.addEventListener("change", this.updatePath);
                // 模拟点击
                inputObj.click();
            },
            // 打开文件选择器input标签的change事件响应
            updatePath: function () {              
                var inputObj = document.getElementById("_ef");
                var files = inputObj.files;
                console.log(files)
                try {
                    if (files.length > 1) {
                        alert('当前仅支持选择一个文件')
                    }
                    else {
                        this.value = files[0].path;
                    }
                    // 移除事件监听器
                    inputObj.removeEventListener("change", function () { });
                    // 从DOM中移除input
                    document.body.removeChild(inputObj);
                } catch (error) {
                    alert(error)
                }
            },
            setValue() {
                if (this.value) {
                    this.values = this.value
                } else {
                    this.values = ''
                }
            },
            blur($e) {
                $e.preventDefault()
                $e.stopPropagation()
                if (this.values.length <= 1) {
                    this.setValue()
                }
                this.$emit('input', this.values)
            },
            change() {
                var inputObj = document.getElementById("_ef");
                document.body.removeChild(inputObj);
            }
        }
    }
</script>

<style lang="stylus">
.dt-file
  display block
  padding 5px 0
  &-title
    text-align left
  &-value
    margin-top 7px
    input
      display block
      width 100%
      height 36px
      line-height 36px
      border 1px solid #ccc
      background-color #fff
      border-radius 2px
      padding 0 6px
      outline none
      &:not([disabled])
        &:hover,
        &:focus,
        &:active
          border 1px solid #0ef
          outline none
        &:focus,
        &:active
          box-shadow 0 0 1px #0bf

      &[disabled]
        background-color #eee
        cursor not-allowed
  &-lable
    text-align left
    margin-top 7px
    font-size 12px

</style>
