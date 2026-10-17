<script setup>
import { MoreHorizontal, Pencil, Settings2, Trash2 } from 'lucide-vue-next';
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
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { placeStatusBadgeVariant, placeStatusLabel } from '../../../utils/placeStatus.js';

defineProps({
  places: { type: Array, required: true },
  getMerchant: { type: Function, required: true },
  getMarketName: { type: Function, required: true },
  readonly: { type: Boolean, default: false },
});

const emit = defineEmits(['assign', 'edit', 'delete']);

const statusVariant = placeStatusBadgeVariant;
const statusLabel = placeStatusLabel;
</script>

<template>
  <div class="rounded-lg border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Étal</TableHead>
          <TableHead>Marché</TableHead>
          <TableHead>Bloc / Allée</TableHead>
          <TableHead>Catégories</TableHead>
          <TableHead>Occupant</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead v-if="!readonly" class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="!places.length">
          <TableCell :colspan="readonly ? 6 : 7" class="text-center py-8 text-muted-foreground">
            Aucun emplacement trouvé.
          </TableCell>
        </TableRow>
        <TableRow v-for="place in places" :key="place.id + place.marketId">
          <TableCell class="font-medium">{{ place.id }}</TableCell>
          <TableCell class="text-sm">{{ getMarketName(place.marketId) }}</TableCell>
          <TableCell class="text-sm text-muted-foreground">
            {{ place.blockName }} · {{ place.rowName }}
          </TableCell>
          <TableCell>
            <span v-if="place.categories?.length" class="text-sm">{{ place.categories.join(', ') }}</span>
            <span v-else class="text-sm text-muted-foreground">—</span>
          </TableCell>
          <TableCell>
            <div v-if="getMerchant(place.merchantId)" class="flex items-center gap-2">
              <img
                :src="getMerchant(place.merchantId).image"
                class="w-7 h-7 rounded-md object-cover"
              />
              <span class="text-sm">{{ getMerchant(place.merchantId).name }}</span>
            </div>
            <span v-else class="text-sm text-muted-foreground italic">Aucun</span>
          </TableCell>
          <TableCell>
            <Badge :variant="statusVariant(place.status)">
              {{ statusLabel(place.status) }}
            </Badge>
          </TableCell>
          <TableCell v-if="!readonly" class="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal class="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="emit('edit', place)">
                  <Pencil class="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem @click="emit('assign', place)">
                  <Settings2 class="w-4 h-4 mr-2" />
                  Gérer l'affectation
                </DropdownMenuItem>
                <DropdownMenuItem
                  class="text-destructive focus:text-destructive"
                  @click="emit('delete', place)"
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
