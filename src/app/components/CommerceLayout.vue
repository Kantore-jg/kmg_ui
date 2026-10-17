<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApp } from '../../composables/useApp.js';
import { useCommerceScope } from '../../composables/useCommerceScope.js';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  History,
  Wallet,
  DoorOpen,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Eye,
  Store,
  ChevronLeft,
} from 'lucide-vue-next';
import Button from './ui/Button.vue';
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
const { currentUser, loading, logout } = useApp();
const {
  currentCommerce,
  commerceRoleLabel,
  canManageUsers,
  canManageProducts,
  canManageStocks,
  canManageSales,
  canManageCash,
  canViewReports,
  canManageSettings,
} = useCommerceScope();

const userInitials = computed(() => {
  const name = currentUser.value?.name || 'U';
  return name.substring(0, 2).toUpperCase();
});

const formattedDate = computed(() =>
  new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }),
);

const breadcrumb = computed(() => ({
  section: currentCommerce.value?.name || 'Commerce',
  page: route.meta?.title || 'Tableau de bord',
}));

const navGroups = computed(() => {
  const groups = [
    {
      label: 'TABLEAU DE BORD',
      items: [
        { id: 'dashboard', name: 'Tableau de bord', icon: LayoutDashboard, path: '/commerce', exact: true },
      ],
    },
  ];

  if (canManageSales.value) {
    groups.push({
      label: 'VENTES',
      items: [
        { id: 'pos', name: 'Nouvelle vente', icon: ShoppingCart, path: '/commerce/pos' },
        { id: 'sales', name: 'Ventes', icon: Receipt, path: '/commerce/sales' },
      ],
    });
  }

  const stockItems = [];
  if (canManageStocks.value) {
    stockItems.push({ id: 'stocks', name: 'Mes stocks', icon: Boxes, path: '/commerce/stocks' });
  }
  if (canManageProducts.value) {
    stockItems.push({ id: 'products', name: 'Produits', icon: Package, path: '/commerce/products' });
  }
  if (canManageStocks.value) {
    stockItems.push(
      { id: 'purchases', name: 'Entrées', icon: ArrowDownToLine, path: '/commerce/purchases' },
      { id: 'stock-exits', name: 'Sorties', icon: ArrowUpFromLine, path: '/commerce/stock-exits' },
      { id: 'transfers', name: 'Transferts', icon: ArrowLeftRight, path: '/commerce/transfers' },
      { id: 'movements', name: 'Mouvements', icon: History, path: '/commerce/movements' },
    );
  }
  if (stockItems.length) {
    groups.push({ label: 'STOCKS', items: stockItems });
  }

  if (canManageCash.value) {
    groups.push({
      label: 'CAISSES',
      items: [
        { id: 'cash-current', name: 'Caisse actuelle', icon: Wallet, path: '/commerce/cash/current' },
        { id: 'cash-open-close', name: 'Ouverture / fermeture', icon: DoorOpen, path: '/commerce/cash/open-close' },
        { id: 'cash-in', name: 'Entrées', icon: ArrowDownCircle, path: '/commerce/cash/movements', query: { tab: 'in' } },
        { id: 'cash-out', name: 'Sorties', icon: ArrowUpCircle, path: '/commerce/cash/movements', query: { tab: 'out' } },
        { id: 'cash-history', name: 'Historique', icon: History, path: '/commerce/cash/history' },
      ],
    });
  }

  if (canViewReports.value) {
    groups.push({
      label: 'RAPPORTS',
      items: [
        { id: 'reports', name: 'Rapports', icon: BarChart3, path: '/commerce/reports' },
      ],
    });
  }

  const adminItems = [];
  if (canManageUsers.value) {
    adminItems.push({ id: 'users', name: 'Utilisateurs', icon: Users, path: '/commerce/users' });
  }
  if (canManageSettings.value) {
    adminItems.push({ id: 'settings', name: 'Paramètres', icon: Settings, path: '/commerce/settings' });
  }
  if (adminItems.length) {
    groups.push({ label: 'ADMINISTRATION', items: adminItems });
  }

  return groups;
});

const isActive = (item) => {
  if (item.exact) return route.path === item.path;
  if (item.query?.tab) {
    return route.path === item.path && route.query.tab === item.query.tab;
  }
  return route.path === item.path || route.path.startsWith(`${item.path}/`);
};

const navigate = (item) => {
  const target = item.query ? { path: item.path, query: item.query } : item.path;
  router.push(target);
};

const goToPortal = () => router.push('/');
const goToProfile = () => router.push('/profile');

const handleLogout = async () => {
  await logout();
  router.push('/login');
};
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
        <div :class="['flex items-center', sidebarOpen ? 'gap-3' : 'flex-col gap-2']">
          <div class="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Store class="w-5 h-5 text-white" />
          </div>
          <div v-if="sidebarOpen" class="flex-1 min-w-0">
            <h1 class="text-sm font-bold text-foreground tracking-tight truncate">AKAGURIRO</h1>
            <p class="text-[10px] text-primary font-semibold uppercase tracking-wider">Commerce indépendant</p>
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

      <nav class="flex-1 p-3 space-y-4 overflow-y-auto">
        <div v-for="group in navGroups" :key="group.label">
          <p v-if="sidebarOpen" class="px-3 mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {{ group.label }}
          </p>
          <div class="space-y-1">
            <button
              v-for="item in group.items"
              :key="item.id"
              @click="navigate(item)"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left text-sm',
                isActive(item) ? 'bs-nav-active' : 'bs-nav-item',
              ]"
            >
              <component :is="item.icon" class="w-[18px] h-[18px] shrink-0" />
              <span v-if="sidebarOpen" class="flex-1 truncate">{{ item.name }}</span>
            </button>
          </div>
        </div>
      </nav>
    </aside>

    <div class="flex-1 flex flex-col min-h-screen min-w-0">
      <header class="h-14 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 shadow-sm relative">
        <div v-if="loading" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-pulse" aria-hidden="true" />
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
                  <AvatarFallback class="bg-primary text-white text-xs">{{ userInitials }}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-56">
              <DropdownMenuLabel>
                <p class="font-medium">{{ currentUser.name }}</p>
                <p class="text-xs text-muted-foreground font-normal">{{ commerceRoleLabel }}</p>
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
              <DropdownMenuItem @click="handleLogout">
                <LogOut class="w-4 h-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main class="flex-1 p-4 lg:p-6 overflow-auto">
        <router-view />
      </main>
    </div>

    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/30 z-20 lg:hidden" @click="sidebarOpen = false" />
  </div>
</template>
