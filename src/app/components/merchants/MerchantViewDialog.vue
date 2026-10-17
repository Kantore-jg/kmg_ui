<script setup>
import { ShieldCheck, Phone, MapPin } from 'lucide-vue-next';
import Badge from '../ui/Badge.vue';
import Button from '../ui/Button.vue';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

defineProps({
  open: { type: Boolean, default: false },
  merchant: { type: Object, default: null },
  marketName: { type: String, default: '' },
  productsCount: { type: Number, default: 0 },
});

const emit = defineEmits(['update:open']);
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg" v-if="merchant">
      <DialogHeader>
        <DialogTitle>{{ merchant.name }}</DialogTitle>
      </DialogHeader>

      <div class="flex gap-4 items-start">
        <img :src="merchant.image" class="w-20 h-20 rounded-xl object-cover" />
        <div class="space-y-2 flex-1">
          <Badge :variant="merchant.verified ? 'default' : 'secondary'">
            <ShieldCheck class="w-3 h-3 mr-1" />
            {{ merchant.verified ? 'Commerçant habilité' : 'Certification en attente' }}
          </Badge>
          <p class="text-sm text-muted-foreground flex items-center gap-1">
            <Phone class="w-3.5 h-3.5" /> {{ merchant.phone }}
          </p>
          <p class="text-sm flex items-center gap-1">
            <MapPin class="w-3.5 h-3.5 text-muted-foreground" />
            {{ marketName }} — Étale {{ merchant.activePlaceNumber || merchant.activePlaceId }}
          </p>
        </div>
      </div>

      <div class="space-y-2">
        <p class="text-xs font-medium text-muted-foreground uppercase">Filière</p>
        <p class="text-sm">{{ merchant.category }}</p>
      </div>

      <div class="space-y-2">
        <p class="text-xs font-medium text-muted-foreground uppercase">Bio</p>
        <p class="text-sm text-muted-foreground leading-relaxed">{{ merchant.bio }}</p>
      </div>

      <div class="p-3 rounded-lg bg-muted/40 border border-border text-sm">
        <span class="font-medium">{{ productsCount }}</span>
        <span class="text-muted-foreground"> produit(s) référencé(s) au catalogue</span>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="emit('update:open', false)">Fermer</Button>
        <a
          :href="`https://wa.me/${merchant.phone.replace(/\s+/g, '')}`"
          target="_blank"
          rel="noreferrer"
        >
          <Button>Contacter WhatsApp</Button>
        </a>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>