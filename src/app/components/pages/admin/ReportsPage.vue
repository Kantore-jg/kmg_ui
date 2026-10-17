<script setup>
import { computed, ref } from 'vue';
import {
  Download,
  Layers3,
  MapPin,
  Package,
  Store,
  ShoppingCart,
  Users,
} from 'lucide-vue-next';
import { useApp } from '../../../../composables/useApp.js';
import { useAdminScope } from '../../../../composables/useAdminScope.js';
import { getAdministrativeLocationLabel } from '../../../../utils/burundiLocations.js';
import { sameId } from '../../../../utils/ids.js';
import { downloadCsvReport } from '../../../../utils/reportExport.js';
import Button from '../../ui/Button.vue';
import Badge from '../../ui/Badge.vue';
import PageHeader from '../../layout/PageHeader.vue';
import StatCard from '../../StatCard.vue';
import Card from '../../ui/card/Card.vue';
import CardContent from '../../ui/card/CardContent.vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';

const { markets } = useApp();
const {
  isSuperAdmin,
  isMarketAdmin,
  isMarketOwner,
  isMerchant,
  assignedMarketId,
  assignedMerchant,
  scopedMarkets,
  scopedMerchants,
  scopedPlaces,
  scopedBlocks,
  scopedProducts,
  scopedSales,
  findMarket,
  findMerchant,
} = useAdminScope();

const activeTab = ref(isMerchant.value ? 'products' : 'markets');
const marketFilter = ref('all');
const previewLimit = 8;

const selectedMarketId = computed(() => {
  if (isSuperAdmin.value) {
    return marketFilter.value === 'all' ? null : marketFilter.value;
  }
  if (isMerchant.value) {
    return assignedMerchant.value?.activeMarketId || null;
  }
  if (isMarketAdmin.value || isMarketOwner.value) {
    return assignedMarketId.value || null;
  }
  return null;
});

const marketScopeLabel = computed(() => {
  if (selectedMarketId.value) {
    return findMarket(selectedMarketId.value)?.name || 'Marché sélectionné';
  }
  return 'Tous les marchés';
});

const marketOptions = computed(() => markets.value.slice().sort((a, b) => a.name.localeCompare(b.name)));

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatNumber = (value) => Number(value || 0).toLocaleString('fr-FR');

const filterByMarket = (list, getter) => {
  if (!selectedMarketId.value) return list;
  return list.filter((item) => sameId(getter(item), selectedMarketId.value));
};

const marketsRows = computed(() =>
  filterByMarket(scopedMarkets.value, (market) => market.id).map((market) => {
    const occupied = Number(market.occupiedPlaces || 0);
    const total = Number(market.totalPlaces || 0);
    return {
      id: market.id,
      name: market.name,
      province: market.province || '—',
      commune: market.commune || '—',
      zone: market.zone || '—',
      colline: market.colline || '—',
      location: market.location || market.administrativeLocation || getAdministrativeLocationLabel(market) || '—',
      categories: market.productCategories?.length ? market.productCategories.join(', ') : '—',
      totalPlaces: total,
      occupiedPlaces: occupied,
      freePlaces: Math.max(total - occupied, 0),
      status: market.isActive ? 'Actif' : 'Inactif',
    };
  }),
);

const placesRows = computed(() =>
  filterByMarket(scopedPlaces.value, (place) => place.marketId).map((place) => {
    const merchant = place.merchantId ? findMerchant(place.merchantId) : null;
    return {
      id: place.id,
      market: findMarket(place.marketId)?.name || '—',
      block: place.blockName || '—',
      row: place.rowName || '—',
      status: place.status || '—',
      categories: place.categories?.length ? place.categories.join(', ') : place.category || '—',
      merchant: merchant?.name || '—',
      phone: merchant?.phone || '—',
    };
  }),
);

const blocksRows = computed(() =>
  filterByMarket(scopedBlocks.value, (block) => block.marketId).map((block) => ({
    id: block.id,
    name: block.name,
    code: block.code || '—',
    market: findMarket(block.marketId)?.name || '—',
    description: block.description || '—',
    totalPlaces: block.totalPlaces ?? 0,
    placesCount: block.placesCount ?? 0,
    status: block.isActive ? 'Actif' : 'Inactif',
  })),
);

const merchantsRows = computed(() =>
  filterByMarket(scopedMerchants.value, (merchant) => merchant.activeMarketId).map((merchant) => ({
    id: merchant.id,
    name: merchant.name,
    phone: merchant.phone || '—',
    email: merchant.email || '—',
    market: findMarket(merchant.activeMarketId)?.name || '—',
    place: merchant.activePlaceNumber || merchant.activePlaceId || '—',
    category: merchant.category || '—',
    productsCount: merchant.productsCount ?? 0,
    verified: merchant.verified ? 'Habilité' : 'En attente',
  })),
);

