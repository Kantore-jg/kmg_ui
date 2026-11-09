<script setup>
import { computed, ref } from 'vue';
import { Store } from 'lucide-vue-next';
import { useApp } from '../../../../composables/useApp.js';
import { getAdministrativeLocationLabel } from '../../../../utils/burundiLocations.js';
import PageHeader from '../../layout/PageHeader.vue';
import MarketFormDialog from '../../markets/MarketFormDialog.vue';
import Button from '../../ui/Button.vue';
import { Card, CardContent } from '../../ui/card';

const { markets, places, merchants, addMarket, updateMarket } = useApp();

const formOpen = ref(false);

const market = computed(() => markets.value[0] || null);
const placeCount = computed(() =>
  market.value ? places.value.filter((place) => place.marketId == market.value.id).length : 0,
);
const merchantCount = computed(() =>
  market.value ? merchants.value.filter((item) => item.activeMarketId == market.value.id).length : 0,
);

const openForm = () => {
  formOpen.value = true;
};

const handleFormSubmit = (payload) => {
  if (payload.id) {
    updateMarket(payload);
  } else {
    addMarket(payload);
  }
};
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Le marché"
      :action-label="market ? 'Modifier la fiche' : 'Créer le marché'"
      :action-icon="Store"
      @action="openForm"
    />

    <Card v-if="market">
      <CardContent class="p-6 space-y-4">
        <div class="flex flex-col md:flex-row gap-6">
          <img
            v-if="market.image"
            :src="market.image"
            :alt="market.name"
            class="w-full md:w-64 h-40 object-cover rounded-xl"
          />
          <div class="space-y-2">
            <h2 class="text-2xl font-semibold">{{ market.name }}</h2>
            <p class="text-sm text-muted-foreground">{{ getAdministrativeLocationLabel(market) }}</p>
            <p class="text-sm">{{ market.description || 'Aucune description.' }}</p>
            <p class="text-sm">
              {{ placeCount }} emplacement(s) · {{ merchantCount }} commerçant(s) ·
              {{ market.occupiedPlaces }} occupé(s) / {{ market.totalPlaces }}
            </p>
          </div>
        </div>
        <Button variant="outline" @click="openForm">Modifier</Button>
      </CardContent>
    </Card>

    <Card v-else>
      <CardContent class="p-6 text-sm text-muted-foreground">
        Aucun marché n'est encore configuré.
      </CardContent>
    </Card>

    <MarketFormDialog
      v-model:open="formOpen"
      :market="market"
      @submit="handleFormSubmit"
    />
  </div>
</template>
