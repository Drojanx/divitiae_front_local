import HomeView from '../views/HomeView.vue'
import PageNotFoundView from '../views/PageNotFoundView.vue'
import EnvironmentView from '../views/EnvironmentView.vue'
import EnvironmentConfigView from '../views/EnvironmentConfigView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import RootView from '../views/RootView.vue'
import ForgotView from '../views/ForgotView.vue'
import Workspace from '../components/Workspace.vue'
import PageNotFound from '../components/NotFound/PageNotFound.vue'
import EnvironmentNotFound from '../components/NotFound/EnvironmentNotFound.vue'
import WorkspaceNotFound from '../components/NotFound/WorkspaceNotFound.vue'
import AppNotFound from '../components/NotFound/AppNotFound.vue'
import ItemNotFound from '../components/NotFound/ItemNotFound.vue'
import AddUserForm from '../components/AddUser.vue'
import NewItem from '../components/NewItem.vue'
import TaskDetail from '../components/TaskDetail.vue'
import WorkspaceApp from '../components/WorkspaceApp.vue'
import ItemDetail from '../components/ItemDetail.vue'
import NewAppForm from '../components/NewAppForm.vue'
import UserInfo from '../components/UserInfo.vue'
import LogOutView from '../views/LogOutView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import axios from 'axios';
import createStore from '../store/index.js';
import { useLoading } from 'vue-loading-overlay';

const { loading, show, hide } = useLoading();

// Función de comprobación de autenticación
function checkAuthentication(to) {
  const token = localStorage.getItem('token');

  const requiresAuth = to.meta.requiresAuth;
  
  if (requiresAuth && !token) {
    
    // Si la ruta requiere autenticación y el usuario no está logueado, redireccionar a '/login'
    router.push({
      name: 'login',
      query: to.query,
      hash: to.hash
    })
  } else if (!requiresAuth && token && to.fullPath != '/page-not-found') {
    // Si la ruta no requiere autenticación y el usuario está logueado, redireccionar a '/home'
    router.push({
      name: 'home',
      query: to.query,
      hash: to.hash
    })
    
  }
}


// Revisa si la vista que se va a acceder requiere permisos de admin
function checkAdminPermissions(to, from, next) {
  const envId = to.params.id;
  const requiresAdmin = to.meta.requiresAdmin;
  const userId = createStore.getters.user.userId;
  var isAdmin = createStore.getters.environment.usersData.find(role => role.userId == userId).isAdmin;
  // Si los requiere y no es admin, redirige a Home. Si no, sigue.
  if (requiresAdmin && !isAdmin) {
    next('/home');
  } else {
    next();
  }  
}


async function getEnvironment(environmentNameURL, to, next) {
  // Busca el environment en la información del usuario en store
  var we = createStore.getters.user.workEnvironments.find(we => we.environmentNameURL == environmentNameURL);
  let loader = show({
    color: "#ffc107",
    width: 80,
    height: 80
  });
  //Si no existe en los datos del usuario, redirige a página de Not Found
  if (we == undefined) {
    loader.hide();
    createStore.dispatch('environment', null);
    createStore.dispatch('isAdminInCurrentEnv', null);
    router.push({
      name: 'environment-not-found',
      params: { pathMatch: to.path.substring(1).split("/")},
      query: to.query,
      hash: to.hash
    })
  } //Si existe hace llamada API para recibir información completa del environment
  else {
  
    await axios
      .get(`environment/${we.id}`)
      .then((response) => {
        // Crea variable con la información recibida y le añade el nombre de URL
        var env = response.data.weData;
        env.environmentNameURL = we.environmentNameURL;
        let existingNames = {};
        //Revisa todos los workspaces del environment y modifica sus nombres de URL. Si hay 2 workspaces con el mismo
        //nombre, añade al final del nobmre de URL de uno de ellos un (1), si hay otro (2)...
        env.workspaces.forEach((ws) => {
          let nombreUrlFriendly = ws.workspaceName.toLowerCase().replace(/ /g, "-").replace(/[^a-zA-Z0-9-]/g, "");
          
          // Verifica si ya existe el nombreUrlFriendly
          if (existingNames[nombreUrlFriendly] !== undefined) {
              // Genera un nuevo nombre único
              let count = existingNames[nombreUrlFriendly]++;
              nombreUrlFriendly += `(${count})`;
          } else {
            existingNames[nombreUrlFriendly] = 1;
          }
          ws.workspaceNameURL = nombreUrlFriendly;

          let existingAppNames = {}
          //Revisa también los nombres de las apps y hace lo mismo con sus nombres de URL
          ws.apps.forEach((app) => {
            let nombreAppUrlFriendly = app.appName.toLowerCase().replace(/ /g, "-").replace(/[^a-zA-Z0-9-]/g, "");
          
            // Verifica si ya existe el nombreUrlFriendly
            if (existingAppNames[nombreAppUrlFriendly] !== undefined) {
                // Genera un nuevo nombre único
                let count = existingNames[nombreAppUrlFriendly]++;
                nombreAppUrlFriendly += `(${count})`;
            } else {
              existingAppNames[nombreAppUrlFriendly] = 1;
            }

            app.appNameURL = nombreAppUrlFriendly;
          })
        });
        // Guarda la información del environment y el permiso del usuario actual en el mismo en store
        createStore.dispatch('environment', env);
        createStore.dispatch('isAdminInCurrentEnv', we.isAdmin);
        
        loader.hide();
      })
      .catch((error) => {
        console.error('Error al obtener detalles del entorno:', error);
        // Redireccionar a otra página en caso de error, por ejemplo:
        router.push('/error');
        loader.hide();
      });
  }
}

