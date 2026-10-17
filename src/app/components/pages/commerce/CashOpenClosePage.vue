<script setup>
import { ref, onMounted } from 'vue';
import {
  fetchCashRegisters,
  fetchCurrentCashSession,
  openCashSession,
  closeCashSession,
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
import { formatFbu } from '../../../../utils/money.js';

const { showToast } = useApp();

const registers = ref([]);
const session = ref(null);
const loading = ref(true);
const submitting = ref(false);

const openForm = ref({ cashRegisterId: '', openingFloat: 0, notes: '' });
const closeForm = ref({ closingCounted: 0, notes: '' });

async function refresh() {
  loading.value = true;
  try {
    registers.value = await fetchCashRegisters();
    if (registers.value.length && !openForm.value.cashRegisterId) {
      openForm.value.cashRegisterId = String(registers.value[0].id);
    }
    session.value = openForm.value.cashRegisterId
      ? await fetchCurrentCashSession(Number(openForm.value.cashRegisterId))
      : null;
    if (session.value?.theoretical_balance) {
      closeForm.value.closingCounted = session.value.theoretical_balance;
    }
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    loading.value = false;
  }
}

onMounted(() => { void refresh(); });

async function handleOpen() {
  if (!openForm.value.cashRegisterId) {
    showToast('Sélectionnez une caisse', 'error');
    return;
  }
  submitting.value = true;
  try {
    await openCashSession({
      cashRegisterId: Number(openForm.value.cashRegisterId),
      openingFloat: Number(openForm.value.openingFloat) || 0,
      notes: openForm.value.notes,
    });
    showToast('Caisse ouverte', 'success');
    await refresh();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    submitting.value = false;
  }
}

async function handleClose() {
  if (!session.value?.id) return;
  submitting.value = true;
  try {
    await closeCashSession(session.value.id, {
      closingCounted: Number(closeForm.value.closingCounted) || 0,
      notes: closeForm.value.notes,
    });
    showToast('Caisse fermée', 'success');
    await refresh();
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Ouverture / fermeture" subtitle="Gestion des sessions de caisse" />

    <div v-if="loading" class="text-sm text-muted-foreground">Chargement...</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card v-if="!session">
        <CardHeader><CardTitle class="text-base">Ouvrir une caisse</CardTitle></CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-1.5">
            <Label>Caisse *</Label>
            <Select v-model="openForm.cashRegisterId">
              <SelectTrigger><SelectValue placeholder="Caisse" /></SelectTrigger>
              <SelectContent>
                <SelectItem v-for="r in registers" :key="r.id" :value="String(r.id)">{{ r.name }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid gap-1.5">
            <Label>Fond de caisse (FBu)</Label>
            <Input v-model.number="openForm.openingFloat" type="number" min="0" />
          </div>
          <div class="grid gap-1.5">
            <Label>Notes</Label>
            <Input v-model="openForm.notes" />
          </div>
          <Button :disabled="submitting" @click="handleOpen">{{ submitting ? 'Ouverture...' : 'Ouvrir la caisse' }}</Button>
        </CardContent>
      </Card>

      <Card v-else>
        <CardHeader><CardTitle class="text-base">Fermer la caisse</CardTitle></CardHeader>
        <CardContent class="space-y-4">
          <p class="text-sm text-muted-foreground">
            Caisse : <strong>{{ session.register?.name }}</strong> —
            Solde théorique : <strong class="text-primary">{{ formatFbu(session.theoretical_balance) }}</strong>
          </p>
          <div class="grid gap-1.5">
            <Label>Montant compté (FBu) *</Label>
            <Input v-model.number="closeForm.closingCounted" type="number" min="0" />
          </div>
          <div class="grid gap-1.5">
            <Label>Notes</Label>
            <Input v-model="closeForm.notes" />
          </div>
          <Button variant="destructive" :disabled="submitting" @click="handleClose">
            {{ submitting ? 'Fermeture...' : 'Fermer la caisse' }}
          </Button>
        </CardContent>
      </Card>

      <Card v-if="session" class="lg:col-span-2">
        <CardContent class="py-6 text-sm text-muted-foreground">
          Session ouverte le {{ (session.opened_at || '').split('T')[0] }} —
          Fond initial : {{ formatFbu(session.opening_float) }}
        </CardContent>
      </Card>
    </div>
  </div>
</template>
