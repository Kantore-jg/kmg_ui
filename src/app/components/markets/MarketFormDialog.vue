<script setup>
import { ref, watch, computed } from 'vue';
import { Store, Upload } from 'lucide-vue-next';
import { useApp } from '../../../composables/useApp.js';
import Button from '../ui/Button.vue';
import Input from '../ui/Input.vue';
import Label from '../ui/Label.vue';
import ProductCategoryMultiSelect from './ProductCategoryMultiSelect.vue';
import {
  getProvinceOptions,
  getCommuneOptions,
  getZoneOptions,
  getCollineOptions,
  getAdministrativeLocationLabel,
} from '../../../utils/burundiLocations.js';
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
  market: { type: Object, default: null },
});

const emit = defineEmits(['update:open', 'submit']);

const { productCategories } = useApp();

const PROVINCE_OPTIONS = getProvinceOptions();

const createEmptyForm = (market = null) => ({
  name: market?.name || '',
  province: market?.province || PROVINCE_OPTIONS[0]?.value || '',
  commune: market?.commune || '',
  zone: market?.zone || '',
  colline: market?.colline || '',
  description: market?.description || '',
  totalPlaces: market?.totalPlaces || 50,
  productCategoryIds: [...(market?.productCategoryIds || [])],
});

const form = ref({
  name: '',
  province: PROVINCE_OPTIONS[0]?.value || '',
  commune: '',
  zone: '',
  colline: '',
  description: '',
  totalPlaces: 50,
  productCategoryIds: [],
});

const imageFile = ref(null);
const imagePreview = ref(null);

const isEditing = computed(() => Boolean(props.market?.id));
const communeOptions = computed(() => getCommuneOptions(form.value.province));
const zoneOptions = computed(() => getZoneOptions(form.value.province, form.value.commune));
const collineOptions = computed(() => getCollineOptions(form.value.province, form.value.commune, form.value.zone));

function resetImage(marketImage = null) {
  imageFile.value = null;
  imagePreview.value = marketImage || null;
}

function onImageChange(e) {
  const file = e.target.files?.[0];
  imageFile.value = file || null;
  imagePreview.value = file ? URL.createObjectURL(file) : props.market?.image || null;
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;
    if (props.market) {
      form.value = createEmptyForm(props.market);
      resetImage(props.market.image || props.market.coverImage);
    } else {
      form.value = createEmptyForm();
      resetImage();
    }
  },
);

watch(
  () => form.value.province,
  (province) => {
    const communes = getCommuneOptions(province);
    if (!communes.some((item) => item.value === form.value.commune)) {
      form.value.commune = communes[0]?.value || '';
    }
  },
  { immediate: true },
);

watch(
  () => form.value.commune,
  (commune) => {
    const zones = getZoneOptions(form.value.province, commune);
    if (!zones.some((item) => item.value === form.value.zone)) {
      form.value.zone = zones[0]?.value || '';
    }
  },
  { immediate: true },
);

watch(
  () => form.value.zone,
  (zone) => {
    const collines = getCollineOptions(form.value.province, form.value.commune, zone);
    if (!collines.some((item) => item.value === form.value.colline)) {
      form.value.colline = collines[0]?.value || '';
    }
  },
  { immediate: true },
);

const close = () => emit('update:open', false);

const handleSubmit = () => {
  if (!form.value.name.trim()) return;
  if (!isEditing.value && !imageFile.value) return;
  const location = getAdministrativeLocationLabel({
    province: form.value.province,
    commune: form.value.commune,
    zone: form.value.zone,
    colline: form.value.colline,
  });

  emit('submit', {
    ...(props.market || {}),
    name: form.value.name.trim(),
    province: form.value.province,
    commune: form.value.commune,
    zone: form.value.zone,
    colline: form.value.colline,
    location,
    description: form.value.description.trim(),
    totalPlaces: Number(form.value.totalPlaces) || 0,
    productCategoryIds: form.value.productCategoryIds,
    imageFile: imageFile.value,
  });
  close();
};
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Store class="w-5 h-5 text-primary" />
          {{ isEditing ? 'Modifier le marché' : 'Nouveau marché' }}
        </DialogTitle>
        <!-- <DialogDescription>
          {{ isEditing ? 'Mettez à jour les informations du marché public.' : 'Enregistrez un nouveau marché dans le réseau Akaguriro.' }}
        </DialogDescription> -->
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="market-name">Nom du marché</Label>
          <Input id="market-name" v-model="form.name" placeholder="Marché Central de..." required />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Province</Label>
            <Select v-model="form.province">
              <SelectTrigger>
                <SelectValue placeholder="Choisir une province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="province in PROVINCE_OPTIONS" :key="province.value" :value="province.value">
                  {{ province.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="market-places">Capacité (étals)</Label>
            <Input id="market-places" v-model.number="form.totalPlaces" type="number" min="1" required />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-2">
            <Label>Commune</Label>
            <Select v-model="form.commune">
              <SelectTrigger>
                <SelectValue placeholder="Choisir une commune" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="commune in communeOptions" :key="commune.value" :value="commune.value">
                  {{ commune.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>Zone</Label>
            <Select v-model="form.zone">
              <SelectTrigger>
                <SelectValue placeholder="Choisir une zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="zone in zoneOptions" :key="zone.value" :value="zone.value">
                  {{ zone.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>Colline</Label>
            <Select v-model="form.colline">
              <SelectTrigger>
                <SelectValue placeholder="Choisir une colline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="colline in collineOptions" :key="colline.value" :value="colline.value">
                  {{ colline.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="market-description">Description</Label>
          <textarea
            id="market-description"
            v-model="form.description"
            rows="3"
            class="flex w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            placeholder="Description du marché..."
          />
        </div>

        <div class="space-y-2">
          <Label>Types de produits (optionnel)</Label>
          <ProductCategoryMultiSelect
            v-model="form.productCategoryIds"
            :options="productCategories"
            placeholder="Choisir les catégories de produits..."
          />
        </div>

        <div class="space-y-2">
          <Label>Image du marché</Label>
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-xl bg-muted border overflow-hidden shrink-0">
              <img v-if="imagePreview" :src="imagePreview" alt="Aperçu" class="w-full h-full object-cover" />
            </div>
            <label class="cursor-pointer">
              <span class="inline-flex items-center gap-2 text-xs font-semibold text-primary border border-input px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                <Upload class="w-4 h-4" />
                {{ isEditing ? 'Changer l\'image' : 'Sélectionner une image' }}
              </span>
              <input type="file" accept="image/*" class="hidden" @change="onImageChange" />
            </label>
          </div>
          <p v-if="!isEditing && !imageFile" class="text-xs text-muted-foreground">Image requise pour la création</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="close">Annuler</Button>
          <Button type="submit" :disabled="!isEditing && !imageFile">
            {{ isEditing ? 'Enregistrer' : 'Créer le marché' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
