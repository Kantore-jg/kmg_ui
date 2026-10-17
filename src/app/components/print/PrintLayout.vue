<script setup>
import { Printer, ArrowLeft, X } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import './print-styles.css';

const router = useRouter();

const props = defineProps({
  backPath: { type: String, default: '/admin' },
  title: { type: String, default: 'Rapport' },
});

function handlePrint() {
  window.print();
}

function handleClose() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push(props.backPath);
  }
}
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="print-toolbar">
      <div class="flex items-center gap-3">
        <button type="button" class="print-btn print-btn--outline" @click="handleClose">
          <ArrowLeft class="w-4 h-4" />
          Retour
        </button>
        <span class="text-sm font-medium text-gray-600 hidden sm:inline">{{ title }}</span>
      </div>
      <div class="print-toolbar__actions">
        <button type="button" class="print-btn print-btn--outline" @click="handleClose">
          <X class="w-4 h-4" />
          Fermer
        </button>
        <button type="button" class="print-btn print-btn--primary" @click="handlePrint">
          <Printer class="w-4 h-4" />
          Imprimer
        </button>
      </div>
    </div>

    <slot />
  </div>
</template>