const productsRows = computed(() =>
  filterByMarket(scopedProducts.value, (product) => product.marketId).map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category || '—',
    market: findMarket(product.marketId)?.name || '—',
    merchant: findMerchant(product.merchantId)?.name || '—',
    place: product.placeNumber || '—',
    unit: product.unit || '—',
    price: formatNumber(product.price),
    stock: product.stock ?? 0,
    availability: product.available === false ? 'Indisponible' : 'Disponible',
    trending: product.isTrending ? 'Oui' : 'Non',
  })),
);

const salesRows = computed(() =>
  filterByMarket(scopedSales.value, (sale) => sale.marketId).map((sale) => ({
    id: sale.id,
    invoice: sale.invoiceNumber || '—',
    date: formatDateTime(sale.createdAtFull || sale.createdAt),
    market: sale.marketName || findMarket(sale.marketId)?.name || '—',
    merchant: sale.merchantName || '—',
    client: sale.clientName || '—',
    payment:
      sale.paymentType === 'cash'
        ? 'Espèces'
        : sale.paymentType === 'electronic'
          ? 'Électronique'
          : sale.paymentType === 'credit'
            ? 'Crédit'
            : sale.paymentType || '—',
    subtotal: formatNumber(sale.subtotal),
    paidAmount: formatNumber(sale.paidAmount || 0),
    remainingAmount: formatNumber(sale.remainingAmount || 0),
    total: formatNumber(sale.total),
    itemsCount: sale.items?.length || 0,
    place: sale.placeNumber || '—',
  })),
);

const buildSection = ({ key, label, icon, description, filename, columns, rows }) => ({
  key,
  label,
  icon,
  description,
  filename,
  columns,
  rows,
  previewRows: rows.slice(0, previewLimit),
  count: rows.length,
});

const reportSections = computed(() => {
  if (isMerchant.value) {
    return [
      buildSection({
        key: 'products',
        label: 'Produits',
        icon: Package,
        filename: 'rapport-produits',
        columns: [
          { key: 'name', label: 'Produit' },
          { key: 'category', label: 'Catégorie' },
          { key: 'market', label: 'Marché' },
          { key: 'merchant', label: 'Commerçant' },
          { key: 'place', label: 'Étal' },
          { key: 'unit', label: 'Unité' },
          { key: 'price', label: 'Prix' },
          { key: 'stock', label: 'Stock' },
          { key: 'availability', label: 'Statut' },
          { key: 'trending', label: 'Tendance' },
        ],
        rows: productsRows.value,
      }),
      buildSection({
        key: 'sales',
        label: 'Ventes',
        icon: ShoppingCart,
        filename: 'rapport-ventes',
        columns: [
          { key: 'invoice', label: 'Facture' },
          { key: 'date', label: 'Date' },
          { key: 'market', label: 'Marché' },
          { key: 'merchant', label: 'Commerçant' },
          { key: 'client', label: 'Client' },
          { key: 'payment', label: 'Paiement' },
          { key: 'subtotal', label: 'Sous-total' },
          { key: 'paidAmount', label: 'Payé' },
          { key: 'remainingAmount', label: 'Reste' },
          { key: 'total', label: 'Total' },
          { key: 'itemsCount', label: 'Articles' },
          { key: 'place', label: 'Étal' },
        ],
        rows: salesRows.value,
      }),
    ];
  }

  return [
    buildSection({
      key: 'markets',
      label: 'Marchés',
      icon: Store,
      filename: 'rapport-marches',
      columns: [
        { key: 'name', label: 'Marché' },
        { key: 'province', label: 'Province' },
        { key: 'commune', label: 'Commune' },
        { key: 'zone', label: 'Zone' },
        { key: 'colline', label: 'Colline' },
        { key: 'categories', label: 'Catégories' },
        { key: 'totalPlaces', label: 'Places total' },
        { key: 'occupiedPlaces', label: 'Occupées' },
        { key: 'freePlaces', label: 'Libres' },
        { key: 'status', label: 'Statut' },
      ],
      rows: marketsRows.value,
    }),
    buildSection({
      key: 'places',
      label: 'Emplacements',
      icon: MapPin,
      filename: 'rapport-emplacements',
      columns: [
        { key: 'market', label: 'Marché' },
        { key: 'block', label: 'Bloc' },
        { key: 'row', label: 'Emplacement' },
        { key: 'categories', label: 'Filière' },
        { key: 'merchant', label: 'Commerçant' },
        { key: 'phone', label: 'Téléphone' },
        { key: 'status', label: 'Statut' },
      ],
      rows: placesRows.value,
    }),
    buildSection({
      key: 'blocks',
      label: 'Blocs',
      icon: Layers3,
      filename: 'rapport-blocs',
      columns: [
        { key: 'name', label: 'Bloc' },
        { key: 'code', label: 'Code' },
        { key: 'market', label: 'Marché' },
        { key: 'description', label: 'Description' },
        { key: 'totalPlaces', label: 'Places total' },
        { key: 'placesCount', label: 'Places référencées' },
        { key: 'status', label: 'Statut' },
      ],
      rows: blocksRows.value,
    }),
    buildSection({
      key: 'merchants',
      label: 'Commerçants',
      icon: Users,
      filename: 'rapport-commercants',
      columns: [
        { key: 'name', label: 'Commerçant' },
        { key: 'phone', label: 'Téléphone' },
        { key: 'email', label: 'Email' },
        { key: 'market', label: 'Marché' },
        { key: 'place', label: 'Étal' },
        { key: 'category', label: 'Filière' },
        { key: 'productsCount', label: 'Produits' },
        { key: 'verified', label: 'Habilitation' },
      ],
      rows: merchantsRows.value,
    }),
  ];
});

