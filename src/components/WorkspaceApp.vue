<template>
    <div id="appContent" :class="'txt-'+colorMode+' b-less-'+colorMode" class="container px-0" v-if="stateApp != null">
        <div class="w-100 m-auto h-10 mt-4 leading-8 flex items-center justify-center gap-x-4 px-4">
            <div class="pw-25"></div>
            <h3 class="pw-50 py-2 text-center pw-25 text-xl"  > {{ stateApp.appName }}</h3>
            <div class="pw-25 flex flex-row-reverse">
                <Button label="Edit app" @click="editApp = !editApp" class="h-6 align-right bg-warning rounded px-2 " />
            </div>
            <Dialog :class="'b-less-'+colorMode+' txt-'+colorMode" v-model:visible="editApp" header="Edit app   " :style="{ width: '25rem' }" :position="this.position" :modal="true" :draggable="false">
                <ConfirmDialog></ConfirmDialog>
                <div class="flex gap-x-5">
                    <button @click="deleteApp" v-tooltip.left="{ value: 'Delete this app and its items', showDelay: 300, hideDelay: 300}" label="Delete" severity="danger" outlined><fa  v-if="isAdminInCurrentEnv" icon="fa-solid fa-trash" /></button>
                    <span  :class="'b-less-'+colorMode+' txt-'+colorMode" class="block">Edit app name:</span>
                </div>
                <div class="flex align-items-center gap-3 mb-3">
                    <input v-model="appName" type="text" class="form-control w-75 mx-auto my-2" placeholder="App name...">
                </div>
                <div class="flex justify-content-end gap-2">
                    <Button type="button" label="Cancel" class="p-1 rounded hover:bg-cancel" severity="secondary" @click="editApp = false"></Button>
                    <Button type="button" label="Save" class="p-1 rounded" :class="'hover hover-bsec-'+colorMode" @click="updateAppName()"></Button>
                </div>
            </Dialog>
        </div>
        <div class="d-flex justify-content-end me-3">
            <div class="w-100 flex justify-between align-items-center px-5" >
                <div id="searchDiv" class="pw-30 h-10 rounded d-flex content-center ">
                    <button id="searchButton" @click="showSearch()" class="ease-in-out transform transition duration-300 pw-15 border-1 border-solid border-slate-300 px-2 rounded-lg text-slate-500"><fa icon="fa-solid fa-search" /></button>
                    <transition name="slide-fade">

                        <v-select  v-if="search" id="appSearch" class="pw-80 h-10 bg-slate-100 rounded-r-lg" :class="'txt-light'" v-model="searchedItem" :options="options" label="name" @search="buscar($event, stateApp.id)" @focusout="limpiar()"></v-select>                
                    </transition>
                </div>
                <div class="pw-70 d-flex justify-content-end">
                    <div class="cursor-pointer">
                        <Toast />
                        <ConfirmDialog></ConfirmDialog>
                        <button @click="deleteItems" label="Delete" severity="danger" outlined><fa  v-if="isAdminInCurrentEnv" icon="fa-solid fa-trash" /></button>

                    </div>
                    <div class="mb-1 ms-4">
                        
                        <RouterLink class="bg-warning rounded px-2 py-1 cursor-pointer text-align-center text-center" :to=" { name: 'new-item', params: { environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL, appNameURL: this.stateApp.appNameURL } }" style="text-decoration: none; font-weight: 700 !important; color: #2c3e50 !important;"> Add an item </RouterLink>              
                    </div>
                </div>
                </div>
        </div>
        <div class="container d-flex py-1 px-3 " style="height: 85%;">
            <div class="container-fluid" style="height: 100%;">
                <div class="row" style="overflow-y: hidden; min-height: 100px; height: 100%;">                    
                    <DataTable stickyHeader="true" :class="'table-'+colorMode" v-model:selection="selectedItems" :value="stateItems" dataKey="_id" tableStyle="min-width: 50rem" id="items-table">
                        <Column class="select-item" selectionMode="multiple" style="padding: 0 1rem; width: 3rem;" headerStyle="border-top-left-radius: 15px;" ></Column>
                        <Column header="#" headerStyle="width:3rem;">
                            <template #body="slotProps">
                                <div class="cell h-100">
                                    <span class="" v-tooltip.top="{ value: `${slotProps.index + 1}`, showDelay: 300, hideDelay: 300}">{{ slotProps.index + 1 }}</span>
                                </div>
                            </template>
                        </Column>
                        <Column field="_descriptiveName" header="Item Name">
                            <template #body="slotProps">
                                <!-- <div class="h-100 flex justify-content-center">
                                    
                                </div> -->
                                <RouterLink class="cell h-100" v-tooltip.top="{ value: `${slotProps.data._descriptiveName}`, showDelay: 300, hideDelay: 300 }" :to="{ name: 'item', params: { environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL, appNameURL: this.stateApp.appNameURL, itemId: slotProps.data._id } }">
                                    <a  class="font-medium">{{ slotProps.data._descriptiveName }}</a>

                                </RouterLink>
                            </template>
                        </Column>
                         <Column :header="field.name" v-for="(field) in stateApp.fields" :class="field.type+'-field'" :key="field.id" style="min-width: 8rem;" :field="'fields.'+field.nameAsProperty" :title="'fields.'+field.nameAsProperty">

                            <template #body="slotProps" >
                                <RouterLink class="w-100 block cell h-100" v-tooltip.top="{ value: `${slotProps.data.fields[field.id]}`, showDelay: 150, hideDelay: 200 }" :to="{ name: 'item', params: { environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL, appNameURL: this.stateApp.appNameURL, itemId: slotProps.data._id } }">
                                    <a class="item-cell-value font-medium" :value="slotProps.data.fields[`${field.id}`]"></a>
                                </RouterLink>
                            </template>
                        </Column>           
                        <template #empty> <a class="text-center w-100 block">No items found.</a> </template>   
                    </DataTable>
                    <div id="items-loader" class="mt-3 cursor-pointer" ref="loadMoreItems" @click="loadMoreItems()">
                        <span class="text-center m-auto block w-25 py-2 rounded b-warning" style="text-decoration: none; font-weight: 700 !important; color: #2c3e50 !important;">Load more items</span>
                    </div>
                </div>
            </div>            
        </div>
        <router-view v-if="this.stateItemDetail!==null || this.stateNewItem!==null" v-slot="{ Component }">
                <component :is="Component" />
        </router-view>
       <!--  <Transition name="fade">
            
            <router-view v-if="this.stateItemDetail!==null"></router-view> -->
            <!-- <div id="itemDetailSection" v-if="this.stateItemDetail !== null"><ItemDetail/></div> -->
        <!-- </Transition> -->
    </div>
