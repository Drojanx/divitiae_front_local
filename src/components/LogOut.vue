<template>
    <div>
        <h1>Loging out</h1>
    </div>
</template>

<script>
import createStore from '../store/index.js';
import {router} from '../router/index.js'
    export default {
        name: 'LogOut',
        setup() {
            // Trigger logout on component mount
            logout();

            // Prevent unnecessary redirection
            return {};
        }        
    }

function logout(){

    createStore.dispatch('user', null);
    createStore.dispatch('environment', null);
    localStorage.removeItem('token');
    localStorage.removeItem('vuex');
    localStorage.removeItem('environment');
    console.log("borra")
    router.push('/login');
}
</script>
