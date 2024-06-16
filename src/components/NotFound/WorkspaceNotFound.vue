<template>
    <div id="page-not-found">
        <div class="mx-auto w-50 text-center mt-5">
            <h1>Sorry, workspace not found</h1>
            <RouterLink class="btn btn-warning rounded px-2" :to=" { name: 'environment', params: {environmentNameURL: this.environment.environmentNameURL}}" style="text-decoration: none;"> Go back to the environment </RouterLink>
</div>
    </div>
</template>

<script>
import {mapGetters} from 'vuex';


    export default {
        name: 'WorkspaceNotFound',
        computed: {
            
            ...mapGetters(['environment', 'stateWorkspace', 'stateItems', 'stateApp', 'stateItemDetail']),

            }
    }
</script>