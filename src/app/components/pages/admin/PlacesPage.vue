<script setup>
import { ref, computed, watch } from 'vue';
import { Plus, Search, MapPin, LayoutGrid, Printer } from 'lucide-vue-next';
import { useApp } from '../../../../composables/useApp.js';
import { useAdminScope } from '../../../../composables/useAdminScope.js';
import { usePrintReport } from '../../../../composables/usePrintReport.js';
import StatCard from '../../StatCard.vue';
import PlacesTable from '../../places/PlacesTable.vue';
import BlocksTable from '../../places/BlocksTable.vue';
import PlaceAssignDialog from '../../places/PlaceAssignDialog.vue';
import PlaceFormDialog from '../../places/PlaceFormDialog.vue';
import BlockFormDialog from '../../places/BlockFormDialog.vue';
import Button from '../../ui/Button.vue';
import Input from '../../ui/Input.vue';
import { Card, CardContent } from '../../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { PLACE_STATUS } from '../../../../utils/placeStatus.js';

const {
  blocks,
  loadBlocks,
  updatePlaceStatus,
  addPlace,
  updatePlace,
  deletePlace,
  addBlock,
  updateBlock,
  deleteBlock,
  showToast,
} = useApp();

const {
  isSuperAdmin,
  isMarketAdmin,
  scopedMarkets,
  scopedPlaces,
  scopedMerchants,
  assignedMarketId,
  findMarket,
  findMerchant,
} = useAdminScope();

const { openPlacesPrint } = usePrintReport();

const canManage = computed(() => isSuperAdmin.value || isMarketAdmin.value);

const printMarketId = computed(() => {
  if (marketFilter.value !== 'all') return marketFilter.value;
  return assignedMarketId.value || undefined;
});

const handlePrint = () => openPlacesPrint(printMarketId.value);

const activeTab = ref('places');
const searchQuery = ref('');
const marketFilter = ref('all');
const statusFilter = ref('all');
const assignOpen = ref(false);
const placeFormOpen = ref(false);
const blockFormOpen = ref(false);
const deletePlaceOpen = ref(false);
const deleteBlockOpen = ref(false);
const selectedPlace = ref(null);
const editingPlace = ref(null);
const editingBlock = ref(null);
const placeToDelete = ref(null);
const blockToDelete = ref(null);
const defaultBlockId = ref('');
const defaultMarketForBlock = ref('');

const scopedBlocks = computed(() =>
  blocks.value.filter(
    (b) => !assignedMarketId.value || b.marketId == assignedMarketId.value,
  ),
);

watch(
  () => scopedMarkets.value.map((market) => market.id),
  (marketIds) => {
    void loadBlocks(marketIds);
  },
  { immediate: true },
);

const filteredPlaces = computed(() =>
  scopedPlaces.value.filter((p) => {
    const q = searchQuery.value.toLowerCase();
    const matchesQuery =
      !q ||
      p.id.toLowerCase().includes(q) ||
      p.blockName.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.categories?.some((c) => c.toLowerCase().includes(q));
    const matchesMarket = marketFilter.value === 'all' || p.marketId === marketFilter.value;
    const matchesStatus = statusFilter.value === 'all' || p.status === statusFilter.value;
    return matchesQuery && matchesMarket && matchesStatus;
  }),
);

const filteredBlocks = computed(() =>
  scopedBlocks.value.filter((b) => {
    const q = searchQuery.value.toLowerCase();
    const matchesQuery =
      !q || b.name.toLowerCase().includes(q) || b.code?.toLowerCase().includes(q);
    const matchesMarket = marketFilter.value === 'all' || b.marketId === marketFilter.value;
    return matchesQuery && matchesMarket;
  }),
);

const occupiedCount = computed(() =>
  scopedPlaces.value.filter((p) => p.status === PLACE_STATUS.OCCUPIED).length,
);
const freeCount = computed(() =>
  scopedPlaces.value.filter((p) => p.status === PLACE_STATUS.AVAILABLE).length,
);
const maintenanceCount = computed(() =>
  scopedPlaces.value.filter((p) => p.status === PLACE_STATUS.MAINTENANCE).length,
);

const getMarketName = (id) => findMarket(id)?.name || '—';
const getMerchant = (id) => (id ? findMerchant(id) : null);

const openAssign = (place) => {
  selectedPlace.value = place;
  assignOpen.value = true;
};

const openPlaceForm = (block = null) => {
  editingPlace.value = null;
  defaultBlockId.value = block?.id ? String(block.id) : '';
  placeFormOpen.value = true;
};

const openEditPlace = (place) => {
  editingPlace.value = place;
  defaultBlockId.value = place?.blockId ? String(place.blockId) : '';
  placeFormOpen.value = true;
};

const openBlockForm = (marketId = '') => {
  editingBlock.value = null;
  defaultMarketForBlock.value = marketId || assignedMarketId.value || '';
  blockFormOpen.value = true;
};

const openEditBlock = (block) => {
  editingBlock.value = block;
  blockFormOpen.value = true;
};

const openDeletePlace = (place) => {
  placeToDelete.value = place;
  deletePlaceOpen.value = true;
};

const openDeleteBlock = (block) => {
  blockToDelete.value = block;
  deleteBlockOpen.value = true;
};

const handleAssign = ({ placeId, marketId, status, merchantId }) => {
  updatePlaceStatus(placeId, marketId, status, merchantId);
};

