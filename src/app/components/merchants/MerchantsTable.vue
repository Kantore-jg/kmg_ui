<script setup>
import { Eye, MoreHorizontal, ShieldCheck } from 'lucide-vue-next';
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
  merchants: { type: Array, required: true },
  getMarketLabel: { type: Function, required: true },
});

const emit = defineEmits(['view']);
</script>

<template>
  <div class="rounded-lg border border-border bg-card">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Commerçant</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead>Marché & étal</TableHead>
          <TableHead>Filière</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead class="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-if="!merchants.length">
          <TableCell colspan="6" class="text-center py-8 text-muted-foreground">
            Aucun commerçant trouvé.
          </TableCell>
        </TableRow>
        <TableRow v-for="merchant in merchants" :key="merchant.id">
          <TableCell>
            <div class="flex items-center gap-3">
              <img :src="merchant.image" class="w-9 h-9 rounded-lg object-cover" />
              <span class="font-medium text-sm">{{ merchant.name }}</span>
            </div>
          </TableCell>
          <TableCell class="text-sm">{{ merchant.phone }}</TableCell>
          <TableCell class="text-sm">
            {{ getMarketLabel(merchant.activeMarketId) }}
            <span class="text-muted-foreground"> · {{ merchant.activePlaceNumber || merchant.activePlaceId }}</span>
          </TableCell>
          <TableCell>{{ merchant.category }}</TableCell>
          <TableCell>
            <Badge :variant="merchant.verified ? 'default' : 'secondary'">
              <ShieldCheck class="w-3 h-3 mr-1" />
              {{ merchant.verified ? 'Habilité' : 'En attente' }}
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
                <DropdownMenuItem @click="emit('view', merchant)">
                  <Eye class="w-4 h-4 mr-2" />
                  Voir le profil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