async function getWorkspace(workspaceNameURL, to){
  let loader = show({
    color: "#ffc107",
    width: 80,
    height: 80
  });
    if(createStore.getters.environment) {
      //Busca el workspace por su nombre de URL en el environment almacenado en store
      var currentWs = createStore.getters.environment.workspaces.find(ws => ws.workspaceNameURL == workspaceNameURL);

      //Si no existe, redirige a página de Not Found
      if (currentWs == undefined){
        
        router.push({
          name: 'workspace-not-found',
          params: { pathMatch: to.path.substring(1).split("/")},
          query: to.query,
          hash: to.hash
        })
      } //Si existe, almacena su información en state y resetea el valor de la app e items actuales en state a null 
      else {

        createStore.dispatch('stateWorkspace', currentWs);
        createStore.dispatch('stateApp', null);
        createStore.dispatch('stateItems', []);
      }
    }
  loader.hide();
}


async function getWorkspaceApp(appNameURL, to){
  let loader = show({
    color: "#ffc107",
    width: 80,
    height: 80
  });
  var loadedItems = [];
  if (createStore.getters.stateWorkspace) {
    //Busca la app por su nombre de URL en el workspace almacenado en store
    var loadedApp = createStore.getters.stateWorkspace.apps.find(app => app.appNameURL == appNameURL);
    //Si no existe, redirige a página de Not Found
    if (loadedApp == undefined) {
      router.push({
        name: 'app-not-found',
        params: { pathMatch: to.path.substring(1).split("/")},
        query: to.query,
        hash: to.hash
      })
    }//Si existe, almacena en store un objeto originalItemStructure con su estructura original para poder trabajar más fácilmente
    //posibles modificaciones posteriores de sus items  
    else {
      
      var originalItemStructure = {
        descriptiveName: '',
        fieldsValue: loadedApp.fields,
        fieldsRelationValue: loadedApp.relationFields
      }
      originalItemStructure.fieldsValue.forEach((e) => {
        switch (e.type) {
          case "string":
              e.value = "";
              break;
          case "int":
            e.value = "0";
              break;
          case "decimal":
            e.value = "0";
              break;
          case "currency":
            e.value = "0";
              break;
          case "date":
            e.value = "0";
              break;
          case "boolean":
            e.value = false;
              break;
        }
      })
      originalItemStructure.fieldsRelationValue.forEach((e) => {
        e.relatedItems = []
      })
      createStore.dispatch('originalItemStructure', originalItemStructure);
  
      if (loadedApp == undefined) {
        router.push({
          name: 'app-not-found',
          params: { pathMatch: to.path.substring(1).split("/")},
          query: to.query,
          hash: to.hash
        })
      }//Si todo es correcto, almacena la información de la app en store 
      else {
        createStore.dispatch('stateApp', loadedApp);

        const params = {
          offset: 0,
          ascending: false
        }
        
        await populateStateItems(loadedApp.id, loadedItems, params);

      }
      
    }
    loader.hide();
    }


}

