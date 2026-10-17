<script setup>
import { provideApp } from './composables/useApp.js';

provideApp();
</script>

<template>
  <router-view />
</template>