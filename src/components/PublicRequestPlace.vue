/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

<script setup>
import { ref, computed, watch } from 'vue';
import { useApp } from '../composables/useApp.js';
import { categoriesForMarket, findMarketById } from '../utils/categories.js';
import PlaceRequestCategoryMultiSelect from './PlaceRequestCategoryMultiSelect.vue';
import { Store, User, Phone, Briefcase, FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-vue-next';

const {
  markets,
  requests,
  addPlaceRequest,
  currentUser,
  showToast,
} = useApp();

const candidateName = ref(currentUser.value?.name || '');
const candidatePhone = ref(currentUser.value?.phone || '');
const activity = ref('');
const selectedCategoryIds = ref([]);
const targetMarketId = ref(markets.value[0]?.id ?? null);
const description = ref('');

const selectedMarket = computed(() =>
  findMarketById(markets.value, targetMarketId.value),
);

const availableCategories = computed(() =>
  categoriesForMarket(selectedMarket.value),
);

watch(
  markets,
  (items) => {
    if (!targetMarketId.value && items.length) {
      targetMarketId.value = items[0].id;
    }
  },
  { immediate: true },
);

watch(
  availableCategories,
  (cats) => {
    const allowed = new Set(cats.map((c) => String(c.id)));
    selectedCategoryIds.value = selectedCategoryIds.value.filter((id) =>
      allowed.has(String(id)),
    );
  },
  { immediate: true },
);

function handleSubmit(e) {
  e.preventDefault();
  if (!currentUser.value?.id || currentUser.value.role === 'VISITOR') {
    showToast('Connectez-vous pour soumettre une demande.', 'error');
    return;
  }
  if (!candidateName.value || !candidatePhone.value || !activity.value || !description.value) {
    showToast('Veuillez remplir l\'intégralité des champs obligatoires.', 'error');
    return;
  }
  if (!targetMarketId.value) {
    showToast('Aucun marché disponible.', 'error');
    return;
  }
  if (!selectedCategoryIds.value.length) {
    showToast('Sélectionnez au moins une catégorie d\'activité.', 'error');
    return;
  }

  addPlaceRequest({
    merchantName: candidateName.value,
    merchantPhone: candidatePhone.value,
    activityType: activity.value,
    productCategoryIds: selectedCategoryIds.value,
    requestedMarketId: targetMarketId.value,
    description: description.value,
  });

  activity.value = '';
  description.value = '';
  selectedCategoryIds.value = [];
}

function findMarket(marketId) {
  return findMarketById(markets.value, marketId);
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <div class="space-y-1">
      <h1>
        Demande Publique d'Octroi d'Emplacement
      </h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div class="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h2 class="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Store class="w-5 h-5 text-primary" />
          Introduire un dossier
        </h2>

        <form @submit="handleSubmit" class="space-y-4 text-xs font-bold text-slate-700">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-slate-500 block">Nom du Candidat</label>
              <div class="flex items-center gap-2 bg-background border border-slate-200 rounded-xl px-3 py-2.5">
                <User class="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="ex. Emery Ndayiragije"
                  v-model="candidateName"
                  class="bg-transparent border-0 outline-none text-xs w-full text-slate-800 font-medium"
                  required
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-slate-500 block">Numéro de Téléphone</label>
              <div class="flex items-center gap-2 bg-background border border-slate-200 rounded-xl px-3 py-2.5">
                <Phone class="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="tel"
                  placeholder="ex. +257 79 884 902"
                  v-model="candidatePhone"
                  class="bg-transparent border-0 outline-none text-xs w-full text-slate-800 font-medium"
                  required
                />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
              <label class="text-slate-500 block">Marché Souhaité</label>
              <div class="flex items-center gap-2 bg-background border border-slate-200 rounded-xl px-3 py-2 mr-1">
                <Store class="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  v-model="targetMarketId"
                  class="bg-transparent border-0 outline-none w-full text-xs cursor-pointer text-slate-700"
                >
                  <option v-for="m in markets" :key="m.id" :value="m.id">{{ m.name }}</option>
                </select>
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-slate-500 block">Catégories d'activité</label>
              <div class="flex items-center gap-2 bg-background border border-slate-200 rounded-xl px-3 py-2 mr-1 min-h-[42px]">
                <Briefcase class="w-4 h-4 text-slate-400 shrink-0" />
                <PlaceRequestCategoryMultiSelect
                  v-model="selectedCategoryIds"
                  :options="availableCategories"
                  placeholder="Choisis les catégories..."
                  :disabled="!availableCategories.length"
                />
              </div>
              <p v-if="!availableCategories.length" class="text-[10px] text-slate-400 font-medium">
                Ce marché n'a pas encore de catégories configurées.
              </p>
              <!-- <p v-else class="text-[10px] text-slate-400 font-medium">
                Sélectionnez toutes les catégories de produits que vous comptez vendre.
              </p> -->
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-slate-500 block">Description de l'activité</label>
            <div class="flex items-center gap-2 bg-background border border-slate-200 rounded-xl px-3 py-2.5">
              <FileText class="w-4 h-4 text-slate-400 shrink-0 self-start mt-1" />
              <input
                type="text"
                placeholder="ex. Vente de poisson frais de Rumonge"
                v-model="activity"
                class="bg-transparent border-0 outline-none text-xs w-full text-slate-800 font-medium"
                required
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-slate-500 block">Pourquoi avez-vous besoin de cette place ?</label>
            <textarea
              rows="4"
              placeholder="Rédigez ici vos motivations..."
              v-model="description"
              class="w-full bg-background border border-slate-200 rounded-xl py-2.5 px-4 outline-none font-medium text-slate-850 text-xs focus:bg-white focus:border-primary transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full bg-primary hover:bg-primary transition-all text-white font-extrabold py-3.5 rounded-xl text-center text-xs tracking-wide shadow shadow-emerald-700/30 pt-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="!availableCategories.length"
          >
            Soumettre
          </button>
        </form>
      </div>

    </div>
  </div>
</template>