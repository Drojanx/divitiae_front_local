<template>
    <Dialog :class="'b-less-'+colorMode+' txt-'+colorMode" v-model:visible="visibleTask" :header="currentTask.information" :style="{ width: '50vw', padding: '20px' }"  :modal="true" :draggable="false">
        <template v-if="!editTask">
            <div class="d-flex flex flex-row-reverse" v-if="user.userId == currentTask.createdBy.id">
                <Button label="Edit" @click="editTask = !editTask" class="align-right bg-warning rounded px-2 my-2" />
            </div>
            <div >
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-2 font-bold">Created by</span>
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-1">{{ currentTask.createdBy.name.concat(' ', currentTask.createdBy.lastName) }}</span>
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me">({{ currentTask.createdBy.email }})</span>
            </div>
            <div class="mb-2">
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold">Created on:</span>
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-2">{{ formatDate(currentTask.createdOn) }}</span>
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me">{{ formatTime(currentTask.createdOn) }}</span>
            </div>
            <div>
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold">Due date:</span>
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-2">{{ formatDate(currentTask.dueDate) }}</span>
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me">{{ formatTime(currentTask.dueDate) }}</span>
            </div>
            <div>
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold">Assigned user:</span>
                <div class="taskUsersCard mb-1">
                    <span class="relation-field-header" v-tooltip="{ value: currentTask.assignedUser.name.concat(' ', currentTask.assignedUser.lastName), showDelay: 150, hideDelay: 200 }">{{ currentTask.assignedUser.name+" "+currentTask.assignedUser.lastName }}</span>
                    <a v-tooltip="{ value: user.email, showDelay: 150, hideDelay: 200 }">{{ currentTask.assignedUser.email }}</a>

                </div>
            </div>
            <div >
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold">Related to:</span>
                <div class="taskUsersCard mb-1" v-if="currentTaskRelated.url">
                    <RouterLink class="flex cursor-pointer" :to="currentTaskRelated.url" >
                        <span class="relation-field-header" v-tooltip="{ value: currentTaskRelated.name, showDelay: 150, hideDelay: 200 }">{{ currentTaskRelated.name }}</span>
                    </RouterLink>
                    
                </div>
            </div>
            <div>
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold">Completed: </span>
                <label class="switch" >
                    <input @change="completeTask()" type="checkbox" v-model="this.currentTask.finished">
                    <span class="slider round"></span>
                </label>
            </div>
            <div id="taskComments"  class="min-h-20 max-h-56 w-100 rounded-t-md border-solid border-1">
                <div v-for="comment in currentTask.comments" class="d-flex">
                    <div class="pw-30 text-end px-3">
                        <span>
                            {{ comment.userName+" "+comment.userLastName }}
                        </span>
                        <div>
                            <span class="pe-2 text-xs">
                                {{ formatDate(comment.createdOn) }}
                            </span>
                            <span class="text-xs">
                                {{ formatTime(comment.createdOn) }}
                            </span>
                        </div>
                    </div>
                    <div class="pw-70 px-3">
                        <span>
                            {{ comment.comment }}
                        </span>
                    </div>                                            
                </div>
                <div v-if="currentTask.comments.length == 0">
                    <div class="pw-30 text-center p-2">
                        <span>
                            No comments added here yet!
                        </span>
                    </div>
                </div>
            </div>
            <form class="w-100" @submit.prevent="addComment()">
                <input v-model="newComment" class=" rounded-b-md border-solid border-1 w-100 px-3 py-2" type="text" placeholder="Type a comment...">
                <div class="flex justify-content-end gap-2">
                    <Button type="button" label="Send" class="p-1 rounded" :class="'hover hover-bsec-'+colorMode" @click="addComment()"></Button>
                </div>
            </form>

        </template>
        <template v-if="editTask">
            <div class="d-flex flex flex-row-reverse" v-if="user.userId == currentTask.createdBy.id">
                <Button label="Back" @click="editTask = !editTask" class="align-right bg-warning rounded px-2 my-2" />
            </div>
            <div>   
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold">Due date:</span>
                <input v-model="taskDueDate" @input="updateDueDate($event.target.value)" type="datetime-local">
            </div>
            <div>
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold">Environment:</span><br>
                <!-- <Dropdown  v-model="taskEnvironment" :options="user.workEnvironments" optionLabel="environmentName" placeholder="Select an environment" class="w-full md:w-14rem w-80 py-2 item-detail-value" /> -->
                <div class="w-80 py-2 item-detail-value"> 
                    <v-select @change="getEnv(taskEnvironment.environmentNameURL)" v-model="taskEnvironment" :options="user.workEnvironments" label="environmentName" class="w-50"></v-select>
                </div>
            </div>
            <div v-if="taskEnvironment!=null">
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold" >User:</span>
                <div class="w-80 py-2 item-detail-value"> 
                    <v-select v-model="taskUser"  :options="environment.usersData" label="userDisplayName" class="w-50"></v-select>
                </div>
            </div>
            <div v-if="taskUser!=null">
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold" >Workspace:</span>
                <div class="w-80 py-2 item-detail-value"> 
                    <v-select v-model="taskWorkspace"  :options="environment.workspaces" label="workspaceName" class="w-50"></v-select>
                </div>
            </div>
            <div v-if="taskWorkspace!=null">
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold" >App:</span>
                <div class="w-80 py-2 item-detail-value"> 
                    <v-select v-model="taskApp" :options="taskWorkspace.apps" label="appName" class="w-50"></v-select>
                </div>
            </div>
            <div v-if="taskApp!=null">
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold" >Item:</span>
                <div class="w-80 py-2 item-detail-value"> 
                    <!-- <v-select v-model="taskApp" :options="taskWorkspace.apps" label="appName" class="w-50"></v-select> -->
                    <v-select v-model="taskItem"  :options="searchedItems" label="RelatedItemName" @search="buscar($event, taskApp.id)" @focusout="limpiar()" class="w-50"></v-select>
                </div>
            </div>
            <div v-if="taskUser!=null">
                <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold" >Information:</span>
                <div class="w-80 py-2"> 
                    <textarea v-model="taskInformation" class="w-50 border-solid border-2 rounded px-3 py-2 w-100"></textarea>
                </div>
            </div>

            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Save" class="p-1 rounded" :class="'hover hover-bsec-'+colorMode" @click="updateTask()"></Button>
            </div>
        </template>
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
        name: 'TaskDetail',
        computed: {
            
            ...mapGetters(['stateWorkspace', 'stateNewAppFormIsOpen', 'stateApp', 'stateFieldTypes', 'environment', 'colorMode', 'user', 'stateTaskDetail']),

        },
        components: {            
            Dialog
        },
        mounted() {
            this.loadTask(this.stateTaskDetail);
        },
        data(){
            return{
                visibleTask: ref(false),
                currentTask: {},
                currentTaskRelated:{},
                newComment: "",
                editTask: false,
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
            visibleTask: {
                handler() {
                    if(this.visibleTask == false){
                        this.currentTask = {}
                        this.currentTaskRelated = {}
                        this.editTask = false
                        console.log(this.$route.name)
                        if(this.$route.name == 'task-detail'){
                            this.$router.push({ name: 'home' })
                        }
                    } else{
                        this.unFormatDate(this.currentTask.dueDate)
                        this.editTaskEnv();
                        this.editTaskAssignedUser();
                        this.editTaskWs();
                        this.editTaskApp();
                        this.editTaskItem();
                        this.editTaskInfo();
                    }
                }
            },
            editTask:{
                handler(){
                    if(this.editTask == false){
                        this.editTaskEnv();
                        this.editTaskAssignedUser();
                        this.editTaskWs();
                        this.editTaskApp();
                        this.editTaskItem();
                        this.editTaskInfo();
                    }
                }
            },
            taskEnvironment:{
                handler() {
                    if(this.taskEnvironment == null){
                        this.taskUser = null
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
            async loadTask(task) {
                console.log(JSON.parse(JSON.stringify(task)));
                this.currentTask = task;
                var taskEnv = this.user.workEnvironments.find(x => x.id == task.environment.id)
                await getEnvironment(taskEnv.environmentNameURL);
                if(this.currentTask.workspace){
                    var taskWs = this.environment.workspaces.find(x => x.id == task.workspace.id);
                    await getWorkspace(taskWs.workspaceNameURL);
                }
                if(this.currentTask.app)
                    var taskApp = this.stateWorkspace.apps.find(x => x.id == task.app.id);

                var relatedRoute = {};
                var relatedName = '';
                if (this.currentTask.item){
                    relatedName = this.currentTask.item.descriptiveName;
                    relatedRoute = { name: 'item', params: {environmentNameURL: taskEnv.environmentNameURL, workspaceNameURL: taskWs.workspaceNameURL, appNameURL: taskApp.appNameURL, itemId: task.item.id }}
                } else if(this.currentTask.app) {
                    relatedName = this.currentTask.app.appName;
                    relatedRoute = { name: 'app', params: {environmentNameURL: taskEnv.environmentNameURL, workspaceNameURL: taskWs.workspaceNameURL, appNameURL: taskApp.appNameURL }}
                } else if(this.currentTask.workspace){
                    relatedName = this.currentTask.workspace.workspaceName;
                    relatedRoute = { name: 'workspace', params: {environmentNameURL: taskEnv.environmentNameURL, workspaceNameURL: taskWs.workspaceNameURL }}
                } else if(this.currentTask.environment){
                    relatedName = this.currentTask.environment.environmenteName;
                    relatedRoute = { name: 'environment', params: {environmentNameURL: taskEnv.environmentNameURL }}
                }
                this.currentTaskRelated.url = relatedRoute;
                this.currentTaskRelated.name = relatedName;
                this.visibleTask = true;
            },
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
            formatDate(unixTimestamp) {
                return format(new Date(unixTimestamp * 1000), 'dd/MM/yyyy')
            },
            formatTime(unixTimestamp) {
                return format(new Date(unixTimestamp * 1000), 'HH:mm')
            },
            async completeTask(){
                let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                });
                await axios.patch(`appTask/${this.currentTask.id}/status`, this.currentTask.finished, {
                            headers: {
                        'Content-Type': 'application/json'
                    }})
                    .then(()=>{
                        notify({
                            type: "success",
                            title: "Task uncompleted succesfully!",
                            text: "You marked this task as uncompleted!",
                        });
                        console.log(JSON.parse(JSON.stringify(this.currentTask)));
                        this.$store.dispatch('completeUserTask', this.currentTask)
                        loader.hide();
                    })
                    .catch(()=>{
                        loader.hide();
                    })
            },
            async addComment() {
                let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                });
                let comment = {
                    userName: this.user.userName,
                    userLastName: this.user.userLastName,
                    createdOn: Math.trunc(Date.now()/1000),
                    comment: this.newComment
                }
                if (comment.comment != ""){
                    await axios.put(`apptask/${this.currentTask.id}/add-comment`, comment)
                    .then( () => {
                        this.currentTask.comments.push(comment);
                        notify({
                            type: "success",
                            title: "Commented succesfully",
                            text: "You made a comment on this task!",
                        }); 
                        loader.hide();

                    })
                    .catch((err) => {
                        loader.hide();

                    })
                } else {
                    notify({
                        type: "error",
                        title: "Failed comment",
                        text: "Text field cannot be empty!",
                    }); 
                    loader.hide();

                }
            },
            unFormatDate(unixDate) {
            // Convertir Unix timestamp a formato 'yyyy-MM-ddTHH:mm'
            this.taskDueDate = this.currentTask.dueDate 
                ? format(new Date(this.currentTask.dueDate * 1000), "yyyy-MM-dd'T'HH:mm")
                : ''
            },
            updateDueDate(value) {
                // Convertir el valor del input (ISO 8601) a Unix timestamp
                const date = parseISO(value)
                this.taskDueDate = Math.floor(date.getTime() / 1000)
            },
            editTaskEnv(){
                this.taskEnvironment = this.user.workEnvironments.find(x=>x.id==this.currentTask.environment.id)
            },
            editTaskAssignedUser(){
                this.taskUser = this.environment.usersData.find(x=>x.userId==this.currentTask.assignedUser.id)
            },
            editTaskWs(){
                this.taskWorkspace = this.environment.workspaces.find(x=>x.id==this.currentTask.workspace?.id) ?? null
            },
            editTaskApp(){
                this.taskApp = this.taskWorkspace?.apps.find(x=>x.id==this.currentTask.app?.id) ?? null
            },
            editTaskItem(){
                console.log(this.currentTaskRelated)
                this.taskItem = {
                    RelatedItemName: this.currentTaskRelated.url.params.itemId == null ? null : this.currentTaskRelated.name,
                    RelatedItemId: this.currentTaskRelated.url.params.itemId == null ? null : this.currentTaskRelated.url.params.itemId
                }
            },
            editTaskInfo(){
                this.taskInformation = this.currentTask.information
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
                        });

                        
                        
                }
            },
            async updateTask(){
                let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                });
                if (this.taskDueDate == null || this.taskInformation == null || this.taskEnvironment == null || this.taskUser == null){
                    notify({
                        type: "error",
                        title: "Data missing",
                        text: "At least due date, environment, user and information fields must be filled!",
                    });
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
                    finished: this.currentTask.finished
                }
                await axios.put(`apptask/${this.currentTask.id}`, task)
                    .then( (res) => {
                        var index = this.user.userTasks.findIndex(x=>x.id=this.currentTask.id);
                        this.user.userTasks[index] = res.data

                        this.$store.dispatch('modifyUserTask', res.data)
                        this.currentTask = res.data
                        loader.hide();
                        notify({
                            type: "success",
                            title: "Task modified succesfully",
                            text: "You created a task!",
                        }); 
                        this.loadTask(this.currentTask)
                        this.editTask = false;
                    })
                    .catch((err) => {
                        loader.hide();
                    })
            },
        }

    }
</script>
