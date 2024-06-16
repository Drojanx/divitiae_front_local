<template>
  <div class="about">
    <PageNotFound/>
  </div>
</template>

<script>

  import PageNotFound from '../components/NotFound/PageNotFound.vue'

  export default {
      name: 'PageNotFoundView',
      components: {
        PageNotFound
      },
      watch: {
        $route: {
            immediate: true,
            handler(to, from) {
                document.title = to.meta.title || 'Divitiae - Page not found';
            }
        },
      }
  }
</script>