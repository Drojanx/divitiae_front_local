import { createApp } from 'vue'
import './styles.scss'
import './style.css'
import App from './App.vue'
import { router } from './router'
import store from './store'
import './axios'
import { LoadingPlugin } from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons'
import VueLodash from 'vue-lodash'
import lodash from 'lodash'
import Notifications from '@kyvg/vue3-notification'
import PrimeVue from 'primevue/config';
import 'primevue/resources/primevue.min.css'
import 'primevue/resources/themes/aura-light-green/theme.css'
import Dropdown from 'primevue/dropdown';
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css';
import 'primeicons/primeicons.css';
import Button from 'primevue/button';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { ChevronDownIcon } from '@heroicons/vue/20/solid'
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';   // optional
import Row from 'primevue/row';      
import Tooltip from 'primevue/tooltip';
import ProgressSpinner from 'primevue/progressspinner';
import Textarea from 'primevue/textarea';
import FloatLabel from 'primevue/floatlabel';
import ConfirmationService from 'primevue/confirmationservice';
import ConfirmPopup from 'primevue/confirmpopup';
import ToastService from 'primevue/toastservice';



library.add(fas)

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBA-80mIOsWvMPSeIx7wewM0nThnnVkXeI",
  authDomain: "divitiae-app.firebaseapp.com",
  projectId: "divitiae-app",
  storageBucket: "divitiae-app.appspot.com",
  messagingSenderId: "791250432045",
  appId: "1:791250432045:web:9ad212e7b236b1286988a4"
};

initializeApp(firebaseConfig);

const app = createApp(App);

app.config.globalProperties.$loading = LoadingPlugin;

app.use(store).use(router).use(LoadingPlugin).use(VueLodash).use(lodash).use(Notifications).use(PrimeVue).use(ConfirmationService).use(ConfirmPopup).use(ToastService)
  .component('fa', FontAwesomeIcon)
  .component('v-select', vSelect)
  .component('Dropdown', Dropdown)
  .component('Button', Button)
  .component('Menu', Menu)
  .component('MenuButton', MenuButton)
  .component('MenuItems', MenuItems)
  .component('MenuItem', MenuItem)
  .component('DataTable', DataTable)
  .component('Column', Column)
  .component('ColumnGroup', ColumnGroup)
  .component('Row', Row)
  .component('ChevronDownIcon', ChevronDownIcon)
  .component('ProgressSpinner', ProgressSpinner)
  .component('Textarea', Textarea)
  .component('FloatLabel', FloatLabel)
  .directive('tooltip', Tooltip);
app.mount('body')
