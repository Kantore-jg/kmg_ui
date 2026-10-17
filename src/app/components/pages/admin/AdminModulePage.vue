<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AdminDashboard from '../../../../components/AdminDashboard.vue';

const route = useRoute();
const tab = computed(() => route.meta.tab || 'dashboard');
</script>

<template>
  <AdminDashboard :embedded="true" :tab="tab" />
</template>