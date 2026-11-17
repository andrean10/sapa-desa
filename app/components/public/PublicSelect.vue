<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'

type Opsi = { value: string, label: string }

const properti = withDefaults(defineProps<{
  id: string
  modelValue: string
  placeholder: string
  options: Opsi[]
  disabled?: boolean
}>(), {
  disabled: false
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const pilihan = computed(() => properti.options.find(item => item.value === properti.modelValue))
const dropdownTerbuka = useState<string | null>('public-select-terbuka', () => null)
const details = ref<HTMLDetailsElement>()

watch(dropdownTerbuka, (id) => {
  if (id !== properti.id && details.value) details.value.open = false
})

onMounted(() => document.addEventListener('pointerdown', tutupDiLuar))
onBeforeUnmount(() => document.removeEventListener('pointerdown', tutupDiLuar))

function ubahBukaan(event: MouseEvent) {
  if (properti.disabled) {
    event.preventDefault()
    return
  }
  dropdownTerbuka.value = details.value?.open ? null : properti.id
}

function tutupDiLuar(event: PointerEvent) {
  if (details.value?.open && !details.value.contains(event.target as Node)) {
    details.value.open = false
    if (dropdownTerbuka.value === properti.id) dropdownTerbuka.value = null
  }
}

function pilih(value: string, event: MouseEvent) {
  emit('update:modelValue', value)
  dropdownTerbuka.value = null
  const details = (event.currentTarget as HTMLElement).closest('details')
  if (details) details.open = false
}
</script>

<template>
  <details ref="details" class="group relative min-w-0 w-full" :class="{ 'pointer-events-none opacity-50': disabled }">
    <summary :id="id" class="flex min-h-12 w-full min-w-0 cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-input bg-background px-4 text-left text-base font-normal text-foreground outline-none transition hover:border-primary/50 focus:ring-2 focus:ring-primary" :aria-disabled="disabled" :tabindex="disabled ? -1 : 0" @click="ubahBukaan">
      <span class="min-w-0 truncate" :class="pilihan ? '' : 'text-muted-foreground'">{{ pilihan?.label ?? placeholder }}</span>
      <span class="grid size-6 shrink-0 place-items-center text-primary transition duration-200 group-open:rotate-180" aria-hidden="true"><ChevronDown class="size-5 stroke-[2.5]" /></span>
    </summary>
    <div class="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl bg-card p-2 shadow-card ring-1 ring-primary/10">
      <button v-for="option in options" :key="option.value" class="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-medium text-foreground transition hover:bg-muted hover:text-primary" type="button" :class="option.value === modelValue ? 'bg-muted text-primary' : ''" @click="pilih(option.value, $event)">{{ option.label }}</button>
      <p v-if="!options.length" class="px-3 py-3 text-sm text-muted-foreground">Belum ada pilihan.</p>
    </div>
  </details>
</template>
