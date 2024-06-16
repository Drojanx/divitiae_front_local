<template>
  <div id="appDropdowns" class="d-flex justify-content-center mx-auto" v-if="user">
    <!-- <div class="dropdown">
      <button id="environmentspaceDrop" class="dropbtn" @click="openDropdown()"><img src="/src/assets/arrow.png"/>Environments</button>
      <div class="dropdown-content" id="environmentspaceDropContent">
        <router-link @click="openDropdown()" v-for="item in this.user.workEnvironments" :key="item.id" style="cursor: pointer;"  :to="{ name: 'environment', params: { environmentNameURL: item.environmentNameURL }}"><fa icon="people-group"/> {{ item.environmentName }}</router-link>
      </div>
    </div> -->
<!--     <div class="dropdown" v-if="currentView === '/home/environment'">
      <button id="workspaceDrop" class="dropbtn" @click="openDropdown($event)">Workspace<img src="@/assets/arrow.png"/></button>
      <div class="dropdown-content" id="workspaceDropContent">
        <a v-for="item in items"></a>
        <a href="#">Link 1</a>
        <a href="#">Link 2</a>
        <a href="#">Link 3</a>
      </div>
    </div> -->
    <Menu as="div" class="relative inline-block text-left w-56 ms-3">
      <div>
        <MenuButton :class="'bsec-'+colorMode" class="font-bold inline-flex w-full justify-center gap-x-1.5 rounded-b-lg px-3 py-2 text-sm shadow-sm ring-1 ring-inset ring-gray-300" >
          Choose environment
          <ChevronDownIcon class="-mr-1 h-5 w-5 text-white-400" aria-hidden="true" />
        </MenuButton>
      </div>

      <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
        <MenuItems :class="'bsec-'+colorMode" class="absolute right-0 z-10 mt-2 origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div class="py-1 px-3 w-56 d-flex flex-column">
            <MenuItem v-slot="{ active }" v-for="item in this.user.workEnvironments">
              <router-link class="text-sm font-bold w-100 my-2 hover:scale-110 transform transition duration-300" @click="openDropdown()" :key="item.id" style="cursor: pointer;"  :to="{ name: 'environment', params: { environmentNameURL: item.environmentNameURL }}"><fa icon="people-group"/> {{ item.environmentName }}</router-link>
            </MenuItem>
          </div>
        </MenuItems>
      </transition>
    </Menu>
    <div :class="'bsec-'+colorMode" class="appTab flex ms-2 cursor-pointer" style="height: 34px; width: 170px" @click="openPosition('center')">
        <span class="flex align-items-center p-2"><i class="pi pi-plus text-bold"></i></span>
        <a class="text-xs p-2 ps-0 font-semibold"  style="text-decoration: none; height: 30px;">Create environment</a>
    </div>
    <Dialog :class="'b-less-'+colorMode+' txt-'+colorMode" v-model:visible="dialog" header="Create environment" :style="{ width: '25rem' }" :position="this.position" :modal="true" :draggable="false">
        <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="block">New environment name:</span>
        <div class="flex align-items-center gap-3 mb-3">
            <input v-model="newEnvironmentName" type="text" class="form-control w-75 mx-auto my-2" placeholder="Environment name...">
        </div>
        <div class="flex justify-content-end gap-2">
            <Button type="button" label="Cancel" class="p-1 rounded hover:bg-cancel" severity="secondary" @click="dialog = false"></Button>
            <Button type="button" label="Save" class="p-1 rounded" :class="'hover hover-bsec-'+colorMode" @click="insertEnvironment()"></Button>
        </div>
    </Dialog>
  </div>
  </template>

<script>
import axios from 'axios';
import {useRoute} from 'vue-router'
import {computed} from 'vue'
import {mapGetters} from 'vuex';
import { ref } from "vue";
import Dialog from 'primevue/dialog';
import { notify } from "@kyvg/vue3-notification";


    export default {
    name: "AppBar",
/*     setup(){
      const route=useRoute();

      const path = computed(() =>route.path)

      return {
        path
      }
    }, */
    components: {
      Dialog
    },
    data() {
        return {
            dialog: ref(false),
            position: ref('center'),
            newEnvironmentName: ''
        }
    },
    computed : {
      ...mapGetters(['user', 'colorMode'])/* ,
      currentView() {
        return this.path;
      } */
    },
    methods: {
      openDropdown() {
        var content = document.getElementById("environmentspaceDropContent");
        content.classList.toggle("notHidden")                    
      },
      openPosition(position) {
        this.position = position;
        this.dialog = true;
      },
      async insertEnvironment() {
            let loader = this.$loading.show({
                // Optional parameters
                container: this.fullPage ? null : this.$refs.loadingArea,
                onCancel: this.onCancel,
                color: "#ffc107",
                width: 80,
                height: 80
            });

            await axios.post(`environment/add`,this.newEnvironmentName,{
                headers: {
                  'Content-Type': 'application/json'
                }
              })
            .then( async (response) => {
                    console.log(response)
                    notify({
                        type: "success",
                        title: "Created succesfully",
                        text: "Workspace has been created!",
                    });        
                    await axios.get('user/userdata')
                      .then( (response) => {
                        var userData = response.data.userData;

                        let existingNames = {};
                        userData.workEnvironments.forEach((we) => {
                          let nombreUrlFriendly = we.environmentName.toLowerCase().replace(/ /g, "-").replace(/[^a-zA-Z0-9-]/g, "");
                          
                          // Verifica si ya existe el nombreUrlFriendly
                          if (existingNames[nombreUrlFriendly] !== undefined) {
                              // Genera un nuevo nombre único
                              let count = existingNames[nombreUrlFriendly]++;
                              nombreUrlFriendly += `(${count})`;
                          } else {
                            existingNames[nombreUrlFriendly] = 1;
                          }
                          
                          we.environmentNameURL = nombreUrlFriendly;
                        });
                        this.$store.dispatch('user', userData);
                        console.log("userdata updated")
                      })
                      .catch( (err) => {
                        err.code == "ERR_NETWORK" ? this.$router.push( { name: 'logout'}) :"";
                        console.log(localStorage.getItem('token'));
                        
                      });                              
            });
            this.dialog = false;  
            loader.hide();
        }
    }
    

}

</script>