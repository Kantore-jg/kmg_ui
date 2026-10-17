<script setup>
import { ref, computed, watch } from 'vue';
import { CreditCard, Banknote } from 'lucide-vue-next';
import Button from '../ui/Button.vue';
import Input from '../ui/Input.vue';
import Label from '../ui/Label.vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const props = defineProps({
  open: { type: Boolean, default: false },
  cart: { type: Array, default: () => [] },
  marketId: { type: [Number, String], default: null },
  placeId: { type: [Number, String], default: null },
  saving: { type: Boolean, default: false },
});

const emit = defineEmits(['update:open', 'submit']);

const clientName = ref('');
const clientPhone = ref('');
const clientEmail = ref('');
const paymentType = ref('cash');
const paidAmount = ref(0);
const notes = ref('');

const cartTotal = computed(() =>
  props.cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
);

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    clientName.value = '';
    clientPhone.value = '';
    clientEmail.value = '';
    paymentType.value = 'cash';
    paidAmount.value = cartTotal.value;
    notes.value = '';
  },
);

const normalizedPaidAmount = computed(() => {
  const value = Number(paidAmount.value);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(value, cartTotal.value);
});

const remainingAmount = computed(() =>
  Math.max(cartTotal.value - normalizedPaidAmount.value, 0),
);

const formatPrice = (n) => Number(n).toLocaleString('fr-FR');

watch(paymentType, (newType, oldType) => {
  if (newType === 'credit') {
    paidAmount.value = oldType === 'credit' ? Math.min(Number(paidAmount.value) || 0, cartTotal.value) : 0;
    return;
  }
  paidAmount.value = cartTotal.value;
});

watch(
  cartTotal,
  (total) => {
    if (paymentType.value === 'credit') {
      paidAmount.value = Math.min(Number(paidAmount.value) || 0, total);
      return;
    }
    paidAmount.value = total;
  },
  { immediate: true },
);

const close = () => emit('update:open', false);

const handleSubmit = () => {
  if (!clientName.value.trim() || props.cart.length === 0) return;

  emit('submit', {
    marketId: props.marketId,
    placeId: props.placeId,
    clientName: clientName.value.trim(),
    clientPhone: clientPhone.value.trim() || null,
    clientEmail: clientEmail.value.trim() || null,
    paymentType: paymentType.value,
    paidAmount: normalizedPaidAmount.value,
    notes: notes.value.trim() || null,
    items: props.cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    })),
  });
};
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Valider le paiement</DialogTitle>
       
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        

        <div class="space-y-2">
          <Label for="client-name">Nom du client *</Label>
          <Input
            id="client-name"
            v-model="clientName"
            placeholder="Nom complet du client"
            required
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="client-phone">Téléphone</Label>
            <Input id="client-phone" v-model="clientPhone" placeholder="+257 ..." />
          </div>
          <div class="space-y-2">
            <Label for="client-email">Email</Label>
            <Input id="client-email" v-model="clientEmail" type="email" placeholder="client@email.com" />
          </div>
        </div>

        <div class="space-y-2">
          <Label>Mode de paiement *</Label>
          <Select v-model="paymentType">
            <SelectTrigger>
              <SelectValue placeholder="Choisir le mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">
                <span class="flex items-center gap-2">
                  <Banknote class="w-4 h-4" />
                  Espèces (Cash)
                </span>
              </SelectItem>
              <SelectItem value="electronic">
                <span class="flex items-center gap-2">
                  <CreditCard class="w-4 h-4" />
                  Électronique
                </span>
              </SelectItem>
              <SelectItem value="credit">
                <span class="flex items-center gap-2">
                  <CreditCard class="w-4 h-4" />
                  Crédit
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="paid-amount">Montant payé *</Label>
            <Input
              id="paid-amount"
              v-model="paidAmount"
              type="number"
              min="0"
              :max="cartTotal"
              step="0.01"
              :disabled="paymentType !== 'credit'"
            />
            <p class="text-xs text-muted-foreground">
              <span v-if="paymentType !== 'credit'">
                Paiement complet requis pour ce mode.
              </span>
              <span v-else>
                Saisissez l'acompte versé maintenant.
              </span>
            </p>
          </div>
          <div class="space-y-2">
            <Label>Reste à payer</Label>
            <div class="rounded-md border bg-muted/40 px-3 py-2 text-sm font-semibold">
              {{ formatPrice(remainingAmount) }} FBU
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="sale-notes">Notes (optionnel)</Label>
          <Input id="sale-notes" v-model="notes" placeholder="Remarques sur la vente..." />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="close">Annuler</Button>
          <Button type="submit" :disabled="!clientName.trim() || saving">
            {{ saving ? 'Enregistrement...' : 'Confirmer la vente' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
