<script setup>
import { Tags, MoreHorizontal, Pencil, Trash2 } from 'lucide-vue-next';
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
  categories: { type: Array, required: true },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(['edit', 'delete']);
</script>

<template>
  <div class="rounded-lg border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Catégorie</TableHead>
          <TableHead>Produits</TableHead>
          <TableHead>Marchés</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="loading">
          <TableCell colspan="4" class="text-center py-8 text-muted-foreground">
            Chargement...
          </TableCell>
        </TableRow>
        <TableRow v-else-if="!categories.length">
          <TableCell colspan="4" class="text-center py-8 text-muted-foreground">
            Aucune catégorie trouvée.
          </TableCell>
        </TableRow>
        <TableRow v-for="category in categories" :key="category.id">
          <TableCell>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Tags class="w-4 h-4 text-primary" />
              </div>
              <div class="min-w-0">
                <p class="font-medium text-sm truncate">{{ category.name }}</p>
                <p v-if="category.description" class="text-xs text-muted-foreground truncate">
                  {{ category.description }}
                </p>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <span class="text-sm font-medium">{{ category.productsCount ?? 0 }}</span>
          </TableCell>
          <TableCell>
            <span class="text-sm font-medium">{{ category.marketsCount ?? 0 }}</span>
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
                <DropdownMenuItem @click="emit('edit', category)">
                  <Pencil class="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  class="text-destructive focus:text-destructive"
                  @click="emit('delete', category)"
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