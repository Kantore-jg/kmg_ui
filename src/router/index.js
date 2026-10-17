import { createRouter, createWebHistory } from 'vue-router';
import { getStoredUser } from '../api/services/auth.js';
import { getToken } from '../api/client.js';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN_MARCHE', 'PROPRIETAIRE_MARCHE', 'COMMERCANT'];
const OWNER_CONSULT_ROLES = ['SUPER_ADMIN', 'ADMIN_MARCHE', 'PROPRIETAIRE_MARCHE'];
const COMMERCE_USER_ROLE = 'COMMERCE_USER';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/LoginPage.vue'),
    meta: { public: true, standalone: true, authMode: 'login' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../components/LoginPage.vue'),
    meta: { public: true, standalone: true, authMode: 'register' },
  },
  {
    path: '/auth',
    redirect: '/login',
  },
  {
    path: '/admin',
    component: () => import('../app/components/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../app/components/pages/admin/DashboardPage.vue'),
        meta: { title: 'Tableau de bord' },
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../app/components/pages/admin/UsersPage.vue'),
        meta: { title: 'Utilisateurs', roles: ['SUPER_ADMIN', 'ADMIN_MARCHE'] },
      },
      {
        path: 'markets',
        name: 'AdminMarkets',
        component: () => import('../app/components/pages/admin/MarketsPage.vue'),
        meta: { title: 'Marchés', roles: ['SUPER_ADMIN'] },
      },
      {
        path: 'places',
        name: 'AdminPlaces',
        component: () => import('../app/components/pages/admin/PlacesPage.vue'),
        meta: { title: 'Emplacements', roles: OWNER_CONSULT_ROLES },
      },
      {
        path: 'merchants',
        name: 'AdminMerchants',
        component: () => import('../app/components/pages/admin/MerchantsPage.vue'),
        meta: { title: 'Commerçants', roles: OWNER_CONSULT_ROLES },
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('../app/components/pages/admin/CategoriesPage.vue'),
        meta: { title: 'Catégories', roles: ['SUPER_ADMIN', 'ADMIN_MARCHE'] },
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('../app/components/pages/admin/ProductsPage.vue'),
        meta: { title: 'Produits', roles: ['COMMERCANT'] },
      },
      {
        path: 'requests',
        name: 'AdminRequests',
        component: () => import('../app/components/pages/admin/RequestsPage.vue'),
        meta: { title: 'Demandes', roles: OWNER_CONSULT_ROLES },
      },
      {
        path: 'receipts',
        name: 'AdminReceipts',
        component: () => import('../app/components/pages/admin/ReceiptsPage.vue'),
        meta: { title: 'Reçus' },
      },
      {
        path: 'sales',
        name: 'AdminSales',
        component: () => import('../app/components/pages/admin/SalesPage.vue'),
        meta: { title: 'Ventes', roles: ['COMMERCANT'] },
      },
      {
        path: 'reports',
        name: 'AdminReports',
        component: () => import('../app/components/pages/admin/ReportsPage.vue'),
        meta: { title: 'Rapports', roles: [...OWNER_CONSULT_ROLES, 'COMMERCANT'] },
      },
      {
        path: 'rents',
        name: 'AdminRents',
        component: () => import('../app/components/pages/admin/RentsPage.vue'),
        meta: { title: 'Loyers', roles: OWNER_CONSULT_ROLES },
      },
      {
        path: 'payment-methods',
        name: 'AdminPaymentMethods',
        component: () => import('../app/components/pages/admin/PaymentMethodsPage.vue'),
        meta: { title: 'Moyens de paiement', roles: OWNER_CONSULT_ROLES },
      },
      {
        path: 'commerces',
        name: 'AdminCommerces',
        component: () => import('../app/components/pages/admin/CommercesPage.vue'),
        meta: { title: 'Commerces indépendants', roles: ['SUPER_ADMIN'] },
      },
    ],
  },
  {
    path: '/commerce',
    component: () => import('../app/components/CommerceLayout.vue'),
    meta: { requiresCommerceAuth: true },
    children: [
      {
        path: '',
        name: 'CommerceDashboard',
        component: () => import('../app/components/pages/commerce/DashboardPage.vue'),
        meta: { title: 'Tableau de bord' },
      },
      {
        path: 'pos',
        name: 'CommercePos',
        component: () => import('../app/components/pages/commerce/PosPage.vue'),
        meta: { title: 'Nouvelle vente' },
      },
      {
        path: 'sales',
        name: 'CommerceSales',
        component: () => import('../app/components/pages/commerce/SalesPage.vue'),
        meta: { title: 'Ventes' },
      },
      {
        path: 'stocks',
        name: 'CommerceStocks',
        component: () => import('../app/components/pages/commerce/StocksPage.vue'),
        meta: { title: 'Mes stocks' },
      },
      {
        path: 'products',
        name: 'CommerceProducts',
        component: () => import('../app/components/pages/commerce/ProductsPage.vue'),
        meta: { title: 'Produits' },
      },
      {
        path: 'purchases',
        name: 'CommercePurchases',
        component: () => import('../app/components/pages/commerce/PurchasesPage.vue'),
        meta: { title: 'Entrées stock' },
      },
      {
        path: 'stock-exits',
        name: 'CommerceStockExits',
        component: () => import('../app/components/pages/commerce/StockExitsPage.vue'),
        meta: { title: 'Sorties stock' },
      },
      {
        path: 'transfers',
        name: 'CommerceTransfers',
        component: () => import('../app/components/pages/commerce/TransfersPage.vue'),
        meta: { title: 'Transferts' },
      },
      {
        path: 'movements',
        name: 'CommerceMovements',
        component: () => import('../app/components/pages/commerce/MovementsPage.vue'),
        meta: { title: 'Mouvements' },
      },
      {
        path: 'cash/current',
        name: 'CommerceCashCurrent',
        component: () => import('../app/components/pages/commerce/CashCurrentPage.vue'),
        meta: { title: 'Caisse actuelle' },
      },
      {
        path: 'cash/open-close',
        name: 'CommerceCashOpenClose',
        component: () => import('../app/components/pages/commerce/CashOpenClosePage.vue'),
        meta: { title: 'Ouverture / fermeture' },
      },
      {
        path: 'cash/movements',
        name: 'CommerceCashMovements',
        component: () => import('../app/components/pages/commerce/CashMovementsPage.vue'),
        meta: { title: 'Mouvements caisse' },
      },
      {
        path: 'cash/history',
        name: 'CommerceCashHistory',
        component: () => import('../app/components/pages/commerce/CashHistoryPage.vue'),
        meta: { title: 'Historique caisse' },
      },
      {
        path: 'reports',
        name: 'CommerceReports',
        component: () => import('../app/components/pages/commerce/ReportsPage.vue'),
        meta: { title: 'Rapports' },
      },
      {
        path: 'users',
        name: 'CommerceUsers',
        component: () => import('../app/components/pages/commerce/UsersPage.vue'),
        meta: { title: 'Utilisateurs' },
      },
      {
        path: 'settings',
        name: 'CommerceSettings',
        component: () => import('../app/components/pages/commerce/SettingsPage.vue'),
        meta: { title: 'Paramètres' },
      },
    ],
  },
  {
    path: '/admin/prints',
    redirect: '/admin/reports',
  },
  {
    path: '/admin/print',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'merchants',
        name: 'PrintMerchants',
        component: () => import('../app/components/print/PrintMerchantsPage.vue'),
        meta: { title: 'Impression commerçants', roles: OWNER_CONSULT_ROLES },
      },
      {
        path: 'places',
        name: 'PrintPlaces',
        component: () => import('../app/components/print/PrintPlacesPage.vue'),
        meta: { title: 'Impression emplacements', roles: OWNER_CONSULT_ROLES },
      },
      {
        path: 'products',
        name: 'PrintProducts',
        component: () => import('../app/components/print/PrintProductsPage.vue'),
        meta: { title: 'Impression produits', roles: ['COMMERCANT'] },
      },
      {
        path: 'invoice',
        name: 'PrintInvoice',
        component: () => import('../app/components/print/PrintInvoicePage.vue'),
        meta: { title: 'Facture de vente', roles: ['COMMERCANT'] },
      },
      {
        path: 'receipt',
        name: 'PrintSaleReceipt',
        component: () => import('../app/components/print/PrintSaleReceiptPage.vue'),
        meta: { title: 'Reçu de vente', roles: ['COMMERCANT'] },
      },
    ],
  },
  {
    path: '/',
    component: () => import('../components/PublicApp.vue'),
    meta: { public: true },
    children: [
      { path: '', name: 'Home', meta: { tab: 'home' } },
      { path: 'markets', name: 'Markets', meta: { tab: 'markets' } },
      { path: 'markets/:marketId', name: 'MarketDetail', meta: { tab: 'markets' } },
      { path: 'products', name: 'Products', meta: { tab: 'products' } },
      { path: 'products/:productId', name: 'ProductDetail', meta: { tab: 'products' } },
      { path: 'merchants', name: 'Merchants', meta: { tab: 'merchants' } },
      { path: 'merchants/:merchantId', name: 'MerchantDetail', meta: { tab: 'merchants' } },
      { path: 'price-trends', name: 'PriceTrends', meta: { tab: 'price-trends' } },
      { path: 'request', name: 'Request', meta: { tab: 'request' } },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../components/ProfilePage.vue'),
        meta: { requiresToken: true, tab: 'profile' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const user = getStoredUser();
  const role = user?.role;
  const hasToken = Boolean(getToken());

  if ((to.name === 'Login' || to.name === 'Register') && hasToken && user?.id) {
    if (role === COMMERCE_USER_ROLE) {
      next({ path: '/commerce' });
    } else if (ADMIN_ROLES.includes(role)) {
      next({ path: '/admin' });
    } else {
      next({ path: '/' });
    }
    return;
  }

  if (to.matched.some((r) => r.meta.requiresToken)) {
    if (!hasToken || !user?.id) {
      next({ path: '/login', query: { redirect: to.fullPath } });
      return;
    }
  }

  if (to.matched.some((r) => r.meta.requiresCommerceAuth)) {
    if (!hasToken || role !== COMMERCE_USER_ROLE) {
      next({ path: '/login', query: { redirect: to.fullPath } });
      return;
    }
  }

  if (to.matched.some((r) => r.meta.requiresAuth)) {
    if (!hasToken || !role || !ADMIN_ROLES.includes(role)) {
      next({ path: '/login' });
      return;
    }

    const restricted = to.matched.find((r) => r.meta.roles);
    if (restricted?.meta.roles && !restricted.meta.roles.includes(role)) {
      next({ name: 'AdminDashboard' });
      return;
    }
  }

  if (to.path.startsWith('/admin') && role === COMMERCE_USER_ROLE) {
    next({ path: '/commerce' });
    return;
  }

  if (to.path.startsWith('/admin') && role && !ADMIN_ROLES.includes(role)) {
    next(user?.id ? { name: 'Profile' } : { path: '/login' });
    return;
  }

  if (to.path.startsWith('/commerce') && role && role !== COMMERCE_USER_ROLE) {
    next(ADMIN_ROLES.includes(role) ? { path: '/admin' } : { path: '/login' });
    return;
  }

  next();
});

export default router;
