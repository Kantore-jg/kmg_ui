import { createRouter, createWebHistory } from 'vue-router';
import { getStoredUser } from '../api/services/auth.js';
import { getToken } from '../api/client.js';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN_MARCHE', 'PROPRIETAIRE_MARCHE', 'COMMERCANT'];
const OWNER_CONSULT_ROLES = ['SUPER_ADMIN', 'ADMIN_MARCHE', 'PROPRIETAIRE_MARCHE'];

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
        meta: { title: 'Le marché', roles: ['SUPER_ADMIN'] },
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
        path: 'reports',
        name: 'AdminReports',
        component: () => import('../app/components/pages/admin/ReportsPage.vue'),
        meta: { title: 'Rapports', roles: OWNER_CONSULT_ROLES },
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
    ],
  },
  {
    path: '/',
    component: () => import('../components/PublicApp.vue'),
    meta: { public: true },
    children: [
      { path: '', name: 'Home', meta: { tab: 'home' } },
      { path: 'markets', redirect: '/' },
      { path: 'markets/:marketId', redirect: '/' },
      { path: 'products', redirect: '/' },
      { path: 'products/:productId', redirect: '/' },
      { path: 'price-trends', redirect: '/' },
      { path: 'merchants', name: 'Merchants', meta: { tab: 'merchants' } },
      { path: 'merchants/:merchantId', name: 'MerchantDetail', meta: { tab: 'merchants' } },
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
    if (ADMIN_ROLES.includes(role)) {
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

  if (to.path.startsWith('/admin') && role && !ADMIN_ROLES.includes(role)) {
    next(user?.id ? { name: 'Profile' } : { path: '/login' });
    return;
  }

  next();
});

export default router;
