<script setup>
defineProps({
  product: { type: Object, required: true },
  marketName: { type: String, default: '—' },
  onSelectProduct: { type: Function, required: true },
});
</script>

<template>
  <div
    @click="onSelectProduct(product.id)"
    class="bg-white rounded-2xl border border-slate-100 p-3.5 space-y-3.5 transition-all cursor-pointer"
  >
    <div class="relative rounded-xl overflow-hidden aspect-square bg-background">
      <img
        :src="product.image"
        :alt="product.name"
        class="w-full h-full object-cover transition-transform duration-300"
      />
    </div>
    <div class="space-y-1">
      <span class="text-[9.5px] font-bold text-primary block uppercase tracking-wide">{{ product.category }}</span>
      <h4 class="text-xs sm:text-sm font-extrabold text-slate-800 line-clamp-1 transition-colors">{{ product.name }}</h4>
      <p class="text-[10.5px] text-slate-400 font-semibold truncate">
        {{ marketName }} (étal {{ product.placeNumber }})
      </p>
    </div>
    <div class="border-t border-slate-50 pt-2.5 flex items-center justify-between">
      <div>
        <span class="text-xs sm:text-sm font-black text-slate-950">{{ product.price.toLocaleString('fr-FR') }} BIF</span>
        <span class="text-[8.5px] text-slate-400 font-medium font-mono ml-0.5">/ {{ product.unit }}</span>
      </div>
      <span class="text-[10px] font-black text-primary">Détails</span>
    </div>
  </div>
</template>
