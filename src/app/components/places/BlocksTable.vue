<script setup>
import { Pencil, Trash2, MoreHorizontal, LayoutGrid, Plus } from 'lucide-vue-next';
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

defineProps({
  blocks: { type: Array, required: true },
  getMarketName: { type: Function, required: true },
  readonly: { type: Boolean, default: false },
});

const emit = defineEmits(['edit', 'delete', 'add-place']);
</script>

<template>
  <div class="rounded-lg border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bloc</TableHead>
          <TableHead>Marché</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Loyer</TableHead>
          <TableHead>Étals</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead v-if="!readonly" class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="!blocks.length">
          <TableCell :colspan="readonly ? 6 : 7" class="text-center py-8 text-muted-foreground">
            Aucun bloc configuré. Créez un bloc pour organiser les emplacements.
          </TableCell>
        </TableRow>
        <TableRow v-for="block in blocks" :key="block.id">
          <TableCell>
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <LayoutGrid class="w-4 h-4 text-primary" />
              </div>
              <div>
                <p class="font-medium text-sm">{{ block.name }}</p>
                <p v-if="block.description" class="text-xs text-muted-foreground line-clamp-1">
                  {{ block.description }}
                </p>
              </div>
            </div>
          </TableCell>
          <TableCell class="text-sm">{{ getMarketName(block.marketId) }}</TableCell>
          <TableCell class="text-sm text-muted-foreground">{{ block.code || '—' }}</TableCell>
          <TableCell class="text-sm font-medium">
            {{ Number(block.rentAmount || 0).toLocaleString('fr-FR') }} BIF
          </TableCell>
          <TableCell class="font-medium">{{ block.placesCount ?? block.totalPlaces ?? 0 }}</TableCell>
          <TableCell>
            <Badge :variant="block.isActive ? 'default' : 'secondary'">
              {{ block.isActive ? 'Actif' : 'Inactif' }}
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
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="emit('add-place', block)">
                  <Plus class="w-4 h-4 mr-2" />
                  Ajouter un emplacement
                </DropdownMenuItem>
                <DropdownMenuItem @click="emit('edit', block)">
                  <Pencil class="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  class="text-destructive focus:text-destructive"
                  @click="emit('delete', block)"
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
