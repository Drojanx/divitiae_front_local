<template>
  <div id="myApp" class="d-flex flex-column appClass" :class="'base-b-'+colorMode">
    <Nav />
    
    <div class="auth-wrapper">
      <div class="auth-inner" ref="loadingArea">
        <Router-view v-slot="{ Component }">
          <Transition name="route" mode="out-in">
            <component :is="Component"></component>
          </Transition>
        </Router-view>
      </div>
    </div>
    <notifications position="bottom right" class="my-notification" />
  </div>
</template>

<script>
  import axios from 'axios';
  import Nav from './components/Bars/Nav.vue'
  import {mapGetters} from 'vuex';

  export default {
    name: 'App',
    components: {
      Nav
    },
    computed: {
      ...mapGetters(['appClass', 'colorMode'])

    },
    async created() {
      if (localStorage.getItem('token') !== null) {
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
            userData.userTasks.sort((a, b) => a.dueDate - b.dueDate)
            this.$store.dispatch('user', userData);
            console.log("userdata updated")
          })
          .catch( (err) => {
            err.code == "ERR_NETWORK" ? this.$router.push( { name: 'logout'}) :"";
            console.log(localStorage.getItem('token'));
            
          });
        
      }
    },
    watch: {
        $route: {
            immediate: true,
            handler(to, from) {
                document.title = to.meta.title || 'Divitiae';
            }
        },
    },
    methods: {
    showLoader() {
      return this.$loading.show({
        container: this.$refs.loadingArea,
        // otras configuraciones
      });
    },
  }
  }
</script>