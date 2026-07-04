import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { router } from './router'
import './assets/main.css'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

createApp(App).use(createPinia()).use(router).mount('#app')