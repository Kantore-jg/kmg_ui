<script setup>
import { ref, watch, computed } from 'vue';
import { Tags } from 'lucide-vue-next';
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

const props = defineProps({
  open: { type: Boolean, default: false },
  category: { type: Object, default: null },
});

const emit = defineEmits(['update:open', 'submit']);

const form = ref({
  name: '',
  description: '',
});

const isEditing = computed(() => Boolean(props.category?.id));

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    if (props.category) {
      form.value = {
        name: props.category.name || '',
        description: props.category.description || '',
      };
    } else {
      form.value = {
        name: '',
        description: '',
      };
    }
  },
);

const close = () => emit('update:open', false);

const handleSubmit = () => {
  if (!form.value.name.trim()) return;

  emit('submit', {
    ...(props.category || {}),
    name: form.value.name.trim(),
    description: form.value.description.trim(),
  });
  close();
};
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Tags class="w-5 h-5 text-primary" />
          {{ isEditing ? 'Modifier la catégorie' : 'Nouvelle catégorie' }}
        </DialogTitle>
        
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="category-name">Nom</Label>
          <Input id="category-name" v-model="form.name" placeholder="Ex: Fruits & Légumes" required />
        </div>

        <div class="space-y-2">
          <Label for="category-description">Description</Label>
          <textarea
            id="category-description"
            v-model="form.description"
            rows="3"
            class="flex w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            placeholder="Description de la catégorie..."
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="close">Annuler</Button>
          <Button type="submit">
            {{ isEditing ? 'Enregistrer' : 'Créer la catégorie' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>