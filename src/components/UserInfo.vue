<template>
    <Teleport to="body">
        <div id="newUserFormSection">
            <form id="newUserForm" class="container-fluid p-0" @submit.prevent="">
                <div id="itemDetailNav" class="d-flex justify-content-between flex-row-reverse"><fa icon="fa-solid fa-xmark" @click="closeForm()"/></div>
                <div class="flex justify-content-between">
                    <div class="pw-20 cursor-pointer flex justify-content-end align-items-center pe-4" >
                        <Toast />
                        <ConfirmDialog></ConfirmDialog>
                        <button @click="deleteUser" label="Delete" severity="danger" outlined><fa icon="fa-solid fa-trash" /></button>
                    </div>
                    <h1 class="w-80 py-1 transition duration-300 ease-in-out" id="user-name">{{ editingUser.userName + " " + editingUser.userLastName }}</h1>
                </div>
                <div class="container-fluid w-100 p-0">
                    <div class="d-flex justify-content-between newAppField " style="flex-wrap: wrap;">
                        <div class="pw-20 d-flex pe-3" style="align-items: center; justify-content: end;">
                            <small>ID</small>   
                        </div>
                        <small class="ps-3 w-80 py-2 newAppFieldType" type="text">{{ editingUser.userId }}</small>  
                    </div>
                    <div class="d-flex justify-content-between newAppField " style="flex-wrap: wrap;">
                        <div class="pw-20 d-flex pe-3" style="align-items: center; justify-content: end;">
                            <span>Email</span>   
                        </div>
                        <span class="ps-3 w-80 py-2 newAppFieldType" type="text">{{ editingUser.userEmail }}</span> 
                    </div>
                    <div class="d-flex justify-content-between newAppField " style="flex-wrap: wrap;">
                        <div class="pw-20 d-flex pe-3" style="align-items: center; justify-content: end;">
                            <span>Admin</span>   
                        </div>
                        <div class="ps-3 w-80 py-2 newAppFieldType">
                            <label class="switch" >
                                <input @click="updateAdminPermission" type="checkbox" v-model="isAdmin">
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between newAppField " style="flex-wrap: wrap;">
                        <div class="pw-20 d-flex pe-3" style="align-items: center; justify-content: end;">
                            <span>Owner</span>   
                        </div>
                        <div class="ps-3 w-80 py-2 newAppFieldType">
                            <label class="switch" >
                                <input @change="updateOwnerPermission" type="checkbox" v-model="isOwner">
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between newAppField " style="flex-wrap: wrap;">
                        <div class="pw-20 pe-3"></div>
                        <div class="ps-3 w-80 py-2 newAppFieldType" style="align-items: center; justify-content: end;">
                            <span style="font-size: smaller;">Workspaces' accesses</span>   
                        </div>
                    </div>


                    <div class="d-flex justify-content-between newAppField " v-for="(workspace, index) in environment.workspaces" style="flex-wrap: wrap;">
                        <div class="pe-3 pw-20 d-flex" style="align-items: center; justify-content: end;">
                            <span :title="workspace.workspaceName" class="w-80 text-end px-0 newAppFieldName h-100">{{ workspace.workspaceName }}</span> 
                        </div>
                        <div class="ps-3 w-80 py-2 newAppFieldType" style="align-items: center; justify-content: end;">
                            <label class="switch" >
                                <input type="checkbox" v-model="checkedWorkspaces[workspace.id]">
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                    <div id="createAppButton" class="text-center">
                        <button @click="updateUser()" class="btn btn-block">Update workspaces access</button>
                    </div>
                    
                </div>
            </form>   
        </div>
    </Teleport>  
</template>

