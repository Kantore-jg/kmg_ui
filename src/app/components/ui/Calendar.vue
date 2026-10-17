<script setup>
// Simplified Calendar component for now, as Radix Vue DatePicker is complex to setup fully without more context.
// Using native date input or just a placeholder if needed, but the original was just a wrapper around react-day-picker.
// Use 'v-calendar' or 'radix-vue' primitives if needed in future.
// For now, let's create a basic implementation or just a placeholder that warns it's not fully ported.
// Actually, let's check if we can use 'radix-vue' Calendar primitive. It exists.

import { CalendarRoot, CalendarHeader, CalendarHeading, CalendarGrid, CalendarGridHead, CalendarGridBody, CalendarGridRow, CalendarHeadCell, CalendarCell, CalendarCellTrigger, CalendarPrev, CalendarNext } from 'radix-vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { cn } from './utils'
import { buttonVariants } from './button/index.js' // We need to export buttonVariants from button if not already

const props = defineProps({
  class: { type: String, default: '' },
})
</script>

<template>
  <CalendarRoot :class="cn('p-3', props.class)">
    <CalendarHeader class="flex items-center justify-between">
      <CalendarPrev :class="cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100')">
        <ChevronLeft class="h-4 w-4" />
      </CalendarPrev>
      <CalendarHeading class="text-sm font-medium" />
      <CalendarNext :class="cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100')">
        <ChevronRight class="h-4 w-4" />
      </CalendarNext>
    </CalendarHeader>

    <div class="flex flex-col space-y-4 mt-4 sm:flex-row sm:space-x-4 sm:space-y-0">
      <CalendarGrid v-for="month in 1" :key="month" class="w-full border-collapse space-y-1">
        <CalendarGridHead>
          <CalendarGridRow class="flex">
            <CalendarHeadCell v-for="day in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="day" class="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]">
              {{ day }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
          <CalendarGridRow v-for="(week, weekIndex) in 6" :key="weekIndex" class="flex w-full mt-2">
            <CalendarCell v-for="(day, dayIndex) in 7" :key="dayIndex" :date="new Date()" class="relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md">
                <CalendarCellTrigger :day="day" :month="month" class="h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md">
                  {{ day }}
                </CalendarCellTrigger>
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </div>
  </CalendarRoot>
</template>