async function populateStateItems(appId, loadedItems, params){
  //Hace llamada API para traer los items de la app paginados según los parametros propuestos
  //En este caso, con offset 0 y en orden descendente. Luego, los almacena en store
  await axios.get(`app/${appId}/item/paginated`, { params })
          .then((response) => {
  
            response.data.forEach(async (item) => {
              let fixedItem = await fixItem(item)
      
              loadedItems.push(fixedItem);
      
            });
              createStore.dispatch('stateItems', loadedItems);

              console.log(response)
          }); 
}

//Modifica un item para que sea más fácil de tratar en la web
async function fixItem(item){
  let fixedItem = {
    _id: '',
    _descriptiveName: '',
    fields: {},
    relationFields: {},
    relatedItemsByAppId: {}
  }
  //console.log(item)
  var fixedValues = {};
  var fixedRelationValues = {};
  item.fieldsValue.forEach((value) => {
      //Modifica los campos de fecha para que sean mejor tratables en la web
      if (value.type == "date" || value.type == "datetime") {
        let date = new Date(value.value * 1000);
        const offset = date.getTimezoneOffset();
        date = new Date(date.getTime() - (offset*60*1000));
        fixedValues[`${value.id}`] = date.toISOString().split('T')[0];
      } else {
        fixedValues[`${value.id}`] = value.value;
      }


  })

  item.fieldsRelationValue.forEach((relationValue) => {
    //Hace que los campos de relación sea una lista de objetos accesibles por su propio ID
    if (!fixedRelationValues[`${relationValue.id}`]){
      fixedRelationValues[`${relationValue.id}`] = {};
      //Luego, crea una lista relatedItems
      fixedRelationValues[`${relationValue.id}`]['relatedItems'] = [];
      fixedRelationValues[`${relationValue.id}`]['appNameURL'] = '';
      fixedRelationValues[`${relationValue.id}`]['workspaceNameURL'] = '';
    }

    console.log("aqui")
    console.log(item)
    relationValue.value.relatedItems.forEach((value) => {
      //Almacena el valor de la relación en la lista relatedItems
      fixedRelationValues[`${relationValue.id}`]['relatedItems'].push(value);
      var appURL = ''
      createStore.getters.environment.workspaces.forEach((ws) => {
        ws.apps.forEach((app) => {
          console.log(app.id)
          console.log(relationValue.value.relatedAppId)
          if (app.id == relationValue.value.relatedAppId){
            appURL = app.appNameURL;
          }
        })
      })
      console.log(appURL)
      fixedRelationValues[`${relationValue.id}`]['appNameURL'] = appURL;
      console.log("hola")
      var wsURL = createStore.getters.environment.workspaces.find((ws) => ws.id == relationValue.value.relatedWorkspaceId).workspaceNameURL;
      console.log("hola")
      fixedRelationValues[`${relationValue.id}`]['workspaceNameURL'] = wsURL;
    })
  })

  fixedItem._id = item.id.toString();
  fixedItem._descriptiveName = item.descriptiveName;
  fixedItem.fields = fixedValues;
  fixedItem.relationFields = fixedRelationValues;

  //Se hace lo mismo que con los campos de relación directa
  item.relations.forEach((relation) => {
      
      const { relatedAppId } = relation;
      var relatedWorkspaceNameURL = '';
      createStore.getters.environment.workspaces.forEach((ws) => {
        ws.apps.forEach((app)=> {
          if (app.id == relation.relatedAppId){
            relatedWorkspaceNameURL = ws.workspaceNameURL;
          }
        })
      });
      var appURL = '';
      createStore.getters.environment.workspaces.forEach(ws => {
        ws.apps.forEach(app => {
          if (app.id == relation.relatedAppId){
            appURL = app.appNameURL;
          }
        })
      })
      //var relatedAppName = createStore.getters.stateWorkspace.apps.find((app) => app.id == relation.relatedAppId).appName;
      
      if (!fixedItem.relatedItemsByAppId[relatedAppId]) {
          // Si la lista para 'relatedAppId' no existe, crea una nueva.
          fixedItem.relatedItemsByAppId[relatedAppId] = {};
          fixedItem.relatedItemsByAppId[relatedAppId]['relatedItems'] = [];
          fixedItem.relatedItemsByAppId[relatedAppId]['appName'] = '';
          fixedItem.relatedItemsByAppId[relatedAppId]['appNameURL'] = '';
          fixedItem.relatedItemsByAppId[relatedAppId]['workspaceNameURL'] = '';
      }

      fixedItem.relatedItemsByAppId[relatedAppId]['appNameURL'] = appURL;
      fixedItem.relatedItemsByAppId[relatedAppId]['appName'] = relation.relatedAppName;
      //var wsURL = createStore.getters.environment.workspaces.find((ws) => ws.id == relation.relatedWorkspaceId).workspaceNameURL;
      fixedItem.relatedItemsByAppId[relatedAppId]['workspaceNameURL'] = relatedWorkspaceNameURL;
      
      relation.relatedItems.forEach((relatedItem) => {
        var fixedRelatedItem = {
            relatedItemId: relatedItem.relatedItemId,
            relatedItemName: relatedItem.relatedItemName
        }
        fixedItem.relatedItemsByAppId[relatedAppId]['relatedItems'].push(fixedRelatedItem);

      })
  });

  return fixedItem;
}

