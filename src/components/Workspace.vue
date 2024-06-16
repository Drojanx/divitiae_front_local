<template>
    <div id="vpCentered" class="px-0">
        <div class="m-auto h-10 gap-x-4 flex justify-between items-center pw-85">
            <div class="pw-25"></div>
            <h2 class="pw-50 text-center inline-block text-2xl" :class="'txt-'+colorMode">{{ stateWorkspace.workspaceName }}</h2>
            <div class="pw-25 flex flex-row-reverse">
                <Button label="Edit workspace" @click="editWorkspace = !editWorkspace" class="justify-self-end align-right bg-warning rounded px-2 my-2" />
            </div>
            <Dialog :class="'b-less-'+colorMode+' txt-'+colorMode" v-model:visible="editWorkspace" header="Edit workspace" :style="{ width: '25rem' }" :modal="true" :draggable="false">
                <ConfirmDialog></ConfirmDialog>
                <div class="flex gap-x-5">
                    <button @click="deleteWorkspace" v-tooltip.left="{ value: 'Delete this workspace, with its apps and items', showDelay: 300, hideDelay: 300}" label="Delete" severity="danger" outlined><fa  v-if="isAdminInCurrentEnv" icon="fa-solid fa-trash" /></button>
                    <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="block">Edit workspace name:</span>
                </div>
                <div class="flex align-items-center gap-3 mb-3">
                    <input v-model="workspaceName" type="text" class="form-control w-75 mx-auto my-2" placeholder="Workspace name...">
                </div>
                <div class="flex justify-content-end gap-2">
                    <Button type="button" label="Cancel" class="p-1 rounded hover:bg-cancel" severity="secondary" @click="editWorkspace = false"></Button>
                    <Button type="button" label="Save" class="p-1 rounded" :class="'hover hover-bsec-'+colorMode" @click="updateWorkspaceName()"></Button>
                </div>
            </Dialog>
        </div>
        <div id="workspaceContent" class="px-3">
            <div class="container-fluid flex py-3" :class="'b-less-'+colorMode+' txt-'+colorMode" id="ws-nav">

                <div class="txt-light b-prim mx-1 my-1 text-center appTab px-1" style="cursor: pointer; width: 100px; max-height: 50px;">
                    <RouterLink class="text-xs" :to=" { name: 'workspace', params: {environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL }}" style="text-decoration: none;"><span class="icon app-icon-24 icon-135"></span>Home</RouterLink>                     
                </div>
                <div class="mr-1 ml-1" style="border-right: 3px solid #26cf91; height: 60px;"></div>
                <div id="appScroll" class='d-flex ' style="overflow-y: hidden; max-height: 77px; ">
                    <div v-for="app in this.stateWorkspace.apps" :key="app.id" :class="'bsec-'+colorMode" class="txt-light px-1 mx-1 my-1 text-center appTab" style="cursor: pointer; width: 100px;" :title="app.appName ">
                        <RouterLink class="text-xs" :to=" { name: 'app', params: {environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL, appNameURL: app.appNameURL}}" style="text-decoration: none;"><span class="icon app-icon-24" :class="app.appIconId"></span> {{ app.appName }} </RouterLink>
                    </div>
                    
                </div>
                <div class="ml-1 mr-1" style="border-right: 3px solid #26cf91; height: 60px;"></div>
                <div class="txt-light mx-1 my-1 text-center appTab flex align-items-center" v-if="isAdminInCurrentEnv" style="cursor: pointer; width: 80px; max-height: 50px;">
                    <!-- <fa class="addElementsIcon" icon="plus-square" @click="openAppForm"/> -->
                    <div :class="'b-accent-'+colorMode" class="appTab flex" style="height: 34px; width: 100px" @click="openAppForm">
                        <span class="flex align-items-center p-2"><i class="pi pi-plus text-bold"></i></span>
                        <a class="text-xs p-2 ps-0 font-semibold"  style="text-decoration: none; height: 30px;">Add app</a>

                    </div>
                    <!-- <a class="text-xs" @click="openAppForm"><i class="pi pi-plus"></i>Add app</a> -->
                </div>
            </div>
            <!-- <router-view v-if="this.stateApp!==null"></router-view> -->
            <!-- <WorkspaceApp v-if="this.loadedApp!==null" /> -->
            <router-view v-slot="{ Component }">
                <component :is="Component" />
            </router-view>
            <div id="homeContent" :class="'b-'+colorMode" class="container mt-4 py-4 px-3">
                <div id="newEnvironment" class="w-100 text-center">
                    <div id="" class="m-auto pw-70 px-3 pb-3 border-solid border-b-2 rounded">
                        <div class="flex justify-content-center">
                            <SelectButton v-model="finishedTasks" :options="options" optionLabel="name" aria-labelledby="basic" />
                            <div class="flex ms-2 cursor-pointer rounded" style="width: 120px; background-color: #F1F5F9;" @click="taskForm=!taskForm">
                                <span class="flex align-items-center p-2"><i class="pi pi-plus text-bold"></i></span>
                                <a class="text-xs p-2 ps-0 font-semibold"  style="text-decoration: none; height: 30px; line-height: 23px">Create task</a>
                            </div>
                        </div>
                        <div class="mt-2 d-flex w-100 border-solid border-b-2">
                            <div class=" pw-30 px-3 d-flex">
                                <p :class="'txt-'+colorMode" class="px-4">Due date</p>
                            </div>
                            <div class="task-info pw-40">
                                <p :class="'txt-'+colorMode" class="px-4">Information</p>
                            </div>
                            <div class="pw-30">
                                <p :class="'txt-'+colorMode" class="px-4">Assigned to</p>
                            </div>
                            
                        </div>
                        <div id="pendingTasks" class="w-100 border-solid">
                            <template v-if="user.userTasks.length > 0" v-for="task, index in user.userTasks" :key="task.id" >
                                <div @click="loadTask(task.id)" v-if="task.finished == finishedTasks.value && task.workspace !== null && task.workspace.id == stateWorkspace.id" :class="isDueSoon(task)" class="m-auto d-flex border-solid border-t-2 py-2 cursor-pointer hover:scale-95 hover:bg-slate-300 hover:rounded ease-in-out transform transition duration-300">
                                    <div class=" pw-30 px-3 d-flex justify-around taskCell px-4" v-tooltip="{ value: formatDate(task.dueDate).concat(` ${formatTime(task.dueDate)}`), showDelay: 150, hideDelay: 200 }">
                                        <span :class="'txt-'+colorMode">{{ formatDate(task.dueDate) }}</span><span :class="'txt-'+colorMode">{{ formatTime(task.dueDate) }}</span>
                                    </div>
                                    <div class="task-info pw-40 taskCell px-4" v-tooltip="{ value: task.information, showDelay: 150, hideDelay: 200 }">
                                        <a :class="'txt-'+colorMode">{{ task.information }}</a>
                                    </div>
                                    <div class="pw-30 taskCell px-4" v-tooltip="{ value: task.assignedUser.name.concat(` ${task.assignedUser.lastName}`), showDelay: 150, hideDelay: 200 }">
                                        <a :class="'txt-'+colorMode" class="text-center">{{ task.assignedUser.name+" "+task.assignedUser.lastName }}</a>
                                    </div>
                                </div>   
                            </template>
                            <div v-if="user.userTasks.length == 0">
                                <p class="text-center pt-3">No tasks found</p>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <TaskDetail v-if="visibleTask"/>
    </div>
