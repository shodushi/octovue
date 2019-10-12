<template>
  <div id="app">
    <mainPage msg="Welcome to Your Vue.js App" txt="kjgfdhjkshfhjsghdj"/>
  </div>
</template>

<script>
import mainPage from './components/mainPage.vue'
import 'bulma/css/bulma.css'
import Router from 'vue-router'

import 'bulma-extensions/bulma-slider/dist/js/bulma-slider.min.js'
import 'bulma-extensions/bulma-slider/dist/css/bulma-slider.min.css'






//import OctoPrintClient from './assets/js/packed_client.js'

//import {tasmota_ip} from './assets/js/config.js'
//import {octo_ip} from './assets/js/config.js'

//import './assets/js/config.js'
//import './assets/js/jquery-3.4.1.min.js'
//import './assets/js/sockjs.min.js'
/*
import './assets/js/jquery-ui.js'
import './assets/js/api.js'
import './assets/js/dropzone.min.js'
import './assets/js/fa-all.js'
import './assets/js/proxies.js'
import './assets/js/sockjs.min.js'
import './assets/js/states.js'
*/
require('@/assets/css/octomin.css')
require('@/assets/css/dropzone.min.css')

export default {
  name: 'app',
  linkActiveClass: 'is-active',
  components: {
    mainPage
  }
}

</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0px;
}
</style>
