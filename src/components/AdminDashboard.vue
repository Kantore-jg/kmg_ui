<!--
  @license
  SPDX-License-Identifier: Apache-2.0
-->

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useApp } from '../composables/useApp.js';
import { getAdministrativeLocationLabel } from '../utils/burundiLocations.js';
import { sameId } from '../utils/ids.js';
import { PLACE_STATUS, placeStatusLabel } from '../utils/placeStatus.js';

const props = defineProps({
  embedded: { type: Boolean, default: false },
  tab: { type: String, default: null },
});
import {
  LayoutDashboard,
  Store,
  MapPin,
  Users,
  Package,
  FileText,
  Plus,
  Edit3,
  Trash2,
  X,
  Shield,
  Upload,
  Coins,
  Eye,
  Menu,
} from 'lucide-vue-next';

const router = useRouter();
const {
  currentUser,
  markets,
  merchants,
  products,
  productCategories,
  places,
  requests,
  receipts,
  sales,
  addProduct,
  updateProduct,
  deleteProduct,
  updateRequestStatus,
  updateReceiptStatus,
  updatePlaceStatus,
  addPaymentReceipt,
  showToast,
} = useApp();

const activeTab = ref(props.tab || 'dashboard');
const mobileSidebarOpen = ref(false);

watch(
  () => props.tab,
  (newTab) => {
    if (newTab) activeTab.value = newTab;
  },
);

onMounted(() => {
  if (props.tab) activeTab.value = props.tab;
});

const productModalOpen = ref(false);
const currentEditingProduct = ref(null);

const pName = ref('');
const pPrice = ref(0);
const pCategoryId = ref('');
const pUnit = ref('kg');
const pDescription = ref('');
const pStock = ref(50);
const pAvailable = ref(true);
const pImage = ref('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400');

const assignModalOpen = ref(false);
const assignPlaceId = ref('');
const assignMarketId = ref('');
const assignMerchantId = ref('all_free');

const receiptModalOpen = ref(false);
const recMonth = ref('Juin 2026');
const recAmount = ref(35000);
const recFile = ref(null);
const recFileName = ref('Aucun fichier sélectionné');

const isSuperAdmin = computed(() => currentUser.value.role === 'SUPER_ADMIN');
const isMarketAdmin = computed(() => currentUser.value.role === 'ADMIN_MARCHE');
const isMerchant = computed(() => currentUser.value.role === 'COMMERCANT');

const assignedMarketId = computed(() =>
  isMarketAdmin.value ? (currentUser.value.marketId || null) : null
);
const assignedMarketObj = computed(() =>
  assignedMarketId.value ? markets.value.find((m) => sameId(m.id, assignedMarketId.value)) : null
);

const assignedMerchantIdValue = computed(() =>
  isMerchant.value ? (currentUser.value.merchantId || null) : null
);
const assignedMerchantObj = computed(() =>
  assignedMerchantIdValue.value
    ? merchants.value.find((m) => sameId(m.id, assignedMerchantIdValue.value))
    : null
);

const filteredPlaces = computed(() =>
  places.value.filter((p) => !assignedMarketId.value || p.marketId === assignedMarketId.value)
);
const filteredMerchants = computed(() =>
  merchants.value.filter((m) => !assignedMarketId.value || m.activeMarketId === assignedMarketId.value)
);
const filteredProducts = computed(() =>
  products.value.filter((p) => {
    if (isMerchant.value) return p.merchantId === assignedMerchantIdValue.value;
    if (isMarketAdmin.value) return p.marketId === assignedMarketId.value;
    return true;
  })
);
const filteredRequests = computed(() =>
  requests.value.filter((r) => !assignedMarketId.value || r.requestedMarketId === assignedMarketId.value)
);
const filteredReceipts = computed(() =>
  receipts.value.filter((r) => {
    if (isMerchant.value) return r.merchantId === assignedMerchantIdValue.value;
    if (isMarketAdmin.value) {
      const merchantIdsInMarket = merchants.value
        .filter((m) => m.activeMarketId === assignedMarketId.value)
        .map((m) => m.id);
      return merchantIdsInMarket.includes(r.merchantId);
    }
    return true;
  })
);
const filteredSales = computed(() =>
  sales.value.filter((sale) => {
    if (isMerchant.value) return sale.merchantId === assignedMerchantIdValue.value;
    if (isMarketAdmin.value) return sale.marketId === assignedMarketId.value;
    return true;
  })
);

const pendingRequestsCount = computed(() =>
  filteredRequests.value.filter((r) => r.status === 'pending').length
);
const pendingReceiptsCount = computed(() =>
  filteredReceipts.value.filter((r) => r.status === 'pending').length
);
const salesTotal = computed(() =>
  filteredSales.value.reduce((sum, sale) => sum + Number(sale.total || 0), 0)
);
const vacantPlacesCount = computed(() =>
  filteredPlaces.value.filter((p) => p.status === PLACE_STATUS.AVAILABLE).length
);
const marketAdminPlacesCount = computed(() =>
  places.value.filter((p) => p.marketId === assignedMarketId.value).length
);

