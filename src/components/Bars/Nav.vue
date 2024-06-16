<template>
    <div>
      <nav class="navbar navbar-dark flex" >
        <div class="container-fluid h-100">
          <router-link to="/" class="navbar-brand my-auto px-4 rounded ms-4 mt-4" v-if="!user"><img width="200px" src="/src/assets/divitiae-new-blue.png" id="navLogo"></router-link>
          <router-link to="/home" class="navbar-brand my-auto px-4 rounded ms-4" v-if="user"><img width="40px" src="/src/assets/divitiae-logo-blue.png" id="navLogo" ></router-link>
          <div class="ms-auto me-6" v-if="!user">
            <ul class="navbar-nav ms-auto my-auto d-flex flex-row">
              <li class="nav-item h-100 w-32">
                <router-link to="/login" class="mt-4 nav-link rounded px-4 text-center text-secondary">Login</router-link>
              </li>
              <li class="nav-item h-100 w-32">
                <router-link to="/signup" class="mt-4 nav-link rounded px-4 bg-warning text-secondary text-center">Sign up</router-link>
              </li>
            </ul>
          </div>
          <div id="session" class="ms-auto flex align-items-center" :class="'base-b-'+colorMode"  v-if="user">
            <ul class="navbar-nav ms-auto my-auto d-flex flex-row">
              <li class="nav-item h-10 flex align-items-center " :class="'b-accent-'+colorMode">
                <router-link to="/home" class="nav-link rounded ps-3 pe-2 text-black" id="usernameNav">Hi, {{ this.user.userName }}!</router-link>
              </li>
              <li class="nav-item h-10 b-warning flex align-items-center ">
                <router-link to="/logout" class="nav-link" id="logoutButton"><img src="/src/assets/logout.png"/></router-link>
              </li>
              
            </ul>
            <li v-if="colorMode == 'light'" @click="switchMode('dark')" class="cursor-pointer p-3 text-xl pi pi-moon"></li>
            <li v-if="colorMode == 'dark'" @click="switchMode('light')" class="cursor-pointer p-3 text-xl pi pi-sun text-white"></li>
          </div>  
        </div>
      </nav>
    </div>
  </template>

<script>
import { RouterView } from 'vue-router';
import {mapGetters} from 'vuex';




    export default {
    name: "Nav",
    components: { RouterView },
    computed: {
      ...mapGetters(['user', 'colorMode']),

    },
    methods: {
      signOut() {
        this.$router.push('/')
        localStorage.removeItem('token');
        localStorage.removeItem('vuex');
        localStorage.removeItem('environment');
        this.$store.dispatch('user', false);
        this.$store.dispatch('environment', false);
        
      },
      switchMode(mode) {
        this.$store.dispatch('colorMode', mode)
      }
    }
}

</script>