async function getItem(itemId, to){
      console.log("hola")
  let loader = show({
    color: "#ffc107",
    width: 80,
    height: 80
  });
  //Busca el item en store
  let item = createStore.getters.stateItems.find(item => item._id == itemId);
  let app = createStore.getters.stateApp;
  
  //Si existe, almacena su información en store en stateItemDetail. Si no, hace llamada API para obtener su información
  item ? createStore.dispatch('stateItemDetail', item) :
   await axios.get(`app/${app.id}/item/${itemId}`)
    .then(async (response) => {
      console.log(await fixItem(response.data))
      createStore.dispatch('stateItemDetail', await fixItem(response.data))
    })
    .catch(() => {
      //Si falla, redirige a página de Not Found
      router.push({
        name: 'item-not-found',
        params: { pathMatch: to.path.substring(1).split("/")},
        query: to.query,
        hash: to.hash
      })
      loader.hide();
    })
 
  
  //Ahora, hace llamada API para recibir los itemActivityLogs del Item actual
  let logs = null;
  //Para añadir una animación de carga en el contenedor dónde aparecerán los logs
  createStore.dispatch('loadingItemLogs', true)
  await axios.get(`app/${app.id}/item/${itemId}/itemactivitylog`)
    .then((response) => {
    
      logs = response.data;

      logs.forEach( async (element) => {
          //Pide la información del usuario que creó el log
          await axios.get(`user/${element.creatorId}`)
              .then((response) => {
                  element.creatorName = response.data.name + " " + response.data.lastName;
                  logs.forEach((log) => {
                      log.fixedDate = fixDate(log.unixCreatedOn);
                      
                  });

              })
          //Almacena los logs en store
          createStore.dispatch('stateItemLogs', element);

      });
      //Deja de cargar
      createStore.dispatch('loadingItemLogs', false)
      loader.hide();
    })
    .catch((err) => {
      loader.hide();
    });
}

//Formatea una fecha timestamp
function fixDate(unixDate){
  let date = new Date(unixDate * 1000);
/*   const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - (offset*60*1000)); */
  return date.getDate().toString().padStart(2, "0") + "/" + 
          date.getMonth().toString().padStart(2, "0") + "/" + 
          date.getFullYear().toString().padStart(2, "0") + " - " + 
          date.getHours().toString().padStart(2, "0") + ":" + 
          date.getMinutes().toString().padStart(2, "0") + ":" + 
          date.getSeconds().toString().padStart(2, "0");
}

//Guarda en store la información necesaria para el formulario de nuevo item
async function newItemForm() {
  let app = createStore.getters.stateApp;

  let newItem = {
    _descriptiveName: ""
  }

  app.fields.forEach((field) => {
    newItem[field.nameAsProperty] = ""
  })
  createStore.dispatch('stateNewItem', newItem);
}

