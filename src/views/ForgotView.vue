<template>
  <Forgot/>
</template>

<script>

  import Forgot from '../components/Forgot.vue'

  export default {
      name: 'ForgotView',
      components: {
        Forgot
      },
      watch: {
        $route: {
            immediate: true,
            handler(to, from) {
                document.title = to.meta.title || 'Divitiae - Forgot password';
            }
        },
      }
  }
</script>
