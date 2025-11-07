<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> Collaborator Manager App </q-toolbar-title>

        <q-space />
        <div v-if="isAuthed" class="row items-center q-gutter-sm">
          <q-avatar color="primary" text-color="white" icon="person" />
          <div class="text-subtitle2">{{ fullName || user?.email }}</div>
          <q-btn flat dense icon="logout" label="Logout" @click="logout" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AuthAPI } from 'src/services/api'

const router = useRouter()
const route = useRoute()

function getStoredUser() {
  const raw = localStorage.getItem('user')
  if (!raw || raw === 'undefined') return null
  try {
    return JSON.parse(raw)
  } catch (e) {
    console.log("🚀 ~ getStoredUser ~ e:", e)
    return null
  }
}

const user = ref(getStoredUser())
const isAuthed = computed(() => !!user.value)
const fullName = computed(() => {
  if (!user.value) return ''
  const fn = [user.value.firstName, user.value.lastName].filter(Boolean).join(' ').trim()
  return fn || ''
})

watch(route, () => {
  // refresh user from localStorage on route changes (simple approach)
  user.value = getStoredUser()
})

async function logout() {
  await AuthAPI.logout()
  user.value = null
  router.push('/login')
}
</script>
