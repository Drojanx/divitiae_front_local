<template>
    <form class="rounded px-5 py-4" @submit.prevent="handleSubmit">
        <div class="mx-auto w-75">
            <img src="../assets/Divitiae-1.png" width="100%>">
        </div>
        <h3 class="text-center">Recover your Divitiae password</h3>

        <div class="form-group my-3">
            <label>Email</label>
            <input type="email" class="form-control" v-model="email" autofocus/>
        </div>

        <button class="btn btn-success btn-block mt-4 w-100">Login</button>
        <router-link to="/forgot" class="btn btn-dark btn-block mt-2 w-100">Forgot password?</router-link>

        <div class="text-center mt-3">
            <span>Don't have an account? </span><router-link to="/signup" class="text-reset">Sign up</router-link>
        </div>
    </form>
</template>

<script>


    export default {
        name: 'Forgot',
        
        data() {
            return {
                email: ''
            }
        },
        methods: {
            async handleSubmit() { }
        }
    }
</script>