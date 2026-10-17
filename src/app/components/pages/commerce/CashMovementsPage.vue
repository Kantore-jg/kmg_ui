<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  fetchCurrentCashSession,
  fetchCashRegisters,
  createCashMovement,
} from '../../../../api/services/commerce.js';
import { getErrorMessage } from '../../../../api/client.js';
import { useApp } from '../../../../composables/useApp.js';
import PageHeader from '../../layout/PageHeader.vue';
import Button from '../../ui/Button.vue';
import Input from '../../ui/Input.vue';
import Label from '../../ui/Label.vue';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../ui/select';

const route = useRoute();
const router = useRouter();
const { showToast } = useApp();

const registers = ref([]);
const registerId = ref('');
const session = ref(null);
const loading = ref(true);
const submitting = ref(false);
const activeTab = ref(route.query.tab === 'out' ? 'out' : 'in');

const form = ref({ type: 'CASH_IN', amount: 0, motif: '' });

watch(activeTab, (tab) => {
  form.value.type = tab === 'out' ? 'CASH_OUT' : 'CASH_IN';
  router.replace({ query: { tab } });
});

async function loadSession() {
  if (!registerId.value) {
    session.value = null;
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    session.value = await fetchCurrentCashSession(Number(registerId.value));
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
    session.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  try {
    registers.value = await fetchCashRegisters();
    if (registers.value.length) registerId.value = String(registers.value[0].id);
    else loading.value = false;
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
    loading.value = false;
  }
});

watch(registerId, () => { void loadSession(); });

async function submit() {
  if (!session.value?.id) {
    showToast('Aucune session ouverte', 'error');
    return;
  }
  if (!form.value.amount || form.value.amount <= 0) {
    showToast('Montant invalide', 'error');
    return;
  }
  submitting.value = true;
  try {
    await createCashMovement({
      cashSessionId: session.value.id,
      type: form.value.type,
      amount: Number(form.value.amount),
      motif: form.value.motif,
    });
    showToast('Mouvement enregistré', 'success');
    form.value.amount = 0;
    form.value.motif = '';
    session.value = await fetchCurrentCashSession(Number(registerId.value));
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Mouvements caisse" subtitle="Entrées et sorties de caisse" />

    <div class="flex gap-2">
      <Button :variant="activeTab === 'in' ? 'default' : 'outline'" @click="activeTab = 'in'">Entrées</Button>
      <Button :variant="activeTab === 'out' ? 'default' : 'outline'" @click="activeTab = 'out'">Sorties</Button>
    </div>

    <div v-if="registers.length" class="max-w-xs space-y-1">
      <Label class="text-xs">Caisse</Label>
      <Select v-model="registerId">
        <SelectTrigger class="bg-card"><SelectValue placeholder="Caisse" /></SelectTrigger>
        <SelectContent>
          <SelectItem v-for="r in registers" :key="r.id" :value="String(r.id)">{{ r.name }}</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div v-if="loading" class="text-sm text-muted-foreground">Chargement...</div>

    <Card v-else-if="session">
      <CardHeader>
        <CardTitle class="text-base">
          {{ activeTab === 'in' ? 'Entrée de caisse' : 'Sortie de caisse' }}
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4 max-w-md">
        <div v-if="activeTab === 'out'" class="grid gap-1.5">
          <Label>Type de sortie</Label>
          <Select v-model="form.type">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH_OUT">Sortie</SelectItem>
              <SelectItem value="EXPENSE">Dépense</SelectItem>
              <SelectItem value="WITHDRAWAL">Retrait</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="grid gap-1.5">
          <Label>Montant (FBu) *</Label>
          <Input v-model.number="form.amount" type="number" min="0" />
        </div>
        <div class="grid gap-1.5">
          <Label>Motif</Label>
          <Input v-model="form.motif" />
        </div>
        <Button :disabled="submitting" @click="submit">{{ submitting ? 'Enregistrement...' : 'Enregistrer' }}</Button>
      </CardContent>
    </Card>

    <Card v-else>
      <CardContent class="py-10 text-center text-muted-foreground">
        Aucune session ouverte. Ouvrez une caisse d'abord.
      </CardContent>
    </Card>
  </div>
</template>