const handleAddPlace = async (payload) => {
  if (payload.placeId) {
    await updatePlace(payload);
    return;
  }
  const exists = scopedPlaces.value.some(
    (p) => p.id === payload.id && p.marketId === payload.marketId,
  );
  if (exists) {
    showToast(`L'étal ${payload.id} existe déjà dans ce marché.`, 'error');
    return;
  }
  addPlace(payload);
};

const handleBlockSubmit = (payload) => {
  if (payload.id) {
    updateBlock(payload);
  } else {
    addBlock(payload);
  }
};

const confirmDeletePlace = () => {
  if (placeToDelete.value) {
    deletePlace(placeToDelete.value);
  }
  deletePlaceOpen.value = false;
  placeToDelete.value = null;
};

const confirmDeleteBlock = async () => {
  if (blockToDelete.value) {
    await deleteBlock(blockToDelete.value.id);
  }
  deleteBlockOpen.value = false;
  blockToDelete.value = null;
};

const onCreateBlockFromPlace = (marketId) => {
  placeFormOpen.value = false;
  openBlockForm(marketId);
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        
      </div>
      <div class="flex flex-wrap gap-2">
        <Button variant="outline" class="rounded-full" @click="handlePrint">
          <Printer class="w-4 h-4 mr-2" />
          Imprimer le plan
        </Button>
        <template v-if="canManage">
        <Button variant="outline" @click="openBlockForm()">
          <LayoutGrid class="w-4 h-4 mr-2" />
          Nouveau bloc
        </Button>
        <Button @click="openPlaceForm()">
          <Plus class="w-4 h-4 mr-2" />
          Nouvel emplacement
        </Button>
        </template>
      </div>
    </div>

    

    <div class="flex gap-1 p-1 bg-muted rounded-lg w-fit">
      <button
        type="button"
        :class="[
          'px-4 py-2 text-sm font-semibold rounded-md transition-colors',
          activeTab === 'places' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
        ]"
        @click="activeTab = 'places'"
      >
        Étals ({{ scopedPlaces.length }})
      </button>
      <button
        type="button"
        :class="[
          'px-4 py-2 text-sm font-semibold rounded-md transition-colors',
          activeTab === 'blocks' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
        ]"
        @click="activeTab = 'blocks'"
      >
        Blocs ({{ scopedBlocks.length }})
      </button>
    </div>

    <Card>
      <CardContent class="p-4">
        <div class="flex flex-col lg:flex-row gap-3">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              :placeholder="activeTab === 'places' ? 'Rechercher par code, bloc...' : 'Rechercher un bloc...'"
              class="pl-9"
            />
          </div>
          <Select v-model="marketFilter">
            <SelectTrigger class="w-full lg:w-52">
              <SelectValue placeholder="Tous les marchés" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les marchés</SelectItem>
              <SelectItem v-for="m in scopedMarkets" :key="m.id" :value="m.id">
                {{ m.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-if="activeTab === 'places'" v-model="statusFilter">
            <SelectTrigger class="w-full lg:w-44">
              <SelectValue placeholder="Tous statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem :value="PLACE_STATUS.AVAILABLE">Libre</SelectItem>
              <SelectItem :value="PLACE_STATUS.OCCUPIED">Occupée</SelectItem>
              <SelectItem :value="PLACE_STATUS.MAINTENANCE">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <PlacesTable
      v-if="activeTab === 'places'"
      :places="filteredPlaces"
      :get-merchant="getMerchant"
      :get-market-name="getMarketName"
      :readonly="!canManage"
      @assign="openAssign"
      @edit="openEditPlace"
      @delete="openDeletePlace"
    />

    <BlocksTable
      v-else
      :blocks="filteredBlocks"
      :get-market-name="getMarketName"
      :readonly="!canManage"
      @edit="openEditBlock"
      @delete="openDeleteBlock"
      @add-place="openPlaceForm"
    />

    <PlaceAssignDialog
      v-model:open="assignOpen"
      :place="selectedPlace"
      :merchants="scopedMerchants"
      :market-name="selectedPlace ? getMarketName(selectedPlace.marketId) : ''"
      @submit="handleAssign"
    />

    <PlaceFormDialog
      v-model:open="placeFormOpen"
      :place="editingPlace"
      :markets="scopedMarkets"
      :blocks="scopedBlocks"
      :default-market-id="assignedMarketId || ''"
      :default-block-id="defaultBlockId"
      @submit="handleAddPlace"
      @create-block="onCreateBlockFromPlace"
    />

    <BlockFormDialog
      v-model:open="blockFormOpen"
      :block="editingBlock"
      :markets="scopedMarkets"
      :default-market-id="defaultMarketForBlock || assignedMarketId || ''"
      @submit="handleBlockSubmit"
    />

    <AlertDialog v-model:open="deletePlaceOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cet emplacement ?</AlertDialogTitle>
          <AlertDialogDescription>
            L'étal <strong>{{ placeToDelete?.id }}</strong> sera retiré du registre.
            Les emplacements occupés doivent être libérés avant suppression.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-white hover:bg-destructive/90"
            @click="confirmDeletePlace"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog v-model:open="deleteBlockOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce bloc ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le bloc <strong>{{ blockToDelete?.name }}</strong> sera supprimé.
            Seuls les blocs sans emplacements peuvent être retirés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-white hover:bg-destructive/90"
            @click="confirmDeleteBlock"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
