<template>
    <form id="logInForm" class="rounded px-5 py-4" @submit.prevent="handleLogin">
        <div id="accessLogo" class="mb-4 mt-2">
            <img src="../assets/divitiae-logo-blue.png">
        </div>
        <h2 class="text-center">Log in</h2>

        <div class="form-group my-3">
            <span class="accessIcon">
                <fa icon="envelope"/>
            </span>
            
            <input type="email" v-model="email" placeholder="" required/>
            <label>Email</label>
        </div>

        <div class="form-group">
            <span class="accessIcon">
                <fa icon="lock"/>
            </span>
            <input type="password" v-model="password" placeholder="" required/>
            <label>Password</label>
        </div>

        <div class="text-warning" v-if="failedToLogin"><small>{{ errorText }}</small></div>

        <button class="btn btn-success btn-block w-100">Login</button>
        <!-- <router-link to="/forgot" class="btn btn-dark btn-block mt-2 w-100">Forgot password?</router-link> -->

        <div class="text-center mt-3">
            <span>Don't have an account? </span><router-link to="/signup" class="text-reset">Sign up</router-link>
        </div>
    </form>
</template>

<script>
    import axios from 'axios'
    import { getAuth, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth'
    
    export default {
        name: 'Login',
        data() {
            return {
                email: '',
                password: '',
                fullPage: false,
                failedToLogin: false,
                errorText: ''
            }
        },
        methods: {
            async handleLogin() {
                let loader = this.$loading.show({
                    // Optional parameters
                    container: this.fullPage ? null : this.$refs.loadingArea,
                    onCancel: this.onCancel,
                    color: '#FFC107'
                });
                try {
                    const response = await axios.post('user/login', {
                        email: this.email,
                        password: this.password,
                        GoogleUID: ''
                    })
                    .then( async (response) => {
                        console.log(response)

                        localStorage.setItem('token', response.data.token);

                        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

                        await axios.get('user/userdata')
                            .then( async (response) => {
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
                                userData.userTasks.sort((a, b) => a.dueDate - b.dueDate)
                                this.$store.dispatch('user', userData);

                                this.$router.push('/home');
                            })
                            .catch(err => {
                                console.log(err.response)
                            });
                    })
                    .catch(err => {
                        this.errorText = err.response.data;
                        if (err.code=="ERR_NETWORK" || err.code=="ERR_BAD_RESPONSE")
                            this.errorText = "There is a network issue. Try again later.";
                        this.failedToLogin = true;
                    })           
                } catch(err){
                    console.log(err)
                }
                loader.hide();
            },
            /* async googleLogIn() {
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
                var gUserFirstName;
                var gUserLastName;
                var isNewUser;
                await signInWithPopup(getAuth(), provider)
                    .then((result) => {
                        gUser = result.user;
                        isNewUser = getAdditionalUserInfo(result);
                        gUserFirstName = result._tokenResponse.firstName;
                        gUserLastName = result._tokenResponse.lastName;
 
                    })
                    .catch((error) => {
                        console.log(error);
                    });

                const response = await axios.post('user/google-login', {
                        name: gUserFirstName,
                        lastName: gUserLastName,
                        email: gUser.email,
                        googleUID: gUser.uid
                    }).then( async (response) => {
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
                    })    

                console.log(response)

                localStorage.setItem('token', response.data.token)
                this.$store.dispatch('user', response.data.user);
                this.$router.push('/home'); 
                loader.hide();
            }           */ 
            
        }
    }
</script>
