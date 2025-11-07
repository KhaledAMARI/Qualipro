<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5">Collaborators</div>
        <div class="text-caption">Manage your team members</div>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="add" label="Add" @click="openAdd" />
      </div>
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat
      bordered
    >
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn dense flat icon="edit" @click="openEdit(props.row)" />
          <q-btn dense flat color="negative" icon="delete" @click="confirmDelete(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogOpen">
      <q-card style="min-width: 420px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ editing ? 'Edit collaborator' : 'Add collaborator' }}</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-form ref="formRef" @submit.prevent="save" class="q-gutter-md">
            <q-input v-model="form.firstName" label="First name" :rules="[required, nameRule]" />
            <q-input v-model="form.lastName" label="Last name" :rules="[required, nameRule]" />
            <q-input v-model="form.email" type="email" label="Email" :rules="[required, emailRule]" />
            <q-input v-model="form.post" label="Post" :rules="[required]" />
            <div v-if="error" class="text-negative">{{ error }}</div>
            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="Cancel" v-close-popup />
              <q-btn :loading="saving" color="primary" label="Save" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteOpen">
      <q-card>
        <q-card-section class="text-h6">Delete collaborator</q-card-section>
        <q-card-section>Are you sure you want to delete {{ toDelete?.firstName }} {{ toDelete?.lastName }}?</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="negative" label="Delete" :loading="deleting" @click="doDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CollaboratorsAPI } from 'src/services/api'

const router = useRouter()
const loading = ref(false)
const rows = ref([])
const error = ref('')

const columns = [
  { name: 'firstName', label: 'First Name', field: 'firstName', align: 'left' },
  { name: 'lastName', label: 'Last Name', field: 'lastName', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'post', label: 'Post', field: 'post', align: 'left' },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const dialogOpen = ref(false)
const saving = ref(false)
const editing = ref(false)
const form = reactive({ id: null, firstName: '', lastName: '', email: '', post: '' })
const formRef = ref(null)

const required = v => !!(v && String(v).trim()) || 'Required'
const nameRule = v => !!(v && String(v).trim().length >= 2) || 'Min 2 chars'
const emailRule = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)) || 'Invalid email'

const deleteOpen = ref(false)
const deleting = ref(false)
const toDelete = ref(null)

function openAdd() {
  editing.value = false
  Object.assign(form, { id: null, firstName: '', lastName: '', email: '', post: '' })
  error.value = ''
  dialogOpen.value = true
}

function openEdit(row) {
  editing.value = true
  Object.assign(form, { id: row.id, firstName: row.firstName, lastName: row.lastName, email: row.email, post: row.post })
  error.value = ''
  dialogOpen.value = true
}

function confirmDelete(row) {
  toDelete.value = row
  deleteOpen.value = true
}

async function doDelete() {
  try {
    deleting.value = true
    await CollaboratorsAPI.remove(toDelete.value.id)
    deleteOpen.value = false
    await fetchData()
  } catch (e) {
    console.log("🚀 ~ doDelete ~ e:", e)
    // swallow
  } finally {
    deleting.value = false
  }
}

async function save() {
  try {
    saving.value = true
    const ok = await formRef.value.validate()
    if (!ok) {
      saving.value = false
      return
    }
    if (editing.value) {
      await CollaboratorsAPI.update(form.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        post: form.post,
      })
    } else {
      await CollaboratorsAPI.create({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        post: form.post,
      })
    }
    dialogOpen.value = false
    await fetchData()
  } catch (e) {
    error.value = e?.response?.data?.error || e.message || 'Save failed'
  } finally {
    saving.value = false
  }
}

async function fetchData() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return router.push('/login')
    loading.value = true
    rows.value = await CollaboratorsAPI.list()
  } catch (e) {
    if (e?.response?.status === 401) return router.push('/login')
    error.value = e?.response?.data?.error || e.message || 'Load failed'
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>
