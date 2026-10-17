<script setup>
import { Store, MoreHorizontal, Eye, Pencil, Trash2, MapPin } from 'lucide-vue-next';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { getAdministrativeLocationLabel } from '../../../utils/burundiLocations.js';

defineProps({
  markets: { type: Array, required: true },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(['view', 'edit', 'delete']);

const occupationPercent = (market) => {
  if (!market.totalPlaces) return 0;
  return Math.round((market.occupiedPlaces / market.totalPlaces) * 100);
};

const statusVariant = (percent) => {
  if (percent >= 90) return 'destructive';
  if (percent >= 70) return 'secondary';
  return 'default';
};
</script>

<template>
  <div class="rounded-lg border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Marché</TableHead>
          <TableHead>Localisation</TableHead>
          <TableHead>Occupation</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="loading">
          <TableCell colspan="5" class="text-center py-8 text-muted-foreground">
            Chargement...
          </TableCell>
        </TableRow>
        <TableRow v-else-if="!markets.length">
          <TableCell colspan="5" class="text-center py-8 text-muted-foreground">
            Aucun marché trouvé.
          </TableCell>
        </TableRow>
        <TableRow v-for="market in markets" :key="market.id">
          <TableCell>
            <div class="flex items-center gap-3">
              <img
                :src="market.image"
                :alt="market.name"
                class="w-10 h-10 rounded-lg object-cover bg-muted"
              />
              <div class="min-w-0">
                <p class="font-medium text-sm truncate">{{ market.name }}</p>
                <p class="text-xs text-muted-foreground truncate flex items-center gap-1">
                  <MapPin class="w-3 h-3 shrink-0" />
                  {{ getAdministrativeLocationLabel(market) || market.location }}
                </p>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <span class="text-sm">{{ getAdministrativeLocationLabel(market) }}</span>
          </TableCell>
          <TableCell>
            <div class="space-y-1">
              <span class="text-sm font-medium">
                {{ market.occupiedPlaces }} / {{ market.totalPlaces }}
              </span>
              <div class="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  class="h-full bg-primary rounded-full"
                  :style="{ width: `${occupationPercent(market)}%` }"
                />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Badge :variant="statusVariant(occupationPercent(market))">
              {{ occupationPercent(market) >= 90 ? 'Saturation' : 'Connecté' }}
            </Badge>
          </TableCell>
          <TableCell class="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal class="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="emit('view', market)">
                  <Eye class="w-4 h-4 mr-2" />
                  Voir les détails
                </DropdownMenuItem>
                <DropdownMenuItem @click="emit('edit', market)">
                  <Pencil class="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  class="text-destructive focus:text-destructive"
                  @click="emit('delete', market)"
                >
                  <Trash2 class="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
