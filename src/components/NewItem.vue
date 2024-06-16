<template>
    <Teleport to="body">
        <div id="itemDetailSection">
            <form id="newAppForm" class="container-fluid p-0" @submit.prevent="insertItem()" >
                <div id="itemDetailNav" class="d-flex justify-content-between flex-row-reverse"><fa icon="fa-solid fa-xmark" @click="closeItem()"/><fa icon="fa-solid fa-arrow-left" @click="goBack()"/></div>
                <input id="newAppName" type="text" placeholder="New Item..." v-model="originalItemStructure.descriptiveName" required>
                <div class="container-fluid w-100 p-0 mt-2">
                    <div v-for="(field, index) in originalItemStructure.fieldsValue" :id="index + '-field'" :key="field.nameAsProperty" class="d-flex justify-content-between item-detail-row" @click="focusInput($event)">
                        <span class="pw-20 py-2 item-detail-key text-end">{{ field.name }}</span> 
                        <div class="col-3 w-80 item-detail-value" :class="inputType(field)">
                            <input :class="index + '-field'" v-if="inputType(field) != 'checkbox' && inputType(field) != 'text'" :type="inputType(field)" :step="stepStep(field).toString()" v-model="field.value"/>  
                            <label v-if="inputType(field) == 'checkbox'" class="switch" >
                                <input :class="index + '-field'" type="checkbox" :step="stepStep(field).toString()" v-model="field.value">
                                <span class="slider round"></span>
                            </label>
                            <textarea 
                                ref="textarea" 
                                v-if="inputType(field) == 'text'" 
                                :class="index + '-field'" 
                                @input="resize($event)"
                                :step="stepStep(field).toString()" 
                                v-model="field.value">
                            </textarea>
                        </div>
                    </div>
                    <div v-for="(relationField, index) in originalItemStructure.fieldsRelationValue" :key="relationField.nameAsProperty" class="d-flex justify-content-between ">
                        <span class="pw-20 py-2 item-detail-key text-end">{{ relationField.name }}</span> 
                        <div class="w-80 py-2 item-detail-value"> 
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
                    
                </div>
                <div id="createAppButton" class="text-center">
                        <button class="btn btn-block">Create</button>
                </div>
            </form>
        </div>
    </Teleport>
</template>

<script>
import axios from 'axios';
import {mapGetters} from 'vuex';
import { getItem, getWorkspaceApp } from '../router/index.js'
//import _ from 'lodash';
import { notify } from "@kyvg/vue3-notification";
import VueSelect from 'vue-select';
import { toRaw } from 'vue';
import Chips from 'primevue/chips';
import { fixItem } from '../router/index.js'

    export default {
        name: 'NewItem',
        components: {
            VueSelect,
            Chips
        },
        computed: {
            
        ...mapGetters(['environment', 'stateWorkspace', 'stateItems', 'stateApp', 'stateItemDetail', 'isAdminInCurrentEnv', 'updateItem', 'stateNewItem', 'originalItemStructure']),

        },
        data() {
            return {
                fullPage: false,
                loadedApp: null,
                previousItem: {},
                // Propiedades para el select
                selectedOption: null,
                options: [],
                // Propiedades para la búsqueda
                searchQuery: '',
                selectedItem: {},
                selectedItems: []
            }
        },
        methods: {
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
            resize(event) {
                let element = event.target;

                element.style.height = "18px";
                element.style.height = element.scrollHeight + "px";
            },
            async limpiar() {
                this.options = [];
            },
            async buscar(event, relation) {
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
            async insertItem(){
                let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                    color: '#FFC107'
                });
                this.selectedItems.forEach((itemsList) => {
                    itemsList.forEach((item) => {
                        this.originalItemStructure.fieldsRelationValue.find((value) => value.appRelationId == item.relatedAppId).relatedItems.push({relatedItemName: item.relatedItemName, relatedItemId: item.relatedItemId}); 

                    })
                })
                console.log(this.selectedItems)
                let fieldRelation = [];
                this.originalItemStructure.fieldsRelationValue.forEach(relation => {
                    let value = {
                        relatedAppId: relation.appRelationId,
                        relatedAppName: relation.appRelationName,
                        relatedWorkspaceId: relation.workspaceRelationId,
                        relatedItems: relation.relatedItems
                    }
                    let rel = {
                        id: relation.id,
                        name: relation.name,
                        nameAsProperty: relation.nameAsProperty,
                        type: relation.type,
                        value: value
                    }
                    fieldRelation.push(rel);
                })

                var request = {
                    descriptiveName: this.originalItemStructure.descriptiveName,
                    fieldsRelationValue: fieldRelation,
                    fieldsValue: this.originalItemStructure.fieldsValue
                }
                
                request.fieldsValue.forEach((field) => {
                    if ((field.type == "date" || field.type == "datetime") && field.value != "") {
                        // Get the date string from the value
                        const dateString = field.value;

                        // Parse the date string into a Date object
                        const date = new Date(dateString);
                        // Convert the Date object to a timestamp
                        const timestamp = date.getTime()/1000;
                        // Convert the timestamp to UTC format
                        const cetOffset = date.getTimezoneOffset() * -60;
                        const utcTimestamp = timestamp + cetOffset;
                        
                        field.value = Math.trunc(utcTimestamp);
                    }
                })

                console.log(JSON.parse(JSON.stringify(request)));

                await axios.post(`app/${this.stateApp.id}/item/add`,request)
                .then( async (response) => {
                    console.log(JSON.parse(JSON.stringify(response.data)));
                    let fixedItem = await fixItem(response.data);
                    this.$router.go(-1);
                    notify({
                        type: "success",
                        title: "Created succesfully",
                        text: "Item has been created!",
                    });
                    this.$store.dispatch('addItemToStateItems', fixedItem)
                    loader.hide();

                }) 
                .catch((err) => {
                    console.log(err)
                    loader.hide();

                })
            },  
            async closeItem() {
                this.$store.dispatch('stateNewItem', null);
                this.$router.push({ name: 'app', params: { environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL, appNameURL: this.stateApp.appNameURL } });
            },
            async focusInput(event) {
                if(event.target.firstChild !== null && event.target.firstChild !== undefined) {
                    try {
                        event.target.firstChild.focus();
                    } catch (error) {
                    }
                }
            },
            async goBack() {
                this.$store.dispatch('stateItemDetail', null);
                this.$router.go(-1);
            },
            async handleClickOutsideOfDetail(e) {
                e.stopPropagation();
                if (document.getElementById('itemDetailSection') == e.target){
                    this.closeItem();
                }
            },
            async loadRelatedItem(relatedAppId, relatedItemId){

                let app = this.stateWorkspace.apps.find(app => app.id == relatedAppId)
                this.$store.dispatch('stateItemDetail', null);
                this.$router.push({ name: 'item', params: { environmentNameURL: this.environment.environmentNameURL, workspaceNameURL: this.stateWorkspace.workspaceNameURL, appNameURL: app.appNameURL, itemId: relatedItemId}});
                
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
                    case "datetime":
                        type = 'datetime-local';
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