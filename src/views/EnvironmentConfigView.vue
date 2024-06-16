<template>
  <div id="environment-config" :class="'b-'+colorMode">
    <EnvironmentConfig/>
  </div>
</template>

<script>

  import EnvironmentConfig from '../components/EnvironmentConfig.vue'
  import AppBar from '../components/Bars/AppBar.vue'
  import {mapGetters} from 'vuex';

  export default {
      name: 'EnvironmentConfigView',
      computed: {
            
            ...mapGetters(['colorMode']),
    
            },
      components: {
        EnvironmentConfig,
        AppBar
      },
      beforeCreate: function() {
        document.body.className = 'app';
      }
  }
</script>