</template>

<script>
import axios from 'axios';
import {mapGetters} from 'vuex';
import ItemDetail from './ItemDetail.vue'
import { getWorkspaceApp, getItem, populateStateItems } from '../router/index.js'
import {ref, inject} from 'vue'
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import Dialog from 'primevue/dialog';
import { notify } from "@kyvg/vue3-notification";

    export default {
        name: 'WorkspaceApp',
        computed: {
            
        ...mapGetters(['colorMode', 'environment', 'stateWorkspace', 'stateItems', 'stateApp', 'stateItemDetail', 'stateNewItem', 'isAdminInCurrentEnv']),

        },
        data() {
            return {
                appName: '',
                fullPage: false,
                loadedApp: null,
                selectedItems: [],
                fullPage: false,
                ascending: true ,
                search: false,
                lastParams: {},
                options: [],
                // Propiedades para la búsqueda
                searchQuery: '',
                searchedItem: {},
                editApp: false
            }
        },
        components: {
            ItemDetail,
            ConfirmDialog,
            Toast,
            Dialog
            
        },
        watch: {
            $route: {
                immediate: true,
                handler(to, from) {
                    if (to.params.appId != null)
                        document.title = to.meta.title || `${this.stateApp.appName}`;
                }
            },
            stateItems: {
                handler() {
                    setTimeout(() => {
                        this.populateText("item-cell-value")
                    }, "10");
                },
                deep: true
            },
            searchedItem: {
                handler() {
                    this.loadItem(this.searchedItem);
                }
            }
        },
        mounted() {
            this.populateText("item-cell-value");
            this.appName = this.stateApp.appName;
        },
        methods: {   
            async deleteApp(){
                this.$confirm.require({
                    message: 'Are you sure you want to delete this app and its items? This action CANNOT BE UNDONE.',
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
                        await axios.delete(`app/${this.stateApp.id}`)
                            .then((res) => {
                                console.log(res)
                                this.$router.push({ name: 'workspace', params: { environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL } });
                                this.$store.dispatch('removeAppWorkspace', this.stateApp.id);
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
            async showSearch(){
                this.search=!this.search;
                let btn = document.getElementById('searchButton');
                btn.classList.toggle('rounded-lg');                
                btn.classList.toggle('rounded-l-lg');

            },
            async limpiar() {
                this.options = [];
            },
            async buscar(event, appId) {
                console.log(event)
                if (event != ""){
                    // Petición a la API con la query de búsqueda                    
                    await axios.get(`app/${appId}/item?dName=${event}`)
                        .then((response) => {
                            this.options = response.data.map(item => ({
                                appName: this.stateApp.appName,
                                appId: this.stateApp.id,
                                name: item.descriptiveName,
                                _id: item.id
                            }))
                            console.log(JSON.parse(JSON.stringify(this.options)));
                        });

                        
                        
                } else {
                    this.limpiar();
                }
            },
            async updateAppName(){
                let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                    color: "#ffc107"
                });
                await axios.patch(`app/${this.stateApp.id}/edit-name`, this.appName, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(() => {        
                    let existingAppNames = {}
                    this.stateApp.appName = this.appName;
                    this.stateWorkspace.apps.find(app=>app.id==this.stateApp.id).appName = this.appName;
                    this.stateWorkspace.apps.forEach((app) => {
                        console.log(JSON.parse(JSON.stringify(app)));
                        let nombreAppUrlFriendly = app.appName.toLowerCase().replace(/ /g, "-").replace(/[^a-zA-Z0-9-]/g, "");
                        console.log(JSON.parse(JSON.stringify(nombreAppUrlFriendly)));
                        // Verifica si ya existe el nombreAppUrlFriendly
                        if (existingAppNames[nombreAppUrlFriendly] !== undefined) {
                            // Genera un nuevo nombre único
                            let count = existingAppNames[nombreAppUrlFriendly]++;
                            nombreAppUrlFriendly += `(${count})`;
                        } else {
                            existingAppNames[nombreAppUrlFriendly] = 1;
                        }

                        app.appNameURL = nombreAppUrlFriendly;
                        if(app.id==this.stateApp.id){
                            this.stateApp.appNameURL = nombreAppUrlFriendly;
                        }
                    })
                    notify({
                        type: "success",
                        title: "Workspace updated",
                        text: "You just updated the workspace name!",
                    });
                    this.editApp = false;
                    loader.hide();
                    this.$router.push({ name: 'app', params: { environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL, appNameURL: this.stateApp.appNameURL } })
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
            async deleteItems(){
                        console.log(this.selectedItems)
                this.$confirm.require({
                    message: 'Do you want to delete this record?',
                    header: 'Danger Zone',
                    icon: 'pi pi-info-circle',
                    rejectLabel: 'Cancel',
                    acceptLabel: 'Delete',
                    rejectClass: 'p-button-secondary p-button-outlined',
                    acceptClass: 'p-button-danger',
                    
                    accept: async () => {
                        this.$toast.add({ severity: 'info', summary: 'Confirmed', detail: 'Record deleted', life: 6000 });
                        /* await axios.delete(`app/${this.stateApp.id}/item/${this.stateItemDetail._id}`)
                            .then(() => {
                                this.stateItems = _.remove(this.stateItems, function(n) {
                                    return n._id == id;
                                })
                                this.$router.push({ name: 'app', params: { environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL, appNameURL: this.stateApp.appNameURL } });
                                this.$store.dispatch('stateItems', this.stateItems);
                                this.$store.dispatch('stateItemDetail', null);

                            }) */
                    },
                    reject: () => {
                        this.$toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 6000 });
                    }
                });
            },
            populateText(className){
                setTimeout(() => {
                    var element = document.getElementsByClassName(className);
                    setTimeout(() => {
                        for (var i = 0; i < element.length; i++){
                            element[i].innerText = element[i].getAttribute("value")                            
                        }
                        this.parseBooleans();
                    }, "1")
                }, "1")
            },
            async parseBooleans() {
                var bools = document.getElementsByClassName('boolean-field');
                
                for (var i = 0; i < bools.length; i++) {

                    switch (bools[i].innerText){
                        case "true":
                            bools[i].firstElementChild.innerText = "";
                            var img = document.createElement("img");
                            img.src = "https://em-content.zobj.net/source/skype/289/check-mark_2714-fe0f.png"
                            img.style.width = "15px"
                            bools[i].firstElementChild.appendChild(img);
                            bools[i].firstElementChild.style.display = "flex";
                            bools[i].firstElementChild.style.alignItems = "center";
                            break;
                        case "false":
                        bools[i].firstElementChild.innerText = "";
                            var img = document.createElement("img");
                            img.src = "https://em-content.zobj.net/source/skype/289/cross-mark_274c.png"
                            img.style.width = "12px"
                            bools[i].firstElementChild.appendChild(img);
                            bools[i].firstElementChild.style.display = "flex";
                            bools[i].firstElementChild.style.alignItems = "center";
                            break;
                    }

                }
            },      
            async loadMoreItems(){
                var cont = document.getElementById('items-loader');
                let loader = this.$loading.show({
                    // Optional parameters
                    container: cont,
                    color: "#ffc107",
                    width: 80,
                    height: 80
                });

                var loadedItems = this.stateItems;
                this.lastParams.offset = this.stateItems.length;
                var params = this.lastParams
                params.offset = this.stateItems.length;
                await populateStateItems(this.stateApp.id, this.stateItems, params)
                /* await axios.get(`app/${this.stateApp.id}/item/paginated`, {params})
                .then((response) => {
            
                    response.data.forEach((item) => {
                            let fixedItem = {
                                _id: '',
                                _descriptiveName: '',
                                fields: {},
                                relationFields: {},
                                relatedItemsByAppId: {}
                            }
                            var fixedValues = {};
                            var fixedRelationValues = {};
                            item.fieldsValue.forEach((value) => {
                
                                if (value.type == "date" || value.type == "datetime") {
                                let date = new Date(value.value * 1000);
                                const offset = date.getTimezoneOffset();
                                date = new Date(date.getTime() - (offset*60*1000));
                                fixedValues[`${value.nameAsProperty}`] = date.toISOString().split('T')[0];
                                } else {
                                fixedValues[`${value.nameAsProperty}`] = value.value;
                                }
                
                
                            })
                
                            item.fieldsRelationValue.forEach((relationValue) => {
                            fixedRelationValues[`${relationValue.nameAsProperty}`] = relationValue.value;
                            })
                
                            fixedItem._id = item.id.toString();
                            fixedItem._descriptiveName = item.descriptiveName;
                            fixedItem.fields = fixedValues;
                            fixedItem.relationFields = fixedRelationValues;
                
                                                        
                            item.relations.forEach((relation) => {
                                
                                const { relatedAppId } = relation;

                                var relatedAppName = this.stateWorkspace.apps.find((app) => app.id == relation.relatedAppId).appName;
                                
                                if (!fixedItem.relatedItemsByAppId[relatedAppId]) {
                                    // Si la lista para 'relatedAppId' no existe, crea una nueva.
                                    fixedItem.relatedItemsByAppId[relatedAppId] = {};
                                    fixedItem.relatedItemsByAppId[relatedAppId]['relatedItems'] = [];
                                }

                                fixedItem.relatedItemsByAppId[relatedAppId]['relatedAppName'] = relatedAppName
                                
                                relation.relatedItems.forEach((relatedItem) => {
                                    var fixedRelatedItem = {
                                        relatedItemId: relatedItem.relatedItemId,
                                        relatedItemName: relatedItem.relatedItemName
                                    }
                                    fixedItem.relatedItemsByAppId[relatedAppId]['relatedItems'].push(fixedRelatedItem);

                                })
                                
                            });
                
                            loadedItems.push(fixedItem);
                
                        });
                        this.$store.dispatch('stateItems', loadedItems);
                });  */
                loader.hide();
            },
            async loadItem(item){

                this.$router.push({ name: 'item', params: { environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL, appNameURL: this.stateApp.appNameURL, itemId: item._id } });

            },
            generateItemUrl(item) {
                // Función para generar la URL del enlace
                return `/environment/${this.environment.id}/workspace/${this.stateWorkspace.id}/app/${this.stateApp.id}/item/${item._id}`;
            },
            handleRowClick(item, event) {
                // Manejar el clic en la fila con Ctrl
                if (event.ctrlKey) {
                    const url = this.generateItemUrl(item);
                    window.open(url, '_blank'); // Abrir enlace en nueva pestaña
                } else {
                    this.loadItem(item); // Ejecutar tu función loadItem si no se presiona Ctrl
                }
            },
        },
        async beforeRouteUpdate(to, from, next){
            if(to.params.appNameURL !== from.params.appNameURL && to.params.appNameURL != null){
                this.$store.dispatch('stateItems', null)
                this.$store.dispatch('stateApp', null)
                            
                await getWorkspaceApp(to.params.appNameURL);
                if(to.params.itemId != undefined){ //Con esto gestiono cuando se intente acceder un item relacionado 
                    await getItem(to.params.itemId)//desde otra app, ya que esto supone borrar el stateItemDetail, 
                }                                  //haciendo así que el componente de item no se renderice, así que no
                next();                            //podría detectar si ha habido un cambio de url desde ahí
            } else{
                next();
            }
            
        }
    }
</script>

<style>

</style>