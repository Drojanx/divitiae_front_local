<template>
    <div id="rootSection" class="d-flex flex-column">
        <div class="container-fluid mt-8 w-50 text-center" id="root">
            <h1 class="text-4xl font-bold">Manage your way</h1>
            <p class="mx-auto mt-5 font-bold text-2xs">Easy, agile and customizable. Divitiae adapts to you.</p>
            <div class=" mt-6 mb-9 w-50 mx-auto">
            </div>
        </div>
        <div id="info" class="d-flex flex-column mt-3">
            <div class="container aboutbox d-flex justify-content-around mt-6">
                <div class="w-25 text-justify">
                    <h4 class="text-center">Teamwork</h4>
                    <p>Improve communication and follow-up of your teammates.</p>
                    <img class="w-100" src = "../assets/undraw_engineering_team_a7n2.svg"/>
                </div>
                <div class="w-33 text-justify aboutitem rounded-pill">
                    <img class="w-100 px-3 py-4" src = "../assets/undraw_projections_re_ulc6.svg"/>
                    <h4 class="text-center">Organize as you like.</h4>
                    <p>Have all the ifnormation you need organized the way that suits you best.</p>
                </div>
                <div class="w-25 text-justify">
                    <h4 class="text-center">Follow-up.</h4>
                    <p>Create tasks and keep track of how they are going.</p>
                    <img class="w-100" src = "../assets/undraw_scrum_board_re_wk7v.svg"/>
                </div>
            </div>
        </div>
    </div>    
</template>


<script>
import {mapGetters} from 'vuex';
import axios from 'axios'

    export default {
        name: 'Root',
        methods: {
            async googleLogIn() {
                console.log('hola ola')
                const googleUser = await this.$gAuth.signIn();
                console.log('Google user', googleUser);
            }
        },
        created: async function() {
            
        },
        computed: {
      ...mapGetters(['appClass'])

         },
        async created() {

            this.$store.dispatch('appClass', 'annonApp');

            /* if(localStorage.getItem('token')!==null) {        
                const userdata = await axios.get('user/userdata');

                let loader = this.$loading.show({
                        // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                });

                this.$store.dispatch('user', userdata.data.userDataDTO);

                console.log(userdata.data.userDataDTO);

                this.$router.push('/home');          

                loader.hide()  
            } */ 
        }
    }
    
    
    

</script>