async function getUserPermissionsOnWorkEnvironment(userId, environmentNameURL) {
  let loader = show({
    color: "#ffc107",
    width: 80,
    height: 80
  });
  //Busca el environment en los datos del user y hace llamada API para obtener sus permisos en el mismo
  var we = createStore.getters.user.workEnvironments.find(we => we.environmentNameURL == environmentNameURL);
  await axios
    .get(`user/permissions/${userId}/environment/${we.id}`)
    .then((res) => {
      var resWe = res.data.userData.workEnvironments.find(resWe => resWe.id == we.id);
      //Se crea un objeto para manejar más fácilmente los permisos del usuario en el environment
      var fixedWe = {
        environmentName: resWe.environmentName,
        id: resWe.id,
        isAdmin: resWe.isAdmin,
        isOwner: resWe.isOwner,
        workspaces: {}
      }
      //Determina por cada workspace si el usuario tiene acceso a este
      we.workspaces.forEach(ws => {
        var resWs = resWe.workspaces.find(resWs => resWs == ws);
        if (resWs == undefined) {
          fixedWe.workspaces[ws] = false;
        } else {
          fixedWe.workspaces[ws] = true;
        }
      })

      var editingUserInfo = {
        userEmail: res.data.userData.userEmail,
        userId: res.data.userData.userId,
        userLastName: res.data.userData.userLastName,
        userName: res.data.userData.userName,
        workEnvironment: fixedWe
      }
      //Almacena la información del usuario en store
      createStore.dispatch('editingUser', editingUserInfo);
    })
  loader.hide();  
}

async function getTask(taskId, to){
  //Busca la task en la ifnormación del usuario y la guarda en sotre en stateTaskDetail
  var task = createStore.getters.user.userTasks.find(x => x.id == taskId);
  createStore.dispatch('stateTaskDetail', task);
}


