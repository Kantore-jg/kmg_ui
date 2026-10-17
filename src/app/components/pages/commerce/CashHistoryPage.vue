<script setup>
import { ref, onMounted, watch } from 'vue';
import { fetchCurrentCashSession, fetchCashRegisters } from '../../../../api/services/commerce.js';
import { getErrorMessage } from '../../../../api/client.js';
import { useApp } from '../../../../composables/useApp.js';
import PageHeader from '../../layout/PageHeader.vue';
import Label from '../../ui/Label.vue';
import { Card, CardContent } from '../../ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../ui/table';
import { formatFbu } from '../../../../utils/money.js';

const { showToast } = useApp();
const registers = ref([]);
const registerId = ref('');
const session = ref(null);
const loading = ref(true);

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
    if (registers.value.length) registerId.value = String(registers.value[0].id);
    else loading.value = false;
  } catch (error) {
    showToast(getErrorMessage(error), 'error');
    loading.value = false;
  }
});

watch(registerId, () => { void loadSession(); });
</script>

<template>
  <div class="space-y-6">
    <PageHeader title="Historique caisse" subtitle="Mouvements de la session en cours" />

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

    <div v-else-if="session" class="bs-card overflow-hidden">
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
            <TableCell colspan="4" class="text-center text-muted-foreground py-8">Aucun mouvement</TableCell>
          </TableRow>
          <TableRow v-for="m in session.movements" :key="m.id">
            <TableCell>{{ (m.moved_at || '').split('T')[0] }}</TableCell>
            <TableCell>{{ m.type }}</TableCell>
            <TableCell>{{ m.motif || '—' }}</TableCell>
            <TableCell class="text-right">{{ formatFbu(m.amount) }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Card v-else>
      <CardContent class="py-10 text-center text-muted-foreground">
        Aucune session de caisse active. L'historique s'affichera lorsqu'une caisse est ouverte.
      </CardContent>
    </Card>
  </div>
</template>
