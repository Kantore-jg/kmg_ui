<script setup>
import { ref, watch, computed } from 'vue';
import { LayoutGrid } from 'lucide-vue-next';
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
  block: { type: Object, default: null },
  markets: { type: Array, default: () => [] },
  defaultMarketId: { type: String, default: '' },
});

const emit = defineEmits(['update:open', 'submit']);

const form = ref({
  name: '',
  code: '',
  description: '',
  rentAmount: '',
  marketId: '',
});

const isEditing = computed(() => Boolean(props.block?.id));

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    if (props.block) {
      form.value = {
        name: props.block.name || '',
        code: props.block.code || '',
        description: props.block.description || '',
        rentAmount: props.block.rentAmount ?? '',
        marketId: props.block.marketId || '',
      };
    } else {
      form.value = {
        name: '',
        code: '',
        description: '',
        rentAmount: '',
        marketId: props.defaultMarketId || props.markets[0]?.id || '',
      };
    }
  },
);

const close = () => emit('update:open', false);

const handleSubmit = () => {
  if (!form.value.name.trim() || !form.value.marketId) return;
  const rent = Number(form.value.rentAmount);
  if (!rent || rent < 1) return;
  emit('submit', {
    ...(props.block || {}),
    name: form.value.name.trim(),
    code: form.value.code.trim() || undefined,
    description: form.value.description.trim() || undefined,
    rentAmount: rent,
    marketId: form.value.marketId,
  });
  close();
};
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <LayoutGrid class="w-5 h-5 text-primary" />
          {{ isEditing ? 'Modifier le bloc' : 'Nouveau bloc' }}
        </DialogTitle>
        
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label>Marché</Label>
          <Select v-model="form.marketId" :disabled="isEditing">
            <SelectTrigger>
              <SelectValue placeholder="Choisir un marché" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="m in markets" :key="m.id" :value="m.id">
                {{ m.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-2">
            <Label for="block-name">Nom du bloc</Label>
            <Input id="block-name" v-model="form.name" placeholder="Bloc Poissons" required />
          </div>
          <div class="space-y-2">
            <Label for="block-code">Code (optionnel)</Label>
            <Input id="block-code" v-model="form.code" placeholder="A" />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="block-rent">Loyer par place (BIF)</Label>
          <Input
            id="block-rent"
            v-model="form.rentAmount"
            type="number"
            min="1"
            step="1"
            placeholder="12000"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="block-desc">Description</Label>
          <textarea
            id="block-desc"
            v-model="form.description"
            rows="2"
            class="flex w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            placeholder="Zone dédiée à la poissonnerie..."
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="close">Annuler</Button>
          <Button type="submit">{{ isEditing ? 'Enregistrer' : 'Créer le bloc' }}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