const selectedMarketCount = computed(() => {
  if (selectedMarketId.value) return 1;
  return marketOptions.value.length;
});

const exportSection = (section) => {
  if (!section) return;
  const today = new Date().toISOString().split('T')[0];
  downloadCsvReport({
    filename: `${section.filename}-${today}.csv`,
    columns: section.columns,
    rows: section.rows,
  });
};
</script>

<template>
  <div class="space-y-6">
    <!-- <PageHeader title="Centre des rapports" />

    <Card class="p-5">
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Périmètre actif</p>
          <h2 class="text-lg font-semibold text-foreground">{{ marketScopeLabel }}</h2>
          <p class="text-sm text-muted-foreground">
            Les onglets ci-dessous regroupent les rapports opérationnels. Chaque section peut être exportée en
            format Excel compatible.
          </p>
        </div>

        <div class="flex items-end gap-3 flex-wrap">
          <div v-if="isSuperAdmin" class="space-y-1 min-w-56">
            <label class="text-xs font-medium text-muted-foreground">Filtre marché</label>
            <Select v-model="marketFilter">
              <SelectTrigger class="bg-card">
                <SelectValue placeholder="Tous les marchés" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les marchés</SelectItem>
                <SelectItem v-for="market in marketOptions" :key="market.id" :value="market.id">
                  {{ market.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Badge variant="secondary" class="rounded-full px-3 py-1.5">
            {{ selectedMarketCount }} marché(s)
          </Badge>
        </div>
      </div>
    </Card> -->

    <!-- <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
      <StatCard title="Marchés" :value="marketsRows.length" :icon="Store" color="primary" />
      <StatCard title="Emplacements" :value="placesRows.length" :icon="MapPin" color="secondary" />
      <StatCard title="Blocs" :value="blocksRows.length" :icon="Layers3" color="warning" />
      <StatCard title="Commerçants" :value="merchantsRows.length" :icon="Users" color="success" />
      <StatCard title="Produits" :value="productsRows.length" :icon="Package" color="pink" />
      <StatCard title="Ventes" :value="salesRows.length" :icon="ShoppingCart" color="primary" />
    </div> -->

    <Tabs v-model="activeTab" class="space-y-4">
      <div class="overflow-x-auto">
        <TabsList class="w-full min-w-max justify-start gap-2 bg-muted/70 p-1">
          <TabsTrigger
            v-for="section in reportSections"
            :key="section.key"
            :value="section.key"
            class="min-w-36 justify-between gap-2 px-4"
          >
            <span class="inline-flex items-center gap-2">
              <component :is="section.icon" class="w-4 h-4" />
              {{ section.label }}
            </span>
            <Badge variant="secondary" class="rounded-full px-2 py-0.5 text-[10px]">
              {{ section.count }}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        v-for="section in reportSections"
        :key="section.key"
        :value="section.key"
      >
        <Card class="p-5">
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div class="space-y-1">
              <h3 class="text-lg font-semibold text-foreground">{{ section.label }}</h3>
              <p class="text-sm text-muted-foreground">{{ section.description }}</p>
              <p class="text-xs text-muted-foreground">
                {{ section.count }} enregistrement(s) 
              </p>
            </div>

            <Button variant="outline" class="rounded-full" @click="exportSection(section)">
              <Download class="w-4 h-4" />
              Exporter Excel
            </Button>
          </div>

          <CardContent class="px-0 pt-5">
            <div class="overflow-hidden rounded-xl border border-border">
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-muted/50">
                    <tr>
                      <th
                        v-for="column in section.columns"
                        :key="column.key"
                        class="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap"
                      >
                        {{ column.label }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!section.previewRows.length">
                      <td
                        :colspan="section.columns.length"
                        class="px-4 py-8 text-center text-muted-foreground"
                      >
                        Aucun enregistrement à afficher pour ce rapport.
                      </td>
                    </tr>
                    <tr
                      v-for="row in section.previewRows"
                      :key="row.id"
                      class="border-t border-border/70"
                    >
                      <td
                        v-for="column in section.columns"
                        :key="`${row.id}-${column.key}`"
                        class="px-4 py-3 align-top text-foreground"
                      >
                        {{ row[column.key] }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <p v-if="section.rows.length > section.previewRows.length" class="mt-3 text-xs text-muted-foreground">
              Aperçu limité aux {{ section.previewRows.length }} premières lignes. L’export contient l’ensemble des données.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
