<script setup>
import emblaCarouselVue from 'embla-carousel-vue'
import { provide, ref, onMounted } from 'vue'
import { cn } from '@/app/components/ui/utils'

const props = defineProps({
  opts: { type: Object, default: () => ({}) },
  plugins: { type: Array, default: () => [] },
  orientation: { type: String, default: 'horizontal' },
  class: { type: String, default: '' },
})

const [emblaNode, emblaApi] = emblaCarouselVue(props.opts, props.plugins)
const canScrollPrev = ref(false)
const canScrollNext = ref(false)

const scrollPrev = () => emblaApi.value?.scrollPrev()
const scrollNext = () => emblaApi.value?.scrollNext()

const onSelect = (api) => {
  canScrollPrev.value = api.canScrollPrev()
  canScrollNext.value = api.canScrollNext()
}

onMounted(() => {
  if (!emblaApi.value) return
  emblaApi.value.on('select', onSelect)
  emblaApi.value.on('reInit', onSelect)
  onSelect(emblaApi.value)
})

provide('carousel', {
  emblaNode,
  emblaApi,
  orientation: props.orientation,
  scrollPrev,
  scrollNext,
  canScrollPrev,
  canScrollNext
})
</script>

<template>
  <div
    class="relative"
    role="region"
    aria-roledescription="carousel"
    :class="props.class"
  >
    <slot />
  </div>
</template>
