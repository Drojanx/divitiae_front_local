<template>
  <LogOut/>
</template>

<script>

  import LogOut from '../components/LogOut.vue'

  export default {
      name: 'LoginView',
      components: {
        LogOut
      },
      watch: {
        $route: {
            immediate: true,
            handler(to, from) {
                document.title = to.meta.title || 'Divitiae - Log out';
            }
        },
      },
      beforeCreate: function() {
        document.body.className = 'root';
      }
  }
</script>