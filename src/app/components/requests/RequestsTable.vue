<script setup>
import { computed } from 'vue';
import { CheckCircle, XCircle } from 'lucide-vue-next';
import Badge from '../ui/Badge.vue';
import Button from '../ui/Button.vue';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const props = defineProps({
  requests: { type: Array, required: true },
  markets: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
});

const emit = defineEmits(['approve', 'reject']);

const marketById = computed(() => new Map(props.markets.map((market) => [String(market.id), market])));

const statusMeta = (status) => {
  const map = {
    pending: { label: 'En attente', variant: 'secondary' },
    approved: { label: 'Approuvé', variant: 'default' },
    rejected: { label: 'Rejeté', variant: 'destructive' },
  };

  return map[status] || { label: status, variant: 'outline' };
};

function getMarketName(marketId) {
  return marketById.value.get(String(marketId))?.name || '—';
}

function getCategories(item) {
  if (item.categories?.length) return item.categories.join(', ');
  return item.category || '—';
}
</script>

<template>
  <div class="rounded-xl border border-border bg-card overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Demandeur</TableHead>
          <TableHead>Marché</TableHead>
          <TableHead>Activité</TableHead>
          <TableHead>Catégories</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead v-if="!readonly" class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow v-if="loading">
          <TableCell :colspan="readonly ? 6 : 7" class="text-center py-10 text-muted-foreground">
            Chargement...
          </TableCell>
        </TableRow>

        <TableRow v-else-if="!requests.length">
          <TableCell :colspan="readonly ? 6 : 7" class="text-center py-10 text-muted-foreground">
            Aucun dossier trouvé.
          </TableCell>
        </TableRow>

        <TableRow v-for="item in requests" :key="item.id">
          <TableCell class="whitespace-normal align-top">
            <div class="space-y-1 min-w-0">
              <p class="font-medium text-sm text-foreground truncate">
                {{ item.merchantName }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ item.merchantPhone }}
              </p>
            </div>
          </TableCell>

          <TableCell class="whitespace-normal align-top">
            <div class="space-y-1">
              <p class="text-sm text-foreground">
                {{ getMarketName(item.requestedMarketId) }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ item.assignedPlaceNumber || 'À assigner' }}
              </p>
            </div>
          </TableCell>

          <TableCell class="whitespace-normal align-top">
            <div class="max-w-[320px] space-y-1">
              <p class="text-sm font-medium text-foreground break-words">
                {{ item.activityType || '—' }}
              </p>
              <p v-if="item.description" class="text-xs text-muted-foreground break-words">
                {{ item.description }}
              </p>
            </div>
          </TableCell>

          <TableCell class="whitespace-normal align-top">
            <p class="max-w-[280px] text-sm text-muted-foreground break-words">
              {{ getCategories(item) }}
            </p>
          </TableCell>

          <TableCell class="whitespace-normal align-top">
            <p class="text-sm text-muted-foreground">
              {{ item.submittedDate }}
            </p>
          </TableCell>

          <TableCell class="whitespace-normal align-top">
            <Badge :variant="statusMeta(item.status).variant">
              {{ statusMeta(item.status).label }}
            </Badge>
          </TableCell>

          <TableCell v-if="!readonly" class="text-right whitespace-normal align-top">
            <div v-if="item.status === 'pending'" class="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                class="text-destructive border-destructive/30 hover:bg-destructive/10"
                @click="emit('reject', item)"
              >
                <XCircle class="w-4 h-4" />
                Rejeter
              </Button>
              <Button size="sm" @click="emit('approve', item)">
                <CheckCircle class="w-4 h-4" />
                Approuver & assigner
              </Button>
            </div>
            <span v-else class="text-xs text-muted-foreground">
              Traité
            </span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
