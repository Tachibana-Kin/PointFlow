<script setup lang="ts">
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar class="sidebar" />
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  display: none;
}

.content {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
}

@media (min-width: 640px) {
  .sidebar {
    display: flex;
  }

  .content {
    padding: var(--spacing-lg);
  }
}
</style>
