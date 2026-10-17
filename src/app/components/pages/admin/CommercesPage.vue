<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus, Search, Store, UserPlus } from 'lucide-vue-next';
import {
  fetchCommerces,
  createCommerce,
  updateCommerce,
  createCommerceOwner,
} from '../../../../api/services/commerce.js';
import { getErrorMessage } from '../../../../api/client.js';
import { useApp } from '../../../../composables/useApp.js';
import PageHeader from '../../layout/PageHeader.vue';
import FilterBar from '../../layout/FilterBar.vue';
import Button from '../../ui/Button.vue';
import Input from '../../ui/Input.vue';
import Label from '../../ui/Label.vue';
import Badge from '../../ui/Badge.vue';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../ui/select';
import {
  getProvinceOptions,
  getCommuneOptions,
  getZoneOptions,
  getCollineOptions,
} from '../../../../utils/burundiLocations.js';

const { showToast } = useApp();

const commerces = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('all');
const formOpen = ref(false);
const ownerOpen = ref(false);
const editingCommerce = ref(null);
const ownerCommerce = ref(null);
const saving = ref(false);

const PROVINCE_OPTIONS = getProvinceOptions();

const emptyForm = () => ({
  name: '',
  type: '',
  rccm: '',
  nif: '',
  phone: '',
  email: '',
  address: '',
  province: PROVINCE_OPTIONS[0]?.value || '',
  commune: '',
  zone: '',
  colline: '',
  description: '',
  status: 'active',
});

const form = ref(emptyForm());

const ownerForm = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
});

const communeOptions = computed(() => getCommuneOptions(form.value.province));
const zoneOptions = computed(() => getZoneOptions(form.value.province, form.value.commune));
const collineOptions = computed(() => getCollineOptions(form.value.province, form.value.commune, form.value.zone));

const filteredCommerces = computed(() =>
  commerces.value.filter((c) => {
    const q = searchQuery.value.toLowerCase();
    const matchesQuery =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q);
    const matchesStatus = statusFilter.value === 'all' || c.status === statusFilter.value;
    return matchesQuery && matchesStatus;
  }),
);

async function refresh() {
  loading.value = true;
  try {
    commerces.value = await fetchCommerces();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(() => { void refresh(); });

const openCreate = () => {
  editingCommerce.value = null;
  form.value = emptyForm();
  formOpen.value = true;
};

const openEdit = (commerce) => {
  editingCommerce.value = commerce;
  form.value = {
    name: commerce.name,
    type: commerce.type,
    rccm: commerce.rccm,
    nif: commerce.nif,
    phone: commerce.phone,
    email: commerce.email,
    address: commerce.address,
    province: commerce.province,
    commune: commerce.commune,
    zone: commerce.zone,
    colline: commerce.colline,
    description: commerce.description,
    status: commerce.status,
  };
  formOpen.value = true;
};

const openOwner = (commerce) => {
  ownerCommerce.value = commerce;
  ownerForm.value = { name: '', email: '', phone: '', password: '' };
  ownerOpen.value = true;
};

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    showToast('Le nom est obligatoire', 'error');
    return;
  }
  saving.value = true;
  try {
    if (editingCommerce.value) {
      await updateCommerce(editingCommerce.value.id, form.value);
      showToast('Commerce mis à jour', 'success');
    } else {
      await createCommerce(form.value);
      showToast('Commerce créé', 'success');
    }
    formOpen.value = false;
    await refresh();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    saving.value = false;
  }
};

const handleOwnerSubmit = async () => {
  if (!ownerForm.value.name || !ownerForm.value.email || !ownerForm.value.password) {
    showToast('Nom, email et mot de passe requis', 'error');
    return;
  }
  saving.value = true;
  try {
    await createCommerceOwner(ownerCommerce.value.id, ownerForm.value);
    showToast('Compte principal créé', 'success');
    ownerOpen.value = false;
    await refresh();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    saving.value = false;
  }
};

