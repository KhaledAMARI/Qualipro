<template>
  <q-page class="row items-center justify-center q-pa-md">
    <q-card style="width: 420px; max-width: 90vw">
      <q-card-section class="q-pa-lg">
        <div class="text-h6">Login</div>
        <div class="text-subtitle2">Access your account</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-lg">
        <q-form ref="formRef" @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input v-model="email" type="email" label="Email" autocomplete="email" :rules="[required, emailRule]" :error="!!error" />
          <q-input v-model="password" type="password" label="Password" autocomplete="current-password" :rules="[required]" :error="!!error" />
          <div v-if="error" class="text-negative">{{ error }}</div>
          <div class="row justify-center">
            <q-btn :loading="loading" label="Login" type="submit" color="primary" />
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions align="between">
        <div class="text-caption">Don't have an account?</div>
        <q-btn flat to="/signup" label="Create one" color="primary" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AuthAPI } from 'src/services/api'

const router = useRouter()
const formRef = ref(null)
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const required = v => !!(v && String(v).trim()) || 'Required'
const emailRule = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)) || 'Invalid email'

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const ok = await formRef.value.validate()
    if (!ok) {
      loading.value = false
      return
    }
    const { token, user } = await AuthAPI.login({ email: email.value, password: password.value })
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    router.push('/collaborators')
  } catch (e) {
    error.value = e?.response?.data?.error || e.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
</style>
