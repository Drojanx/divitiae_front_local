import { createStore } from 'vuex'
import VuexPersistence from 'vuex-persist'

export default createStore({
  state: {
    colorMode: 'light',
    user: null,
    sampleButton: true,
    appClass: null,
    environment: null,
    isAdminInCurrentEnv: null,
    stateWorkspace: null,
    stateApp: null,
    stateItems: [],
    stateItemDetail: null,
    stateTaskDetail: null,
    stateItemLogs: [],
    loadingItemLogs: false,
    stateNewItem: null,
    stateNewAppFormIsOpen: false,
    editingUser: null,
    originalItemStructure: null,
    selectedItems: [],
    selectedItem: {},
    stateFieldTypes: [
      {
        display: 'Text',
        value: 'string'
     }, 
     {
        display: 'Int Number',
        value: 'int'
     }, 
     { 
        display: 'Decimal Number', 
        value: 'decimal'
     }, 
     {
        display: 'Currency',
        value: 'currency'
     }, 
     {  
        display: 'Date',
        value: 'date'
     },  
     {  
        display: 'Date-Time',
        value: 'datetime'
     }, 
     { 
        display: 'Boolean',
        value: 'boolean'
     }, 
     {  
        display: 'Item Relation',
        value: 'itemRelation'
     }
    ]
  },
  getters: {
    colorMode: (state) => {
      return state.colorMode;
    },
    user: (state) => {
      return state.user;
    },
    sampleButton: (state) => {
      return state.sampleButton;
    },
    appClass: (state) => {
      return state.appClass;
    },
    environment: (state) => {
      return state.environment;
    },
    isAdminInCurrentEnv: (state) => {
      return state.isAdminInCurrentEnv;
    },
    stateWorkspace: (state) => {
      return state.stateWorkspace;
    },
    stateApp: (state) => {
      return state.stateApp;
    },
    stateItems: (state) => {
      return state.stateItems;
    },
    stateItemDetail: (state) => {
      return state.stateItemDetail;
    },
    stateTaskDetail: (state) => {
      return state.stateTaskDetail;
    },
    selectedItems: (state) => {
      return state.selectedItems;
    },
    selectedItem: (state) => {
      return state.selectedItem;
    },
    stateItemLogs: (state) => {
      return state.stateItemLogs;
    },
    loadingItemLogs: (state) => {
      return state.loadingItemLogs;
    },
    stateNewItem: (state) => {
      return state.stateNewItem;
    },
    stateNewAppFormIsOpen: (state) => {
      return state.stateNewAppFormIsOpen;
    },
    stateFieldTypes: (state) => {
      return state.stateFieldTypes;
    },
    editingUser: (state) => {
      return state.editingUser;
    }
    ,
    originalItemStructure: (state) => {
      return state.originalItemStructure;
    }
  },
  mutations: {
    colorMode(state, colorModePayload) {
      state.colorMode =  colorModePayload;
    },
    user(state, userPayload) {
      state.user =  userPayload;
    },
    modifyUserTask(state, payload){
      var index = state.user.userTasks.findIndex(t => t.id == payload.id);
      state.user.userTasks[index] = payload;
    },
    completeUserTask(state, payload){
      var index = state.user.userTasks.findIndex(t => t.id == payload.id);
      state.user.userTasks[index].finised = true;
    },
    addUserTask(state, payload){
      state.user.userTasks.push(payload)
    },
    sampleButton(state, sampleButtonPayload) {
      state.sampleButton =  sampleButtonPayload;
    },
    appClass(state, appClassPayload) {
      state.appClass =  appClassPayload;
    },
    environment(state, environmentPayload) {
      state.environment =  environmentPayload;
    },
    environmentName(state, environmentNamePayload) {
      state.environment.environmentName =  environmentNamePayload.environmentName;
      state.environment.environmentNameURL =  environmentNamePayload.environmentNameURL;
    },
    addWorkspaceToEnvironment(state, newWorkspace) {
      state.environment.workspaces.push(newWorkspace);
    },
    addAppToWorkspace(state, payload) {
      state.environment.workspaces.find(ws => ws.id == payload.wsId).apps.push(payload.app);
    },
    addUserToEnvironment(state, newUser) {
      state.environment.usersData.push(newUser);
    },
    updateUserAdminPermission(state, editedUser) {
      state.environment.usersData.find(x=>x.userId == editedUser.userId).isAdmin = editedUser.isAdmin;
      state.editingUser.workEnvironment.isAdmin = editedUser.isAdmin;
    },
    updateUserOwnerPermission(state, editedUser) {
      state.environment.usersData.find(x=>x.userId == editedUser.userId).isOwner = editedUser.isOwner;
      state.editingUser.workEnvironment.isOwner = editedUser.isOwner;
    },
    removeCurrentUserFromEnvironment(state, envId) {
      state.user.workEnvironments.forEach((item, index) => {
        if(item.id == envId) {
          state.user.workEnvironments.splice(index, 1);
        }
      })
    },
    removeUserFromEnvironment(state, removeUserId) {
      state.environment.usersData.forEach((item, index) => {
        if (item.userId == removeUserId) {
          state.environment.usersData.splice(index, 1);
        }
      });
    },
    removeAppWorkspace(state, removeAppId) {
      state.stateWorkspace.apps.forEach((item, index) => {
        if (item.id == removeAppId) {
          state.stateWorkspace.apps.splice(index, 1);
        }
      });
    },
    removeWorkspaceFromEnvironment(state, removeWsId) {
      state.environment.workspaces.forEach((item, index) => {
        if (item.id == removeWsId) {
          state.environment.workspaces.splice(index, 1);
        }
      });
    },
    isAdminInCurrentEnv(state, isAdminPayload) {
      state.isAdminInCurrentEnv =  isAdminPayload;
    },
    stateWorkspace(state, workspacePayload) {
      state.stateWorkspace =  workspacePayload;
    },
    stateApp(state, appPayload) {
      state.stateApp =  appPayload;
    },
    stateItems(state, itemsPayload) {
      state.stateItems =  itemsPayload;
    },
    stateItemDetail(state, itemDetailPayload) {
      state.stateItemDetail =  itemDetailPayload;
    },
    stateTaskDetail(state, taskDetailPayload) {
      state.stateTaskDetail =  taskDetailPayload;
    },
    addItemToStateItems(state, newItemPayload) {
      state.stateItems.unshift(newItemPayload);
    },
    selectedItems(state, selectedItemsPayload) {
      state.selectedItems =  selectedItemsPayload;
    },
    selectedItem(state, selectedItemPayload) {
      state.selectedItem =  selectedItemPayload;
    },
    stateItemLogs(state, itemLogsPayload) {
      state.stateItemLogs.push(itemLogsPayload);
    },
    emptyStateItemLogs(state) {
      state.stateItemLogs = [];
    },
    loadingItemLogs(state, loadingItemLogsPayload) {
      state.loadingItemLogs =  loadingItemLogsPayload;
    },
    stateNewItem(state, newItemPayload) {
      state.stateNewItem =  newItemPayload;
    },
    updateItem(state, itemUpdatePayload) {
      state.stateItems.find(item => item._id == itemUpdatePayload._id);
    },
    stateNewAppFormIsOpen(state, newAppPayloadIsOpen) {
      state.stateNewAppFormIsOpen =  newAppPayloadIsOpen;
    },
    stateFieldTypes(state, stateFieldTypesPayload) {
      state.stateFieldTypes =  stateFieldTypesPayload;
    },
    editingUser(state, stateFieldTypesPayload) {
      state.editingUser =  stateFieldTypesPayload;
    },
    originalItemStructure(state, originalItemStructurePayload) {
      state.originalItemStructure =  originalItemStructurePayload;
    }
  },
  actions: {
    colorMode(context, colorMode) {
      context.commit('colorMode', colorMode);
    },
    user(context, user) {
      context.commit('user', user);
    },
    modifyUserTask(context, modifyUserTask) {
      context.commit('modifyUserTask', modifyUserTask);
    },
    completeUserTask(context, completeUserTask) {
      context.commit('completeUserTask', completeUserTask);
    },
    addUserTask(context, newUserTask) {
      context.commit('addUserTask', newUserTask);
    },
    sampleButton(context, sampleButton) {
      context.commit('sampleButton', sampleButton);
    },
    appClass(context, appClass) {
      context.commit('appClass', appClass);
    },
    environment(context, environment) {
      context.commit('environment', environment);
    },
    environmentName(context, environmentName) {
      context.commit('environmentName', environmentName);
    },
    addWorkspaceToEnvironment(context, addWorkspaceToEnvironment) {
      context.commit('addWorkspaceToEnvironment', addWorkspaceToEnvironment);
    },
    addAppToWorkspace(context, newAppInfo) {
      context.commit('addAppToWorkspace', newAppInfo);
    },    
    addUserToEnvironment(context, newUserInfo) {
      context.commit('addUserToEnvironment', newUserInfo);
    },
    updateUserAdminPermission(context, editedUser){
      context.commit('updateUserAdminPermission', editedUser);
    },
    updateUserOwnerPermission(context, editedUser){
      context.commit('updateUserOwnerPermission', editedUser);
    },
    removeCurrentUserFromEnvironment(context, envId) {
      context.commit('removeCurrentUserFromEnvironment', envId);
    },
    removeUserFromEnvironment(context, userId) {
      context.commit('removeUserFromEnvironment', userId);
    },
    removeAppWorkspace(context, appId) {
      context.commit('removeAppWorkspace', appId);
    },
    removeWorkspaceFromEnvironment(context, wsId) {
      context.commit('removeWorkspaceFromEnvironment', wsId);
    },
    isAdminInCurrentEnv(context, isAdminInCurrentEnv) {
      context.commit('isAdminInCurrentEnv', isAdminInCurrentEnv);
    },
    stateWorkspace(context, stateWorkspace) {
      context.commit('stateWorkspace', stateWorkspace);
    },
    stateApp(context, stateApp) {
      context.commit('stateApp', stateApp);
    },
    stateItems(context, stateItems) {
      context.commit('stateItems', stateItems);
    },
    addItemToStateItems(context, addItemToStateItems) {
      context.commit('addItemToStateItems', addItemToStateItems);
    },
    stateItemDetail(context, stateItemDetail) {
      context.commit('stateItemDetail', stateItemDetail);
    },
    stateTaskDetail(context, stateTaskDetail) {
      context.commit('stateTaskDetail', stateTaskDetail);
    },
    selectedItems(context, selectedItems) {
      context.commit('selectedItems', selectedItems);
    },
    selectedItem(context, selectedItem) {
      context.commit('selectedItem', selectedItem);
    },
    stateItemLogs(context, stateItemLogs) {
      context.commit('stateItemLogs', stateItemLogs);
    },
    emptyStateItemLogs(context) {
      context.commit('emptyStateItemLogs');
    },
    loadingItemLogs(context, loadingItemLogs) {
      context.commit('loadingItemLogs', loadingItemLogs);
    },
    stateNewItem(context, stateNewItem) {
      context.commit('stateNewItem', stateNewItem);
    },
    updateItem(context, updateItem) {
      context.commit('updateItem', updateItem);
    },
    stateNewAppFormIsOpen(context, stateNewAppFormIsOpen) {
      context.commit('stateNewAppFormIsOpen', stateNewAppFormIsOpen);
    },
    stateFieldTypes(context, stateFieldTypes) {
      context.commit('stateFieldTypes', stateFieldTypes);
    },
    editingUser(context, editingUser) {
      context.commit('editingUser', editingUser);
    },
    originalItemStructure(context, originalItemStructure) {
      context.commit('originalItemStructure', originalItemStructure);
    }
  },
  plugins: [
    new VuexPersistence({
      storage: window.localStorage,
      reducer: (state) => ({user: state.user, environment: state.environment, colorMode: state.colorMode})
    }).plugin
  ]
  
})
