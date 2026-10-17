<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useApp } from '../composables/useApp.js';
import { Upload, Lock, ArrowLeft } from 'lucide-vue-next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../app/components/ui/card';
import Button from '../app/components/ui/Button.vue';
import Input from '../app/components/ui/Input.vue';
import { Avatar, AvatarImage, AvatarFallback } from '../app/components/ui/avatar';

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
  <div class="max-w-3xl mx-auto px-4 py-8 space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="sm" @click="router.back()">
        <ArrowLeft class="w-4 h-4 mr-1" />
        Retour
      </Button>
      <div>
        <h1 class="text-2xl font-bold text-foreground">Mon profil</h1>
        <!-- <p class="text-sm text-muted-foreground">Gérez vos informations personnelles et votre sécurité</p> -->
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Informations personnelles</CardTitle>
        <CardDescription>
          Rôle : <span class="font-medium capitalize">{{ roleLabel }}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit="handleProfileSubmit" class="space-y-5">
          <div class="flex items-center gap-5">
            <Avatar class="w-20 h-20 border-2 border-border">
              <AvatarImage v-if="displayAvatar" :src="displayAvatar" alt="Photo de profil" />
              <AvatarFallback class="bg-primary text-white text-lg">
                {{ userInitials }}
              </AvatarFallback>
            </Avatar>
            <div class="space-y-2">
              <!-- <p class="text-sm font-medium text-foreground">Photo de profil</p> -->
              <!-- <p class="text-xs text-muted-foreground">JPG, PNG — max. 2 Mo</p> -->
              <label class="inline-flex cursor-pointer">
                <span class="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg hover:bg-primary/15 transition-colors">
                  <Upload class="w-4 h-4" />
                  Changer la photo
                </span>
                <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
              </label>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5 sm:col-span-2">
              <label class="text-sm font-medium">Nom complet</label>
              <Input v-model="name" type="text" placeholder="Votre nom" required />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Email</label>
              <Input v-model="email" type="email" placeholder="email@exemple.bi" required />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Téléphone</label>
              <Input v-model="phone" type="tel" placeholder="+257 79 000 000" />
            </div>
          </div>

          <Button type="submit" :disabled="savingProfile">
            {{ savingProfile ? 'Enregistrement...' : 'Enregistrer les modifications' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Lock class="w-5 h-5" />
          Mot de passe
        </CardTitle>
        <CardDescription>Modifiez votre mot de passe de connexion</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit="handlePasswordSubmit" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Mot de passe actuel</label>
            <Input v-model="currentPassword" type="password" required autocomplete="current-password" />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Nouveau mot de passe</label>
              <Input v-model="newPassword" type="password" required minlength="8" autocomplete="new-password" />
            </div>
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Confirmer le mot de passe</label>
              <Input v-model="confirmPassword" type="password" required minlength="8" autocomplete="new-password" />
            </div>
          </div>
          <p
            v-if="confirmPassword && newPassword !== confirmPassword"
            class="text-xs text-destructive"
          >
            Les mots de passe ne correspondent pas
          </p>
          <Button
            type="submit"
            variant="outline"
            :disabled="savingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword"
          >
            {{ savingPassword ? 'Mise à jour...' : 'Changer le mot de passe' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>