/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

<script setup>
import { ref, computed, watch } from 'vue';
import { Check } from 'lucide-vue-next';
import { useApp } from '../composables/useApp.js';
import { findMarketById } from '../utils/categories.js';

const {
  markets,
  addPlaceRequest,
  currentUser,
  showToast,
} = useApp();

const candidateName = ref(currentUser.value?.name || '');
const candidatePhone = ref(currentUser.value?.phone || '');
const activity = ref('');
const targetMarketId = ref(markets.value[0]?.id ?? null);
const description = ref('');
const submitting = ref(false);

const selectedMarket = computed(() =>
  findMarketById(markets.value, targetMarketId.value),
);

const isLoggedIn = computed(() =>
  Boolean(currentUser.value?.id) && currentUser.value?.role !== 'VISITOR',
);

const nameValid = computed(() => candidateName.value.trim().length >= 2);
const phoneValid = computed(() => candidatePhone.value.trim().length >= 8);
const marketValid = computed(() => Boolean(targetMarketId.value));
const activityValid = computed(() => activity.value.trim().length >= 2);
const descriptionValid = computed(() => description.value.trim().length >= 10);

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
  currentUser,
  (user) => {
    if (user?.name && !candidateName.value) candidateName.value = user.name;
    if (user?.phone && !candidatePhone.value) candidatePhone.value = user.phone;
  },
);

async function handleSubmit(e) {
  e.preventDefault();
  if (!isLoggedIn.value) {
    showToast('Connectez-vous pour soumettre une demande.', 'error');
    return;
  }
  if (!nameValid.value || !phoneValid.value || !activityValid.value || !descriptionValid.value) {
    showToast('Veuillez remplir l\'intégralité des champs obligatoires.', 'error');
    return;
  }
  if (!targetMarketId.value) {
    showToast('Aucun marché disponible.', 'error');
    return;
  }

  submitting.value = true;
  try {
    await addPlaceRequest({
      merchantName: candidateName.value.trim(),
      merchantPhone: candidatePhone.value.trim(),
      activityType: activity.value.trim(),
      requestedMarketId: targetMarketId.value,
      description: description.value.trim(),
    });
    activity.value = '';
    description.value = '';
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white border border-slate-200/80 rounded-sm shadow-sm">
      <div class="px-5 sm:px-8 pt-6 pb-4 border-b border-slate-100">
        <h1 class="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
          Nouvelle demande d'emplacement
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Remplissez le formulaire pour solliciter un emplacement sur le marché.
        </p>
      </div>

      <form @submit="handleSubmit" class="px-5 sm:px-8 py-6 space-y-5">
        <div
          v-if="!isLoggedIn"
          class="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Connectez-vous pour pouvoir enregistrer votre demande.
        </div>

        <!-- Ligne 1 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 lg:gap-4">
          <div class="lg:col-span-4 space-y-1.5">
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Nom du candidat
            </label>
            <div class="relative">
              <input
                v-model="candidateName"
                type="text"
                placeholder="ex. Emery Ndayiragije"
                required
                class="w-full h-10 rounded-sm border border-slate-300 bg-white px-3 pr-9 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
              />
              <Check
                v-if="nameValid"
                class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500"
              />
            </div>
          </div>

          <div class="lg:col-span-4 space-y-1.5">
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Téléphone
            </label>
            <div class="relative">
              <input
                v-model="candidatePhone"
                type="tel"
                placeholder="ex. +257 79 884 902"
                required
                class="w-full h-10 rounded-sm border border-slate-300 bg-white px-3 pr-9 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
              />
              <Check
                v-if="phoneValid"
                class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500"
              />
            </div>
          </div>

          <div class="lg:col-span-4 space-y-1.5">
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Marché
            </label>
            <div class="relative">
              <select
                v-if="markets.length > 1"
                v-model="targetMarketId"
                class="w-full h-10 appearance-none rounded-sm border border-slate-300 bg-white px-3 pr-9 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
              >
                <option v-for="m in markets" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
              <input
                v-else
                type="text"
                :value="selectedMarket?.name || 'Aucun marché configuré'"
                readonly
                class="w-full h-10 rounded-sm border border-slate-300 bg-slate-50 px-3 pr-9 text-sm text-slate-800 outline-none"
              />
              <Check
                v-if="marketValid"
                class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500"
              />
            </div>
          </div>
        </div>

        <!-- Ligne 2 -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          <div class="lg:col-span-5 space-y-1.5">
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Activité / filière
            </label>
            <div class="relative">
              <input
                v-model="activity"
                type="text"
                placeholder="ex. Vente de poisson frais"
                required
                class="w-full h-10 rounded-sm border border-slate-300 bg-white px-3 pr-9 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
              />
              <Check
                v-if="activityValid"
                class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500"
              />
            </div>
          </div>

          <div class="lg:col-span-7 space-y-1.5">
            <label class="block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Motivation de la demande
            </label>
            <div class="relative">
              <textarea
                v-model="description"
                rows="3"
                placeholder="Expliquez pourquoi vous avez besoin de cet emplacement..."
                required
                class="w-full min-h-[5.5rem] resize-y rounded-sm border border-slate-300 bg-white px-3 py-2.5 pr-9 text-sm text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30"
              />
              <Check
                v-if="descriptionValid"
                class="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-emerald-500"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
          <button
            type="submit"
            :disabled="submitting || !isLoggedIn"
            class="inline-flex h-11 min-w-[10rem] items-center justify-center rounded-sm bg-sky-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ submitting ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
