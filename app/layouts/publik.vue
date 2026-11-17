<template>
  <div class="flex min-h-screen min-w-0 flex-col overflow-x-hidden bg-background text-foreground">
    <PublicHeader />
    <main class="flex-1">
      <slot />
    </main>
    <PublicFooter />
  </div>
</template>
