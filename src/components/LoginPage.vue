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
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
    <button
      type="button"
      class="absolute top-5 left-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-sky-700"
      @click="router.push('/')"
    >
      <ArrowLeft class="w-4 h-4" />
      Retour au portail
    </button>

    <div class="w-full max-w-md">
      <div class="bg-white border border-slate-200/80 rounded-sm shadow-sm">
        <div class="border-b border-slate-100 px-5 sm:px-8 pt-6 pb-4">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-sky-700">Akaguriro</p>
          <h1 class="mt-1 text-xl sm:text-2xl font-semibold tracking-tight text-slate-800">
            {{ isLogin ? 'Connexion' : 'Créer un compte' }}
          </h1>
          <p class="mt-1 text-sm text-slate-500">
            {{ isLogin ? 'Accédez à votre espace marché' : 'Rejoignez la plateforme digitale' }}
          </p>
        </div>

        <form @submit="handleSubmit" class="px-5 sm:px-8 py-6 space-y-4">
          <div v-if="!isLogin" class="space-y-1.5">
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Nom complet
            </label>
            <input
              v-model="name"
              type="text"
              placeholder="ex. Claver Ndayishimiye"
              class="h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Email
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="ex. commercant@akaguriro.bi"
              required
              class="h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
            />
          </div>

          <div v-if="!isLogin" class="space-y-1.5">
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Téléphone
            </label>
            <input
              v-model="phone"
              type="tel"
              placeholder="ex. +257 79 123 456"
              class="h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
            />
          </div>

          <div v-if="!isLogin" class="space-y-1.5">
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Photo de profil
            </label>
            <div class="flex items-center gap-4">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-slate-200 bg-slate-50">
                <img v-if="avatarPreview" :src="avatarPreview" alt="Aperçu" class="h-full w-full object-cover" />
                <User v-else class="h-6 w-6 text-slate-400" />
              </div>
              <label class="cursor-pointer">
                <span class="inline-flex h-10 items-center gap-2 rounded-sm border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                  <Upload class="h-4 w-4" />
                  Choisir une image
                </span>
                <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
              </label>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Mot de passe
            </label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              class="h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
            />
          </div>

          <div v-if="!isLogin" class="space-y-1.5">
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Confirmer le mot de passe
            </label>
            <input
              v-model="passwordConfirmation"
              type="password"
              placeholder="••••••••"
              required
              class="h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
            />
          </div>

          <button
            type="submit"
            :disabled="submitting"
            class="inline-flex h-11 w-full items-center justify-center rounded-sm bg-sky-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ submitting ? (isLogin ? 'Connexion...' : 'Inscription...') : (isLogin ? 'Se connecter' : "S'inscrire") }}
          </button>
        </form>

        <p class="border-t border-slate-100 px-5 sm:px-8 py-4 text-center text-xs text-slate-500">
          {{ isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?" }}
          <button
            type="button"
            class="font-semibold text-sky-700 hover:underline"
            @click="goToAuthMode(isLogin ? 'register' : 'login')"
          >
            {{ isLogin ? "Créer un compte" : "Se connecter" }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
