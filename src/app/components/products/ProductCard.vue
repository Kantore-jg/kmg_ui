<script setup>
import { Pencil, Trash2 } from 'lucide-vue-next';
import Switch from '../ui/Switch.vue';

const props = defineProps({
  product: { type: Object, required: true },
  showActions: { type: Boolean, default: true },
});

const emit = defineEmits(['edit', 'delete', 'toggle-availability']);

const formatPrice = (n) => Number(n).toLocaleString('fr-FR');
</script>

<template>
  <div class="bs-card-hover overflow-hidden flex flex-col">
    <div class="relative aspect-[4/3] bg-muted overflow-hidden">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.name"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-muted-foreground text-xs"
      >
        Aucune image
      </div>
      <!-- <span class="bs-category-pill absolute top-3 left-3 bg-white/90 backdrop-blur-sm">
        {{ product.category }}
      </span> -->
    </div>

    <div class="p-4 flex-1 flex flex-col gap-3">
      <div>
        <h3 class="font-semibold text-foreground text-sm leading-snug">{{ product.name }}</h3>
        <p v-if="product.description" class="text-xs text-muted-foreground mt-1 line-clamp-2">
          {{ product.description }}
        </p>
      </div>

      <div class="flex items-center justify-between mt-auto pt-2 border-t border-border">
        <div>
          <span class="text-base font-bold text-primary">{{ formatPrice(product.price) }} BIF</span>
          <span class="text-xs text-muted-foreground"> / {{ product.unit }}</span>
        </div>
      </div>

      <div v-if="showActions" class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <Switch
            :checked="product.available !== false"
            @update:checked="emit('toggle-availability', product)"
          />
          <span class="text-xs text-muted-foreground">
            {{ product.available !== false ? 'Disponible' : 'Indisponible' }}
          </span>
        </div>
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            title="Modifier"
            @click="emit('edit', product)"
          >
            <Pencil class="w-4 h-4" />
          </button>
          <button
            type="button"
            class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
            title="Supprimer"
            @click="emit('delete', product)"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>