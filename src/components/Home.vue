<template>
    <div class="container">
        <h1 class="text-center mt-3 mb-3" :class="'txt-'+colorMode">Welcome back, {{ this.user.userName }}!</h1>
        <div id="homeContent" :class="'b-'+colorMode" class="container py-4 px-3">
            <div id="newEnvironment" class="w-100 text-center">
                <!-- <p :class="'txt-'+colorMode">Go to your environment</p> -->
                <AppBar/>
                <!-- <span class="icon app-icon-24 icon-51"></span> -->
<!--                 <div class="form-group" v-if="this.addEnvironmentForm">                
                    <input type="text" required />
                    <label>Environment Name</label>
                    <div class="text-danger" v-if="sent && v$.first_name.$error">Please, type your first name.</div>
                </div> -->

<!--                 <div class="mt-0 d-flex justify-content-between w-20 mx-auto">
                    <fa v-if="!this.addEnvironmentForm" class="addElementsIcon" icon="plus-square" @click="openEnvironmentForm"/>
                    <fa v-if="this.addEnvironmentForm" class="addElementsIcon" icon="square-check" style="color: #00ccff;" @click="insertWorkspace"/>
                    <fa v-if="this.addEnvironmentForm" class="addElementsIcon" icon="square-xmark" style="color: #ff0000;" @click="openEnvironmentForm"/>
                </div> -->
            </div>
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
                        <RouterLink v-if="task.finished == finishedTasks.value" :class="isDueSoon(task)" class="m-auto d-flex border-solid border-t-2 py-2 cursor-pointer hover:scale-95 hover:bg-slate-300 hover:rounded ease-in-out transform transition duration-300" :to=" { name: 'task-detail', params: { taskId: task.id} }">
                            <div class=" pw-30 px-3 d-flex justify-around taskCell px-4" v-tooltip="{ value: formatDate(task.dueDate).concat(` ${formatTime(task.dueDate)}`), showDelay: 150, hideDelay: 200 }">
                                <span :class="'txt-'+colorMode">{{ formatDate(task.dueDate) }}</span><span :class="'txt-'+colorMode">{{ formatTime(task.dueDate) }}</span>
                            </div>
                            <div class="task-info pw-40 taskCell px-4" v-tooltip="{ value: task.information, showDelay: 150, hideDelay: 200 }">
                                <a :class="'txt-'+colorMode">{{ task.information }}</a>
                            </div>
                            <div class="pw-30 taskCell px-4" v-tooltip="{ value: task.assignedUser.name.concat(` ${task.assignedUser.lastName}`), showDelay: 150, hideDelay: 200 }">
                                <a :class="'txt-'+colorMode" class="text-center">{{ task.assignedUser.name+" "+task.assignedUser.lastName }}</a>
                            </div>
                        </RouterLink>   
                    </template>
                    <div v-if="user.userTasks.length == 0">
                        <p class="text-center pt-3">No tasks found</p>
                    </div>
                    
                </div>
            </div>
            <form :class="'txt-'+colorMode" id="yourInformation" class="w-50 m-auto" @submit.prevent="">
                <h2 class="pt-4 pb-2 m-auto text-center border-solid border-b-2 pw-70 ">Your information</h2>
                <h6 class="pt-4 m-auto text-center">Id: {{ this.user.userId }}</h6>
                <div class="form-group mt-4 rounded border-2 border-solid border-black">

                    
                    <input class="px-4" type="text" v-model="user.userName" placeholder="" required/>
                    <label :class="'b-'+colorMode" class="px-2">Name</label>
                </div>
                <div class="form-group mt-4 rounded border-2 border-solid border-black">

                    
                    <input class="text-normal px-4" type="text" v-model="user.userLastName" placeholder="" required/>
                    <label :class="'b-'+colorMode" class="px-2">Last name</label>
                </div>

                <div class="form-group mt-4 rounded border-2 border-solid border-black">
                    <span class="emailIcon">
                        <fa icon="envelope"/>
                    </span>
                    
                    <input class="cursor-not-allowed px-4" disabled type="email" v-model="user.userEmail" placeholder="" required/>
                    <label :class="'b-'+colorMode" class="px-2">Email</label>
                </div>

                <div class="flex justify-center">
                    <button @click="updateUser" class="btn btn-success btn-block w-50 m-auto">Update</button>
                </div>

            </form>
            <router-view v-if="this.stateTaskDetail!==null" v-slot="{ Component }">
                <component :is="Component" />
            </router-view>
            <NewTaskForm v-if="taskForm"/>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import {mapGetters} from 'vuex';
import AppBar from '../components/Bars/AppBar.vue'
import { format } from 'date-fns'
import SelectButton from 'primevue/selectbutton';
import { notify } from "@kyvg/vue3-notification";
import Dialog from 'primevue/dialog';
import { ref } from "vue";
import {getEnvironment, getWorkspace} from "../router/index.js";
import NewTaskForm from '../components/NewTask.vue';
import { parseISO, getTime } from 'date-fns'

    export default {
        name: 'Home',
        computed: {
            
        ...mapGetters(['user', 'colorMode', 'environment', 'stateWorkspace', 'stateTaskDetail']),

        },
        components: {
            AppBar,
            SelectButton,
            Dialog,
            NewTaskForm
        },
        data() {
            return {
                visibleTask: ref(false),
                fullPage: false,
                addEnvironmentForm: false,
                finishedTasks: { name: 'Pending Tasks', value: false },
                options: [
                { name: 'Pending Tasks', value: false },
                { name: 'Completed Tasks', value: true }
                ],
                currentTask: {},
                currentTaskRelated:{},
                newComment: "",
                taskForm: false,
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
        watch: {
            $route: {
                immediate: true,
                handler(to, from) {
                    document.title = to.meta.title || 'Divitiae - Home';
                }
            },
            
        },
        methods: {
            async openEnvironmentForm() {
                this.addEnvironmentForm = !this.addEnvironmentForm;
                var value = "Alejandro's, ,:environment".toLowerCase().replace(/ /g, "-").replace(/[^a-zA-Z0-9-]/g, "");
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
            async updateUser(){
                let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                    color: '#FFC107'
                });

                let user = {
                    Name: this.user.userName,
                    LastName: this.user.userLastName,
                    Email: this.user.email
                }
                 
                await axios.put(`user/${this.user.userId}`, user)
                    .then(() => {
                        notify({
                            type: "success",
                            title: "Information updated",
                            text: "Your information was updated succesfully!",
                        });
                        loader.hide();
                    })
                    .catch((err) => {
                        notify({
                            type: "error",
                            title: "Information update failed",
                            text: "There was a problem, please try again later.",
                        });
                        loader.hide();
                    })
            }

        }
    }
</script>

<style>

</style>