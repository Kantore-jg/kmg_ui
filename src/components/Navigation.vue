<!--
  @license
  SPDX-License-Identifier: Apache-2.0
-->

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApp } from '../composables/useApp.js';
import { usePublicNavigation } from '../composables/usePublicNavigation.js';
import {
  Building2,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-vue-next';
import { Avatar, AvatarImage, AvatarFallback } from '../app/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../app/components/ui/dropdown-menu';

const route = useRoute();
const router = useRouter();
const {
  currentUser,
  logout,
  publicTab,
} = useApp();

const { goHome, goToTab } = usePublicNavigation();

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN_MARCHE', 'PROPRIETAIRE_MARCHE', 'COMMERCANT'];

const isAdminRoute = computed(() => route.path.startsWith('/admin'));
const isProfileRoute = computed(() => route.path === '/profile');
const isPublicRoute = computed(() => !isAdminRoute.value && !isProfileRoute.value);
const isLoggedIn = computed(() => Boolean(currentUser.value?.id));
const canAccessAdmin = computed(() => ADMIN_ROLES.includes(currentUser.value?.role));
const userInitials = computed(() => {
  const name = currentUser.value?.name || 'U';
  return name.substring(0, 2).toUpperCase();
});

const roleLabel = computed(() =>
  (currentUser.value?.role || '').replace(/_/g, ' '),
);

const mobileMenuOpen = ref(false);
const navItems = [
  { id: 'home', label: 'Accueil', path: '/' },
  { id: 'markets', label: 'Marchés', path: '/markets' },
  { id: 'products', label: 'Produits', path: '/products' },
  { id: 'price-trends', label: 'Tendances prix', path: '/price-trends' },
  { id: 'merchants', label: 'Commerçants', path: '/merchants' },
];

function handleLogoClick() {
  goHome();
}

function handlePublicNav(tab) {
  if (tab === 'auth') {
    router.push('/login');
  } else {
    goToTab(tab);
  }
  mobileMenuOpen.value = false;
}

function goToAdmin() {
  router.push('/admin');
}

function goToProfile() {
  router.push('/profile');
  mobileMenuOpen.value = false;
}

async function handleLogout() {
  await logout();
  router.push('/');
  goToTab('home');
  mobileMenuOpen.value = false;
}
</script>

<template>
  <header class="sticky top-0 z-50 w-full bg-card text-foreground shadow-sm border-b border-border">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14">
        <div @click="handleLogoClick" class="flex items-center gap-2.5 cursor-pointer group shrink-0">
          <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Building2 class="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 class="text-base font-bold tracking-tight text-primary">AKAGURIRO</h1>
            <!-- <p class="text-[9px] uppercase tracking-wider text-muted-foreground font-medium leading-none">Smart Markets Burundi</p> -->
          </div>
        </div>

        <nav class="hidden lg:flex items-center gap-1">
          <button
            v-for="item in navItems"
            :key="item.id"
            @click="handlePublicNav(item.id)"
            class="px-4 py-2 text-sm font-medium transition-colors relative"
            :class="isPublicRoute && publicTab === item.id
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'"
          >
            {{ item.label }}
            <span
              v-if="isPublicRoute && publicTab === item.id"
              class="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
            />
          </button>
        </nav>

        <div class="flex items-center gap-2">
          <template v-if="!isLoggedIn">
            <button
              @click="handlePublicNav('auth')"
              class="bs-btn-primary text-xs hidden sm:inline-flex"
            >
              Connexion
            </button>
          </template>
          <template v-else>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <button
                  class="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 hover:bg-accent transition-colors"
                  :title="currentUser.name"
                >
                  <span class="hidden sm:inline text-sm font-medium text-foreground max-w-[140px] truncate">
                    {{ currentUser.name }}
                  </span>
                  <Avatar class="w-8 h-8">
                    <AvatarImage
                      v-if="currentUser.avatar"
                      :src="currentUser.avatar"
                      :alt="currentUser.name"
                    />
                    <AvatarFallback class="bg-primary text-white text-xs font-bold">
                      {{ userInitials }}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-56">
                <DropdownMenuLabel>
                  <p class="font-medium">{{ currentUser.name }}</p>
                  <p class="text-xs text-muted-foreground font-normal">{{ roleLabel }}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="goToProfile">
                  <User class="w-4 h-4 mr-2" />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuItem v-if="canAccessAdmin" @click="goToAdmin">
                  <LayoutDashboard class="w-4 h-4 mr-2" />
                  Espace Admin
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="handleLogout">
                  <LogOut class="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </template>

          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
          >
            <X v-if="mobileMenuOpen" class="w-5 h-5" />
            <Menu v-else class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="mobileMenuOpen"
      class="lg:hidden border-t border-border bg-card px-4 py-4 space-y-2 animate-fadeIn"
    >
      <button
        v-for="item in navItems"
        :key="item.id"
        @click="handlePublicNav(item.id)"
        class="w-full py-2.5 px-3 rounded-lg text-left text-sm font-medium"
        :class="isPublicRoute && publicTab === item.id ? 'bg-primary/10 text-primary' : 'hover:bg-accent'"
      >
        {{ item.label }}
      </button>
      <div class="border-t border-border pt-3 space-y-2">
        <button
          v-if="!isLoggedIn"
          @click="handlePublicNav('auth')"
          class="w-full bs-btn-primary text-center"
        >
          Connexion / Inscription
        </button>
        <template v-else>
          <button @click="goToProfile" class="w-full py-2 rounded-lg text-sm font-medium hover:bg-accent flex items-center justify-center gap-2">
            <User class="w-4 h-4" /> Mon profil
          </button>
          <button
            v-if="canAccessAdmin"
            @click="goToAdmin(); mobileMenuOpen = false"
            class="w-full py-2 rounded-lg text-sm font-medium hover:bg-accent flex items-center justify-center gap-2"
          >
            <LayoutDashboard class="w-4 h-4" /> Espace Admin
          </button>
          <button
            @click="handleLogout"
            class="w-full bs-btn-primary text-center"
          >
            Déconnexion
          </button>
        </template>
      </div>
    </div>
  </header>
</template>
