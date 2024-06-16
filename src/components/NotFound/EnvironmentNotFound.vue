<template>
    <div id="page-not-found">
        <div class="mx-auto w-50 text-center mt-5">
            <h1>Sorry, environment not found</h1>
            <router-link to="/home" class="btn btn-warning rounded px-2">Go back to home</router-link>
        </div>
    </div>
</template>

<script>


    export default {
        name: 'EnvironmentNotFound'
    }
</script>