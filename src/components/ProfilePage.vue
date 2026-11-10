<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useApp } from '../composables/useApp.js';
import { Upload, Lock, ArrowLeft } from 'lucide-vue-next';

const router = useRouter();
const { currentUser, updateProfile, updatePassword } = useApp();

const name = ref('');
const email = ref('');
const phone = ref('');
const avatarFile = ref(null);
const avatarPreview = ref(null);

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const savingProfile = ref(false);
const savingPassword = ref(false);

const userInitials = computed(() => {
  const n = name.value || currentUser.value?.name || 'U';
  return n.substring(0, 2).toUpperCase();
});

const displayAvatar = computed(() => avatarPreview.value || currentUser.value?.avatar || null);

const roleLabel = computed(() =>
  (currentUser.value?.role || '').replace(/_/g, ' '),
);

watch(
  currentUser,
  (user) => {
    if (!user?.id) return;
    name.value = user.name || '';
    email.value = user.email || '';
    phone.value = user.phone || '';
  },
  { immediate: true },
);

function onAvatarChange(e) {
  const file = e.target.files?.[0];
  avatarFile.value = file || null;
  avatarPreview.value = file ? URL.createObjectURL(file) : null;
}

async function handleProfileSubmit(e) {
  e.preventDefault();
  savingProfile.value = true;
  try {
    await updateProfile({
      name: name.value,
      email: email.value,
      phone: phone.value,
      avatar: avatarFile.value || undefined,
    });
    avatarFile.value = null;
    avatarPreview.value = null;
  } finally {
    savingProfile.value = false;
  }
}

async function handlePasswordSubmit(e) {
  e.preventDefault();
  if (newPassword.value !== confirmPassword.value) {
    return;
  }
  savingPassword.value = true;
  try {
    await updatePassword({
      current_password: currentPassword.value,
      password: newPassword.value,
      password_confirmation: confirmPassword.value,
    });
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } finally {
    savingPassword.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 space-y-5">
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="inline-flex h-9 items-center gap-1.5 rounded-sm px-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-sky-700"
        @click="router.back()"
      >
        <ArrowLeft class="h-4 w-4" />
        Retour
      </button>
      <h1 class="text-xl sm:text-2xl font-semibold tracking-tight text-slate-800">
        Mon profil
      </h1>
    </div>

    <div class="bg-white border border-slate-200/80 rounded-sm shadow-sm">
      <div class="border-b border-slate-100 px-5 sm:px-8 pt-6 pb-4">
        <h2 class="text-base font-semibold text-slate-800">Informations personnelles</h2>
        <p class="mt-1 text-sm text-slate-500">
          Rôle : <span class="font-medium capitalize text-slate-700">{{ roleLabel }}</span>
        </p>
      </div>

      <form @submit="handleProfileSubmit" class="px-5 sm:px-8 py-6 space-y-5">
        <div class="flex items-center gap-4">
          <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-slate-200 bg-slate-50 text-lg font-semibold text-sky-700">
            <img v-if="displayAvatar" :src="displayAvatar" alt="Photo de profil" class="h-full w-full object-cover" />
            <span v-else>{{ userInitials }}</span>
          </div>
          <label class="cursor-pointer">
            <span class="inline-flex h-10 items-center gap-2 rounded-sm border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50">
              <Upload class="h-4 w-4" />
              Changer la photo
            </span>
            <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
          </label>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5 sm:col-span-2">
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Nom complet
            </label>
            <input
              v-model="name"
              type="text"
              placeholder="Votre nom"
              required
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
              placeholder="email@exemple.bi"
              required
              class="h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
            />
          </div>
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Téléphone
            </label>
            <input
              v-model="phone"
              type="tel"
              placeholder="+257 79 000 000"
              class="h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
            />
          </div>
        </div>

        <div class="flex justify-end pt-1">
          <button
            type="submit"
            :disabled="savingProfile"
            class="inline-flex h-11 min-w-[10rem] items-center justify-center rounded-sm bg-sky-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ savingProfile ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white border border-slate-200/80 rounded-sm shadow-sm">
      <div class="border-b border-slate-100 px-5 sm:px-8 pt-6 pb-4">
        <h2 class="flex items-center gap-2 text-base font-semibold text-slate-800">
          <Lock class="h-4 w-4 text-slate-500" />
          Mot de passe
        </h2>
        <p class="mt-1 text-sm text-slate-500">Modifiez votre mot de passe de connexion</p>
      </div>

      <form @submit="handlePasswordSubmit" class="px-5 sm:px-8 py-6 space-y-4">
        <div class="space-y-1.5">
          <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            Mot de passe actuel
          </label>
          <input
            v-model="currentPassword"
            type="password"
            required
            autocomplete="current-password"
            class="h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Nouveau mot de passe
            </label>
            <input
              v-model="newPassword"
              type="password"
              required
              minlength="8"
              autocomplete="new-password"
              class="h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
            />
          </div>
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Confirmer le mot de passe
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              minlength="8"
              autocomplete="new-password"
              class="h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
            />
          </div>
        </div>
        <p
          v-if="confirmPassword && newPassword !== confirmPassword"
          class="text-xs text-red-600"
        >
          Les mots de passe ne correspondent pas
        </p>
        <div class="flex justify-end pt-1">
          <button
            type="submit"
            :disabled="savingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword"
            class="inline-flex h-11 min-w-[10rem] items-center justify-center rounded-sm border border-slate-300 bg-white px-8 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ savingPassword ? 'Mise à jour...' : 'Changer le mot de passe' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
