<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { MapPin, Store, Users, Package } from 'lucide-vue-next';
import Button from '../ui/Button.vue';
import Badge from '../ui/Badge.vue';
import { getAdministrativeLocationLabel } from '../../../utils/burundiLocations.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

const props = defineProps({
  open: { type: Boolean, default: false },
  market: { type: Object, default: null },
  placesCount: { type: Number, default: 0 },
  merchantsCount: { type: Number, default: 0 },
  productsCount: { type: Number, default: 0 },
});

const emit = defineEmits(['update:open', 'edit']);

const router = useRouter();

const occupationPercent = computed(() => {
  if (!props.market?.totalPlaces) return 0;
  return Math.round((props.market.occupiedPlaces / props.market.totalPlaces) * 100);
});

const close = () => emit('update:open', false);

const goToPlaces = () => {
  close();
  router.push('/admin/places');
};
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-xl" v-if="market">
      <DialogHeader>
        <DialogTitle>{{ market.name }}</DialogTitle>
        <DialogDescription class="flex items-center gap-1">
          <MapPin class="w-3.5 h-3.5" />
          {{ getAdministrativeLocationLabel(market) || market.location }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <img
          :src="market.coverImage || market.image"
          :alt="market.name"
          class="w-full h-40 rounded-lg object-cover"
        />

        <p class="text-sm text-muted-foreground leading-relaxed">{{ market.description }}</p>

        <div class="grid grid-cols-3 gap-3">
          <div class="p-3 rounded-lg border border-border bg-muted/30 text-center">
            <Store class="w-4 h-4 mx-auto text-primary mb-1" />
            <p class="text-lg font-semibold">{{ market.occupiedPlaces }}/{{ market.totalPlaces }}</p>
            <p class="text-xs text-muted-foreground">Étals ({{ occupationPercent }}%)</p>
          </div>
          <div class="p-3 rounded-lg border border-border bg-muted/30 text-center">
            <Users class="w-4 h-4 mx-auto text-primary mb-1" />
            <p class="text-lg font-semibold">{{ merchantsCount }}</p>
            <p class="text-xs text-muted-foreground">Commerçants</p>
          </div>
          <div class="p-3 rounded-lg border border-border bg-muted/30 text-center">
            <Package class="w-4 h-4 mx-auto text-primary mb-1" />
            <p class="text-lg font-semibold">{{ productsCount }}</p>
            <p class="text-xs text-muted-foreground">Produits</p>
          </div>
        </div>

        <div v-if="market.productCategories?.length" class="flex flex-wrap gap-2">
          <Badge v-for="category in market.productCategories" :key="category" variant="secondary">
            {{ category }}
          </Badge>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="close">Fermer</Button>
        <Button variant="outline" @click="emit('edit', market); close()">Modifier</Button>
        <Button @click="goToPlaces">Gérer les emplacements</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
