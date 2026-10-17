<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus, Search, UserCog, UserCheck, UserX } from 'lucide-vue-next';
import { useApp } from '../../../../composables/useApp.js';
import { useAdminScope } from '../../../../composables/useAdminScope.js';
import { createUser, updateUserApi, deleteUserApi } from '../../../../api/services/data.js';
import { getErrorMessage } from '../../../../api/client.js';
import { sameId } from '../../../../utils/ids.js';
import PageHeader from '../../layout/PageHeader.vue';
import FilterBar from '../../layout/FilterBar.vue';
import StatCard from '../../StatCard.vue';
import UsersTable from '../../users/UsersTable.vue';
import UserFormDialog from '../../users/UserFormDialog.vue';
import Button from '../../ui/Button.vue';
import Input from '../../ui/Input.vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';

const { currentUser, showToast, loadUsers } = useApp();
const { isSuperAdmin, scopedMarkets } = useAdminScope();

const users = ref([]);
const searchQuery = ref('');
const roleFilter = ref('all');
const statusFilter = ref('all');
const marketFilter = ref('all');
const formOpen = ref(false);
const deleteOpen = ref(false);
const editingUser = ref(null);
const userToDelete = ref(null);
const loading = ref(false);
const deleting = ref(false);

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

async function refreshUsers() {
  loading.value = true;
  try {
    users.value = await loadUsers();
  } catch (error) {
    showToast(getErrorMessage(error, 'Erreur de chargement des utilisateurs'), 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void refreshUsers();
});

const filteredUsers = computed(() =>
  users.value.filter((u) => {
    const q = searchQuery.value.toLowerCase();
    const matchesQuery =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q);
    const matchesRole = roleFilter.value === 'all' || u.role === roleFilter.value;
    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'active' && u.isActive) ||
      (statusFilter.value === 'inactive' && !u.isActive);
    const matchesMarket =
      marketFilter.value === 'all' || sameId(u.marketId, marketFilter.value);
    return matchesQuery && matchesRole && matchesStatus && matchesMarket;
  }),
);

const activeCount = computed(() => users.value.filter((u) => u.isActive).length);
const inactiveCount = computed(() => users.value.filter((u) => !u.isActive).length);

const openCreate = () => {
  editingUser.value = null;
  formOpen.value = true;
};

const openEdit = (user) => {
  editingUser.value = user;
  formOpen.value = true;
};

const openDelete = (user) => {
  userToDelete.value = user;
  deleteOpen.value = true;
};

const handleFormSubmit = async (payload) => {
  try {
    if (payload.id) {
      await updateUserApi(payload.id, payload);
      showToast(`Utilisateur "${payload.name}" mis à jour`, 'success');
    } else {
      await createUser(payload);
      showToast(`Utilisateur "${payload.name}" créé avec succès`, 'success');
    }
    formOpen.value = false;
    await refreshUsers();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  }
};

const confirmDelete = async () => {
  if (!userToDelete.value || deleting.value) return;
  deleting.value = true;
  try {
    await deleteUserApi(userToDelete.value.id);
    showToast('Utilisateur supprimé', 'success');
    deleteOpen.value = false;
    userToDelete.value = null;
    await refreshUsers();
  } catch (error) {
    showToast(getErrorMessage(error, 'Impossible de supprimer cet utilisateur'), 'error');
  } finally {
    deleting.value = false;
  }
};

const handleToggleActive = async (user, isActive) => {
  try {
    await updateUserApi(user.id, { ...user, isActive });
    showToast(`Compte ${isActive ? 'activé' : 'désactivé'}`, isActive ? 'success' : 'info');
    await refreshUsers();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
    await refreshUsers();
  }
};
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      action-label="Ajouter un utilisateur"
      :action-icon="Plus"
      @action="openCreate"
    />

    <FilterBar
      :show-clear="searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || (isSuperAdmin && marketFilter !== 'all')"
      @clear="searchQuery = ''; roleFilter = 'all'; statusFilter = 'all'; marketFilter = 'all'"
    >
      <div class="flex-1 space-y-1 w-full">
        <label class="text-xs font-medium text-muted-foreground">Recherche</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="Nom, email, téléphone..." class="pl-9 bg-card" />
        </div>
      </div>
      <div class="space-y-1 w-full lg:w-44">
        <label class="text-xs font-medium text-muted-foreground">Rôle</label>
        <Select v-model="roleFilter">
          <SelectTrigger class="bg-card"><SelectValue placeholder="Tous" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem v-for="r in ROLES" :key="r.value" :value="r.value">{{ r.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="space-y-1 w-full lg:w-40">
        <label class="text-xs font-medium text-muted-foreground">Statut</label>
        <Select v-model="statusFilter">
          <SelectTrigger class="bg-card"><SelectValue placeholder="Tous" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="inactive">Désactivés</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div v-if="isSuperAdmin" class="space-y-1 w-full lg:w-44">
        <label class="text-xs font-medium text-muted-foreground">Marché</label>
        <Select v-model="marketFilter">
          <SelectTrigger class="bg-card"><SelectValue placeholder="Tous" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les marchés</SelectItem>
            <SelectItem v-for="m in scopedMarkets" :key="m.id" :value="String(m.id)">{{ m.name }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FilterBar>

    <UsersTable
      :users="filteredUsers"
      :current-user-id="currentUser.id"
      :loading="loading"
      @edit="openEdit"
      @delete="openDelete"
      @toggle-active="handleToggleActive"
    />

    <UserFormDialog
      v-model:open="formOpen"
      :user="editingUser"
      @submit="handleFormSubmit"
    />

    <AlertDialog v-model:open="deleteOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le compte <strong>{{ userToDelete?.name }}</strong> ({{ userToDelete?.email }})
            sera définitivement supprimé du système.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="deleting">Annuler</AlertDialogCancel>
          <Button
            class="bg-destructive text-white hover:bg-destructive/90"
            :disabled="deleting"
            @click="confirmDelete"
          >
            {{ deleting ? 'Suppression...' : 'Supprimer' }}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
