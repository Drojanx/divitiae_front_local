<template>
    <div >
        <div id="vpCentered" class="px-0">
            <div id="envName" class="my-3">
                <h3 :class="'txt-'+colorMode" class="text-center mt-2">{{ environment.environmentName }} - Configuration</h3>            
            </div>
            <div id="configContent" class="pb-4 pt-3 px-3">
                <form id="configInfo" class="container-fluid" @submit.prevent="">
                    <p :class="'txt-'+colorMode" class="mb-1 mt-3">Environment's name</p> 
                    <div class="col-3">
                        <input id="envNameInput" :class="'txt-'+colorMode" class="effect-1 bg-transparent" type="text" v-model="environmentName"> 
                        <span class="focus-border">
                            <i></i>
                        </span>
                    </div>
                    <button @click="changeEnvironmentName()" class="bg-warning rounded px-2 py-1 cursor-pointer text-align-center text-center" style="height: 30px; text-decoration: none; font-weight: 700 !important; color: #2c3e50 !important;">Update</button>
                </form>
                <div class="mt-5 d-flex w-90 justify-content-between mx-auto">
                    <p :class="'txt-'+colorMode" class="mb-1 text-center"  style="align-self: center">Environment's owners</p> 
                </div>
                
                <div class="row mt-3" style="overflow-y: auto; max-height: 30%;">
                    <table :class="'txt-'+colorMode+' bsec-'+colorMode" id="usersList" class="table table-hover text-center">
                        <thead class="thead-greenish">
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col" style="min-width: 8rem;">User Name</th>
                                <th scope="col" style="min-width: 8rem;">User Email</th>
                                <th scope="col" style="min-width: 8rem;">Role</th>
                                <th scope="col" style="min-width: 2rem;">Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(item, index, i) in environment.usersData" :key="item.userId">
                                <tr v-if="user.id !== item.id || item.isOwner">
                                    <th scope="row"> {{ index+1 }} </th>
                                    <td :title="item.userDisplayName"><span>{{ item.userDisplayName }}</span></td>
                                    <td :title="item.userEmail"><span>{{ item.userEmail }}</span></td>
                                    <td title="admin">
                                        <span v-if="item.isAdmin">Administrator</span>
                                        <span v-if="!item.isAdmin">Regular User</span>
                                    </td>
                                    <td title="edit" id="edit-user" @click="openUserInfo(item.userId)"><fa icon="fa-solid fa-ellipsis"></fa></td>
                                </tr>                     
                            </template>
                            
                        </tbody>
                    </table>
                </div>
                <div class="mt-5 d-flex w-90 justify-content-between mx-auto">
                    <p :class="'txt-'+colorMode" class="mb-1 text-center"  style="align-self: center">Environment's users</p> 
                    <button class="bg-warning rounded px-2 py-1 cursor-pointer text-align-center text-center" style="height: 30px; text-decoration: none; font-weight: 700 !important; color: #2c3e50 !important;" @click="openAddUserForm()">Add users</button>
                </div>
                
                <div class="row mt-3" style="overflow-y: auto; max-height: 30%;">
                    <table :class="'txt-'+colorMode" id="usersList" class="table table-hover text-center">
                        <thead class="thead-greenish">
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col" style="min-width: 8rem;">User Name</th>
                                <th scope="col" style="min-width: 8rem;">User Email</th>
                                <th scope="col" style="min-width: 8rem;">Role</th>
                                <th scope="col" style="min-width: 2rem;">Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="(item, index, i) in environment.usersData" :key="item.userId">
                                <tr v-if="user.id !== item.id || !item.isOwner">
                                    <th scope="row"> {{ index+1 }} </th>
                                    <td :title="item.userDisplayName"><span>{{ item.userDisplayName }}</span></td>
                                    <td :title="item.userEmail"><span>{{ item.userEmail }}</span></td>
                                    <td title="admin">
                                        <span v-if="item.isAdmin">Administrator</span>
                                        <span v-if="!item.isAdmin">Regular User</span>
                                    </td>
                                    <td title="edit" id="edit-user" @click="openUserInfo(item.userId)"><fa icon="fa-solid fa-ellipsis"></fa></td>
                                </tr>                     
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
            <router-view v-slot="{ Component }">
                    <component :is="Component" />
            </router-view>
        </div>
        
    </div>
