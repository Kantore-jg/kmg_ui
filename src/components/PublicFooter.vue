<script setup>
defineProps({
  onGoHome: { type: Function, required: true },
  onGoToTab: { type: Function, required: true },
});
</script>

<template>
  <footer class="bg-slate-900 text-slate-200 border-t border-slate-800 py-12 px-4 select-none">
    <div class="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-8 text-xs font-semibold">
      <div class="md:col-span-4 space-y-3">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-display shadow text-slate-950 font-black">A</div>
          <h3 class="text-base font-extrabold text-white">Akaguriro</h3>
        </div>
        <p class="text-slate-400 leading-relaxed text-[11px] font-medium max-w-sm">
          Plateforme de digitalisation et d'aide à la gestion des marchés communaux de la République du Burundi.
        </p>
      </div>
      <div class="md:col-span-4 space-y-1">
        <h4 class="text-[10px] text-primary font-extrabold uppercase tracking-widest mb-2.5">Accès & Navigation rapide</h4>
        <div class="grid grid-cols-2 gap-2 text-slate-300 font-medium">
          <button @click="onGoHome" class="text-left hover:text-white">Accueil</button>
          <button @click="onGoToTab('markets')" class="text-left hover:text-white">Marchés Connectés</button>
          <button @click="onGoToTab('products')" class="text-left hover:text-white">Produits phares</button>
          <button @click="onGoToTab('price-trends')" class="text-left hover:text-white">Tendances prix</button>
          <button @click="onGoToTab('merchants')" class="text-left hover:text-white">Annuaire Commerçants</button>
          <button @click="onGoToTab('request')" class="text-left hover:text-white text-primary">Demander une place</button>
        </div>
      </div>
    </div>
    <div class="mx-auto max-w-7xl border-t border-slate-850 pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-[9.5px] font-bold uppercase tracking-wide gap-3">
      <span>Plateforme Officielle - Akaguriro Burundi © 2026. Tous droits réservés.</span>
    </div>
  </footer>
</template>
