<template>
    <Teleport to="body">
        <div id="itemDetailSection" v-if="stateItemDetail" @click="handleClickOutsideOfDetail">
            <form id="itemDetail" class="container-fluid p-0" @submit.prevent="" >
                <div class="mt-2 flex flex-column justify-content-end align-items-end">
                    <div class="cursor-pointer">
                        <fa class="w-10" icon="fa-solid fa-xmark " @click="closeItem()"/>
                    </div>
                    <ActivityBar/>
                </div>
                <div class="flex justify-content-between">
                    <div class="pw-20 cursor-pointer flex justify-content-end align-items-center pe-4" >
                        <Toast />
                        <ConfirmDialog></ConfirmDialog>
                        <button @click="deleteItem" label="Delete" severity="danger" outlined><fa  v-if="isAdminInCurrentEnv" icon="fa-solid fa-trash" /></button>
                    </div>
                    <h1 id="item-descriptive-name" class="w-80 hover:bg-gray-1 py-1 transition duration-300 ease-in-out"> <input @blur ="test($event)" type="text" v-model="stateItemDetail._descriptiveName" class="item-descriptive-name" > </h1>
                </div>
                <div class="container-fluid w-100 p-0">
                    <div class="d-flex justify-content-between newAppField me-5" style="flex-wrap: wrap;" v-if="isAdminInCurrentEnv">
                        <div class="pw-20 d-flex" style="align-items: center; justify-content: end;">
                             
                        </div>
                    </div>
                    <div class="d-flex justify-content-between newAppField me-5 my-2" style="flex-wrap: wrap;" v-if="isAdminInCurrentEnv">
                        <div class="pw-20 d-flex" style="align-items: center; justify-content: end;">
                            <small>ID</small>   
                        </div>
                        <small class="w-80 py-2 new-app-field-type" type="text">{{ stateItemDetail._id }}</small>  
                    </div>
                    <div v-for="(field, index) in stateApp.fields" :id="index + '-field'" :key="field.id" class="d-flex justify-content-between item-detail-row" @click="focusInput($event)">
                        <span class="pw-20 py-2 item-detail-key text-end">{{ field.name }}</span> 
                        <div class="col-3 w-80 item-detail-value" :class="inputType(field)">
                            <input :class="index + '-field'" @blur ="test($event)" v-if="inputType(field) != 'checkbox' && inputType(field) != 'text'" :type="inputType(field)" :step="stepStep(field).toString()" v-model="stateItemDetail.fields[field.id]" :value="stateItemDetail.fields[field.id]" :title="stateItemDetail.fields[field.id]"/>  
                            <label v-if="inputType(field) == 'checkbox'" class="switch" :title="stateItemDetail.fields[field.id]">
                                <input :class="index + '-field'" @change ="test($event)" type="checkbox" :step="stepStep(field).toString()" v-model="stateItemDetail.fields[field.id]" :value="stateItemDetail.fields[field.id]">
                                <span class="slider round"></span>
                            </label>
                            <textarea 
                                ref="textarea" 
                                v-if="inputType(field) == 'text'" 
                                :class="index + '-field'" 
                                @blur ="test($event)"
                                @input="resize($event)"
                                :step="stepStep(field).toString()" 
                                v-model="stateItemDetail.fields[field.id]" 
                                :title="stateItemDetail.fields[field.id]">
                            </textarea>
                        </div>
                    </div>
                    <div v-for="(relationField, index) in stateApp.relationFields" :key="relationField.id" class="d-flex justify-content-between">
                        <div class="pw-20 py-2 item-detail-key text-end">
                            <span >{{ relationField.name }}</span><br>
                            <button v-if="editRelationField != relationField.id" @click="modifyRelated(relationField.id, index, $event)" class="bg-warning rounded px-2 py-1">Modify</button>
                            <button v-if="editRelationField == relationField.id" @click="modifyRelated(relationField.id, index, $event)" class="bg-warning rounded px-2 py-1">Accept</button>
                        </div>
                        <div v-if="editRelationField != relationField.id" class="w-80 py-2 itemDetailValue related-items-grid"> 
                            <div v-for="relation in stateItemDetail.relationFields[relationField.id].relatedItems" >
                                <RouterLink @click="loadRelatedItem(relationField.appRelationId, relation.relatedItemId)" :to="{ name: 'item', params: { environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL, appNameURL: stateApp.appNameURL, itemId: relation.relatedItemId}}"> 
                                    <div class="h-100 relationFieldCard">
                                        <span class="relation-field-header">{{ relation.relatedItemName }}</span>
                                        <div class="pt-2">
                                            <a >{{ relationField.name }}</a>
                                            <p class="related-id-text">ID: {{ relation.relatedItemId }}</p>
                                        </div>
                                    </div>
                                </RouterLink>
                            </div>
                        </div>
                        <div v-if="editRelationField == relationField.id" class="w-80 py-2 item-detail-value"> 
                            <Chips v-model="selectedItems[index]">
                                <template #chip="slotProps">
                                    <div>
                                        <span>{{ slotProps.value.relatedItemName }}</span>
                                    </div>
                                </template>
                            </Chips>
                            <v-select v-model="selectedItem[relationField.appRelationId]" :options="options" @change="populateSelectedItems(index, relationField.appRelationId)" label="RelatedItemName" @search="buscar($event, relationField)" @focusout="limpiar()" class="w-50"></v-select>
                        </div>
                        

                                                                                        
                    </div>
                    <div id="relatedItems" >
                        <h5>Related Items</h5>
                        <div v-for="(relationData, propertyName) in stateItemDetail.relatedItemsByAppId" :key="propertyName" class="d-flex justify-content-between">
                            <div class="pw-20 py-2 item-detail-key text-end">
                                <span> {{ relationData.relatedAppName }}</span>
                                </div>
                                <div class="w-80 py-2 itemDetailValue related-items-grid">
                                    <div v-for="relatedItem in relationData.relatedItems" class="relationFieldCard mb-1" @click="loadRelatedItem(propertyName, relatedItem.relatedItemId)">
                                        <RouterLink :to="{ name: 'item', params: { environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL, appNameURL: stateApp.appNameURL, itemId: relatedItem.relatedItemId}}">
                                            <span class="relation-field-header" v-tooltip="{ value: relatedItem.relatedItemName, showDelay: 150, hideDelay: 200 }">{{ relatedItem.relatedItemName }}</span>
                                            <div class="pt-2">
                                                <a>{{ relationData.relatedAppName }}</a>
                                                <p class="related-id-text">ID: {{ relatedItem.relatedItemId }}</p>
                                            </div>
                                        </RouterLink>
                                    </div>
                                </div>
                    </div>
                    </div>
                    
                </div>
            </form>
            <ItemActivity/>

        </div>
    </Teleport>