function handleOpenProductModal(prod = null) {
  if (prod) {
    currentEditingProduct.value = prod;
    pName.value = prod.name;
    pPrice.value = prod.price;
    pCategoryId.value = prod.categoryId ?? productCategories.value.find((cat) => cat.name === prod.category)?.id ?? '';
    pUnit.value = prod.unit;
    pDescription.value = prod.description;
    pStock.value = prod.stock;
    pAvailable.value = prod.available;
    pImage.value = prod.image;
  } else {
    currentEditingProduct.value = null;
    pName.value = '';
    pPrice.value = 10000;
    pCategoryId.value = productCategories.value[0]?.id || '';
    pUnit.value = 'kg';
    pDescription.value = '';
    pStock.value = 100;
    pAvailable.value = true;
    pImage.value =
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';
  }
  productModalOpen.value = true;
}

function handleProductSubmit(e) {
  e.preventDefault();
  if (!pName.value || pPrice.value <= 0 || !pCategoryId.value) {
    showToast('Coordonnées du produit invalides', 'error');
    return;
  }

  const marketContext = isMerchant.value
    ? assignedMerchantObj.value?.activeMarketId || null
    : assignedMarketId.value || markets.value[0]?.id || null;

  const merchantContext = isMerchant.value
    ? assignedMerchantObj.value
    : merchants.value.find((m) => sameId(m.activeMarketId, marketContext))
      || merchants.value.find((m) => sameId(m.id, currentEditingProduct.value?.merchantId))
      || merchants.value[0]
      || null;

  if (!marketContext || !merchantContext) {
    showToast('Impossible de déterminer un marché ou un commerçant réel pour ce produit', 'error');
    return;
  }

  if (currentEditingProduct.value) {
    updateProduct({
      ...currentEditingProduct.value,
      name: pName.value,
      price: pPrice.value,
      categoryId: pCategoryId.value,
      unit: pUnit.value,
      description: pDescription.value,
      stock: pStock.value,
      available: pAvailable.value,
      image: pImage.value,
      marketId: currentEditingProduct.value.marketId || marketContext,
      merchantId: currentEditingProduct.value.merchantId || merchantContext.id,
    });
  } else {
    addProduct({
      name: pName.value,
      price: pPrice.value,
      categoryId: pCategoryId.value,
      unit: pUnit.value,
      description: pDescription.value,
      stock: pStock.value,
      available: pAvailable.value,
      image: pImage.value,
      marketId: marketContext,
      merchantId: merchantContext.id,
      placeId: merchantContext.activePlaceId || null,
      isTrending: false,
    });
  }

  productModalOpen.value = false;
}

async function handleReceiptSubmit(e) {
  e.preventDefault();
  if (!isMerchant.value || !assignedMerchantObj.value) {
    showToast('Seul un commerçant affecté peut transmettre un reçu.', 'error');
    return;
  }
  if (!recFile.value) {
    showToast('Veuillez sélectionner un fichier de reçu.', 'error');
    return;
  }

  const created = await addPaymentReceipt({
    file: recFile.value,
    marketId: assignedMerchantObj.value.activeMarketId || null,
    amount: recAmount.value,
    reference: recMonth.value,
  });

  if (created) {
    recFile.value = null;
    recFileName.value = 'Aucun fichier sélectionné';
    receiptModalOpen.value = false;
  }
}

function handleAssignSubmit(e) {
  e.preventDefault();
  if (assignMerchantId.value === 'all_free') {
    updatePlaceStatus(assignPlaceId.value, assignMarketId.value, PLACE_STATUS.AVAILABLE);
  } else {
    updatePlaceStatus(
      assignPlaceId.value,
      assignMarketId.value,
      PLACE_STATUS.OCCUPIED,
      assignMerchantId.value,
    );
  }
  assignModalOpen.value = false;
}

function openAssignModal(placeId, marketId, merchantId) {
  assignPlaceId.value = placeId;
  assignMarketId.value = marketId;
  assignMerchantId.value = merchantId;
  assignModalOpen.value = true;
}

function openDefaultAssignModal() {
  assignPlaceId.value = filteredPlaces.value[0]?.id || '';
  assignMarketId.value = assignedMarketId.value || markets.value[0]?.id || '';
  assignMerchantId.value = 'all_free';
  assignModalOpen.value = true;
}

function onReceiptFileChange(event) {
  const file = event.target.files?.[0] || null;
  recFile.value = file;
  recFileName.value = file ? file.name : 'Aucun fichier sélectionné';
}

function setActiveTab(tab) {
  activeTab.value = tab;
  mobileSidebarOpen.value = false;
}

function getMerchantForPlace(place) {
  return merchants.value.find((m) => m.id === place.merchantId);
}

function getMarketById(id) {
  return markets.value.find((mark) => mark.id === id);
}

function getMerchantById(id) {
  return merchants.value.find((v) => v.id === id);
}
</script>

