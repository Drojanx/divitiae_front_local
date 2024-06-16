<template>
    <form id="signUpForm" class="rounded px-5 py-4" @submit.prevent="handleSubmit" novalidate>
        <div id="accessLogo" class="mb-4 mt-2">
            <img src="../assets/divitiae-logo-blue.png" >
        </div>
        <h2 class="text-center">Sign up</h2>
        <div id="signUpFields">
            <div class="form-group">                
                <input type="text"  v-model="state.first_name" placeholder="" required/>
                <label>First Name</label>
                <div class="text-danger" v-if="sent && v$.first_name.$error">Please, type your first name.</div>
            </div>

            <div class="form-group">                
                <input type="text" v-model="state.last_name" placeholder="" required/>
                <label>Last name</label>
                <div class="text-danger" v-if="sent && v$.last_name.$error">Please, type your last name.</div>
            </div>

            <div class="form-group">                
                <input type="email"  v-model="state.email" placeholder="" required/>
                <label>Email</label>
                <div class="text-danger" v-if="sent && v$.email.$error">Please, type a valid email.</div>                
            </div>
            <div class="sample-generate" >
                <div class="visible-sample-generate" v-if="sampleButton">
                    <span>Generate sample environment?</span>             
                    <label class="switch" >                    
                        <input type="checkbox" v-model="state.sampleEnv"> 
                        <span class="slider round"></span>
                    </label>
                </div>   
            </div>
            <div class="form-group">                
                <input type="password"  v-model="state.password" placeholder="" required/>
                <label>Password</label>
                <div class="text-danger" v-if="sent && v$.password.$error"><div v-if="v$.password.$errors[0].$validator === 'required'">Please, type a new password.</div></div>
                <div class="text-danger" v-if="sent && v$.password.$error"><div v-if="v$.password.$errors[0].$validator === 'minLength'">Password must have more than 6 characters.</div></div>
            </div>

            <div class="form-group">                
                <input type="password"  v-model="state.confirm_password" placeholder="" required/>
                <label>Confirm Password</label>
                <div class="text-danger" v-if="sent && v$.confirm_password.$error"><div v-if="v$.confirm_password.$errors[0].$validator === 'required'">Please, confirm the password.</div></div>
                <div class="text-danger" v-if="sent && v$.confirm_password.$error"><div v-if="v$.confirm_password.$errors[0].$validator === 'sameAs'">Passwords must be equal.</div></div>

            </div>
            <div class="text-danger text-xs w-100" v-if="sent && api_error"> 
                <p class="text-center">{{ api_error_message }}</p>
            </div>
        </div>
        

        <button class="btn btn-success btn-block mt-4 w-50" style="margin-left: 25%">Sign up</button>
        <div class="text-center mt-3">
            <span>Already registered? </span><router-link to="/login" class="text-reset">Log in</router-link>
        </div>
    </form>
</template>

<script>
    import axios from 'axios'
    import useValidate from '@vuelidate/core'
    import { required, email, minLength, sameAs } from '@vuelidate/validators'
    import { reactive, computed } from 'vue'
    import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
    import {mapGetters} from 'vuex';
    
    export default { 
        name: 'Signup',
        setup () {
            const state = reactive({
                first_name: '',
                last_name: '',
                email: '',
                sampleEnv: false,
                password: '',
                confirm_password: ''
            })

            const rules = computed(() =>{
                return {
                    first_name: {required},
                    last_name: {required},
                    email: { required, email },
                    password: {required, minLength: minLength(6)},
                    confirm_password: {required, sameAs: sameAs(state.password)}
                }
            })

            const v$ = useValidate(rules, state);

            return {
                state,
                v$
            }
        },
        data() {
            return {
                sent: false,
                api_error: false,
                api_error_message: ''
            }
        },
        computed: {
            
            ...mapGetters(['sampleButton']),
    
        },
        mounted() {

            console.log("tal")
            if (this.$route.query.invId !== undefined) {
                this.$store.dispatch('sampleButton', false)
            }
            
        },
        methods: {
            async handleSubmit() {
                 let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                    color: "#ffc107",
                    width: 80,
                    height: 80
                });

                this.sent=true;

                this.v$.$validate();
                if (this.v$.$error) {
                    
                } else {
                    
                    const response = await axios.post('user/register', {
                        Name: this.state.first_name,
                        LastName: this.state.last_name,
                        Email: this.state.email,
                        Password: this.state.password,
                        GenerateSampleEnvironment: this.state.sampleEnv
                    }).then(
                        () => {
                            this.$router.push('/login');
                            loader.hide();
                        }
                    ).catch(
                        err => {
                            console.log(err.response.data);
                            var erorr_string = err.response.data;
                            var error_code = err.response.status;
                            console.log(error_code)
                            if(error_code=='409'){
                                this.api_error=true;
                                this.api_error_message=erorr_string;
                            }     
                            loader.hide();                       
                        }
                    )
                }
                loader.hide();
            },
            async googleLogIn() {
                let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                    color: "#ffc107",
                    width: 80,
                    height: 80
                });
                const provider = new GoogleAuthProvider;
                var gUser;
                await signInWithPopup(getAuth(), provider)
                    .then((result) => {
                        gUser = result.user;
                        console.log(gUser);
                    })
                    .catch((error) => {
                        console.log(error);
                        loader.hide();
                    });
                console.log(gUser);
                const response = await axios.post('user/google-login', {
                        name: gUser.displayName,
                        email: gUser.email,
                        googleUID: gUser.uid
                    }).then( async (response) => {
                        console.log(response)
                        console.log(response.data)

                        localStorage.setItem('token', response.data.token);

                        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

                        await axios.get('user/userdata')
                            .then( async (response) => {

                                this.$store.dispatch('user', response.data.userData);

                                this.$router.push('/home');
                            })
                            .catch(err => {
                                console.log(err)
                            });
                        })
                    .catch(err => {
                        console.log(err)
                        loader.hide();
                    })    

                console.log(response)

                localStorage.setItem('token', response.data.token)
                this.$store.dispatch('user', response.data.user);
                loader.hide();
                this.$router.push('/home'); 
            }
        }
    }
</script>
