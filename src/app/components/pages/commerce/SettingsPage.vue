<script setup>
import { ref, onMounted } from 'vue';
import { updateCurrentCommerce } from '../../../../api/services/commerce.js';
import { getErrorMessage } from '../../../../api/client.js';
import { useApp } from '../../../../composables/useApp.js';
import { useCommerceScope } from '../../../../composables/useCommerceScope.js';
import PageHeader from '../../layout/PageHeader.vue';
import Button from '../../ui/Button.vue';
import Input from '../../ui/Input.vue';
import Label from '../../ui/Label.vue';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
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
const { currentCommerce, canManageSettings, loadCommerce } = useCommerceScope();

const saving = ref(false);
const PROVINCE_OPTIONS = getProvinceOptions();

const form = ref({
  name: '',
  type: '',
  rccm: '',
  nif: '',
  phone: '',
  email: '',
  address: '',
  province: '',
  commune: '',
  zone: '',
  colline: '',
  description: '',
  status: 'active',
});

function syncForm() {
  const c = currentCommerce.value;
  if (!c) return;
  form.value = {
    name: c.name,
    type: c.type,
    rccm: c.rccm,
    nif: c.nif,
    phone: c.phone,
    email: c.email,
    address: c.address,
    province: c.province,
    commune: c.commune,
    zone: c.zone,
    colline: c.colline,
    description: c.description,
    status: c.status,
  };
}

onMounted(async () => {
  await loadCommerce();
  syncForm();
});

async function handleSubmit() {
  if (!canManageSettings.value) {
    showToast('Vous n\'avez pas la permission de modifier les paramètres', 'error');
    return;
  }
  saving.value = true;
  try {
    await updateCurrentCommerce(form.value);
    showToast('Paramètres enregistrés', 'success');
    await loadCommerce();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Paramètres" subtitle="Informations du commerce" />

    <Card v-if="!canManageSettings">
      <CardContent class="py-10 text-center text-muted-foreground">
        Vous n'avez pas accès à la modification des paramètres.
      </CardContent>
    </Card>

    <Card v-else>
      <CardHeader><CardTitle class="text-base">Informations générales</CardTitle></CardHeader>
      <CardContent class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="grid gap-1.5"><Label>Nom *</Label><Input v-model="form.name" /></div>
          <div class="grid gap-1.5"><Label>Type</Label><Input v-model="form.type" /></div>
          <div class="grid gap-1.5"><Label>RCCM</Label><Input v-model="form.rccm" /></div>
          <div class="grid gap-1.5"><Label>NIF</Label><Input v-model="form.nif" /></div>
          <div class="grid gap-1.5"><Label>Téléphone</Label><Input v-model="form.phone" /></div>
          <div class="grid gap-1.5"><Label>Email</Label><Input v-model="form.email" type="email" /></div>
        </div>
        <div class="grid gap-1.5"><Label>Adresse</Label><Input v-model="form.address" /></div>
        <div class="grid grid-cols-2 gap-4">
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
                <SelectItem v-for="c in getCommuneOptions(form.province)" :key="c.value" :value="c.value">{{ c.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid gap-1.5">
            <Label>Zone</Label>
            <Select v-model="form.zone">
              <SelectTrigger><SelectValue placeholder="Zone" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="z in getZoneOptions(form.province, form.commune)" :key="z.value" :value="z.value">{{ z.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid gap-1.5">
            <Label>Colline</Label>
            <Select v-model="form.colline">
              <SelectTrigger><SelectValue placeholder="Colline" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="c in getCollineOptions(form.province, form.commune, form.zone)" :key="c.value" :value="c.value">{{ c.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="grid gap-1.5">
          <Label>Description</Label>
          <textarea v-model="form.description" rows="3" class="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div class="flex justify-end">
          <Button :disabled="saving" @click="handleSubmit">{{ saving ? 'Enregistrement...' : 'Enregistrer' }}</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
