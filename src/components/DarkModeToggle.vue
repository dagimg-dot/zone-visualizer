<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'

const isDark = ref(false)

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})

function setTheme(theme: 'light' | 'dark') {
  const root = document.documentElement
  if (theme === 'dark')
    root.classList.add('dark')
  else root.classList.remove('dark')
  localStorage.setItem('theme', theme)
  isDark.value = theme === 'dark'
}

function toggleTheme() {
  setTheme(isDark.value ? 'light' : 'dark')
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    aria-label="Toggle dark mode"
    class="hover:bg-accent"
    @click="toggleTheme"
  >
    <Sun v-if="!isDark" class="size-5" />
    <Moon v-else class="size-5" />
  </Button>
</template>
