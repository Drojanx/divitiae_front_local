<template>
    <div id="page-not-found">
        <div class="mx-auto w-50 text-center mt-5">
            <h1>Sorry, app not found</h1>
            <RouterLink class="btn btn-warning rounded px-2" :to=" { name: 'workspace', params: {environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: stateWorkspace.workspaceNameURL}}" style="text-decoration: none;"> Go back to the workspace </RouterLink>
</div>
    </div>
</template>

<script>
import {mapGetters} from 'vuex';


    export default {
        name: 'AppNotFound',
        computed: {
            
            ...mapGetters(['environment', 'stateWorkspace', 'stateItems', 'stateApp', 'stateItemDetail']),
    
        }
    }
</script>