const statusLabel = (status) => (status === 'active' ? 'Actif' : status === 'inactive' ? 'Inactif' : status);
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Commerces indépendants"
      subtitle="Gestion des commerces hors marché"
      action-label="Ajouter un commerce"
      :action-icon="Plus"
      @action="openCreate"
    />

    <FilterBar :show-clear="searchQuery || statusFilter !== 'all'" @clear="searchQuery = ''; statusFilter = 'all'">
      <div class="flex-1 space-y-1 w-full">
        <label class="text-xs font-medium text-muted-foreground">Recherche</label>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="Nom, téléphone, email..." class="pl-9 bg-card" />
        </div>
      </div>
      <div class="space-y-1 w-full sm:w-48">
        <label class="text-xs font-medium text-muted-foreground">Statut</label>
        <Select v-model="statusFilter">
          <SelectTrigger class="bg-card"><SelectValue placeholder="Tous" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FilterBar>

    <div class="bs-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Commerce</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Localisation</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="loading">
            <TableCell colspan="6" class="text-center text-muted-foreground py-8">Chargement...</TableCell>
          </TableRow>
          <TableRow v-else-if="!filteredCommerces.length">
            <TableCell colspan="6" class="text-center text-muted-foreground py-8">Aucun commerce trouvé</TableCell>
          </TableRow>
          <TableRow v-for="commerce in filteredCommerces" :key="commerce.id">
            <TableCell>
              <div class="flex items-center gap-2">
                <Store class="w-4 h-4 text-primary shrink-0" />
                <span class="font-medium">{{ commerce.name }}</span>
              </div>
            </TableCell>
            <TableCell>{{ commerce.type || '—' }}</TableCell>
            <TableCell>
              <div class="text-sm">{{ commerce.phone || '—' }}</div>
              <div class="text-xs text-muted-foreground">{{ commerce.email || '' }}</div>
            </TableCell>
            <TableCell>{{ [commerce.province, commerce.commune].filter(Boolean).join(', ') || '—' }}</TableCell>
            <TableCell>
              <Badge :class="commerce.status === 'active' ? 'bg-success/15 text-success border-0' : 'bg-muted text-muted-foreground border-0'">
                {{ statusLabel(commerce.status) }}
              </Badge>
            </TableCell>
            <TableCell class="text-right space-x-2">
              <Button variant="outline" size="sm" @click="openEdit(commerce)">Modifier</Button>
              <Button variant="outline" size="sm" @click="openOwner(commerce)">
                <UserPlus class="w-4 h-4" />
                Compte principal
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Dialog v-model:open="formOpen">
      <DialogContent class="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ editingCommerce ? 'Modifier le commerce' : 'Nouveau commerce' }}</DialogTitle>
          <DialogDescription>Informations du commerce indépendant</DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-2">
          <div class="grid gap-1.5">
            <Label>Nom *</Label>
            <Input v-model="form.name" placeholder="Boutique Jean" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="grid gap-1.5">
              <Label>Type</Label>
              <Input v-model="form.type" placeholder="Boutique générale" />
            </div>
            <div class="grid gap-1.5">
              <Label>Statut</Label>
              <Select v-model="form.status">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="grid gap-1.5"><Label>RCCM</Label><Input v-model="form.rccm" /></div>
            <div class="grid gap-1.5"><Label>NIF</Label><Input v-model="form.nif" /></div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="grid gap-1.5"><Label>Téléphone</Label><Input v-model="form.phone" /></div>
            <div class="grid gap-1.5"><Label>Email</Label><Input v-model="form.email" type="email" /></div>
          </div>
          <div class="grid gap-1.5"><Label>Adresse</Label><Input v-model="form.address" /></div>
          <div class="grid grid-cols-2 gap-3">
            <div class="grid gap-1.5">
              <Label>Province</Label>
              <Select v-model="form.province">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="p in PROVINCE_OPTIONS" :key="p.value" :value="p.value">{{ p.label }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="grid gap-1.5">
              <Label>Commune</Label>
              <Select v-model="form.commune">
                <SelectTrigger><SelectValue placeholder="Commune" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="c in communeOptions" :key="c.value" :value="c.value">{{ c.label }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="grid gap-1.5">
              <Label>Zone</Label>
              <Select v-model="form.zone">
                <SelectTrigger><SelectValue placeholder="Zone" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="z in zoneOptions" :key="z.value" :value="z.value">{{ z.label }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="grid gap-1.5">
              <Label>Colline</Label>
              <Select v-model="form.colline">
                <SelectTrigger><SelectValue placeholder="Colline" /></SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="c in collineOptions" :key="c.value" :value="c.value">{{ c.label }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="grid gap-1.5">
            <Label>Description</Label>
            <textarea v-model="form.description" rows="3" class="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="formOpen = false">Annuler</Button>
          <Button :disabled="saving" @click="handleSubmit">{{ saving ? 'Enregistrement...' : 'Enregistrer' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="ownerOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Créer compte principal</DialogTitle>
          <DialogDescription>
            Compte propriétaire pour <strong>{{ ownerCommerce?.name }}</strong>
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-2">
          <div class="grid gap-1.5"><Label>Nom *</Label><Input v-model="ownerForm.name" /></div>
          <div class="grid gap-1.5"><Label>Email *</Label><Input v-model="ownerForm.email" type="email" /></div>
          <div class="grid gap-1.5"><Label>Téléphone</Label><Input v-model="ownerForm.phone" /></div>
          <div class="grid gap-1.5"><Label>Mot de passe *</Label><Input v-model="ownerForm.password" type="password" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="ownerOpen = false">Annuler</Button>
          <Button :disabled="saving" @click="handleOwnerSubmit">{{ saving ? 'Création...' : 'Créer' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
