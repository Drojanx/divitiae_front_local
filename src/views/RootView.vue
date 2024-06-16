<template>
    <Root/>
</template>

<script>

    import Root from '../components/Root.vue';

    export default {
        name: 'RootView',
        components: {
            Root
        },
    
        watch: {
        $route: {
            immediate: true,
            handler(to, from) {
                document.title = to.meta.title || 'Divitiae';
            }
        },
      },
        beforeCreate: function() {
            document.body.className = 'root';
        }
    }
</script>
  