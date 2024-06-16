<template>
    <div>
        <Sidebar v-model:visible="visible" :class="'b-'+colorMode+' txt-'+colorMode">
        <template #container="{ closeCallback }">
            <div class="flex flex-column h-full">
                <div class="flex align-items-center justify-content-between px-4 pt-3 flex-shrink-0">
                    <span class="inline-flex align-items-center gap-2">
                        <svg width="35" height="40" viewBox="0 0 35 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="..." fill="var(--primary-color-color)" />
                            <path d="..." fill="var(--text-color)" />
                        </svg>
                        <span :class="'txt-'+colorMode" class="font-semibold text-2xl">{{ this.environment.environmentName }}</span>
                    </span>
                    <span>
                        <Button type="button" @click="closeCallback" icon="pi pi-times" rounded outlined class="h-2rem w-2rem"></Button>
                    </span>
                </div>
                <div class="overflow-y-auto">
                    <ul class="list-none p-3 m-0">
                        <li>
                            <div class="my-2">
                                <span class="font-medium">Workspaces</span>
                            </div>
                            <ul class="list-none p-0 m-0 overflow-hidden">
                                
                                <li v-for="workspace in this.environment.workspaces" :key="workspace.id" :title="workspace.workspaceName" :class="'hover hover-bsec-'+colorMode" class="pe-2 font-medium rounded my-1 max-h-8 ">
                                    <RouterLink v-if="workspace.workspaceNameURL" class="w-95 flex align-items-center cursor-pointer p-1 border-round hover:surface-100 p-ripple" :to=" { name: 'workspace', params: {environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: workspace.workspaceNameURL}}" @click="this.visible = false">
                                        <i class="pi pi-box mr-2"></i>
                                        <span class="min-w-0 text-ellipsis overflow-hidden whitespace-nowrap font-medium">{{ workspace.workspaceName }}</span>
                                    </RouterLink>
                                </li>
                            </ul>
                        </li>
                        <li :class="'hover hover-bsec-'+colorMode" class="rounded cursor-pointer" @click="openPosition('left')">
                            <button  class="flex align-items-center p-2 border-round text-700 hover:surface-100 p-ripple" >
                                <i class="pi pi-plus mr-2"></i>
                                <span class="p-2 text-xs">New Workspace</span>
                            </button>
                        </li>
                        <li>
                            <Dialog :class="'b-less-'+colorMode+' txt-'+colorMode" v-model:visible="dialog" header="Create workspace" :style="{ width: '25rem' }" :position="this.position" :modal="true" :draggable="false">
                                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="block">New workspace name:</span>
                                <div class="flex align-items-center gap-3 mb-3">
                                    <input v-model="newWorkspaceName" type="text" class="form-control w-75 mx-auto my-2" placeholder="Workspace name...">
                                </div>
                                <div class="flex justify-content-end gap-2">
                                    <Button type="button" label="Cancel" class="p-1 rounded hover:bg-cancel" severity="secondary" @click="dialog = false"></Button>
                                    <Button type="button" label="Save" class="p-1 rounded" :class="'hover hover-bsec-'+colorMode" @click="insertWorkspace()"></Button>
                                </div>
                            </Dialog>
                        </li>
                    </ul>
                </div>
            </div>
        </template>
        </Sidebar>
        
        <div class="mt-3 mx-3" :class="'txt-'+colorMode">
            <Button icon="pi pi-bars" id="side-bar-button" @click="visible = true" />
            <h1 class=" inline-block" style="font-weight: bold">{{ this.environment.environmentName }} <fa class="ps-1" v-if="isAdminInCurrentEnv" @click="openConfig()" icon="fa-solid fa-wrench"></fa></h1>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { RouterView } from 'vue-router';
import {mapGetters} from 'vuex';
import Sidebar from 'primevue/sidebar';
import Dialog from 'primevue/dialog';
import { ref } from "vue";
import { notify } from "@kyvg/vue3-notification";


export default {
    name: "SideBar",
    components: { 
        RouterView,
        Sidebar,
        Dialog
     },
     computed: {
            
    ...mapGetters(['colorMode', 'environment', 'stateWorkspace', 'isAdminInCurrentEnv', 'user', 'isAdminInCurrentEnv'])

    },
    data() {
        let url = this.$route.name == "environment" ? true : false;
        console.log(url)
        return {
            visible: url,
            dialog: ref(false),
            position: ref('center'),
            newWorkspaceName: ''
        }
    },
    methods: {
      signOut() {
        this.$router.push('/')
        localStorage.removeItem('token');
        localStorage.removeItem('vuex');
        localStorage.removeItem('environment');
        this.$store.dispatch('user', false);
        this.$store.dispatch('environment', false);
        
      },
      openPosition(position) {
        this.position = position;
        this.dialog = true;

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
                    var ws = response.data;
                    ws.workspaceNameURL = ws.workspaceName.toLowerCase().replace(/ /g, "-").replace(/[^a-zA-Z0-9-]/g, "");
                    this.$store.dispatch('addWorkspaceToEnvironment', response.data);
                    notify({
                        type: "success",
                        title: "Created succesfully",
                        text: "Workspace has been created!",
                    });        
                    loader.hide();
                    
                    this.$router.push({ name: 'workspace', params: {environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: ws.workspaceNameURL}})
                              
            });
            this.dialog = false;  
            loader.hide();
        },
        async openConfig() {
            /* let loader = this.$loading.show({
                // Optional parameters
                container: this.fullPage ? null : this.$refs.loadingArea,
                onCancel: this.onCancel,
            }); */
            this.$router.push({ name: 'environmentConfigView', params: { environmentNameURL: this.environment.environmentNameURL } });

            /* loader.hide(); */
        }

    }
}

</script>