const routes = [
  {
    path: '/',
    name: 'root',
    component: RootView,
    meta: { requiresAuth: false }, // Esta ruta no requiere autenticación
    //beforeEnter: checkAuthentication()
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }, // Esta ruta requiere autenticación
    //beforeEnter: checkAuthentication()
    children: [
      {
        path: 'task-detail/:taskId',
        name: 'task-detail',
        meta: { requiresAuth: true }, // Esta ruta requiere autenticación
        component: TaskDetail,
        beforeEnter: async  (to) => {
          //checkAuthentication(to);
          await getTask(to.params.taskId, to);      
        }
      }
    ]
  },
  {
    path: '/environment/:pathMatch(.*)*',
    name: 'environment-not-found',
    component: EnvironmentNotFound,
    meta: { requiresAuth: true }, // Esta ruta requiere autenticación
    //beforeEnter: checkAuthentication()
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'workspace-not-found',
    component: WorkspaceNotFound,
    meta: { requiresAuth: true }, // Esta ruta requiere autenticación        
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'app-not-found',
    component: AppNotFound,
    meta: { requiresAuth: true }, // Esta ruta requiere autenticación        
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'item-not-found',
    component: ItemNotFound,
    meta: { requiresAuth: true }, // Esta ruta requiere autenticación        
  },
  {
    path: '/environment/:environmentNameURL',
    name: 'environment',
    component: EnvironmentView,
    meta: { requiresAuth: true }, // Esta ruta requiere autenticación
    beforeEnter: async  (to) => {
      //checkAuthentication(to);
      const environmentNameURL = to.params.environmentNameURL;
      await getEnvironment(environmentNameURL, to);      
    },
    children: [      
      {
        path: ':workspaceNameURL',
        name: 'workspace',
        meta: { requiresAuth: true }, // Esta ruta requiere autenticación
        component: Workspace,
        beforeEnter: async  (to, from) => {
          //checkAuthentication;
          const environmentNameURL = to.params.environmentNameURL;
          const workspaceNameURL = to.params.workspaceNameURL;
          if (!createStore.getters.environment){
            await getEnvironment(environmentNameURL, to);
          }
          
          await getWorkspace(workspaceNameURL, to);          
        },
        children: [
          {
            path: 'new-app-form',
            name: 'new-app-form',
            meta: { requiresAuth: true }, // Esta ruta requiere autenticación
            component: NewAppForm,
            beforeEnter: async  (to, from) => {
              //checkAuthentication;
              const environmentNameURL = to.params.environmentNameURL;
              const workspaceNameURL = to.params.workspaceNameURL;
              if (!createStore.getters.environment){
                await getEnvironment(environmentNameURL, to);
              }
              
              await getWorkspace(workspaceNameURL, to);
    
            }
          },
          {
            path: ':appNameURL',
            name: 'app',
            meta: { requiresAuth: true }, // Esta ruta requiere autenticación
            component: WorkspaceApp,
            beforeEnter: async  (to, from) => {
              //checkAuthentication;
              const environmentNameURL = to.params.environmentNameURL;
              const workspaceNameURL = to.params.workspaceNameURL;
              const appNameURL = to.params.appNameURL;
              if (!createStore.getters.stateWorkspace){
                if (!createStore.getters.environment){
                  await getEnvironment(environmentNameURL, to);
                }              
                await getWorkspace(workspaceNameURL, to);
              }

              await getWorkspaceApp(appNameURL, to)
            },
            children: [
              {
                path: 'item/:itemId',
                name: 'item',
                meta: { requiresAuth: true },
                component: ItemDetail,
                beforeEnter: async (to, from, next) => {
                  //checkAuthentication;
                  const environmentNameURL = to.params.environmentNameURL;
                  const workspaceNameURL = to.params.workspaceNameURL;
                  const appNameURL = to.params.appNameURL;
                  const itemId = to.params.itemId;
                  if (!createStore.getters.ItemDetail){
                    if (!createStore.getters.stateWorkspace){
                      if (!createStore.getters.environment){
                        await getEnvironment(environmentNameURL, to);
                      }                      
                      await getWorkspace(workspaceNameURL, to);
                    }
                    await getWorkspaceApp(appNameURL, to)
                  }
                  await getItem(itemId, to);
                  next();
                }
              },
              {
                path: 'new-item',
                name: 'new-item',
                meta: { requiresAuth: true },
                component: NewItem,
                beforeEnter: async (to, from, next) => {
                  //checkAuthentication;
                  const environmentNameURL = to.params.environmentNameURL;
                  const workspaceNameURL = to.params.workspaceNameURL;
                  const appNameURL = to.params.appNameURL;
                  if (!createStore.getters.ItemDetail){
                    if (!createStore.getters.stateWorkspace){
                      if (!createStore.getters.environment){
                        await getEnvironment(environmentNameURL, to);
                      }                      
                      await getWorkspace(workspaceNameURL, to);
                    }
                    await getWorkspaceApp(appNameURL, to)
                  }
                  await newItemForm();
                  next();
                }
              }
            ]
          }
        ]
      }
    ]    
    
  },
  {
    path: '/environment/:environmentNameURL/configuration',
    name: 'environmentConfigView',
    component: EnvironmentConfigView,
    meta: { requiresAuth: true, requiresAdmin: true }, // Esta ruta requiere autenticación
    beforeEnter: async  (to, from, next) => {
      //checkAuthentication;
      checkAdminPermissions;
      const environmentNameURL = to.params.environmentNameURL;
      await getEnvironment(environmentNameURL, to);
      next();
    },
    children: [ 
      {
        path: '/environment/:environmentNameURL/configuration/add-user',
        name: 'environmentAddUserView',
        component: AddUserForm,
        meta: { requiresAuth: true, requiresAdmin: true }, // Esta ruta requiere autenticación
        beforeEnter: async (to, from, next) => {
          //checkAuthentication;
          checkAdminPermissions;
          const environmentNameURL = to.params.environmentNameURL;
          if (!createStore.getters.environment){
            await getEnvironment(environmentNameURL, to);
          }
          next();
        }
      },
      {
        path: '/environment/:environmentNameURL/configuration/edit-user/:userId',
        name: 'edit-user',
        component: UserInfo,
        meta: { requiresAuth: true, requiresAdmin: true }, // Esta ruta requiere autenticación
        beforeEnter: async (to, from, next) => {
          //checkAuthentication;
          checkAdminPermissions;
          const environmentNameURL = to.params.environmentNameURL;
          const userId = to.params.userId;

          await getUserPermissionsOnWorkEnvironment(userId, environmentNameURL);

          next();
        }
      }
    ]
  },
  {
   
    
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: PageNotFound
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }, // Esta ruta no requiere autenticación
    //beforeEnter: checkAuthentication
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignupView,
    meta: { requiresAuth: false }, // Esta ruta no requiere autenticación
    //beforeEnter: checkAuthentication
  },
  {
    path: '/forgot',
    name: 'forgot',
    component: ForgotView,
    meta: { requiresAuth: false }, // Esta ruta no requiere autenticación
    //beforeEnter: checkAuthentication,
  },
  {
    path: '/logout',
    name: 'logout',
    component: LogOutView,
    meta: { requiresAuth: true } // Esta ruta no requiere autenticación
    
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})  

router.beforeEach((to) => {
  checkAuthentication(to)
})


export {router, getWorkspaceApp, getWorkspace, getEnvironment, getItem, fixDate, fixItem, populateStateItems, getTask}
