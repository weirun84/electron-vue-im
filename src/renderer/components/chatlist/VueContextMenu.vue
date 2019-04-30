<template>
  <span class="vue-contextmenu-listWrapper" :class="'vue-contextmenuName-' + contextMenuData.menuName">
    <li v-for="item in contextMenuData.menulists" class="context-menu-list">
      <button @click.stop="fnHandler(item)">
        <i :class="item.icoName"></i>
        <span style="width:100%">{{item.btnName}}</span>
      </button>
    </li>
  </span>
</template>
<script>
  export default {
    props: {
      contextMenuData: {
        type: Object,
        requred: false,
        default () {
          return {
            menuName: null,
            axios: {
              x: null,
              y: null
            },
            menulists: [
              {
                fnHandler: 'adddata',
                icoName: 'fa fa-home fa-fw',
                btnName: 'New'
              },
              {
                fnHandler: 'savedata',
                icoName: 'fa fa-home fa-fw',
                btnName: 'Save'
              }
            ]
          }
        }
      },
      transferIndex: {
        type: Number,
        default: 0
      }
    },
    watch: {
      'contextMenuData.axios' (val) {
        var x = val.x
        var y = val.y
        var _this = this
        var index = _this.transferIndex
        var menuName = 'vue-contextmenuName-' + _this.contextMenuData.menuName
        var menu = document.getElementsByClassName(menuName)[index]
        menu.style.display = 'block'
        menu.style.left = x + 'px'
        menu.style.top = y + 'px'
        document.addEventListener('mouseup', function () {
          menu.style.display = 'none'
        }, false)
      }
    },
    methods: {
      fnHandler (item) {
        this.$emit(item.fnHandler)
      }
    }
  }
</script>
<style>
  .vue-contextmenu-listWrapper {
    box-shadow: 2px 2px 2px #cccccc;
    display: none;
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;
  }
  .vue-contextmenu-listWrapper .context-menu-list {
    width: 100px;
    height: 32px;
    border-radius: 4px;
    text-decoration: none;
    list-style: none;
  }
  .vue-contextmenu-listWrapper .context-menu-list button {
    cursor: pointer;
    width: 100%;
    height: 100%;
    display: block;
    background-color: white;
    text-align: center;
    outline: 0;
    border: 0;
  }
  .vue-contextmenu-listWrapper .context-menu-list button i,  .vue-contextmenu-listWrapper .context-menu-list button span {
    float: left;
  }
  .vue-contextmenu-listWrapper .context-menu-list button i{
    padding: 0 10px 0 10px;
  }
  .vue-contextmenu-listWrapper .context-menu-list button:hover {
    box-shadow: 0px 1px 3px rgba(207, 231, 216, 0.2);
    color: #000;
    border-radius: 4px;
    background-color: #eee;
  }
</style>