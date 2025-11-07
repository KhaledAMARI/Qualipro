<template>
  <q-page class="row items-center justify-center q-pa-md">
    <q-card style="width: 480px; max-width: 95vw">
      <q-card-section>
        <div class="text-h6">Create account</div>
        <div class="text-subtitle2">Sign up to start</div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form ref="formRef" @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input v-model="firstName" label="First name" :rules="[nameRule]" />
          <q-input v-model="lastName" label="Last name" :rules="[nameRule]" />
          <q-input v-model="email" type="email" label="Email" autocomplete="email" :rules="[required, emailRule]" :error="!!error"/>
          <q-input v-model="password" type="password" label="Password" autocomplete="new-password" :rules="passwordRules" :error="!!error"/>
          <div class="text-caption">Password must be at least 8 chars and include lowercase, uppercase, number, and special character.</div>
          <div v-if="error" class="text-negative">{{ error }}</div>
          <div class="row justify-center">
            <q-btn :loading="loading" label="Create account" type="submit" color="primary" />
          </div>
        </q-form>
      </q-card-section>

      <q-separator />

      <q-card-actions align="between">
        <div class="text-caption">Already have an account?</div>
        <q-btn flat to="/login" label="Login" color="primary" />
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
const firstName = ref('')
const lastName = ref('')
const loading = ref(false)
const error = ref('')

const required = v => !!(v && String(v).trim()) || 'Required'
const emailRule = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)) || 'Invalid email'
const nameRule = v => !!(v && String(v).trim().length >= 2) || 'Min 2 chars'
const passwordRules = [
  v => !!v || 'Required',
  v => String(v).length >= 8 || 'Min 8 chars',
  v => /[a-z]/.test(v) || 'Include lowercase',
  v => /[A-Z]/.test(v) || 'Include uppercase',
  v => /[0-9]/.test(v) || 'Include number',
  v => /[^A-Za-z0-9]/.test(v) || 'Include special',
]

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const ok = await formRef.value.validate()
    if (!ok) {
      loading.value = false
      return
    }
    const { token, user } = await AuthAPI.signup({ email: email.value, password: password.value, firstName: firstName.value, lastName: lastName.value })
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    router.push('/collaborators')
  } catch (e) {
    error.value = e?.response?.data?.error || e.message || 'Signup failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.full-width { width: 100%; }
</style>