</template>


<script>
import axios from 'axios';
import {mapGetters} from 'vuex';
import { getItem, getWorkspaceApp } from '../router/index.js'
import _ from 'lodash'
import ItemActivity from './ItemActivity.vue';
import ActivityBar from './Bars/ActivityBar.vue';
import Chips from 'primevue/chips';
import VueSelect from 'vue-select';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import { notify } from "@kyvg/vue3-notification";


    export default {
        name: 'ItemDetail',
        components: {
            ItemActivity,
            ActivityBar,
            VueSelect,
            Chips,
            ConfirmDialog,
            Toast
        },
        computed: {
            
        ...mapGetters(['environment', 'stateWorkspace', 'stateItems', 'stateApp', 'stateItemDetail', 'isAdminInCurrentEnv', 'updateItem']),

        },
        data() {
            return {
                fullPage: false,
                loadedApp: null,
                previousItem: {},
                originalStructureItem: {},
                relatedItemsField: {},
                editRelationField: "",
                selectedItem: {},
                selectedItems: [],
                // Propiedades para el select
                selectedOption: null,
                options: [],
                // Propiedades para la búsqueda
            }
        },
        async mounted() {
/*             window.addEventListener('click', this.handleClickOutsideOfDetail);*/              
            this.previousItem = JSON.parse(JSON.stringify(this.stateItemDetail));   
            await axios.get(`app/${this.stateApp.id}/item/${this.stateItemDetail._id}`)
                .then((response) => {
                    this.originalStructureItem = response.data;
                })
            
            let texts = document.getElementsByClassName('text');
            for (var i = 0; i < texts.length; i++) {
                let element = texts[i].getElementsByTagName('textarea')[0];
                element.style.height = "18px";
                element.style.height = element.scrollHeight + "px";
            }

        },
        props: ['loadedItem'],
        methods: {
            async buscar(event, relation) {
                console.log(event)
                if (event != ""){
                    // Petición a la API con la query de búsqueda                    
                    await axios.get(`app/${relation.appRelationId}/item?dName=${event}`)
                        .then((response) => {
                            this.options = response.data.map(item => ({
                                RelatedAppName: relation.appRelationName,
                                RelatedAppId: relation.appRelationId,
                                RelatedItemName: item.descriptiveName,
                                RelatedItemId: item.id
                            }))
                        });                                           
                }
            },
            async limpiar() {
                this.options = [];
            },
            populateSelectedItems(i, id){
                var item = {
                    relatedItemName: this.selectedItem[id].RelatedItemName,
                    relatedItemId: this.selectedItem[id].RelatedItemId,
                    relatedAppId: id
                }
                this.selectedItems[i] == undefined ? this.selectedItems[i] = [] : "";

                if(!this.selectedItems[i].find(searched => searched.relatedItemId == item.relatedItemId))
                    this.selectedItems[i].push(item);
            },
            async deleteItem(){
                let id = this.stateItemDetail._id;
                this.$confirm.require({
                    message: 'Do you want to delete this record?',
                    header: 'Attention',
                    icon: 'pi pi-info-circle',
                    rejectLabel: 'Cancel',
                    acceptLabel: 'Delete',
                    rejectClass: 'p-button-secondary p-button-outlined',
                    acceptClass: 'p-button-danger',
                    accept: async () => {
                        this.$toast.add({ severity: 'info', summary: 'Confirmed', detail: 'Record deleted', life: 6000 });

                        await axios.delete(`app/${this.stateApp.id}/item/${this.stateItemDetail._id}`)
                            .then(() => {
                                this.stateItems = _.remove(this.stateItems, function(n) {
                                    return n._id == id;
                                })
                                this.$router.push({ name: 'app', params: { environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL, appNameURL: this.stateApp.appNameURL } });
                                this.$store.dispatch('stateItems', this.stateItems);
                                this.$store.dispatch('stateItemDetail', null);

                            })
                    },
                    reject: () => {
                        this.$toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 6000 });
                    }
                });
            },
            async modifyRelated(id, index, event) {               
                if(event.target.innerHTML  === "Modify"){
                    event.target.innerHTML  = "Accept";
                    console.log(event.target)
                    
                } 
                if (event.target.innerHTML  === "Accept"){
                    event.target.innerHTML  = "Modify";
                } 
                if(this.editRelationField != id){
                    this.stateItemDetail.relationFields[id].relatedItems.forEach((value) => {
                        this.selectedItems[index] == undefined ? this.selectedItems[index] = [] : ""
                        this.selectedItems[index].push(value)
                    })
                }
                if (this.editRelationField == id){
                    if (_.isEqual(this.stateItemDetail.relationFields[id].relatedItems, this.selectedItems[index])) {
                        console.log("NO CHANGES")
                    }
                    if (!_.isEqual(this.stateItemDetail.relationFields[id].relatedItems, this.selectedItems[index])) {
                        let loader = this.$loading.show({
                            // Optional parameters
                            container: this.fullPage ? null : this.$refs.loadingArea,
                            onCancel: this.onCancel,
                            color: '#FFC107'
                        });
                        console.log("CHANGES")
                        this.originalStructureItem.fieldsRelationValue.find((value) => value.id == id).value.relatedItems = this.selectedItems[index];
                        this.stateItemDetail.relationFields[id].relatedItems = this.selectedItems[index];
                        await axios.put(`app/${this.stateApp.id}/item/${this.stateItemDetail._id}`, JSON.parse(JSON.stringify(this.originalStructureItem)))
                            .then(() => {
                                this.$store.dispatch('updateItem', this.stateItemDetail);
                                this.previousItem = JSON.parse(JSON.stringify(this.stateItemDetail));
                                notify({
                                    type: "success",
                                    title: "Item updated",
                                    text: "This item was updated succesfully!",
                                });
                                loader.hide();
                            })
                            .catch((error) => {
                                notify({
                                    type: "error",
                                    title: "Item update failed",
                                    text: "There was a problem updating this item, please try again later.",
                                });
                                console.log(error);
                                loader.hide();
                            })
                    }


                    this.editRelationField = "";
                    this.selectedItems[index] = [];
                } else {
                    this.editRelationField = id;
                }
                
            },
            resize(event) {
                let element = event.target;

                element.style.height = "18px";
                element.style.height = element.scrollHeight + "px";
            },
            async test(event) {

                if (event.target.type == "number" && event.target.value == "") {
                    event.target.value = 0;
                    return;
                }

                this.originalStructureItem.fieldsValue.forEach((field) => {

                    if (field.type == "date" || field.type == "datetime") {

                        // Get the date string from the value
                        const dateString = this.stateItemDetail.fields[field.id];

                        // Parse the date string into a Date object
                        const date = new Date(dateString);
                        // Convert the Date object to a timestamp
                        const timestamp = date.getTime()/1000;
                        // Convert the timestamp to UTC format
                        const cetOffset = date.getTimezoneOffset() * -60;
                        const utcTimestamp = timestamp + cetOffset;

                        field.value = utcTimestamp;

                    } else{
                        field.value = this.stateItemDetail.fields[field.id]

                    }
                })

                this.originalStructureItem.descriptiveName = this.stateItemDetail._descriptiveName;
                if (_.isEqual(this.stateItemDetail, this.previousItem)) {
                    console.log("NO CHANGES")
                }
                if (!_.isEqual(this.stateItemDetail, this.previousItem)) {
                    console.log("CHANGED")
                    await axios.put(`app/${this.stateApp.id}/item/${this.stateItemDetail._id}`, JSON.parse(JSON.stringify(this.originalStructureItem)))
                        .then(() => {
                            this.$store.dispatch('updateItem', this.stateItemDetail);
                            this.previousItem = JSON.parse(JSON.stringify(this.stateItemDetail));
                            var row = document.getElementById(event.target.className.replace(/switch/g,''));

                            row.classList.add("success-field-change");
                            setTimeout(() => {
                                row.classList.remove("success-field-change");
                            },2000)
                        })
                        .catch((error) => {
                            console.log(error);
                            var row = document.getElementById(event.target.className.replace(/switch/g,''));
                            console.log(event.target.className.replace(/switch/g,''))
                            console.log(row)
                            row.classList.add("success-field-change");
                            setTimeout(() => {
                                row.classList.remove("success-field-change");
                            },2000)
                        })

                    
                }
            },
            async closeItem() {
                this.$router.push({ name: 'app', params: { environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL, appNameURL: this.stateApp.appNameURL } });
                this.$store.dispatch('stateItemDetail', null);
                this.$store.dispatch('emptyStateItemLogs');
            },
            async focusInput(event) {
                if(event.target.firstChild !== null && event.target.firstChild !== undefined) {
                    try {
                        event.target.firstChild.focus();
                    } catch (error) {
                    }
                }
            },
            async handleClickOutsideOfDetail(e) {
                e.stopPropagation();
                if (document.getElementById('itemDetailSection') == e.target){
                    await this.closeItem();
                }
            },
            async loadRelatedItem(relatedAppId, relatedItemId){
                /* let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                }); */
                let app = this.stateWorkspace.apps.find(app => app.id == relatedAppId)
                this.$store.dispatch('stateItemDetail', null);
                this.$store.dispatch('emptyStateItemLogs');
                this.$router.push({ name: 'item', params: { environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL, appNameURL: app.appNameURL, itemId: relatedItemId}});
                
                /* loader.hide(); */
            },
            inputType(appField) {

                let type = 'text';
                switch (appField.type){
                    case "string":
                        type = "text";
                        break;
                    case "int":
                        type = "number";
                        break;
                    case "decimal":
                        type = "number";
                        break;
                    case "currency":
                        type = "number";
                        break;
                    case "date":
                        type = 'date';
                        break;
                    case "boolean":
                        type = "checkbox";
                        break;
                }
                return type;
            },
            stepStep(appField) {

                let step = "";
                switch (appField.type){
                    case "decimal":
                        step = "any";
                        break;
                    case "currency":
                        step = ".01";
                        break;
                }

                return step;
            }
            
        },
        async beforeRouteUpdate(to, from, next){
            
            await getWorkspaceApp(to.params.appNameURL);
            await getItem(to.params.itemId);

            next();
        }
    }

    
</script>

<style>

</style>