</template>

<script>
import axios from 'axios';
import WorkspaceApp from './WorkspaceApp.vue';
import NewAppForm from './NewAppForm.vue'
import {mapActions, mapGetters} from 'vuex';
import { getWorkspace } from '../router/index.js'
import { notify } from "@kyvg/vue3-notification";

    export default {
        name: 'EnvironmentConfig',
        computed: {
            
        ...mapGetters(['user', 'colorMode', 'environment', 'stateWorkspace', 'stateNewAppFormIsOpen', 'stateApp', 'isAdminInCurrentEnv']),

        },
        data() {
            return {
                fullPage: false,
                loadedApp: null,
                addUserFormOpen: false,
                environmentName: ''
            }
        },
        mounted() {
            this.environmentName = this.environment.environmentName;
        },
        watch: {
            /* $route: {
                immediate: true,
                handler(to, from) {
                    document.title = to.meta.title || `${this.stateWorkspace.workspaceName}`;
                }
            } */
        },
        methods: {
            async openAddUserForm(){
                let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                    width: 80,
                    height: 80,
                    color: "#ffc107"
                });

                this.$router.push({ name: 'environmentAddUserView', params: { id: this.environment.id } });

                loader.hide();
            },
            async openUserInfo(userId){

                this.$router.push({ name: 'edit-user', params: { id: this.environment.id, userId:  userId} });

            },
            async changeEnvironmentName() {
                let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                    color: '#FFC107'
                });
                await axios.put(`environment/change-name/${this.environment.id}`, this.environmentName,{
                        headers: {
                        'Content-Type': 'application/json'
                        }
                    })
                    .then(() => {
                        notify({
                            type: "success",
                            title: "Environment updated",
                            text: "You just updated the environment name!",
                        });
                        console.log("si")
                        this.environment.environmentName = this.environmentName;
                        this.user.workEnvironments.find(x=>x.id==this.environment.id).environmentName = this.environmentName;
                        let existingNames = {};
                        this.user.workEnvironments.forEach((we) => {
                            let nombreUrlFriendly = we.environmentName.toLowerCase().replace(/ /g, "-").replace(/[^a-zA-Z0-9-]/g, "");
                
                            // Verifica si ya existe el nombreUrlFriendly
                            if (existingNames[nombreUrlFriendly] !== undefined) {
                                // Genera un nuevo nombre único
                                let count = existingNames[nombreUrlFriendly]++;
                                nombreUrlFriendly += `(${count})`;
                            } else {
                                existingNames[nombreUrlFriendly] = 1;
                            }
                            we.environmentNameURL = nombreUrlFriendly;
                            if(we.id==this.environment.id){
                                this.$store.dispatch('environmentName', we)
                            }
                        })
                            
                            
                        this.$store.dispatch('user', this.user);
                        this.$router.push({name: 'environmentConfigView', params: { environmentNameURL: this.environment.environmentNameURL }})
                        loader.hide();
                    })
                    .catch((err)=> {
                                            
                        notify({
                            type: "error",
                            title: "Environment update failed",
                            text: "There was a problem trying to update the environment name.",
                        });
                        loader.hide();
                    })
            }
        },
        async beforeRouteUpdate(to, from, next){
            let loader = this.$loading.show({
                // Optional parameters
                container: this.fullPage ? null : this.$refs.loadingArea,
                onCancel: this.onCancel,
                color: '#FFC107'
            });

            if (to.params.wsId !== from.params.wsId){
                this.$store.dispatch('stateWorkspace', null);
                this.$store.dispatch('stateItems', null);
                this.$store.dispatch('stateApp', null);
                
                await getWorkspace(to.params.wsId);
                next();
                loader.hide();
            } else {
                next();
                loader.hide();
            }
        }
        
    }
</script>

<style>

</style>