<template>
  <div
    :class="[
      'relative text-xs font-semibold text-slate-700',
      embedded ? 'w-full' : 'min-h-screen bg-slate-50 flex flex-col lg:flex-row',
    ]"
  >

    <!-- 1. SIDEBAR FOR ADMINISTRATION (Dashboard theme: Stripe/Metronic) -->
    <aside
      v-if="!embedded"
      :class="[
        'w-full lg:w-64 bg-slate-900 text-slate-100 shrink-0 border-r border-slate-800 p-5 flex flex-col justify-between absolute lg:relative z-30 lg:z-10 h-full lg:h-auto min-h-screen transition-transform duration-300',
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >

      <div class="space-y-6">
        <!-- Header & Logo copy inside sidebar -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-display shadow">
              <Shield class="w-4.5 h-4.5 text-slate-950" />
            </div>
            <div>
              <h2 class="text-sm font-black tracking-tight text-white font-display">Akaguriro ERP</h2>
              <span class="text-[9px] uppercase tracking-widest text-emerald-400 font-extrabold">Espace Interne</span>
            </div>
          </div>

          <button
            @click="mobileSidebarOpen = false"
            class="lg:hidden p-1 text-slate-400 hover:text-white"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Connected User Identity details Badge -->
        <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1 bg-slate-950/40">
          <span class="text-[9.5px] text-slate-400 block font-bold">MUTATION ACTIVE :</span>
          <span class="text-white font-black block truncate">{{ currentUser.name }}</span>
          <span class="text-[9.5px] px-1.5 py-0.2 bg-emerald-950/80 border border-emerald-900/40 rounded text-emerald-400 inline-block uppercase font-bold tracking-tight">
            {{ currentUser.role.replace('_', ' ') }}
          </span>
        </div>

        <!-- Tabs switch panel based on active User ROLE -->
        <nav class="space-y-1.5 pt-4">

          <button
            @click="setActiveTab('dashboard')"
            :class="[
              'w-full py-2 px-3 rounded-lg text-left flex items-center gap-2.5 transition-colors',
              activeTab === 'dashboard' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300',
            ]"
          >
            <LayoutDashboard class="w-4.5 h-4.5" />
            <span>Vue d'ensemble</span>
          </button>

          <!-- SUPER_ADMIN Menu Options -->
          <template v-if="isSuperAdmin">
            <button
              @click="setActiveTab('markets')"
              :class="[
                'w-full py-2 px-3 rounded-lg text-left flex items-center gap-2.5 transition-colors',
                activeTab === 'markets' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300',
              ]"
            >
              <Store class="w-4.5 h-4.5" />
              <span>Marchés Nationaux ({{ markets.length }})</span>
            </button>
            <button
              @click="setActiveTab('places')"
              :class="[
                'w-full py-2 px-3 rounded-lg text-left flex items-center gap-2.5 transition-colors',
                activeTab === 'places' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300',
              ]"
            >
              <MapPin class="w-4.5 h-4.5" />
              <span>Places & Étalages ({{ places.length }})</span>
            </button>
            <button
              @click="setActiveTab('merchants')"
              :class="[
                'w-full py-2 px-3 rounded-lg text-left flex items-center gap-2.5 transition-colors',
                activeTab === 'merchants' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300',
              ]"
            >
              <Users class="w-4.5 h-4.5" />
              <span>Commerçants ({{ merchants.length }})</span>
            </button>
          </template>

          <!-- ADMIN MARCHÉ Menu Options -->
          <template v-if="isMarketAdmin">
            <button
              @click="setActiveTab('places')"
              :class="[
                'w-full py-2 px-3 rounded-lg text-left flex items-center gap-2.5 transition-colors',
                activeTab === 'places' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300',
              ]"
            >
              <MapPin class="w-4.5 h-4.5" />
              <span>Gérer les Places ({{ marketAdminPlacesCount }})</span>
            </button>
            <button
              @click="setActiveTab('merchants')"
              :class="[
                'w-full py-2 px-3 rounded-lg text-left flex items-center gap-2.5 transition-colors',
                activeTab === 'merchants' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300',
              ]"
            >
              <Users class="w-4.5 h-4.5" />
              <span>Commerçants locaux</span>
            </button>
            <button
              @click="setActiveTab('requests')"
              :class="[
                'w-full py-2 px-3 rounded-lg text-left flex items-center justify-between transition-colors',
                activeTab === 'requests' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300',
              ]"
            >
              <div class="flex items-center gap-2.5">
                <FileText class="w-4.5 h-4.5" />
                <span>Demandes de Place</span>
              </div>
              <span
                v-if="pendingRequestsCount > 0"
                class="bg-orange-500 text-white font-black rounded-full px-2 py-0.2 text-[9px] animate-pulse"
              >
                {{ pendingRequestsCount }}
              </span>
            </button>
          </template>

          <!-- Common Admin/Merchant products tab -->
          <button
            @click="setActiveTab('products')"
            :class="[
              'w-full py-2 px-3 rounded-lg text-left flex items-center justify-between transition-colors',
              activeTab === 'products' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300',
            ]"
          >
            <div class="flex items-center gap-2.5">
              <Package class="w-4.5 h-4.5" />
              <span>{{ isMerchant ? "Mes Produits" : "Catalogue Produits" }}</span>
            </div>
            <span class="text-[10px] text-slate-400 font-bold bg-slate-950 px-1.5 py-0.2 rounded">
              {{ filteredProducts.length }}
            </span>
          </button>

          <!-- Financial Controls Tab for everyone (Merchant uploads, Admin validates) -->
          <button
            @click="setActiveTab('receipts')"
            :class="[
              'w-full py-2 px-3 rounded-lg text-left flex items-center justify-between transition-colors',
              activeTab === 'receipts' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-300',
            ]"
          >
            <div class="flex items-center gap-2.5">
              <Coins class="w-4.5 h-4.5" />
              <span>{{ isMerchant ? "Mes Redevances & Reçus" : "Paiements & Reçus" }}</span>
            </div>
            <span
              v-if="!isMerchant && pendingReceiptsCount > 0"
              class="bg-amber-500 text-slate-950 font-black rounded-full px-2 py-0.2 text-[9px]"
            >
              {{ pendingReceiptsCount }}
            </span>
          </button>

        </nav>
      </div>

      <!-- Bottom utility exits -->
      <div class="space-y-3 pt-6 border-t border-slate-800">
        <button
          @click="router.push('/')"
          class="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold py-2 rounded-lg text-center text-xs flex items-center justify-center gap-1.5"
        >
          <Eye class="w-4 h-4" />
          Retourner au portail
        </button>
        <div class="text-center text-[9px] text-slate-500 leading-normal font-medium">
          © 2026 Mairie de Bujumbura <br />
          République du Burundi
        </div>
      </div>

    </aside>

    <!-- 2. DYNAMIC WORKSPACE BAR -->
    <main
      :class="[
        'space-y-8 overflow-y-auto max-w-full',
        embedded ? 'w-full' : 'flex-1 p-4 sm:p-8',
      ]"
    >

      <!-- Mobile top header -->
      <div
        v-if="!embedded"
        class="lg:hidden flex items-center justify-between bg-white border border-slate-100 p-3 rounded-2xl shadow-sm mb-4"
      >
        <div class="flex items-center gap-2">
          <button
            @click="mobileSidebarOpen = true"
            class="p-1 text-slate-700 hover:text-emerald-600 rounded-lg"
          >
            <Menu class="w-6 h-6" />
          </button>
          <span class="text-xs font-black text-slate-900">Espace Administratif</span>
        </div>
        <span class="text-[8.5px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black">
          {{ currentUser.role }}
        </span>
      </div>

      <!-- Tab #1: SUMMARY DASHBOARD VIEW -->
      <div v-if="activeTab === 'dashboard' && !embedded" class="space-y-8 animate-fadeIn">

        <!-- Greeting with administrative notes -->
        <div class="space-y-1.5">
          <h1 class="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Tableau de Bord {{ isSuperAdmin ? "National" : isMarketAdmin ? "Mairie" : "Commerçant" }}
          </h1>
          <p class="text-xs text-slate-500 font-semibold">
            <template v-if="isSuperAdmin">Aperçu global consolidé des transactions, places occupées et redevances communales du Burundi.</template>
            <template v-else-if="isMarketAdmin">Secteur de gestion : {{ assignedMarketObj?.name }}.</template>
            <template v-else-if="isMerchant">Gérez vos produits en stock, surveillez votre taux de redevance et soumettez des justificatifs de paiement.</template>
          </p>
        </div>

        <!-- KPI STATS CARDS GRID -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
            <span class="text-[10px] text-slate-400 block font-bold uppercase">Nombre Etals d'activité</span>
            <strong class="text-xl sm:text-2xl font-black text-slate-900">
              {{ isMerchant ? 'Ét. ' + assignedMerchantObj?.activePlaceId : filteredPlaces.length }}
            </strong>
            <span class="text-[9px] text-slate-400 block font-medium">
              {{ isMerchant ? getAdministrativeLocationLabel(assignedMarketObj) : vacantPlacesCount + ' vacant(s)' }}
            </span>
          </div>

          <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
            <span class="text-[10px] text-slate-400 block font-bold uppercase">Commerçants Associés</span>
            <strong class="text-xl sm:text-2xl font-black text-slate-900">
              {{ isMerchant ? '1 (Vérifié)' : filteredMerchants.length }}
            </strong>
            <span class="text-[9px] text-emerald-500 block font-medium">Registre à jour</span>
          </div>

          <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
            <span class="text-[10px] text-slate-400 block font-bold uppercase">Articles Actifs</span>
            <strong class="text-xl sm:text-2xl font-black text-slate-900">{{ filteredProducts.length }}</strong>
            <span class="text-[9px] text-slate-400 block font-medium">Disponibles publiquement</span>
          </div>

          <div class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
            <span class="text-[10px] text-slate-400 block font-bold uppercase">Chiffre d'affaires des ventes</span>
            <strong class="text-xl sm:text-2xl font-black text-emerald-600">
              {{ salesTotal.toLocaleString('fr-FR') }} BIF
            </strong>
            <span class="text-[9px] text-emerald-500 block font-semibold">
              {{ filteredSales.length }} vente(s) enregistrée(s)
            </span>
          </div>

        </div>

        <!-- DYNAMIC CONTENT WIDGETS COLUMN -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <!-- Left Column: Recent notifications or receipts -->
          <div class="lg:col-span-12 space-y-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">Mises à jour Récentes de la Plateforme</h3>

            <div class="space-y-3">
              <div class="flex gap-3.5 items-start p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span class="w-2.5 h-2.5 mt-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <div class="space-y-0.5">
                  <p class="text-xs font-bold text-slate-800">Service de Cartographie Indoor Stable</p>
                  <p class="text-[11px] text-slate-500">
                    La reconfiguration géométrique des allées de Bujumbura Jabe est achevée. Les commerçants peuvent ré-allouer leurs étals de poissonnerie.
                  </p>
                </div>
              </div>

              <div class="flex gap-3.5 items-start p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span class="w-2.5 h-2.5 mt-1.5 rounded-full bg-blue-500 shrink-0"></span>
                <div class="space-y-0.5">
                  <p class="text-xs font-bold text-slate-800">Canaux publics rationalisés</p>
                  <p class="text-[11px] text-slate-500">
                    L'interface publique conserve les pages de consultation standard.
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="isMerchant && assignedMerchantObj"
              class="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800"
            >
              💡 <strong>Astuce :</strong> Vous êtes affecté à l'étal <strong>{{ assignedMerchantObj.activePlaceId }}</strong> du <strong>{{ assignedMarketObj?.name || 'Siyoni de Bujumbura' }}</strong>. Allez à l'onglet "Mes Produits" pour mettre à jour vos prix instantanément dans le catalogue national !
            </div>
          </div>

        </div>

      </div>

      <!-- Tab #2: MARKETS LIST TABLE (Super Admin only) -->
      <div v-if="activeTab === 'markets' && isSuperAdmin" class="space-y-6 animate-fadeIn">
        <div class="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100">
          <h2 class="text-lg font-extrabold text-slate-900">Registre des Marchés Publics Répertoriés</h2>
        </div>

        <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th class="py-3 px-4">image & nom</th>
                <th class="py-3 px-4">localisation</th>
                <th class="py-3 px-4">places occupées</th>
                <th class="py-3 px-4">statut de réseau</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              <tr v-for="m in markets" :key="m.id" class="hover:bg-slate-50/50">
                <td class="py-4 px-4 flex items-center gap-3">
                  <img :src="m.image" class="w-9 h-9 rounded-lg object-cover" />
                  <span class="font-extrabold text-slate-900">{{ m.name }}</span>
                </td>
                <td class="py-4 px-4">{{ getAdministrativeLocationLabel(m) || m.location }}</td>
                <td class="py-4 px-4">
                  <span class="font-bold text-slate-900">{{ m.occupiedPlaces }} / {{ m.totalPlaces }} occupied</span>
                </td>
                <td class="py-4 px-4">
                  <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[9px]">
                    CONNECTÉ
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab #3: PLACES / STALLS MANAGEMENT (Super Admin & Market Admin) -->
      <div v-if="activeTab === 'places' && !isMerchant" class="space-y-6 animate-fadeIn">

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h2 class="text-lg font-extrabold text-slate-900">Cartographie des Places et Locataires</h2>
            <p class="text-[11px] text-slate-400 font-medium">Affectez des commerçants ou modifiez le statut technique des étals.</p>
          </div>

          <button
            @click="openDefaultAssignModal"
            class="bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-3 py-2 rounded-xl flex items-center gap-1.5"
          >
            <Plus class="w-4 h-4 text-emerald-400" />
            Assigner ou Libérer Stall
          </button>
        </div>

        <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th class="py-3 px-4">Étalage ID</th>
                <th class="py-3 px-4">Bloc & Allée</th>
                <th class="py-3 px-4">Filière d'affaire</th>
                <th class="py-3 px-4">occupant actuel</th>
                <th class="py-3 px-4">Statut</th>
                <th class="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              <tr
                v-for="p in filteredPlaces"
                :key="p.id + p.marketId"
                class="hover:bg-slate-50/50"
              >
                <td class="py-3.5 px-4 font-black text-slate-900">{{ p.id }}</td>
                <td class="py-3.5 px-4 text-slate-500">{{ p.blockName }} • {{ p.rowName }}</td>
                <td class="py-3.5 px-4 font-bold text-slate-600">{{ p.category || 'Tout / Libre' }}</td>
                <td class="py-3.5 px-4">
                  <div v-if="getMerchantForPlace(p)" class="flex items-center gap-2">
                    <img :src="getMerchantForPlace(p).image" class="w-6 h-6 rounded-lg object-cover" />
                    <span class="font-extrabold text-slate-900">{{ getMerchantForPlace(p).name }}</span>
                  </div>
                  <span v-else class="text-slate-400 italic">Aucun</span>
                </td>
                <td class="py-3.5 px-4">
                  <span
                    :class="[
                      'px-2.5 py-0.5 rounded-full text-[9px] font-bold',
                      p.status === PLACE_STATUS.OCCUPIED ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      p.status === PLACE_STATUS.AVAILABLE ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                      'bg-amber-50 text-amber-700 border border-amber-100',
                    ]"
                  >
                    {{ placeStatusLabel(p.status) }}
                  </span>
                </td>
                <td class="py-3.5 px-4">
                  <div class="flex gap-1.5">
                    <button
                      @click="openAssignModal(p.id, p.marketId, p.merchantId || 'all_free')"
                      class="text-slate-500 hover:text-emerald-600 px-2.5 py-1 rounded-lg border border-slate-100 bg-slate-50 hover:bg-emerald-50"
                    >
                      Gérer l'affectation
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab #4: MERCHANTS OVERVIEW (Super Admin & Market Admin) -->
      <div v-if="activeTab === 'merchants' && !isMerchant" class="space-y-6 animate-fadeIn">

        <div class="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h2 class="text-lg font-extrabold text-slate-900">Répertoire des Commerçants Enregistrés</h2>
            <p class="text-[11px] text-slate-400 font-medium">Liste nominative des assujettis habilités à exploiter les étals publics.</p>
          </div>
        </div>

        <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th class="py-3 px-4">photo & nom</th>
                <th class="py-3 px-4">Téléphone</th>
                <th class="py-3 px-4">marché & place d'étal</th>
                <th class="py-3 px-4">filière d'affaire</th>
                <th class="py-3 px-4">Certification</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              <tr v-for="m in filteredMerchants" :key="m.id" class="hover:bg-slate-50/50">
                <td class="py-4 px-4 flex items-center gap-3">
                  <img :src="m.image" class="w-9 h-9 rounded-lg object-cover" />
                  <span class="font-extrabold text-slate-900">{{ m.name }}</span>
                </td>
                <td class="py-4 px-4">{{ m.phone }}</td>
                <td class="py-4 px-4">
                  <span class="font-bold text-slate-800">{{ getAdministrativeLocationLabel(getMarketById(m.activeMarketId)) || 'Siyoni' }}</span> • Place {{ m.activePlaceId }}
                </td>
                <td class="py-4 px-4">{{ m.category }}</td>
                <td class="py-4 px-4">
                  <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[9.5px] rounded-full border border-emerald-100">
                    OFFICIEL INTÉGRÉ
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab #5: PRODUCTS CATALOGUE / MANAGE (Super Admin, Market Admin, and Merchant) -->
      <div v-if="activeTab === 'products'" class="space-y-6 animate-fadeIn">

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h2 class="text-lg font-extrabold text-slate-900">
              {{ isMerchant ? "Catalogue d'Articles Référencés" : "Catalogue de Produits du Territoire" }}
            </h2>
            <p class="text-[11px] text-slate-400 font-medium">
              {{ isMerchant ? "Mettez en vente vos poissons frais, épices, et fruits cultivés." : "Index indicatif des prix des denrées de base." }}
            </p>
          </div>

          <button
            @click="handleOpenProductModal()"
            class="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow shadow-emerald-700/30"
          >
            <Plus class="w-4.5 h-4.5 text-white" />
            Mettre un produit en ligne
          </button>
        </div>

        <div v-if="filteredProducts.length === 0" class="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <p class="text-slate-400 text-sm mb-2">Aucun produit dans cette colonne.</p>
          <button
            @click="handleOpenProductModal()"
            class="text-emerald-600 font-bold text-xs"
          >
            Ajouter un nouvel article
          </button>
        </div>
        <div v-else class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th class="py-3 px-4">produit</th>
                <th class="py-3 px-4">filière / catégorie</th>
                <th class="py-3 px-4">prix unitaire</th>
                <th class="py-3 px-4">stock restant</th>
                <th class="py-3 px-4">vendeur & étal</th>
                <th class="py-3 px-4">actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              <tr v-for="p in filteredProducts" :key="p.id" class="hover:bg-slate-50/50">
                <td class="py-3.5 px-4 flex items-center gap-3">
                  <img :src="p.image" class="w-8 h-8 rounded-lg object-cover" />
                  <span class="font-extrabold text-slate-900">{{ p.name }}</span>
                </td>
                <td class="py-3.5 px-4">{{ p.category }}</td>
                <td class="py-3.5 px-4 text-emerald-600 font-extrabold">
                  {{ p.price.toLocaleString('fr-FR') }} BIF <span class="text-slate-400 font-normal">/ {{ p.unit }}</span>
                </td>
                <td class="py-3.5 px-4">
                  <span :class="['font-bold', p.stock <= 5 ? 'text-red-650' : 'text-slate-800']">
                    {{ p.stock }} {{ p.unit }}(s)
                  </span>
                </td>
                <td class="py-3.5 px-4">
                  <div>
                    <span class="text-slate-900 font-bold block">{{ getMerchantById(p.merchantId) ? getMerchantById(p.merchantId).name : '—' }}</span>
                    <span class="text-slate-400 text-[10px] block">{{ getAdministrativeLocationLabel(getMarketById(p.marketId)) || 'Siyoni' }} ({{ p.placeNumber }})</span>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <div class="flex gap-1">
                    <button
                      @click="handleOpenProductModal(p)"
                      class="p-1 px-2 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-950"
                      title="Modifier"
                    >
                      <Edit3 class="w-4 h-4 inline" />
                    </button>
                    <button
                      @click="deleteProduct(p.id)"
                      class="p-1 px-2 hover:bg-red-50 rounded text-red-400 hover:text-red-600"
                      title="Retirer"
                    >
                      <Trash2 class="w-4 h-4 inline" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab #6: PLACE REQUESTS APPROVAL TABLE (Market Admin only) -->
      <div v-if="activeTab === 'requests' && isMarketAdmin" class="space-y-6 animate-fadeIn">
        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <h2 class="text-lg font-extrabold text-slate-900">Dossiers d'Attribution en Cours</h2>
          <p class="text-[11px] text-slate-400 font-medium">Vérifiez les antécédents des candidats avant de valider l'octroi d'allée.</p>
        </div>

        <div v-if="filteredRequests.length === 0" class="text-center py-16 bg-white rounded-3xl border border-slate-150">
          <span class="text-slate-400 text-xs">Aucun dossier d'attribution reçu.</span>
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="item in filteredRequests"
            :key="item.id"
            class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4"
          >
            <div class="flex justify-between items-start">
              <div>
                <h4 class="text-sm font-black text-slate-900">{{ item.merchantName }}</h4>
                <p class="text-xs text-slate-400 font-bold tracking-tight">{{ item.merchantPhone }}</p>
              </div>

              <span
                :class="[
                  'px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase',
                  item.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-red-100 text-red-800',
                ]"
              >
                {{ item.status.toUpperCase() }}
              </span>
            </div>

            <div class="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-2">
              <p><strong class="text-slate-900">Activité Projetée :</strong> {{ item.activityType }}</p>
              <p><strong class="text-slate-900">Filière / Sector :</strong> {{ item.category }}</p>
              <p><strong class="text-slate-900">Justificatif de demande :</strong> "{{ item.description }}"</p>
            </div>

            <div v-if="item.status === 'pending'" class="flex gap-2 justify-end">
              <button
                @click="updateRequestStatus(item.id, 'rejected')"
                class="bg-slate-50 hover:bg-red-50 text-red-600 font-black border border-slate-200 hover:border-red-200 px-4 py-2 rounded-xl"
              >
                Rejeter le Dossier
              </button>
              <button
                @click="updateRequestStatus(item.id, 'approved')"
                class="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-xl"
              >
                Valider & Assigner Place d'Étals
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab #7: FINANCIAL RECEIPTS & FEES (Merchant uploads, Admin doublechecks) -->
      <div v-if="activeTab === 'receipts'" class="space-y-6 animate-fadeIn">

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <h2 class="text-lg font-extrabold text-slate-900">
              {{ isMerchant ? "Mes Justificatifs de Paiements Mensuels" : "Registre Général des Paiements Publics" }}
            </h2>
            <p class="text-[11px] text-slate-400 font-medium">
              {{ isMerchant ? "Téléversez vos quittances mairies pour valider votre place." : "Inspectez les pièces de paiement versées par les commerçants." }}
            </p>
          </div>

          <button
            v-if="isMerchant"
            @click="receiptModalOpen = true"
            class="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3.5 py-2 rounded-xl transition-all shadow shadow-emerald-700/30 flex items-center gap-1.5"
          >
            <Upload class="w-4 h-4" />
            Transmettre un Reçu de Quittance
          </button>
        </div>

        <div v-if="filteredReceipts.length === 0" class="text-center py-16 bg-white rounded-3xl border border-slate-150 p-8">
          <span class="text-slate-400 text-xs">Aucune quittance de redevance recensée.</span>
        </div>
        <div v-else class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th class="py-3 px-4">commerçant</th>
                <th class="py-3 px-4">Mois deRedevance</th>
                <th class="py-3 px-4">montant acquitté</th>
                <th class="py-3 px-4">Pièce Justificative</th>
                <th class="py-3 px-4">Statut Quittance</th>
                <th v-if="!isMerchant" class="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              <tr v-for="r in filteredReceipts" :key="r.id" class="hover:bg-slate-50/50">
                <td class="py-3.5 px-4 font-extrabold text-slate-900">{{ r.merchantName }}</td>
                <td class="py-3.5 px-4 text-slate-500">{{ r.month }}</td>
                <td class="py-3.5 px-4 font-black text-slate-900">{{ r.amount.toLocaleString('fr-FR') }} BIF</td>
                <td class="py-3.5 px-4 text-emerald-600 underline">
                  <a :href="r.receiptImage" target="_blank" rel="noreferrer" class="flex items-center gap-1 hover:text-emerald-500">
                    <Upload class="w-3.5 h-3.5" />
                    Voir Document
                  </a>
                </td>
                <td class="py-3.5 px-4">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase',
                      r.status === 'pending' ? 'bg-amber-150 text-amber-800' :
                      r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-red-100 text-red-850',
                    ]"
                  >
                    {{ r.status === 'pending' ? 'Attente de vérif.' : r.status === 'approved' ? 'Vérifié' : 'Rejeté' }}
                  </span>
                </td>

                <td v-if="!isMerchant" class="py-3.5 px-4">
                  <div v-if="r.status === 'pending'" class="flex gap-1">
                    <button
                      @click="updateReceiptStatus(r.id, 'approved')"
                      class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-250 px-2 py-1 rounded"
                    >
                      Accepter
                    </button>
                    <button
                      @click="updateReceiptStatus(r.id, 'rejected')"
                      class="bg-red-50 hover:bg-red-100 text-red-750 border border-red-200 px-2 py-1 rounded"
                    >
                      Rejeter
                    </button>
                  </div>
                  <span v-else class="text-slate-400 italic font-medium">Traité</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </main>

    <!-- 4. MODALS CONTAINER -->

    <!-- 4.1. PRODUCT CREATING / MODIFY MODAL -->
    <div
      v-if="productModalOpen"
      class="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 animate-fadeIn text-xs font-bold text-slate-700"
    >
      <div class="bg-white rounded-3xl border border-slate-100 p-6 w-full max-w-lg space-y-5">
        <div class="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <h3 class="text-sm font-extrabold text-slate-900">
              {{ currentEditingProduct ? "Modifier la fiche produit" : "Ajouter un produit en vente" }}
            </h3>
            <span class="text-[10px] text-slate-400">Renseignement des prix nationaux du Burundi.</span>
          </div>
          <button @click="productModalOpen = false" class="text-slate-400 hover:text-black">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleProductSubmit" class="space-y-4">

          <div class="space-y-1">
            <label class="text-slate-500 block">Désignation du Produit</label>
            <input
              v-model="pName"
              type="text"
              placeholder="ex. Mukeke frais de qualité royale"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none text-slate-800 font-medium"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-slate-500 block">Prix de Vente (BIF)</label>
              <input
                v-model.number="pPrice"
                type="number"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none text-slate-800 font-medium"
                required
              />
            </div>
            <div class="space-y-1">
              <label class="text-slate-500 block">Unité de mesure</label>
              <input
                v-model="pUnit"
                type="text"
                placeholder="ex. kg ou régime"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none text-slate-800 font-medium"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-slate-500 block">Catégorie / Filière alimentaire</label>
              <select
                v-model="pCategoryId"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-2.5 outline-none font-medium cursor-pointer"
              >
                <option v-for="cat in productCategories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="space-y-1">
              <label class="text-slate-500 block">Stock initial restant</label>
              <input
                v-model.number="pStock"
                type="number"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none text-slate-800 font-medium"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-slate-500 block">Lien Photo du Produit (Photo URL)</label>
            <input
              v-model="pImage"
              type="text"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none text-slate-705 font-medium"
            />
          </div>

          <div class="space-y-1">
            <label class="text-slate-500 block">Description de l'article en vente</label>
            <textarea
              v-model="pDescription"
              rows="3"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 outline-none text-slate-800 font-medium"
            />
          </div>

          <button
            type="submit"
            class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl transition-all shadow"
          >
            Enregistrer la fiche produit
          </button>

        </form>
      </div>
    </div>

    <!-- 4.2. ASSIGNMENT VENDOR MODAL -->
    <div
      v-if="assignModalOpen"
      class="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 animate-fadeIn text-xs font-bold text-slate-700"
    >
      <div class="bg-white rounded-3xl border border-slate-100 p-6 w-full max-w-md space-y-4">
        <div class="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <h3 class="text-sm font-extrabold text-slate-900">Affectation d'étals</h3>
            <span class="text-[10px] text-slate-400">Modifier l'exploitant principal de la stalle.</span>
          </div>
          <button @click="assignModalOpen = false" class="text-slate-400 hover:text-black">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleAssignSubmit" class="space-y-4">

          <div class="space-y-1">
            <label class="text-slate-400 block">Code de la place cible</label>
            <input
              v-model="assignPlaceId"
              type="text"
              class="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-3 outline-none text-slate-500"
              readonly
            />
          </div>

          <div class="space-y-1">
            <label class="text-slate-500 block">Attribuer au commerçant :</label>
            <select
              v-model="assignMerchantId"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none cursor-pointer"
            >
              <option value="all_free"> Aucun occupant (Libérer la place)</option>
              <option v-for="m in merchants" :key="m.id" :value="m.id">{{ m.name }} ({{ m.category }})</option>
            </select>
          </div>

          <button
            type="submit"
            class="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-xl transition-all"
          >
            Mettre à jour l'étal
          </button>

        </form>
      </div>
    </div>

    <!-- 4.3. RECEIPT TRANSMITTING FILE UPLOADER MODAL (Commerçant only) -->
    <div
      v-if="receiptModalOpen"
      class="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 animate-fadeIn text-xs font-bold text-slate-700"
    >
      <div class="bg-white rounded-3xl border border-slate-100 p-6 w-full max-w-md space-y-4">
        <div class="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <h3 class="text-sm font-extrabold text-slate-900">Transmettre un reçu de quittance municipal</h3>
            <span class="text-[10px] text-slate-400">Le dossier d'acquittement de votre redevance.</span>
          </div>
          <button @click="receiptModalOpen = false" class="text-slate-400 hover:text-black">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleReceiptSubmit" class="space-y-4">

          <div class="space-y-1">
              <label class="text-slate-500 block">Référence du paiement</label>
              <input
                v-model="recMonth"
                type="text"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none"
                required
            />
          </div>

          <div class="space-y-1">
            <label class="text-slate-500 block">Montant global (BIF)</label>
            <input
              v-model.number="recAmount"
              type="number"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 outline-none"
              required
            />
          </div>

          <!-- Drag n drop simulated block -->
          <div class="space-y-1">
              <label class="text-slate-500 block">Télécharger la pièce numérisée (PNG, JPG, PDF)</label>
              <label class="border border-dashed border-slate-350 rounded-2xl p-6 bg-slate-50 text-center space-y-2 hover:bg-slate-100 transition-colors select-none cursor-pointer block">
                <Upload class="w-8 h-8 text-slate-400 mx-auto" />
                <p class="text-[11px] text-slate-500 font-semibold">Cliquez pour parcourir ou déposez un fichier dans le champ ci-dessous</p>
                <p class="text-[9.5px] text-slate-400 font-medium">Formats autorisés : PDF, JPEG, PNG (Max. 10 Mo)</p>
                <input type="file" accept=".pdf,image/jpeg,image/png" class="hidden" @change="onReceiptFileChange" />
              </label>
              <p class="text-[10px] text-slate-500 font-medium">
                Fichier sélectionné : <span class="font-semibold">{{ recFileName }}</span>
              </p>
            </div>

          <button
            type="submit"
            class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl transition-all shadow"
          >
            Envoyer au Conseil Municipal
          </button>

        </form>
      </div>
    </div>

  </div>
</template>
