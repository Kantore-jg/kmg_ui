<script setup>
import { computed } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import Button from "./Button.vue";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  lastPage: {
    type: Number,
    required: true,
  },
  perPage: {
    type: Number,
    default: 15,
  },
  total: {
    type: Number,
    required: true,
  },
  from: {
    type: Number,
    default: 0,
  },
  to: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["page-change", "per-page-change"]);

const canGoPrevious = computed(() => props.currentPage > 1);
const canGoNext = computed(() => props.currentPage < props.lastPage);

const visiblePages = computed(() => {
  const pages = [];
  const current = props.currentPage;
  const last = props.lastPage;

  if (last <= 7) {
    for (let i = 1; i <= last; i++) {
      pages.push(i);
    }
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, "...", last);
    } else if (current >= last - 2) {
      pages.push(1, "...", last - 3, last - 2, last - 1, last);
    } else {
      pages.push(1, "...", current - 1, current, current + 1, "...", last);
    }
  }

  return pages;
});

const goToPage = (page) => {
  if (page !== "..." && page !== props.currentPage) {
    emit("page-change", page);
  }
};

const previousPage = () => {
  if (canGoPrevious.value) {
    emit("page-change", props.currentPage - 1);
  }
};

const nextPage = () => {
  if (canGoNext.value) {
    emit("page-change", props.currentPage + 1);
  }
};

const changePerPage = (value) => {
  emit("per-page-change", parseInt(value));
};
</script>

<template>
  <div
    class="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4"
  >
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <span>
        Affichage de {{ from || 0 }} à {{ to || 0 }} sur {{ total }} résultats
      </span>
    </div>

    <div class="flex items-center gap-6">
      <!-- Per Page Select -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-muted-foreground">Par page</span>
        <Select :model-value="String(perPage)" @update:model-value="changePerPage">
          <SelectTrigger class="w-[70px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="15">15</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- Page Navigation -->
      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="!canGoPrevious"
          @click="previousPage"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>

        <template v-for="(page, index) in visiblePages" :key="index">
          <Button
            v-if="page !== '...'"
            :variant="page === currentPage ? 'default' : 'outline'"
            size="icon"
            class="h-8 w-8"
            @click="goToPage(page)"
          >
            {{ page }}
          </Button>
          <span
            v-else
            class="flex items-center justify-center h-8 w-8 text-muted-foreground"
          >
            ...
          </span>
        </template>

        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="!canGoNext"
          @click="nextPage"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
