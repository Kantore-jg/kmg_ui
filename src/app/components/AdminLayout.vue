<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApp } from '../../composables/useApp.js';
import { useAdminScope } from '../../composables/useAdminScope.js';
import {
  LayoutDashboard,
  Store,
  MapPin,
  Users,
  Package,
  Tags,
  FileText,
  Coins,
  Menu,
  X,
  LogOut,
  User,
  UserCog,
  ChevronDown,
  Eye,
  Building2,
  ChevronLeft,
  Circle,
  Printer,
  ShoppingCart,
  CalendarDays,
  Landmark,
} from 'lucide-vue-next';
import Button from './ui/Button.vue';
import Badge from './ui/Badge.vue';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const sidebarOpen = ref(true);
const route = useRoute();
const router = useRouter();
const { currentUser, loading } = useApp();
const {
  isSuperAdmin,
  isMarketAdmin,
  isMarketOwner,
  isMerchant,
  scopedPendingRequests,
  scopedPendingReceipts,
} = useAdminScope();

const pendingRequestsCount = computed(() => scopedPendingRequests.value.length);
const pendingReceiptsCount = computed(() => scopedPendingReceipts.value.length);

const userInitials = computed(() => {
  const name = currentUser.value?.name || 'U';
  return name.substring(0, 2).toUpperCase();
});

const roleLabel = computed(() =>
  (currentUser.value?.role || '').replace(/_/g, ' '),
);

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
});

const breadcrumb = computed(() => {
  const title = route.meta?.title || 'Tableau de bord';
  return { section: 'Administration', page: title };
});

const navigation = computed(() => {
  const items = [
    {
      id: 'dashboard',
      name: 'Tableau de Bord',
      icon: LayoutDashboard,
      path: '/admin',
      exact: true,
    },
  ];

  if (isSuperAdmin.value) {
    items.push(
      { id: 'users', name: 'Utilisateurs', icon: UserCog, path: '/admin/users' },
      { id: 'markets', name: 'Marchés', icon: Store, path: '/admin/markets' },
      { id: 'commerces', name: 'Commerces indépendants', icon: Building2, path: '/admin/commerces' },
      { id: 'places', name: 'Emplacements', icon: MapPin, path: '/admin/places' },
      { id: 'merchants', name: 'Commerçants', icon: Users, path: '/admin/merchants' },
    );
  }

  if (isMarketAdmin.value) {
    items.push(
      { id: 'users', name: 'Utilisateurs', icon: UserCog, path: '/admin/users' },
      { id: 'places', name: 'Emplacements', icon: MapPin, path: '/admin/places' },
      { id: 'merchants', name: 'Commerçants', icon: Users, path: '/admin/merchants' },
      {
        id: 'requests',
        name: 'Demandes',
        icon: FileText,
        path: '/admin/requests',
        badge: pendingRequestsCount.value,
      },
    );
  }

  if (isMarketOwner.value) {
    items.push(
      { id: 'places', name: 'Emplacements', icon: MapPin, path: '/admin/places' },
      { id: 'merchants', name: 'Commerçants', icon: Users, path: '/admin/merchants' },
      {
        id: 'requests',
        name: 'Demandes',
        icon: FileText,
        path: '/admin/requests',
        badge: pendingRequestsCount.value,
      },
    );
  }

  if (isSuperAdmin.value || isMarketAdmin.value) {
    items.push({
      id: 'categories',
      name: 'Catégories',
      icon: Tags,
      path: '/admin/categories',
    });
  }

  if (isMerchant.value) {
    items.push(
      {
        id: 'products',
        name: 'Produits',
        icon: Package,
        path: '/admin/products',
      },
      {
        id: 'sales',
        name: 'Ventes',
        icon: ShoppingCart,
        path: '/admin/sales',
      },
    );
  }

  if (isSuperAdmin.value || isMarketAdmin.value || isMarketOwner.value) {
    items.push(
      {
        id: 'rents',
        name: 'Loyers',
        icon: CalendarDays,
        path: '/admin/rents',
      },
      {
        id: 'payment-methods',
        name: 'Moyens de paiement',
        icon: Landmark,
        path: '/admin/payment-methods',
      },
    );
  }

  if (isSuperAdmin.value || isMarketAdmin.value || isMarketOwner.value || isMerchant.value) {
    items.push({
      id: 'reports',
      name: 'Rapports',
      icon: Printer,
      path: '/admin/reports',
    });
  }

  if (!isMerchant.value) {
    items.push({
      id: 'receipts',
      name: 'Reçus de paiement',
      icon: Coins,
      path: '/admin/receipts',
      badge: pendingReceiptsCount.value,
    });
  } else {
    items.push({
      id: 'receipts',
      name: 'Mes reçus',
      icon: Coins,
      path: '/admin/receipts',
      badge: pendingReceiptsCount.value,
    });
  }

  return items;
});

