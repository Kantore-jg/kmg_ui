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
  { id: 'merchants', label: 'Commerçants', path: '/merchants' },
  { id: 'request', label: 'Demande place', path: '/request' },
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
  <header class="sticky top-0 z-50 w-full bg-[#0b3a7a] text-white shadow-sm">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14">
        <div @click="handleLogoClick" class="flex items-center gap-2.5 cursor-pointer group shrink-0">
          <div class="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
            <Building2 class="w-4 h-4 text-white" />
          </div>
          <h1 class="text-base font-bold tracking-tight text-white">AKAGURIRO</h1>
        </div>

        <nav class="hidden lg:flex items-center gap-1">
          <button
            v-for="item in navItems"
            :key="item.id"
            @click="handlePublicNav(item.id)"
            class="px-4 py-2 text-sm font-medium transition-colors relative"
            :class="isPublicRoute && publicTab === item.id
              ? 'text-white'
              : 'text-white/70 hover:text-white'"
          >
            {{ item.label }}
            <span
              v-if="isPublicRoute && publicTab === item.id"
              class="absolute bottom-0 left-2 right-2 h-0.5 bg-white rounded-full"
            />
          </button>
        </nav>

        <div class="flex items-center gap-2">
          <template v-if="!isLoggedIn">
            <button
              @click="handlePublicNav('auth')"
              class="hidden sm:inline-flex h-9 items-center rounded-sm bg-white px-4 text-xs font-semibold text-[#0b3a7a] transition-colors hover:bg-sky-50"
            >
              Connexion
            </button>
          </template>
          <template v-else>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <button
                  class="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 hover:bg-white/10 transition-colors"
                  :title="currentUser.name"
                >
                  <span class="hidden sm:inline text-sm font-medium text-white max-w-[140px] truncate">
                    {{ currentUser.name }}
                  </span>
                  <Avatar class="w-8 h-8">
                    <AvatarImage
                      v-if="currentUser.avatar"
                      :src="currentUser.avatar"
                      :alt="currentUser.name"
                    />
                    <AvatarFallback class="bg-white/20 text-white text-xs font-bold">
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
            class="lg:hidden p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X v-if="mobileMenuOpen" class="w-5 h-5" />
            <Menu v-else class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="mobileMenuOpen"
      class="lg:hidden border-t border-white/10 bg-[#0b3a7a] px-4 py-4 space-y-2 animate-fadeIn"
    >
      <button
        v-for="item in navItems"
        :key="item.id"
        @click="handlePublicNav(item.id)"
        class="w-full py-2.5 px-3 rounded-lg text-left text-sm font-medium"
        :class="isPublicRoute && publicTab === item.id ? 'bg-white/15 text-white' : 'text-white/80 hover:bg-white/10'"
      >
        {{ item.label }}
      </button>
      <div class="border-t border-white/10 pt-3 space-y-2">
        <button
          v-if="!isLoggedIn"
          @click="handlePublicNav('auth')"
          class="w-full h-10 rounded-sm bg-white text-center text-sm font-semibold text-[#0b3a7a]"
        >
          Connexion / Inscription
        </button>
        <template v-else>
          <button @click="goToProfile" class="w-full py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 flex items-center justify-center gap-2">
            <User class="w-4 h-4" /> Mon profil
          </button>
          <button
            v-if="canAccessAdmin"
            @click="goToAdmin(); mobileMenuOpen = false"
            class="w-full py-2 rounded-lg text-sm font-medium text-white/90 hover:bg-white/10 flex items-center justify-center gap-2"
          >
            <LayoutDashboard class="w-4 h-4" /> Espace Admin
          </button>
          <button
            @click="handleLogout"
            class="w-full h-10 rounded-sm bg-white text-center text-sm font-semibold text-[#0b3a7a]"
          >
            Déconnexion
          </button>
        </template>
      </div>
    </div>
  </header>
</template>
