import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'events', component: () => import('@/views/EventsListView.vue') },
  { path: '/stats', name: 'all-events-stats', component: () => import('@/views/AllEventsStatsView.vue') },
  { path: '/new', redirect: { name: 'events' } },
  { path: '/events/:eventId', name: 'event-detail', component: () => import('@/views/EventDetailView.vue') }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})