const isActive = (item) => {
  if (item.exact) return route.path === item.path;
  return route.path === item.path || route.path.startsWith(`${item.path}/`);
};

const navigate = (path) => {
  if (route.path !== path) router.push(path);
};

const goToPortal = () => router.push('/');
const goToProfile = () => router.push('/profile');
</script>

<template>
  <div class="min-h-screen flex bg-background">
    <aside
      :class="[
        'transition-all duration-300 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col fixed lg:sticky top-0 h-screen z-30 overflow-hidden shadow-sm',
        sidebarOpen ? 'w-60' : 'w-0 lg:w-[68px]',
      ]"
    >
      <div :class="['border-b border-sidebar-border', sidebarOpen ? 'p-5' : 'p-3']">
        <div
          :class="[
            'flex items-center',
            sidebarOpen ? 'gap-3' : 'flex-col gap-2',
          ]"
        >
          <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Building2 class="w-5 h-5 text-white" />
          </div>
          <div v-if="sidebarOpen" class="flex-1 min-w-0">
            <h1 class="text-sm font-bold text-foreground tracking-tight truncate">AKAGURIRO</h1>
            <p class="text-[10px] text-primary font-semibold uppercase tracking-wider">Espace Contrôle</p>
          </div>
          <button
            type="button"
            class="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors shrink-0"
            :aria-label="sidebarOpen ? 'Réduire la barre latérale' : 'Étendre la barre latérale'"
            @click="sidebarOpen = !sidebarOpen"
          >
            <ChevronLeft :class="['w-4 h-4 transition-transform', !sidebarOpen && 'rotate-180']" />
          </button>
        </div>
      </div>

      <nav class="flex-1 p-3 space-y-1 overflow-y-auto">
        <button
          v-for="item in navigation"
          :key="item.id"
          @click="navigate(item.path)"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left text-sm',
            isActive(item) ? 'bs-nav-active' : 'bs-nav-item',
          ]"
        >
          <component :is="item.icon" class="w-[18px] h-[18px] shrink-0" />
          <span v-if="sidebarOpen" class="flex-1 truncate">{{ item.name }}</span>
          <Badge
            v-if="sidebarOpen && item.badge"
            class="bg-primary/15 text-primary text-[10px] px-1.5 py-0 border-0"
          >
            {{ item.badge }}
          </Badge>
        </button>
      </nav>


    </aside>

    <div class="flex-1 flex flex-col min-h-screen min-w-0">
      <header class="h-14 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 shadow-sm relative">
        <div
          v-if="loading"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-pulse"
          aria-hidden="true"
        />
        <div class="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" class="lg:hidden shrink-0" @click="sidebarOpen = !sidebarOpen">
            <Menu v-if="!sidebarOpen" class="w-5 h-5" />
            <X v-else class="w-5 h-5" />
          </Button>
          <p class="text-sm truncate">
            <span class="text-muted-foreground">{{ breadcrumb.section }} / </span>
            <span class="text-primary font-medium">{{ breadcrumb.page }}</span>
          </p>
        </div>

        <div class="flex items-center gap-3 lg:gap-5 shrink-0">
         
          <span class="hidden md:inline text-xs text-muted-foreground capitalize">{{ formattedDate }}</span>

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold hover:bg-primary/90 transition-colors">
                <Avatar class="w-8 h-8">
                  <AvatarImage v-if="currentUser.avatar" :src="currentUser.avatar" :alt="currentUser.name" />
                  <AvatarFallback class="bg-primary text-white text-xs">
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
              <DropdownMenuItem @click="goToPortal">
                <Eye class="w-4 h-4 mr-2" />
                Portail public
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @click="goToPortal">
                <LogOut class="w-4 h-4 mr-2" />
                Quitter l'espace admin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main class="flex-1 p-4 lg:p-6 overflow-auto">
        <router-view />
      </main>
    </div>

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/30 z-20 lg:hidden"
      @click="sidebarOpen = false"
    />
  </div>
</template>
