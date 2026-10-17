<script setup>
import { ref, onMounted, watch } from 'vue';
import { fetchCurrentCashSession, fetchCashRegisters } from '../../../../api/services/commerce.js';
import { getErrorMessage } from '../../../../api/client.js';
import { useApp } from '../../../../composables/useApp.js';
import PageHeader from '../../layout/PageHeader.vue';
import Badge from '../../ui/Badge.vue';
import Label from '../../ui/Label.vue';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../ui/table';
import { formatFbu } from '../../../../utils/money.js';

const { showToast } = useApp();
const registers = ref([]);
const registerId = ref('');
const session = ref(null);
const loading = ref(true);

const movementLabels = {
  CASH_IN: 'Entrée',
  CASH_OUT: 'Sortie',
  EXPENSE: 'Dépense',
  WITHDRAWAL: 'Retrait',
  SALE: 'Vente',
};

async function loadSession() {
  if (!registerId.value) {
    session.value = null;
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
    if (registers.value.length) {
      registerId.value = String(registers.value[0].id);
    }
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
    loading.value = false;
  }
});

watch(registerId, () => { void loadSession(); });
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Caisse actuelle" subtitle="Session de caisse ouverte" />

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

    <template v-else-if="session">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader class="pb-2"><CardTitle class="text-sm text-muted-foreground">Caisse</CardTitle></CardHeader>
          <CardContent><p class="text-lg font-bold">{{ session.register?.name || '—' }}</p></CardContent>
        </Card>
        <Card>
          <CardHeader class="pb-2"><CardTitle class="text-sm text-muted-foreground">Fond de caisse</CardTitle></CardHeader>
          <CardContent><p class="text-lg font-bold">{{ formatFbu(session.opening_float) }}</p></CardContent>
        </Card>
        <Card>
          <CardHeader class="pb-2"><CardTitle class="text-sm text-muted-foreground">Solde théorique</CardTitle></CardHeader>
          <CardContent><p class="text-lg font-bold text-primary">{{ formatFbu(session.theoretical_balance) }}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle class="text-base flex items-center gap-2">
            Mouvements
            <Badge class="bg-success/15 text-success border-0">{{ session.status === 'open' ? 'Ouverte' : session.status }}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead class="text-right">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="!session.movements?.length">
                <TableCell colspan="4" class="text-center text-muted-foreground py-6">Aucun mouvement</TableCell>
              </TableRow>
              <TableRow v-for="m in session.movements" :key="m.id">
                <TableCell>{{ (m.moved_at || '').split('T')[0] }}</TableCell>
                <TableCell>{{ movementLabels[m.type] || m.type }}</TableCell>
                <TableCell>{{ m.motif || '—' }}</TableCell>
                <TableCell class="text-right font-medium">{{ formatFbu(m.amount) }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </template>

    <Card v-else>
      <CardContent class="py-10 text-center text-muted-foreground">
        Aucune session de caisse ouverte. Ouvrez une caisse depuis « Ouverture / fermeture ».
      </CardContent>
    </Card>
  </div>
</template>
