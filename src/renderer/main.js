// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueLazyload from 'vue-lazyload'
import VueQuillEditor  from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import VueClipboard from 'vue-clipboard2'  
Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(VueQuillEditor)
Vue.use(VueClipboard) 
Vue.use(VueLazyload, {
    preLoad: 1.3,
    error: './assets/images/user.png',//这个是请求失败后显示的图片
    loading: './assets/logo.png',//这个是加载的loading过渡效果
    attempt: 1
})

window.audioList = []
const vm = new Vue({
    el: '#app',
    router,
    template: '<App/>',
    store,

    components: { App }
})

//const config = {
//    fieldsBagName: 'vee-fields'
//}
//Vue.use(VeeValidate, config)
