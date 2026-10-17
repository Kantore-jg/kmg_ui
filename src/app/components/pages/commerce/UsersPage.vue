<script setup>
import { ref, onMounted } from 'vue';
import { Plus } from 'lucide-vue-next';
import {
  fetchCommerceUsers,
  createCommerceUser,
  updateCommerceUser,
} from '../../../../api/services/commerce.js';
import { COMMERCE_ROLE_LABELS } from '../../../../api/mappers.js';
import { getErrorMessage } from '../../../../api/client.js';
import { useApp } from '../../../../composables/useApp.js';
import PageHeader from '../../layout/PageHeader.vue';
import Button from '../../ui/Button.vue';
import Input from '../../ui/Input.vue';
import Label from '../../ui/Label.vue';
import Badge from '../../ui/Badge.vue';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../ui/table';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '../../ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../ui/select';

const { showToast } = useApp();

const users = ref([]);
const loading = ref(true);
const formOpen = ref(false);
const editing = ref(null);
const saving = ref(false);

const ROLES = Object.entries(COMMERCE_ROLE_LABELS).map(([value, label]) => ({ value, label }));

const emptyForm = () => ({
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'seller',
  isActive: true,
});

const form = ref(emptyForm());

async function refresh() {
  loading.value = true;
  try {
    users.value = await fetchCommerceUsers();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(() => { void refresh(); });

const openCreate = () => {
  editing.value = null;
  form.value = emptyForm();
  formOpen.value = true;
};

const openEdit = (user) => {
  editing.value = user;
  form.value = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    password: '',
    role: user.role,
    isActive: user.isActive,
  };
  formOpen.value = true;
};

const handleSubmit = async () => {
  if (!form.value.name || (!editing.value && (!form.value.email || !form.value.password))) {
    showToast('Remplissez les champs obligatoires', 'error');
    return;
  }
  saving.value = true;
  try {
    if (editing.value) {
      await updateCommerceUser(editing.value.id, form.value);
      showToast('Utilisateur mis à jour', 'success');
    } else {
      await createCommerceUser(form.value);
      showToast('Utilisateur créé', 'success');
    }
    formOpen.value = false;
    await refresh();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Utilisateurs"
      subtitle="Membres du commerce"
      action-label="Ajouter"
      :action-icon="Plus"
      @action="openCreate"
    />

    <div class="bs-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="6" class="text-center text-muted-foreground py-8">Chargement...</TableCell>
          </TableRow>
          <TableRow v-for="user in users" :key="user.id">
            <TableCell class="font-medium">{{ user.name }}</TableCell>
            <TableCell>{{ user.email }}</TableCell>
            <TableCell>{{ user.phone || '—' }}</TableCell>
            <TableCell>{{ user.roleLabel }}</TableCell>
            <TableCell>
              <Badge :class="user.isActive ? 'bg-success/15 text-success border-0' : 'bg-muted border-0'">
                {{ user.isActive ? 'Actif' : 'Inactif' }}
              </Badge>
            </TableCell>
            <TableCell class="text-right">
              <Button variant="outline" size="sm" @click="openEdit(user)">Modifier</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Dialog v-model:open="formOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}</DialogTitle>
        </DialogHeader>
        <div class="grid gap-4 py-2">
          <div class="grid gap-1.5"><Label>Nom *</Label><Input v-model="form.name" /></div>
          <div class="grid gap-1.5"><Label>Email *</Label><Input v-model="form.email" type="email" :disabled="!!editing" /></div>
          <div class="grid gap-1.5"><Label>Téléphone</Label><Input v-model="form.phone" /></div>
          <div class="grid gap-1.5">
            <Label>{{ editing ? 'Nouveau mot de passe' : 'Mot de passe *' }}</Label>
            <Input v-model="form.password" type="password" />
          </div>
          <div class="grid gap-1.5">
            <Label>Rôle</Label>
            <Select v-model="form.role">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="r in ROLES" :key="r.value" :value="r.value">{{ r.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label v-if="editing" class="flex items-center gap-2 text-sm">
            <input v-model="form.isActive" type="checkbox" class="rounded" />
            Compte actif
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="formOpen = false">Annuler</Button>
          <Button :disabled="saving" @click="handleSubmit">{{ saving ? 'Enregistrement...' : 'Enregistrer' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