</template>

<script>
import axios from 'axios';
import WorkspaceApp from './WorkspaceApp.vue';
import NewAppForm from './NewAppForm.vue'
import {mapActions, mapGetters} from 'vuex';
import { getWorkspace, getTask } from '../router/index.js'
import { notify } from "@kyvg/vue3-notification";
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import SelectButton from 'primevue/selectbutton';
import { format } from 'date-fns'
import TaskDetail from '../components/TaskDetail.vue'

    export default {
        name: 'Workspace',
        computed: {
            
        ...mapGetters(['colorMode', 'environment', 'stateWorkspace', 'stateNewAppFormIsOpen', 'stateApp', 'isAdminInCurrentEnv', 'user']),

        },
        data() {
            return {
                visibleTask: false,
                fullPage: false,
                loadedApp: null,
                editWorkspace: false,
                workspaceName: '',
                options: [
                { name: 'Pending Tasks', value: false },
                { name: 'Completed Tasks', value: true }
                ],
                finishedTasks: { name: 'Pending Tasks', value: false },
            }
        },
        components: {
            WorkspaceApp,
            NewAppForm,
            Dialog,
            ConfirmDialog,
            SelectButton,
            TaskDetail
        },
        mounted() {
            this.workspaceName = this.stateWorkspace.workspaceName;
        },
        watch: {
            $route: {
                immediate: true,
                handler(to, from) {
                    document.title = to.meta.title || `${this.stateWorkspace.workspaceName}`;
                }
            }
        },
        methods: {   
            async loadTask(taskId){
                await getTask(taskId);
                this.visibleTask = !this.visibleTask;
            },         
            formatDate(unixTimestamp) {
                return format(new Date(unixTimestamp * 1000), 'dd/MM/yyyy')
            },
            formatTime(unixTimestamp) {
                return format(new Date(unixTimestamp * 1000), 'HH:mm')
            },
            isDueSoon(task) {
                if(!task.finished){
                    // Obtener la fecha actual
                    const currentDate = new Date();
        
                    // Convertir la fecha de vencimiento a un objeto Date
                    const dueDateTime = new Date(task.dueDate * 1000); // Multiplicar por 1000 para convertir segundos a milisegundos
        
                    // Calcular la diferencia en milisegundos entre las dos fechas
                    const timeDifference = dueDateTime.getTime() - currentDate.getTime();
        
                    // Convertir la diferencia de tiempo a días
                    const daysDifference = timeDifference / (1000 * 3600 * 24);

                    // Retornar true si la diferencia es de 1 día o menos
                    return daysDifference <= 1 && daysDifference > 0 ? 'bg-warning animate-bounce' : daysDifference < 0 ? 'bg-danger' : '';
                } else {
                    return 'bsec-'+this.colorMode;
                }
            },
            async deleteWorkspace(){
                console.log("holi")
                this.$confirm.require({
                    message: 'Are you sure you want to delete this workspace, with its apps and items? This action CANNOT BE UNDONE.',
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
                        await axios.delete(`workspace/${this.stateWorkspace.id}`)
                            .then((res) => {
                                console.log(res)
                                this.$router.push({ name: 'environment', params: { environmentNameURL: this.environment.environmentNameURL } });
                                this.$store.dispatch('removeWorkspaceFromEnvironment', this.stateWorkspace.id);
                                notify({
                                    type: "success",
                                    title: "App removed",
                                    text: "You removed the app from this workspace!",
                                });
                                loader.hide();
                            })
                            .catch(() => {
                                notify({
                                    type: "error",
                                    title: "Error occurred",
                                    text: "There was a problem trying to remove the app.",
                                });
                                loader.hide();
                            })
                    },
                    reject: () => {
                        this.$toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 6000 });
                    }
                });
            },
            async updateWorkspaceName(){
                let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                    color: "#ffc107"
                });
                await axios.patch(`workspace/${this.stateWorkspace.id}/edit-name`, this.workspaceName, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(() => {
                    let existingNames = {};
                    this.stateWorkspace.workspaceName = this.workspaceName;
                    this.environment.workspaces.find(ws=>ws.id==this.stateWorkspace.id).workspaceName = this.workspaceName;
                    this.environment.workspaces.forEach((ws) => {
                        let nombreUrlFriendly = ws.workspaceName.toLowerCase().replace(/ /g, "-").replace(/[^a-zA-Z0-9-]/g, "");
                        
                        // Verifica si ya existe el nombreUrlFriendly
                        if (existingNames[nombreUrlFriendly] !== undefined) {
                            // Genera un nuevo nombre único
                            let count = existingNames[nombreUrlFriendly]++;
                            nombreUrlFriendly += `(${count})`;
                        } else {
                            existingNames[nombreUrlFriendly] = 1;
                        }

                        ws.workspaceNameURL = nombreUrlFriendly;
                        if (ws.id==this.stateWorkspace.id){
                            this.stateWorkspace.workspaceNameURL = nombreUrlFriendly;
                        }
                    })
                    notify({
                        type: "success",
                        title: "Workspace updated",
                        text: "You just updated the workspace name!",
                    });
                    this.editWorkspace = false;
                    loader.hide();
                    this.$router.push({ name: 'workspace', params: { environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL } })
                })
                .catch(() => {
                    notify({
                        type: "error",
                        title: "Workspace update failed",
                        text: "There was a problem updating the workspace name.",
                    });
                    loader.hide();
                })
            },
            async openAppForm() {                    
                this.$router.push({ name: 'new-app-form', params: { environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL } });
            },
        },
        async beforeRouteUpdate(to, from, next){
            if (to.params.workspaceNameURL !== from.params.workspaceNameURL){
                this.$store.dispatch('stateWorkspace', null);
                this.$store.dispatch('stateItems', null);
                this.$store.dispatch('stateApp', null);
                
                await getWorkspace(to.params.workspaceNameURL);
                next();
            } else {
                next();
            }
        },
        
    }
</script>

<style>

</style>