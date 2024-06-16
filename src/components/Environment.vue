<template>
    <div class="">
        <SideBar/>
        <div id="environmentChildrenSection" class="d-flex">
            <div id="environmentInfo" style="align-self: flex-start;">
                
                
            </div>
            <!-- <router-view v-if="this.stateWorkspace!==null"></router-view> -->
            <!-- <Workspace v-if="this.loadedWorkspace!==null" :workspace="loadedWorkspace"/> -->
            <router-view v-slot="{ Component }">
                <component :is="Component" />
            </router-view>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import Workspace from '../components/Workspace.vue';
import {mapGetters} from 'vuex';
import { getEnvironment } from '../router/index.js'
import { notify } from "@kyvg/vue3-notification";
import createStore from '../store/index.js';
import SideBar from '../components/Bars/SideBar.vue';

    export default {
        name: 'Environment',
        computed: {
            
        ...mapGetters(['environment', 'stateWorkspace', 'isAdminInCurrentEnv'])

        },
        components: {
            Workspace,
            SideBar
        },
        data() {
            return {
                fullPage: false,
                addWorkspaceForm: false,
                newWorkspaceName: "",
            }
        },
        watch: {
            $route: {
                immediate: true,
                async handler(to, from) {                    
                    document.title = to.meta.title || `${this.environment.environmentName}`;
                    if(from != undefined && to.params != undefined){

                        if (to.params.environmentNameURL != undefined && from.params.environmentNameURL != undefined && to.params.environmentNameURL !== from.params.environmentNameURL) {

                            createStore.dispatch('environment', "");
                            createStore.dispatch('stateWorkspace', "");
                            createStore.dispatch('stateItems', "");
                            createStore.dispatch('stateApp', "");

                            await getEnvironment(to.params.environmentNameURL);
                            
                        }
                    }

                }
            }
        },
        methods: {
            async openWorkspaceForm() {
                this.addWorkspaceForm = !this.addWorkspaceForm;
            },
            async insertWorkspace() {
                let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                    color: "#ffc107",
                    width: 80,
                    height: 80
                });

                await axios.post(`workspace/${this.environment.id}/add`, {
                    workspaceName: this.newWorkspaceName
                })
                .then( (response) => {
                        console.log(response)
                        this.$store.dispatch('addWorkspaceToEnvironment', response.data);
                        loader.hide();
                        notify({
                            type: "success",
                            title: "Created succesfully",
                            text: "Item has been created!",
                        });        
                        openWorkspaceForm();            
                });
            },
            /*
            * TODO: probar respuesta API al traer workspace
            */
            async loadWorkspace(workspaceId) {
                /* let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                }); */
                var loadedWorkspace = this.environment.Workspaces.find(workspace => workspace.Id == workspaceId);

                this.$router.push({ name: 'workspace', params: { environmentNameURL: this.environment.environmentNameURL, wsId: loadedWorkspace.Id } });
                
                /* loader.hide(); */
            },
            async openConfig() {
                /* let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                }); */
                this.$router.push({ name: 'environmentConfigView', params: { id: this.environment.id } });

                /* loader.hide(); */
            }
        }
    }
</script>

<style>

</style>