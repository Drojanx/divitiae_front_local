<template>
  <div id="home" :class="'b-'+colorMode" >
    <Home/>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex';
  import Home from '../components/Home.vue'
  import AppBar from '../components/Bars/AppBar.vue'

  export default {
      name: 'HomeView',
      components: {
        Home,
        AppBar
      },
      computed: {
            
      ...mapGetters(['colorMode']),

      },
      beforeCreate: function() {
        document.body.className = 'app';
      }
  }
</script>