const routes = [
  {
    path: '/',
    component: () => import('layouts/BaseLayout.vue'),
    children: [
      { name: 'home', path: '', component: () => import('pages/Home.vue') },
      {
        name: 'deposit',
        path: '/deposit',
        component: () => import('pages/Deposit.vue'),
      },
      {
        name: 'bid',
        path: '/bid',
        component: () => import('pages/Bid.vue'),
      },
      {
        name: 'vote',
        path: '/vote',
        component: () => import('pages/Vote.vue'),
      },
    ],
  },
];

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue'),
  });
}

export default routes;
