<template>
  <CoffeeGsapBackground />
  <div class="app-content">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import CoffeeGsapBackground from "./components/CoffeeGsapBackground.vue";
</script>

<style scoped>
.app-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}
</style>
