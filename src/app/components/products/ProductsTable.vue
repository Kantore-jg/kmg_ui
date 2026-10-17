<script setup>
import { Pencil, Trash2, MoreHorizontal } from 'lucide-vue-next';
import Badge from '../ui/Badge.vue';
import Button from '../ui/Button.vue';
import Switch from '../ui/Switch.vue';
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
  products: { type: Array, required: true },
  getMerchantName: { type: Function, required: true },
  getMarketCity: { type: Function, required: true },
});

const emit = defineEmits(['edit', 'delete', 'toggle-availability']);

const formatPrice = (n) => Number(n).toLocaleString('fr-FR');
</script>

<template>
  <div class="rounded-lg border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produit</TableHead>
          <TableHead>Catégorie</TableHead>
          <TableHead>Prix</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Vendeur</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="!products.length">
          <TableCell colspan="7" class="text-center py-8 text-muted-foreground">
            Aucun produit dans le catalogue.
          </TableCell>
        </TableRow>
        <TableRow v-for="product in products" :key="product.id">
          <TableCell>
            <div class="flex items-center gap-3">
              <img
                v-if="product.image"
                :src="product.image"
                :alt="product.name"
                class="w-9 h-9 rounded-lg object-cover bg-muted"
              />
              <div
                v-else
                class="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-bold"
              >
                N/A
              </div>
              <div>
                <p class="font-medium text-sm">{{ product.name }}</p>
               
              </div>
            </div>
          </TableCell>
          <TableCell>{{ product.category }}</TableCell>
          <TableCell class="font-medium text-primary">
            {{ formatPrice(product.price) }} BIF
            <span class="text-muted-foreground font-normal text-xs">/ {{ product.unit }}</span>
          </TableCell>
          <TableCell>
            <span :class="product.stock <= 5 ? 'text-destructive font-medium' : ''">
              {{ product.stock }}
            </span>
          </TableCell>
          <TableCell>
            <div class="flex items-center gap-2">
              <Switch
                :checked="product.available !== false"
                @update:checked="emit('toggle-availability', product)"
              />
              <Badge :variant="product.available === false ? 'secondary' : 'default'">
                {{ product.available === false ? 'Indisponible' : 'Disponible' }}
              </Badge>
            </div>
          </TableCell>
          <TableCell class="text-sm">
            <p>{{ getMerchantName(product.merchantId) }}</p>
            <p class="text-xs text-muted-foreground">
              {{ getMarketCity(product.marketId) }}
            </p>
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
                <DropdownMenuItem @click="emit('edit', product)">
                  <Pencil class="w-4 h-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  class="text-destructive focus:text-destructive"
                  @click="emit('delete', product)"
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
