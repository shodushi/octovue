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
import 'bulma-extensions/bulma-pageloader/dist/css/bulma-pageloader.min.css'
require('@/assets/css/octomin.css')


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
