<template>
    <div>
        <div id="item-activity" class="activity-bg">
            <div class="flex justify-content-center" style="height: 5%; background-color: rgb(246, 247, 249);">
                <h2 class="m-auto text-center">Item Activity</h2>
            </div>
            <div style="height:95%"  class="container-fluid p-0 flex flex-column justify-content-end" @submit.prevent="" >
                <!-- <div v-if="logs != null" class="flex flex-column justify-content-end"> -->
                
                <template v-if="!loadingItemLogs">
                    <div v-if="stateItemLogs.length > 0" style="overflow: auto; display: flex; flex-direction: column-reverse;" >
                        
                        <div v-for="log in stateItemLogs.slice().reverse()"  class="d-flex justify-content-between my-1">
                            <span class="text-xs pw-40 py-2 px-2 text-end">{{ log.creatorName }}<br><p class="font-normal" style="font-size: 10px">{{ log.fixedDate.split('-')[0] }}</p><p class="font-normal" style="font-size: 10px">{{ log.fixedDate.split('-')[1] }}</p></span>
                            <small class="pw-60 py-2 px-2">{{ log.logText }}</small>
                        </div>
                        
                    </div>   
                    <div v-if="stateItemLogs.length == 0" style="overflow: auto; display: flex; flex-direction: column-reverse;" >
                        
                        <div class="d-flex justify-content-between my-1">
                            <span class="text-xs pw-40 py-2 px-2 text-end"></span>
                            <small class="pw-60 py-2 px-2">No recent activity here!</small>
                        </div>
                        
                    </div> 
                    <div class="align-self-end w-100">
                        <div id="log-box" class="pt-4" v-if="!sendingNewLog">
                            <FloatLabel class="w-100 mt-2 px-3 " style="background-color: rgb(246, 247, 249);">
                                <Textarea v-model="newLog" class="w-100 border-1 border-slate-950 p-2 text-xs min-h-12" autoResize rows="2" />
                                <label class="text-xs color-black ps-3">Type a comment...</label>
                            </FloatLabel>
                            <div class="flex justify-content-end" style="background-color: rgb(246, 247, 249);">
                                <Button @click="addLog" :class="'bsec-'+colorMode" class="border-1 border-emerald-500 p-2 rounded text-xs me-3" label="Submit" icon="pi pi-send" iconPos="down" />
                            </div>
                        </div>
                        <div v-if="sendingNewLog" class="flex align-items-center overflow-hidden">
                            <ProgressSpinner class="w-100" style="" height="10px" strokeWidth="6" fill="transparent"
                                animationDuration="20s" aria-label="Custom ProgressSpinner" />
                        </div>
                    </div>
                </template>
                <div id="logs-loader" v-if="loadingItemLogs" class="h-100 flex align-center">
                    <ProgressSpinner class="ph-80 w-15" style="" strokeWidth="6" fill="transparent"
                        animationDuration="20s" aria-label="Custom ProgressSpinner" />
                </div> 
            </div>
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
import Textarea from 'primevue/textarea';
import FloatLabel from 'primevue/floatlabel';
import ProgressSpinner from 'primevue/progressspinner';
import {fixDate} from '../router/index.js'

export default {
    name: "ItemActivity",
    components: { 
        RouterView,
        Sidebar,
        Dialog,
        Textarea,
        FloatLabel,
        ProgressSpinner
     },
     computed: {
            
    ...mapGetters(['loadingItemLogs', 'colorMode', 'environment', 'stateWorkspace', 'isAdminInCurrentEnv', 'user', 'isAdminInCurrentEnv', 'stateItemDetail', 'stateApp', 'stateItemLogs'])

    },
    data() {
        return {
            visible: false,
            dialog: ref(false),
            position: ref('center'),
            logs: null,
            newLog: '',
            sendingNewLog: false
        }
    },
    methods: {
/*         fixDate(unixDate){
            let date = new Date(unixDate * 1000);
            const offset = date.getTimezoneOffset();
            date = new Date(date.getTime() - (offset*60*1000));
            return date.getDate().toString().padStart(2, "0") + "/" + 
                    date.getMonth().toString().padStart(2, "0") + "/" + 
                    date.getFullYear().toString().padStart(2, "0") + " - " + 
                    date.getHours().toString().padStart(2, "0") + ":" + 
                    date.getMinutes().toString().padStart(2, "0") + ":" + 
                    date.getSeconds().toString().padStart(2, "0");
        }, */
        async addLog() {
            this.sendingNewLog = true;
            var creationDate = Math.trunc(Date.now() / 1000);
            console.log(JSON.parse(JSON.stringify(creationDate)));
            var log = {
                creatorId: this.user.userId,
                unixCreatedOn: creationDate,
                logText: this.newLog
            }
            await axios.post(`app/${this.stateApp.id}/item/${this.stateItemDetail._id}/itemactivitylog/add`, log)
                .then( async (response) => {
                    var createdLog = response.data;
                    createdLog.fixedDate = fixDate(creationDate); 
                    await axios.get(`user/${this.user.userId}`)
                        .then((u) => {
                            createdLog.creatorName = u.data.name + " " + u.data.lastName;
                            this.stateItemLogs.forEach((log) => {
                                log.fixedDate = fixDate(log.unixCreatedOn);
                            });
                        })  
                    this.$store.dispatch('stateItemLogs', createdLog);
                    this.newLog = '';
                    this.sendingNewLog = false;
                    
                })
        }

    }
}

</script>