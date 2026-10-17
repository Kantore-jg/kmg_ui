<script setup>
defineProps({
  merchant: { type: Object, required: true },
  marketName: { type: String, default: '' },
  marketLocation: { type: String, default: '' },
  onSelectMerchant: { type: Function, required: true },
});
</script>

<template>
  <div
    role="button"
    tabindex="0"
    @click="onSelectMerchant(merchant.id)"
    @keydown.enter.prevent="onSelectMerchant(merchant.id)"
    @keydown.space.prevent="onSelectMerchant(merchant.id)"
    class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-4 items-center relative group cursor-pointer"
  >
    <img :src="merchant.image" :alt="merchant.name" class="w-16 h-16 rounded-2xl object-cover bg-background shrink-0" />
    <div class="min-w-0 flex-1 space-y-1 text-xs">
      <h3 class="text-sm font-extrabold text-slate-900 truncate flex items-center gap-1">
        {{ merchant.name }}
        <span class="w-4.5 h-4.5 text-primary inline shrink-0">✓</span>
      </h3>
      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ merchant.category }}</p>
      <p v-if="marketName" class="text-slate-500 font-medium">
        {{ marketLocation }} • Étale {{ merchant.activePlaceNumber || merchant.activePlaceId }}
      </p>
    </div>
    <div class="absolute bottom-4 right-4 flex gap-1">
      <a
        :href="`https://wa.me/${(merchant.phone || '').replace(/\s+/g, '')}`"
        @click.stop
        target="_blank"
        rel="noreferrer"
        class="p-1.5 bg-emerald-50 text-primary rounded-lg border border-emerald-110 shadow-sm hover:bg-primary hover:text-white transition-colors"
        title="Contacter sur WhatsApp"
      >
        <span class="text-xs font-bold">WA</span>
      </a>
    </div>
  </div>
</template>
