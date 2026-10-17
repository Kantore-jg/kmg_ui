<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useApp } from '../composables/useApp.js';
import { getErrorMessage } from '../api/client.js';
import { ArrowLeft, Upload, User } from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const { login, register, showToast } = useApp();

const isLogin = computed(() => route.meta.authMode !== 'register');

const name = ref('');
const email = ref('');
const phone = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const avatarFile = ref(null);
const avatarPreview = ref(null);
const submitting = ref(false);

watch(
  () => route.name,
  () => {
    if (isLogin.value) {
      passwordConfirmation.value = '';
      avatarFile.value = null;
      avatarPreview.value = null;
    }
  },
);

function onAvatarChange(e) {
  const file = e.target.files?.[0];
  avatarFile.value = file || null;
  avatarPreview.value = file ? URL.createObjectURL(file) : null;
}

function resolveRedirect(user) {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null;
  if (redirect && redirect.startsWith('/')) {
    return redirect;
  }
  if (user.role === 'COMMERCE_USER') {
    return '/commerce';
  }
  if (['SUPER_ADMIN', 'ADMIN_MARCHE', 'PROPRIETAIRE_MARCHE', 'COMMERCANT'].includes(user.role)) {
    return '/admin';
  }
  return '/';
}

function goToAuthMode(mode) {
  const target = mode === 'register' ? '/register' : '/login';
  if (route.path !== target) {
    router.push({ path: target, query: route.query });
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  submitting.value = true;
  try {
    if (isLogin.value) {
      if (!email.value || !password.value) {
        showToast('Email et mot de passe requis', 'error');
        return;
      }
      const user = await login(email.value, password.value);
      router.push(resolveRedirect(user));
    } else {
      if (!name.value || !email.value || !password.value) {
        showToast('Veuillez remplir tous les champs obligatoires', 'error');
        return;
      }
      if (password.value !== passwordConfirmation.value) {
        showToast('Les mots de passe ne correspondent pas', 'error');
        return;
      }
      const user = await register({
        name: name.value,
        email: email.value,
        phone: phone.value || undefined,
        password: password.value,
        password_confirmation: passwordConfirmation.value,
        avatar: avatarFile.value || undefined,
      });
      router.push(resolveRedirect(user));
    }
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8">
    <button
      type="button"
      class="absolute top-5 left-5 flex items-center gap-2 text-muted-foreground hover:text-primary text-xs font-semibold transition-colors"
      @click="router.push('/')"
    >
      <ArrowLeft class="w-4 h-4" />
      Retour au portail
    </button>

    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <p class="text-sm text-muted-foreground mt-1">akaguririo</p>
      </div>

      <div class="bs-card p-8 shadow-md">
        <h2 class="text-lg font-semibold text-foreground mb-1">
          {{ isLogin ? 'Connexion' : 'Créer un compte' }}
        </h2>
        <p class="text-sm text-muted-foreground mb-6">
          {{ isLogin ? 'Accédez à votre espace marché' : 'Rejoignez la plateforme digitale' }}
        </p>

        <form @submit="handleSubmit" class="space-y-4">
          <div v-if="!isLogin" class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Nom complet</label>
            <input
              v-model="name"
              type="text"
              placeholder="ex. Claver Ndayishimiye"
              class="w-full bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-xl py-3 px-4 text-sm outline-none transition-all"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="ex. commercant@akaguriro.bi"
              class="w-full bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-xl py-3 px-4 text-sm outline-none transition-all"
              required
            />
          </div>

          <div v-if="!isLogin" class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Téléphone</label>
            <input
              v-model="phone"
              type="tel"
              placeholder="ex. +257 79 123 456"
              class="w-full bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-xl py-3 px-4 text-sm outline-none transition-all"
            />
          </div>

          <div v-if="!isLogin" class="space-y-2">
            <label class="text-xs font-medium text-muted-foreground">Photo de profil</label>
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-xl bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
                <img v-if="avatarPreview" :src="avatarPreview" alt="Aperçu" class="w-full h-full object-cover" />
                <User v-else class="w-6 h-6 text-muted-foreground" />
              </div>
              <label class="flex-1 cursor-pointer">
                <span class="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg hover:bg-primary/15 transition-colors">
                  <Upload class="w-4 h-4" />
                  Choisir une image
                </span>
                <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
              </label>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Mot de passe</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="w-full bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-xl py-3 px-4 text-sm outline-none transition-all"
              required
            />
          </div>

          <div v-if="!isLogin" class="space-y-1.5">
            <label class="text-xs font-medium text-muted-foreground">Confirmer le mot de passe</label>
            <input
              v-model="passwordConfirmation"
              type="password"
              placeholder="••••••••"
              class="w-full bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-xl py-3 px-4 text-sm outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            :disabled="submitting"
            class="w-full bs-btn-primary py-3.5 disabled:opacity-50"
          >
            {{ submitting ? (isLogin ? 'Connexion...' : 'Inscription...') : (isLogin ? 'Se connecter' : "S'inscrire") }}
          </button>
        </form>

        <p class="text-center text-xs text-muted-foreground mt-5">
          {{ isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?" }}
          <button
            type="button"
            class="text-primary hover:underline font-semibold"
            @click="goToAuthMode(isLogin ? 'register' : 'login')"
          >
            {{ isLogin ? "Créer un compte" : "Se connecter" }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>