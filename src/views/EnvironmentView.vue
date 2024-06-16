<template>
  <div id="environment" :class="'b-'+colorMode">
    <Environment/>
  </div>
</template>

<script>

  import Environment from '../components/Environment.vue'
  import AppBar from '../components/Bars/AppBar.vue'
  import {mapGetters} from 'vuex';

  export default {
      name: 'EnvironmentView',
      components: {
        Environment,
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