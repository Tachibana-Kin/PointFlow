<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import MobileNav from '@/components/layout/MobileNav.vue'

const sidebarCollapsed = ref(false)
function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div class="layout">
    <Sidebar
      class="desktop-sidebar"
      :collapsed="sidebarCollapsed"
      @toggle="toggleSidebar"
    />
    <main class="main-content">
      <div class="content-wrapper">
        <slot />
      </div>
    </main>
    <MobileNav class="mobile-bottom-nav" />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}
.desktop-sidebar {
  display: none;
}
.main-content {
  flex: 1;
  overflow-y: auto;
}
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-md);
  padding-bottom: 80px;
}
@media (min-width: 768px) {
  .desktop-sidebar {
    display: flex;
  }
  .content-wrapper {
    padding: var(--spacing-lg);
    padding-bottom: var(--spacing-lg);
  }
  .mobile-bottom-nav {
    display: none;
  }
}
</style>
