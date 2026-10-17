<script setup>
import { ref, watch, computed } from 'vue';
import { UserCog } from 'lucide-vue-next';
import { useApp } from '../../../composables/useApp.js';
import { useAdminScope } from '../../../composables/useAdminScope.js';
import Button from '../ui/Button.vue';
import Input from '../ui/Input.vue';
import Label from '../ui/Label.vue';
import Switch from '../ui/Switch.vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const props = defineProps({
  open: { type: Boolean, default: false },
  user: { type: Object, default: null },
});

const emit = defineEmits(['update:open', 'submit']);

const { markets, currentUser } = useApp();
const { isSuperAdmin, scopedMarkets } = useAdminScope();

const ALL_ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Administrateur' },
  { value: 'ADMIN_MARCHE', label: 'Admin Marché' },
  { value: 'PROPRIETAIRE_MARCHE', label: 'Propriétaire Marché' },
  { value: 'COMMERCANT', label: 'Commerçant' },
  { value: 'USER', label: 'Utilisateur' },
];

const ROLES = computed(() =>
  isSuperAdmin.value
    ? ALL_ROLES
    : ALL_ROLES.filter((r) => ['COMMERCANT', 'USER'].includes(r.value)),
);

const availableMarkets = computed(() =>
  isSuperAdmin.value ? markets.value : scopedMarkets.value,
);

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'USER',
  isActive: true,
  marketId: null,
});

const isEditing = computed(() => Boolean(props.user?.id));
const isSelf = computed(() => props.user?.id === currentUser.value?.id);
const showMarketSelect = computed(() =>
  ['ADMIN_MARCHE', 'PROPRIETAIRE_MARCHE'].includes(form.value.role),
);

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    if (props.user) {
      form.value = {
        name: props.user.name || '',
        email: props.user.email || '',
        phone: props.user.phone || '',
        password: '',
        role: props.user.role || 'USER',
        isActive: props.user.isActive ?? true,
        marketId: props.user.marketId || null,
      };
    } else {
      form.value = {
        name: '',
        email: '',
        phone: '',
        password: '',
        role: isSuperAdmin.value ? 'USER' : 'COMMERCANT',
        isActive: true,
        marketId: null,
      };
    }
  },
);

watch(
  () => form.value.role,
  (role) => {
    if (!['ADMIN_MARCHE', 'PROPRIETAIRE_MARCHE'].includes(role)) {
      form.value.marketId = null;
    }
  },
);

const close = () => emit('update:open', false);

const handleSubmit = () => {
  if (!form.value.name.trim() || !form.value.email.trim()) return;
  if (!isEditing.value && !form.value.password.trim()) return;
  if (['ADMIN_MARCHE', 'PROPRIETAIRE_MARCHE'].includes(form.value.role) && !form.value.marketId) return;

  emit('submit', {
    ...(props.user || {}),
    name: form.value.name.trim(),
    email: form.value.email.trim(),
    phone: form.value.phone.trim() || null,
    password: form.value.password.trim() || undefined,
    role: isSelf.value ? props.user.role : form.value.role,
    isActive: form.value.isActive,
    marketId: form.value.marketId,
  });
};
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <UserCog class="w-5 h-5 text-primary" />
          {{ isEditing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}
        </DialogTitle>
       
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <Label for="user-name">Nom complet</Label>
          <Input id="user-name" v-model="form.name" placeholder="Jean Dupont" required />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="user-email">Email</Label>
            <Input id="user-email" v-model="form.email" type="email" placeholder="email@exemple.bi" required />
          </div>
          <div class="space-y-2">
            <Label for="user-phone">Téléphone (optionnel)</Label>
            <Input id="user-phone" v-model="form.phone" placeholder="+25779123456" />
            <p class="text-xs text-muted-foreground">Doit être unique.</p>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="user-password">
            {{ isEditing ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe' }}
          </Label>
          <Input
            id="user-password"
            v-model="form.password"
            type="password"
            :required="!isEditing"
            placeholder="Minimum 8 caractères"
            minlength="8"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Rôle</Label>
            <Select v-model="form.role" :disabled="isSelf">
              <SelectTrigger>
                <SelectValue placeholder="Choisir un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="r in ROLES" :key="r.value" :value="r.value">
                  {{ r.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="showMarketSelect" class="space-y-2">
            <Label>Marché assigné</Label>
            <Select v-model="form.marketId">
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un marché" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="m in availableMarkets" :key="m.id" :value="m.id">
                  {{ m.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p class="text-sm font-medium">Compte actif</p>
            
          </div>
          <Switch
            v-model:checked="form.isActive"
            :disabled="isSelf"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="close">Annuler</Button>
          <Button type="submit">
            {{ isEditing ? 'Enregistrer' : 'Créer l\'utilisateur' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>