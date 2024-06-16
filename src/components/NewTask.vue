<template>
    <Dialog  :class="'b-less-'+colorMode+' txt-'+colorMode" v-model:visible="visible" header="New task" :style="{ width: '50vw', padding: '20px' }"  :modal="true" :draggable="false">

        <div>
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold">Due date:</span>
            <input v-model="taskDueDate" type="datetime-local">
        </div>
        <div>
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold">Environment:</span><br>
            <!-- <Dropdown  v-model="taskEnvironment" :options="user.workEnvironments" optionLabel="environmentName" placeholder="Select an environment" class="w-full md:w-14rem w-80 py-2 item-detail-value" /> -->
            <div class="w-80 py-2 item-detail-value"> 
                <v-select v-model="taskEnvironment" :options="user.workEnvironments" label="environmentName" class="w-100"></v-select>
            </div>
        </div>
        <div v-if="environment!=null">
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold" >User:</span>
            <div class="w-80 py-2 item-detail-value"> 
                <v-select v-model="taskUser" :options="environment.usersData" label="userDisplayName" class="w-100"></v-select>
            </div>
        </div>
        <div v-if="taskUser!=null">
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold" >Workspace:</span>
            <div class="w-80 py-2 item-detail-value"> 
                <v-select v-model="taskWorkspace" :options="environment.workspaces" label="workspaceName" class="w-100"></v-select>
            </div>
        </div>
        <div v-if="taskWorkspace!=null">
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold" >App:</span>
            <div class="w-80 py-2 item-detail-value"> 
                <v-select v-model="taskApp" :options="taskWorkspace.apps" label="appName" class="w-100"></v-select>
            </div>
        </div>
        <div v-if="taskApp!=null">
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold" >Item:</span>
            <div class="w-80 py-2 item-detail-value"> 
                <!-- <v-select v-model="taskApp" :options="taskWorkspace.apps" label="appName" class="w-50"></v-select> -->
                <v-select v-model="taskItem" :options="searchedItems" label="RelatedItemName" @search="buscar($event, taskApp.id)" @focusout="limpiar()" class="w-100"></v-select>
            </div>
        </div>
        <div v-if="taskUser!=null">
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold" >Information:</span>
            <div class="w-80 py-2"> 
                <textarea v-model="taskInformation" class="w-75 border-solid border-2 rounded px-3 py-2 w-100"></textarea>
            </div>
        </div>

        <div class="flex justify-content-end gap-2">
            <Button type="button" label="Cancel" class="p-1 rounded hover:bg-cancel" severity="secondary" @click="visible = false"></Button>
            <Button type="button" label="Save" class="p-1 rounded" :class="'hover hover-bsec-'+colorMode" @click="insertTask()"></Button>
        </div>
    </Dialog>
</template>

<script>
import Dialog from 'primevue/dialog';
import {mapGetters} from 'vuex';
import { ref } from "vue";
import Dropdown from 'primevue/dropdown';
import {getEnvironment, getWorkspace} from "../router/index.js";
import axios from 'axios';
import { notify } from "@kyvg/vue3-notification";
import { format } from 'date-fns'
import { parseISO, getTime } from 'date-fns'

    export default {
        name: 'NewTaskForm',
        computed: {
            
            ...mapGetters(['stateWorkspace', 'stateNewAppFormIsOpen', 'stateApp', 'stateFieldTypes', 'environment', 'colorMode', 'user']),

        },
        components: {            
            Dialog
        },
        data(){
            return{
                visible: ref(true),
                taskDueDate: "",           
                taskEnvironment: null,
                taskUser: null,
                taskWorkspace: null,
                taskApp: null,
                taskItem: null,
                taskInformation: "",
                searchedItems: []
            }
        },
        watch:{
            taskEnvironment:{
                handler() {
                    if(this.taskEnvironment == null){
                        this.taskUser = null
                    } else {
                        this.getEnv(this.taskEnvironment.environmentNameURL);
                    }
                }
            },
            taskUser:{
                handler() {
                    if(this.taskUser == null){
                        this.taskWorkspace = null
                    }
                }
            },
            taskWorkspace:{
                handler() {
                    if(this.taskWorkspace == null){
                        this.taskApp = null
                    }
                }
            },
            taskApp:{
                handler() {
                    if(this.taskApp == null){
                        this.taskItem = null
                    }
                }
            }
        },
        methods: {
            async getEnv(environmentURL){
                console.log(environmentURL)
                await getEnvironment(environmentURL);
            },
            async limpiar() {
                this.options = [];
            },
            async buscar(event, appId) {
                if (event != ""){
                    // Petición a la API con la query de búsqueda                    
                    await axios.get(`app/${appId}/item?dName=${event}`)
                        .then((response) => {
                            this.searchedItems = response.data.map(item => ({
                                RelatedItemName: item.descriptiveName,
                                RelatedItemId: item.id
                            }))
                            console.log(JSON.parse(JSON.stringify(this.searchedItems)));
                        });

                        
                        
                }
            },
            async insertTask() {
                let loader = this.$loading.show({
                    // Optional parameters
                    color: "#ffc107",
                    width: 80,
                    height: 80
                });
                if (this.taskDueDate == null || this.taskDueDate == "" || this.taskInformation == null || this.taskEnvironment == null || this.taskUser == null){
                    notify({
                        type: "error",
                        title: "Data missing",
                        text: "At least due date, environment, user and information fields must be filled!",
                    });
                    loader.hide();
                    return;
                } else if(this.taskWorkspace==null) {
                    this.taskApp = null;
                    this.taskItem = null;
                } else if(this.taskApp ==null){
                    this.taskItem = null;
                }
                const date = parseISO(this.taskDueDate);
                var unixTimestamp = Math.floor(getTime(date) / 1000);
                var task = {
                    environmentId: this.taskEnvironment.id,
                    assignedUserId: this.taskUser.userId,
                    workspaceId: this.taskWorkspace?.id ?? null,
                    appId: this.taskApp?.id ?? null,
                    itemId: this.taskItem?.RelatedItemId ?? null,
                    dueDate: unixTimestamp,
                    information: this.taskInformation,
                    finished: false
                }
                console.log(task)
                await axios.post(`apptask/add`, task)
                    .then( (res) => {
                        
                        this.user.userTasks.push(res.data)
                        this.user.userTasks.sort((a, b) => a.dueDate - b.dueDate)
                        loader.hide();
                        notify({
                            type: "success",
                            title: "Task created succesfully",
                            text: "You created a task!",
                        }); 
                        this.visible = false;
                    })
                    .catch((err) => {
                        console.log(err)
                        notify({
                            type: "error",
                            title: "Task couldn't be created",
                            text: err.response.data,
                        }); 
                        loader.hide();
                    })
            }
        }

    }
</script>
