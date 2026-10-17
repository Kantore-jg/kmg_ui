<script setup>
import { computed } from 'vue';
import { Printer, Users, MapPin, Package } from 'lucide-vue-next';
import { useAdminScope } from '../../../composables/useAdminScope.js';
import { usePrintReport } from '../../../composables/usePrintReport.js';
import PageHeader from '../layout/PageHeader.vue';

const {
  isSuperAdmin,
  isMarketAdmin,
  isMerchant,
  assignedMarketId,
  scopedMarkets,
  findMarket,
} = useAdminScope();

const { openMerchantsPrint, openPlacesPrint, openProductsPrint } = usePrintReport();

const marketName = computed(() => {
  if (!assignedMarketId.value) return null;
  return findMarket(assignedMarketId.value)?.name;
});

const reports = computed(() => {
  const marketId = assignedMarketId.value || undefined;
  const items = [];

  if (isSuperAdmin.value || isMarketAdmin.value) {
    items.push(
      {
        id: 'merchants',
        title: 'Liste des commerçants',
        description: marketName.value
          ? `Tous les commerçants du marché ${marketName.value}`
          : 'Répertoire complet des commerçants par marché',
        icon: Users,
        action: () => openMerchantsPrint(marketId),
      },
      {
        id: 'places',
        title: 'Plan des emplacements',
        description: marketName.value
          ? `États des étals du marché ${marketName.value}`
          : 'Occupation et disponibilité des emplacements',
        icon: MapPin,
        action: () => openPlacesPrint(marketId),
      },
    );
  }

  items.push({
    id: 'products',
    title: isMerchant.value ? 'Mon catalogue produits' : 'Catalogue produits du marché',
    description: isMerchant.value
      ? 'Liste imprimable de vos produits et tarifs'
      : marketName.value
        ? `Produits référencés sur ${marketName.value}`
        : 'Catalogue produits filtrable par marché',
    icon: Package,
    action: () => openProductsPrint({ marketId }),
  });

  return items;
});
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Centre des rapports"
    />
    <!-- subtitle="Générez des rapports HTML prêts à imprimer pour votre marché." -->


    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <button
        v-for="report in reports"
        :key="report.id"
        type="button"
        class="bs-card-hover p-6 text-left group"
        @click="report.action"
      >
        <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
          <component :is="report.icon" class="w-6 h-6" />
        </div>
        <h3 class="font-semibold text-foreground mb-1">{{ report.title }}</h3>
        <p class="text-sm text-muted-foreground mb-4">{{ report.description }}</p>
        <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Printer class="w-3.5 h-3.5" />
          Ouvrir et imprimer
        </span>
      </button>
    </div>

  </div>
</template>
