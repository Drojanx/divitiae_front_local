<template>
  <Login/>
</template>

<script>

  import Login from '../components/Login.vue'

  export default {
      name: 'LoginView',
      components: {
        Login
      },
      watch: {
        $route: {
            immediate: true,
            handler(to, from) {
                document.title = to.meta.title || 'Divitiae - Log in';
            }
        },
      },
      beforeCreate: function() {
        document.body.className = 'root';
      }
  }
</script>