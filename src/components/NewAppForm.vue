<template>
    <Teleport to="body">
        <div id="newAppFormSection">
            <form id="newAppForm" class="container-fluid p-0" @submit.prevent="createApp()">
                <div id="itemDetailNav" class="d-flex justify-content-between flex-row-reverse"><fa icon="fa-solid fa-xmark" @click="closeNewAppForm()"/></div>
                <div class="d-flex justify-content-between newAppHeaders">
                    <div class="pw-20 text-center my-0" style="max-height: 300px;">
                        <p class="font-bold">Select an icon</p>
                        <span v-if="selectedIcon != ''"  class="icon app-icon-24" :class="selectedIcon"></span>
                        <Button label="Change" @click="visible = true" class="bg-warning rounded px-2 my-2" />
                        <Dialog v-model:visible="visible" modal header="Select an icon" :style="{ width: '25rem' }">
                            <div class="grid grid-cols-4 gap-4" >
                                <div v-for="n in 416" :key="n" class="rounded cursor-pointer" :id="'icon-'+n" @click="selectIcon(n)">
                                    <span  class="icon app-icon-24" :class="'icon-'+n"></span>
                                </div>
                            </div>

                        </Dialog>
                    </div>
                    <input class="w-80 my-0" id="newAppName" style="margin-left: 0 !important" type="text" placeholder="New App..." v-model="newAppName">
                </div>

                <div class="container-fluid w-100 p-0">
                    <div class="d-flex justify-content-between newAppHeaders">
                        <p class="font-bold pw-20 text-center my-0">Field names</p>
                        <p class="font-bold w-80 my-0" style="padding-left: 1.5rem">Select field's type</p>
                    </div>
                    <div class="d-flex justify-content-between newAppField new-app-field-animation" v-for="(appField, index) in appFields" style="flex-wrap: wrap;" :id="`newAppField-${index}`">
                        <div class="pw-20 d-flex pe-2" style="align-items: center; justify-content: end;">
                            <fa icon="fa-solid fa-circle-minus" v-if='index > 0' class="pw-20" style="color: #ff4d4d;" @click="removeField(index, $event)"/>
                            <input :title="appField.Name" class="w-80 text-end px-0 new-app-field-name h-100" placeholder="New Field..." required type="texts" v-model="appField.Name" onkeydown="return /[a-z0-9  ]/i.test(event.key)">
                        </div>
                        <div class="w-80 new-app-field-type">
                            <select  v-model="appField.Type" required>
                                <option v-for="typeOption in stateFieldTypes" :value="typeOption.value"> {{ typeOption.display }} </option>            
                            </select>
                        </div>
