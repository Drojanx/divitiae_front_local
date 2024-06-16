<template>
    <div id="page-not-found">
        <div class="mx-auto w-50 text-center mt-5">
            <h1>Sorry, item not found</h1>
            <RouterLink class="btn btn-warning rounded px-2" :to=" { name: 'app', params: {environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: stateWorkspace.workspaceNameURL, appNameURL: stateApp.appNameURL}}" style="text-decoration: none;"> Go back to the app </RouterLink>
</div>
    </div>
</template>

<script>
import {mapGetters} from 'vuex';


    export default {
        name: 'ItemNotFound',
        computed: {
            
            ...mapGetters(['environment', 'stateWorkspace', 'stateItems', 'stateApp', 'stateItemDetail']),
    
        }
    }
</script>