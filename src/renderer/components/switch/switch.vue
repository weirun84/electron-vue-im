<template>
  <div>
    <span class="weui-switch" :class="{'weui-switch-on' : me_checked}" :value="value" @click="toggle"></span>
  </div>
</template>

<script>
  export default {
    props: {
      value: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        me_checked: this.value
      }
    },
    watch: {
      me_checked(val) {
        this.$emit('input', val);
      }
    },
    methods: {
      toggle() {
        this.me_checked = !this.me_checked;
      }
    }
  }
</script>

<style>
  .weui-switch {
    display: block;
    position: relative;
    width: 52px;
    height: 22px;
    border: 1px solid #DFDFDF;
    outline: 0;
    border-radius: 11px;
    box-sizing: border-box;
    background-color: #DFDFDF;
    transition: background-color 0.1s, border 0.1s;
    cursor: pointer;
  }
  .weui-switch:before {
    content: " ";
    position: absolute;
    top: 0;
    left: 0;
    width: 50px;
    height: 20px;
    border-radius: 10px;
    background-color: #d1d1d1;
    transition: transform 0.35s cubic-bezier(0.45, 1, 0.4, 1);
  }
  .weui-switch:after {
    content: " ";
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    border-radius: 10px;
    background-color: #FFFFFF;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    transition: transform 0.35s cubic-bezier(0.4, 0.4, 0.25, 1.35);
  }
  .weui-switch-on {
    border-color: #1AAD19;
    background-color: #1AAD19;
  }
  .weui-switch-on:before {
    border-color: #1AAD19;
    background-color: #1AAD19;
  }
  .weui-switch-on:after {
    transform: translateX(30px);
  }
</style>
