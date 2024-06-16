<Dialog  :class="'b-less-'+colorMode+' txt-'+colorMode" v-model:visible="visibleTask" :header="currentTask.information" :style="{ width: '50vw', padding: '20px' }"  :modal="true" :draggable="false">
    <template v-if="!editTask">
        <div class="d-flex flex flex-row-reverse" v-if="user.userId == currentTask.createdBy.id">
            <Button label="Edit" @click="editTask = !editTask" class="align-right bg-warning rounded px-2 my-2" />
        </div>
        <div class="mb-2">
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-2 font-bold">Created by</span>
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-1">{{ currentTask.createdBy.name.concat(' ', currentTask.createdBy.lastName) }}</span>
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me">({{ currentTask.createdBy.email }})</span>
        </div>
        <div>
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold">Due date:</span>
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-2">{{ formatDate(currentTask.dueDate) }}</span>
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me">{{ formatTime(currentTask.dueDate) }}</span>
        </div>
        <div>
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold">Assigned user:</span>
            <div class="taskUsersCard mb-1">
                <span class="relation-field-header" v-tooltip="{ value: currentTask.assignedUser.name.concat(' ', currentTask.assignedUser.lastName), showDelay: 150, hideDelay: 200 }">{{ currentTask.assignedUser.name+" "+currentTask.assignedUser.lastName }}</span>
                <a v-tooltip="{ value: user.email, showDelay: 150, hideDelay: 200 }">{{ currentTask.assignedUser.email }}</a>

            </div>
        </div>
        <div >
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold">Related to:</span>
            <div class="taskUsersCard mb-1" v-if="currentTaskRelated.url">
                <RouterLink class="flex cursor-pointer" :to="currentTaskRelated.url" >
                    <span class="relation-field-header" v-tooltip="{ value: currentTaskRelated.name, showDelay: 150, hideDelay: 200 }">{{ currentTaskRelated.name }}</span>
                </RouterLink>
                
            </div>
        </div>
        <div>
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold">Completed: </span>
            <label class="switch" >
                <input @change="completeTask()" type="checkbox" v-model="this.currentTask.finished">
                <span class="slider round"></span>
            </label>
        </div>
        <div id="taskComments"  class="min-h-20 max-h-56 w-100 rounded-t-md border-solid border-1">
            <div v-for="comment in currentTask.comments" class="d-flex">
                <div class="pw-30 text-end px-3">
                    <span>
                        {{ comment.userName+" "+comment.userLastName }}
                    </span>
                    <div>
                        <span class="pe-2 text-xs">
                            {{ formatDate(comment.createdOn) }}
                        </span>
                        <span class="text-xs">
                            {{ formatTime(comment.createdOn) }}
                        </span>
                    </div>
                </div>
                <div class="pw-70 px-3">
                    <span>
                        {{ comment.comment }}
                    </span>
                </div>                                            
            </div>
            <div v-if="currentTask.comments.length == 0">
                <div class="pw-30 text-center p-2">
                    <span>
                        No comments added here yet!
                    </span>
                </div>
            </div>
        </div>
        <form class="w-100">
            <input v-model="newComment" class=" rounded-b-md border-solid border-1 w-100 px-3 py-2" type="text" placeholder="Type a comment...">
            <div class="flex justify-content-end gap-2">
                <Button type="button" label="Send" class="p-1 rounded" :class="'hover hover-bsec-'+colorMode" @click="addComment()"></Button>
            </div>
        </form>

    </template>
    <template v-if="editTask">
        <div class="d-flex flex flex-row-reverse" v-if="user.userId == currentTask.createdBy.id">
            <Button label="Back" @click="editTask = !editTask" class="align-right bg-warning rounded px-2 my-2" />
        </div>
        <div>   
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold">Due date:</span>
            <input v-model="taskDueDate" @input="updateDueDate($event.target.value)" type="datetime-local">
        </div>
        <div>
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold">Environment:</span><br>
            <!-- <Dropdown  v-model="taskEnvironment" :options="user.workEnvironments" optionLabel="environmentName" placeholder="Select an environment" class="w-full md:w-14rem w-80 py-2 item-detail-value" /> -->
            <div class="w-80 py-2 item-detail-value"> 
                <v-select @change="getEnv(taskEnvironment.environmentNameURL)" v-model="taskEnvironment" :options="user.workEnvironments" label="environmentName" class="w-50"></v-select>
            </div>
        </div>
        <div v-if="taskEnvironment!=null">
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold" >User:</span>
            <div class="w-80 py-2 item-detail-value"> 
                <v-select v-model="taskUser"  :options="environment.usersData" label="userDisplayName" class="w-50"></v-select>
            </div>
        </div>
        <div v-if="taskUser!=null">
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold" >Workspace:</span>
            <div class="w-80 py-2 item-detail-value"> 
                <v-select v-model="taskWorkspace"  :options="environment.workspaces" label="workspaceName" class="w-50"></v-select>
            </div>
        </div>
        <div v-if="taskWorkspace!=null">
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold" >App:</span>
            <div class="w-80 py-2 item-detail-value"> 
                <v-select v-model="taskApp" :options="taskWorkspace.apps" label="appName" class="w-50"></v-select>
            </div>
        </div>
        <div v-if="taskApp!=null">
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold" >Item:</span>
            <div class="w-80 py-2 item-detail-value"> 
                <!-- <v-select v-model="taskApp" :options="taskWorkspace.apps" label="appName" class="w-50"></v-select> -->
                <v-select v-model="taskItem"  :options="searchedItems" label="RelatedItemName" @search="buscar($event, taskApp.id)" @focusout="limpiar()" class="w-50"></v-select>
            </div>
        </div>
        <div v-if="taskUser!=null">
            <span :class="'b-less-'+colorMode+' txt-'+colorMode" class="me-3 font-bold" >Information:</span>
            <div class="w-80 py-2"> 
                <textarea v-model="taskInformation" class="w-50 border-solid border-2 rounded px-3 py-2 w-100"></textarea>
            </div>
        </div>

        <div class="flex justify-content-end gap-2">
            <Button type="button" label="Save" class="p-1 rounded" :class="'hover hover-bsec-'+colorMode" @click="updateTask()"></Button>
        </div>
    </template>
</Dialog>