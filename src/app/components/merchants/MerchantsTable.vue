<script setup>
defineProps({
  merchants: { type: Array, required: true },
  getMarketLabel: { type: Function, required: true },
});

const emit = defineEmits(['edit']);

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).replace(/\//g, '-');
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[720px] border-collapse text-sm">
      <thead>
        <tr class="border-b border-slate-200 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <th class="px-3 py-3 w-10">#</th>
          <th class="px-3 py-3">Numéro</th>
          <th class="px-3 py-3">Nom</th>
          <th class="px-3 py-3">Téléphone</th>
          <th class="px-3 py-3">Étal</th>
          <th class="px-3 py-3">Marché</th>
          <th class="px-3 py-3">Date</th>
          <th class="px-3 py-3 text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!merchants.length">
          <td colspan="8" class="px-3 py-10 text-center text-slate-400">
            Aucun commerçant trouvé.
          </td>
        </tr>
        <tr
          v-for="(merchant, index) in merchants"
          :key="merchant.id"
          class="border-b border-slate-100 hover:bg-slate-50/80"
        >
          <td class="px-3 py-3 text-slate-500">{{ index + 1 }}</td>
          <td class="px-3 py-3 font-medium text-slate-700">{{ merchant.id }}</td>
          <td class="px-3 py-3 font-medium text-slate-800">{{ merchant.name }}</td>
          <td class="px-3 py-3 text-slate-700">{{ merchant.phone || '—' }}</td>
          <td class="px-3 py-3 text-slate-700">
            {{ merchant.activePlaceNumber || merchant.activePlaceId || '—' }}
          </td>
          <td class="px-3 py-3 text-slate-700">
            {{ getMarketLabel(merchant.activeMarketId) }}
          </td>
          <td class="px-3 py-3 whitespace-nowrap text-slate-600">
            {{ formatDate(merchant.joinedDate) }}
          </td>
          <td class="px-3 py-3 text-right">
            <button
              type="button"
              class="inline-flex h-8 items-center rounded-sm bg-sky-500 px-3 text-xs font-semibold text-white transition-colors hover:bg-sky-600"
              @click="emit('edit', merchant)"
            >
              Modifier
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
