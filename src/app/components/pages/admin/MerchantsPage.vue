<script setup>
import { ref, computed } from 'vue';
import { useApp } from '../../../../composables/useApp.js';
import { useAdminScope } from '../../../../composables/useAdminScope.js';
import MerchantsTable from '../../merchants/MerchantsTable.vue';
import MerchantViewDialog from '../../merchants/MerchantViewDialog.vue';
import UserFormDialog from '../../users/UserFormDialog.vue';

const { addUser, refreshAll } = useApp();
const {
  scopedMerchants,
  findMarket,
  isSuperAdmin,
  isMarketAdmin,
} = useAdminScope();

const searchQuery = ref('');
const viewOpen = ref(false);
const formOpen = ref(false);
const viewingMerchant = ref(null);
const createDraft = ref({ role: 'COMMERCANT' });

const canAddMerchant = computed(() => isSuperAdmin.value || isMarketAdmin.value);

const filteredMerchants = computed(() =>
  scopedMerchants.value.filter((m) => {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q)
      || String(m.id).includes(q)
      || (m.phone || '').toLowerCase().includes(q)
      || (m.activePlaceNumber || '').toLowerCase().includes(q)
      || (m.email || '').toLowerCase().includes(q)
    );
  }),
);

const getMarketLabel = (marketId) => findMarket(marketId)?.name || '—';

const openView = (merchant) => {
  viewingMerchant.value = merchant;
  viewOpen.value = true;
};

const openCreate = () => {
  createDraft.value = { role: 'COMMERCANT' };
  formOpen.value = true;
};

const handleCreate = async (payload) => {
  const created = await addUser({
    ...payload,
    role: 'COMMERCANT',
  });
  if (created) {
    formOpen.value = false;
    await refreshAll();
  }
};
</script>

<template>
  <div class="space-y-4">
    <div class="bg-white border border-slate-200/80 rounded-sm shadow-sm">
      <div class="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-lg font-semibold text-slate-800 sm:text-xl">
          Le Nombre total des commerçants :
          <span class="text-sky-700">{{ filteredMerchants.length }}</span>
        </h1>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            v-if="canAddMerchant"
            type="button"
            class="inline-flex h-10 items-center justify-center rounded-sm bg-sky-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
            @click="openCreate"
          >
            Ajouter
          </button>

          <div class="space-y-1">
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Rechercher ici
            </label>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Nom, téléphone, étal..."
              class="h-10 w-full min-w-[14rem] rounded-sm border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 sm:w-64"
            />
          </div>
        </div>
      </div>

      <div class="px-5 py-4">
        <h2 class="mb-3 text-base font-semibold text-slate-800">
          Liste des commerçants
        </h2>

        <MerchantsTable
          :merchants="filteredMerchants"
          :get-market-label="getMarketLabel"
          @edit="openView"
        />
      </div>
    </div>

    <MerchantViewDialog
      v-model:open="viewOpen"
      :merchant="viewingMerchant"
      :market-name="viewingMerchant ? findMarket(viewingMerchant.activeMarketId)?.name : ''"
    />

    <UserFormDialog
      v-if="canAddMerchant"
      v-model:open="formOpen"
      :user="createDraft"
      @submit="handleCreate"
    />
  </div>
</template>