<!--                         <div class="d-flex justify-content-center" style="flex-basis: 100%; margin-left: 20%;" v-if="appField.Type == 'itemRelation'" >
                            <select class="w-80 py-2 new-app-field-type" v-model="appField['AppRelationId']" required>
                                <option v-for="app in stateWorkspace.apps" :value="app.id"> {{ app.appName }} </option>            
                            </select>
                        </div> -->
                        <div class="flex w-80" style="flex-basis: 100%; margin-left: 30%" v-if="appField.Type == 'itemRelation'">
                            <CascadeSelect v-model="appField['AppRelation']" :options="environment.workspaces" optionLabel="appName" optionGroupLabel="workspaceName"
                                :optionGroupChildren="['apps']" style="width: 30%; background-color: rgb(246, 247, 249);" placeholder="Select an app" />
                        </div>
                    </div>
                    <div id="addField"><fa icon="fa-solid fa-plus" @click="addField()"/></div>
                    <div id="createAppButton" class="text-center">
                        <button class="btn btn-block">Create</button>
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
import CascadeSelect from 'primevue/cascadeselect';
import Dialog from 'primevue/dialog';


    export default {
        name: 'NewAppForm',
        computed: {
            
            ...mapGetters(['stateWorkspace', 'stateNewAppFormIsOpen', 'stateApp', 'stateItemDetail', 'stateFieldTypes', 'environment']),
            appFields: function() {

                return this.newAppFields;
            }

        },
        components: {
            CascadeSelect,
            Dialog
        },
        data() {
            return {
                fullPage: false,
                visible: false,
                loadedApp: null,
                newAppFields: [
                    {
                        Id: '',
                        Name: '',
                        NameAsProperty: '',
                        Type: ''
                    }
                ],
                newAppName: "",
                selectedIcon: ""
            }
        },
        watch: {
            $route: {
                immediate: true,
                handler(to, from) {
                    document.title = to.meta.title || `${this.stateWorkspace.workspaceName}`;
                }
            }
        },
        async mounted() {
            window.addEventListener('click', this.handleClickOutsideOfAppForm);
        },
        methods: {
            async closeNewAppForm() {
                this.$router.push({ name: 'workspace', params: { id: this.environment.id, wsId: this.stateWorkspace.id } });
                
            },
            async handleClickOutsideOfAppForm(e) {
                e.stopPropagation();
                if ('newAppFormSection' == e.target.id){
                    this.closeNewAppForm();
                }
            },
            async goBack() {
                this.$store.dispatch('stateItemDetail', null);
                this.$router.go(-1);
            },
            async addField() {
                let lastField = this.newAppFields[this.newAppFields.length - 1];
                let appField = document.getElementsByClassName('newAppField')[0];
                let lastFieldHtmlName = Array.from(document.querySelectorAll(".new-app-field-name")).pop();
                let lastFieldHtmlType = Array.from(document.querySelectorAll(".new-app-field-type")).pop();
                let createButton = document.getElementById('createAppButton');

                let styles = window.getComputedStyle(appField)
                let transitionHeight = Math.ceil(appField.offsetHeight  + parseFloat(styles['marginTop'])  );
                createButton.style.transition = 'transform .3s ease-in-out'
                createButton.style.transform = `translateY(${transitionHeight}px)`
                setTimeout(() => {
                
                    if (lastField.Name == "") {
                        lastFieldHtmlName.classList.add('newAppIncorrectFieldName');
                        lastFieldHtmlName.placeholder = "Insert name";
                    } 
                    if(lastField.Type == ""){
                        lastFieldHtmlType.classList.add('newAppIncorrectFieldType');
                    }
                    if(lastField.Name != "" && lastField.Type != "") {
                        lastFieldHtmlName.classList.remove('newAppIncorrectFieldName');
                        lastFieldHtmlType.classList.remove('newAppIncorrectFieldType');
                        let newAppfield = {
                            Id: '',
                            Name: '',
                            Type: ''
                        }
                        this.newAppFields.push(newAppfield);
                        createButton.style.transition = 'none'
                        createButton.style.transform = `translateY(0)`
                    } else {
                        createButton.style.transform = `translateY(0)`
                    }

                    
                }, 300);
            },
            async removeField(indexField, event) {
                let field = event.target;

                while (field && !field.classList.contains('newAppField')) {
                    field = field.parentNode;
                }

                if (this.newAppFields[indexField].Type == 'itemRelation') {
                    field.style.animation = 'fade-out-x2 1s';
                } else {
                    field.style.animation = 'fade-out 1s';
                }




                let createButton = document.getElementById('createAppButton');
                let appField = document.getElementsByClassName('newAppField')[0];
                let styles = window.getComputedStyle(appField)
                let transitionHeight = Math.ceil(appField.offsetHeight + parseFloat(styles['marginTop']) );
                
                setTimeout(() => {

                    setTimeout(() => {

                        this.newAppFields.splice(indexField, 1)

                        document.querySelectorAll('.newAppField').forEach((field) => {
                            field.style.animation = 'none !important'
                        })

                        console.log(document.getElementsByClassName('newAppField'))
                        field.style.marginLeft = '0%';
                        
                    }, 500)
                        
                }, 500)
            },
            async createApp() {

                
                let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                    color: '#FFC107'
                });

                let appName = document.getElementById('newAppName');

                if(this.newAppName == "") {
                    appName.classList.add('newAppIncorrectFieldName')
                } else {
                    console.log(this.newAppFields);
                    var newAppRelationFields = [];
                    var newAppSimpleFields = this.newAppFields.filter((field) => field.Type != 'itemRelation');
                    this.newAppFields.forEach((field) => {

                        field.NameAsProperty = field.Name.toLowerCase().replace(/ /g,"_");

                        if (field.Type == 'itemRelation') {
                            var fixField = {
                                id: "",
                                name: field.Name,
                                nameAsProperty: field.NameAsProperty,
                                type: field.Type,
                                appRelationId: field.AppRelation.id,
                                appRelationName: field.AppRelation.appName
                            }
                            newAppRelationFields.push(fixField);
                        }
                    
                    });

                    console.log(this.newAppFields)
                    console.log(newAppRelationFields)
                    console.log(newAppSimpleFields)

                    let create = {
                        appName: this.newAppName,
                        appIconId: this.selectedIcon == "" ? "icon-1" : this.selectedIcon,
                        fields: newAppSimpleFields,
                        fieldsRelation: newAppRelationFields
                    }

                    await axios.post(`app/add-to/${this.stateWorkspace.id}`, create)
                    .then( (response) => {
                        console.log(response)
                        var app = response.data;
                        app.appNameURL = app.appName.toLowerCase().replace(/ /g, "-").replace(/[^a-zA-Z0-9-]/g, "");
                        var wsId = this.stateWorkspace.id
                        this.$store.dispatch('addAppToWorkspace', {app, wsId});
                        notify({
                            type: "success",
                            title: "Created succesfully",
                            text: "App has been created!",
                        });
                        this.closeNewAppForm(); 

                    })
                    .catch((err) => {
                        console.log("esto")
                        console.log(err)
                        notify({
                            type: "error",
                            title: "Failed to create app",
                            text: err.response.data,
                            duration: 6000
                        });
                    }); 
                    
                }
                loader.hide();
            },
            selectIcon(n) {
                var element = document.getElementById(`icon-${n}`);
                console.log(this.selectedIcon);
                this.selectedIcon != "" ? document.getElementById(this.selectedIcon).classList.toggle("b-accent-light") : "";
                element.classList.toggle("b-accent-light");
                this.selectedIcon = `icon-${n}`;
            }
        }
    }
</script>

<style>

</style>