<script setup lang="ts">
import { Eye, EyeOff } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { TEKS_LOGIN } from '~~/shared/config/teks'

// Kolom password dengan tombol mata untuk menampilkan/menyembunyikan isi. Atribut lain (id, minlength, autocomplete, dst.) diteruskan ke input.
defineOptions({ inheritAttrs: false })
const model = defineModel<string>({ default: '' })
const terlihat = ref(false)
</script>

<template>
  <div class="relative">
    <Input v-bind="$attrs" v-model="model" :type="terlihat ? 'text' : 'password'" class="pr-11" />
    <Button
      type="button"
      variant="ghost"
      size="icon"
      class="absolute top-0 right-0 size-9 text-muted-foreground hover:text-foreground"
      :aria-label="terlihat ? TEKS_LOGIN.sembunyikan : TEKS_LOGIN.tampilkan"
      :aria-pressed="terlihat"
      @click="terlihat = !terlihat"
    >
      <EyeOff v-if="terlihat" aria-hidden="true" />
      <Eye v-else aria-hidden="true" />
    </Button>
  </div>
</template>