<script>
import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import {mapGetters} from 'vuex';
import { notify } from "@kyvg/vue3-notification";
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';

    export default {
        name: 'UserInfo',
        computed: {
            
        ...mapGetters(['stateWorkspace', 'stateNewAppFormIsOpen', 'stateApp', 'stateFieldTypes', 'environment', 'editingUser', 'user']),
        appFields: function() {

            return this.newAppFields;
        }

        },async mounted() {
            window.addEventListener('click', this.handleClickOutsideOfAppForm);
        },
        components: {            
            ConfirmDialog,
            Toast
        },
        async created() {
            this.checkedWorkspaces = this.editingUser.workEnvironment.workspaces;

        },
        data() {
            return {
                fullPage: false,
                loadedApp: null,
                invitedUserEmail: "",
                isAdministrator: false,
                checkedWorkspaces: {},
                isAdmin: false,
                isOwner: false
            }
        },
        watch: {
            $route: {
                immediate: true,
                handler(to, from) {
                    document.title = to.meta.title || `Add user`;
                }
            }
        },
        async mounted() {
            window.addEventListener('click', this.handleClickOutsideOfAppForm);
            this.isAdmin = this.editingUser.workEnvironment.isAdmin;
            this.isOwner = this.editingUser.workEnvironment.isOwner;
        },
        methods: {
            async updateAdminPermission(){
                let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                });
                await axios.put(`environment/${this.environment.id}/admin-permission/${this.editingUser.userId}`, !this.editingUser.workEnvironment.isAdmin, {
                        headers: {
                        'Content-Type': 'application/json'
                        }
                    })
                    .then(() => {
                        let editedUser = {
                            userId: this.editingUser.userId,
                            isAdmin: this.isAdmin
                        }
                        this.$store.dispatch('updateUserAdminPermission', editedUser);
                        notify({
                            type: "success",
                            title: "Admin permission updated",
                            text: "You just updated this user's admin permission!",
                        });
                        loader.hide();
                    })
                    .catch((err) => {
                        console.log(err)
                        notify({
                            type: "error",
                            title: "Admin permission update failed",
                            text: "There was a problem updating this user's admin permission.",
                        });
                        this.isAdmin = this.editingUser.workEnvironment.isAdmin
                        loader.hide();
                    })
                
            },  
            async updateOwnerPermission(){
                let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                });
                await axios.put(`environment/${this.environment.id}/owner-permission/${this.editingUser.userId}`, !this.editingUser.workEnvironment.isOwner, {
                        headers: {
                        'Content-Type': 'application/json'
                        }
                    })
                    .then(() => {
                        let editedUser = {
                            userId: this.editingUser.userId,
                            isAdmin: this.isOwner
                        }
                        this.$store.dispatch('updateUserOwnerPermission', editedUser);
                        notify({
                            type: "success",
                            title: "Owner permission updated",
                            text: "You just updated this user's owner permission!",
                        });
                        loader.hide();
                    })
                    .catch((err) => {
                        console.log(err)
                        if(err.response.status == 403){
                            notify({
                                type: "error",
                                title: "Owner permission update failed",
                                text: err.response.data,
                            });
                            
                        }
                        this.isOwner = this.editingUser.workEnvironment.isOwner
                        loader.hide();
                    })
                
            }, 
            async closeForm() {
                this.$router.push({ name: 'environmentConfigView' });
                
            },
            async handleClickOutsideOfAppForm(e) {
                e.stopPropagation();
                if ('newUserFormSection' == e.target.id){
                    this.closeForm();
                }
            },
            async updateUser() {
                let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                });

                let permissions = []

                for (const property in this.checkedWorkspaces){
                    let permission = {
                        Id: property,
                        Access: this.checkedWorkspaces[property]
                    }
                    permissions.push(permission);
                }

                console.log(permissions);


                await axios.put(`user/${this.editingUser.userId}/update-workspaces/${this.environment.id}`, permissions)
                    .then(async () => {
                        notify({
                            type: "success",
                            title: "User updated",
                            text: "User's permissions updated!",
                        });
                    })
                    .catch((err) =>{
                        console.log(err);
                        loader.hide();
                        
                    })
                    //TODO ARREGLAR UPDATE WORKSPACES
                console.log(this.invitedUserEmail);
                console.log(this.isAdministrator);
                console.log(this.checkedWorkspaces);
                loader.hide();
            },
            async deleteUser(){
                if(this.editingUser.userId != this.user.userId){
                    this.$confirm.require({
                        message: 'Do you want to remove this user from the environment?',
                        header: 'Attention',
                        icon: 'pi pi-info-circle',
                        rejectLabel: 'Cancel',
                        acceptLabel: 'Delete',
                        rejectClass: 'p-button-secondary p-button-outlined',
                        acceptClass: 'p-button-danger',
                        accept: async () => {
                            let loader = this.$loading.show({
                                // Optional parameters
                                container: this.fullPage ? null : this.$refs.loadingArea,
                                onCancel: this.onCancel,
                                color: '#FFC107'
                            });
                            await axios.delete(`environment/${this.environment.id}/remove-user/${this.editingUser.userId}`)
                                .then((res) => {
                                    console.log(res)
                                    this.$router.push({ name: 'environmentConfigView', params: { environmentNameURL: this.environment.environmentNameURL } });
                                    this.$store.dispatch('removeUserFromEnvironment', this.editingUser.userId);
                                    notify({
                                        type: "success",
                                        title: "User removed",
                                        text: "You removed the user from this environment!",
                                    });
                                    loader.hide();
                                })
                                .catch((err) => {
                                    console.log(err)
                                    notify({
                                        type: "error",
                                        title: "Error occurred",
                                        text: err.response.data,
                                    });
                                    loader.hide();
                                })
                        },
                        reject: () => {
                            this.$toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 6000 });
                        }
                    });
                } else {
                    this.$confirm.require({
                        message: 'You are about to remove yourself from the environment, are you sure?',
                        header: 'Attention',
                        icon: 'pi pi-info-circle',
                        rejectLabel: 'Cancel',
                        acceptLabel: 'Delete',
                        rejectClass: 'p-button-secondary p-button-outlined',
                        acceptClass: 'p-button-danger',
                        accept: async () => {
                            let loader = this.$loading.show({
                                // Optional parameters
                                container: this.fullPage ? null : this.$refs.loadingArea,
                                onCancel: this.onCancel,
                                color: '#FFC107'
                            });
                            await axios.delete(`environment/${this.environment.id}/remove-user/${this.editingUser.userId}`)
                                .then((res) => {
                                    console.log(res)
                                    this.$store.dispatch('removeCurrentUserFromEnvironment', this.environment.id);
                                    this.$router.push({ name: 'home'});
                                    this.$store.dispatch('removeUserFromEnvironment', this.editingUser.userId);
                                    notify({
                                        type: "success",
                                        title: "User removed",
                                        text: "You removed yourself from this environment!",
                                    });
                                    loader.hide();
                                })
                                .catch((err) => {
                                    console.log(err)
                                    notify({
                                        type: "error",
                                        title: "Error occurred",
                                        text: err.response.data,
                                    });
                                    loader.hide();
                                })
                        },
                        reject: () => {
                            this.$toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 6000 });
                        }
                    });
                }
            }
        }
    }
</script>

<style>

</style>