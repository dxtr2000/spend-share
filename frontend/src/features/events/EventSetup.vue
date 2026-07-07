<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { Plus, Trash2, Users } from 'lucide-vue-next'

import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import FieldLabel from '@/components/ui/FieldLabel.vue'
import { currencyOptions } from '@/features/expenses/categories'
import { useI18n } from '@/i18n'
import type { CurrencyCode } from '@spend-share/types'

const emit = defineEmits<{
  createEvent: [payload: { currency: CurrencyCode; memberNames: string[]; name: string }]
  cancel: []
}>()

withDefaults(
  defineProps<{
    embedded?: boolean
  }>(),
  {
    embedded: false
  }
)

const eventName = shallowRef('')
const currency = shallowRef<CurrencyCode>('USD')
const memberName = shallowRef('')
const members = ref<string[]>(['You'])
const submitted = shallowRef(false)
const { t } = useI18n()

const validationError = computed(() => {
  if (!eventName.value.trim()) return t('event.validation.name')
  if (members.value.length < 1) return t('event.validation.member')
  return ''
})

function addMember() {
  const normalizedName = memberName.value.trim()
  if (!normalizedName || members.value.includes(normalizedName)) return
  members.value = [...members.value, normalizedName]
  memberName.value = ''
}

function removeMember(name: string) {
  members.value = members.value.filter((member) => member !== name)
}

function submitEvent() {
  submitted.value = true
  if (validationError.value) return
  emit('createEvent', { currency: currency.value, memberNames: members.value, name: eventName.value.trim() })
}
</script>

<template>
  <section :class="embedded ? 'w-full' : 'mx-auto mt-8 w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-panel'">
    <template v-if="!embedded">
      <p class="event-setup__eyebrow">{{ t('event.create.start') }}</p>
      <h2 class="mt-1 text-2xl font-black tracking-tight">{{ t('event.create.title') }}</h2>
      <p class="mt-2 text-sm leading-6 text-muted">
        {{ t('event.create.description') }}
      </p>

      <button
        type="button"
        class="event-setup__back-button"
        @click="emit('cancel')"
      >
        {{ t('event.backToEvents') }}
      </button>
    </template>

    <div :class="embedded ? 'grid gap-4' : 'mt-6 grid gap-4'">
      <div class="grid gap-4 rounded-2xl border border-border bg-cardSoft/60 p-4 sm:grid-cols-[1fr_9rem]">
        <div>
          <FieldLabel html-for="event-name">{{ t('event.name') }}</FieldLabel>
          <Input id="event-name" v-model="eventName" autocomplete="off" name="event-name" :placeholder="t('event.namePlaceholder')" />
        </div>
        <div>
          <FieldLabel html-for="event-currency">{{ t('event.currency') }}</FieldLabel>
          <Select id="event-currency" v-model="currency" :ariaLabel="t('event.currency')" :options="currencyOptions" />
        </div>
      </div>

      <section class="rounded-2xl border border-border bg-cardSoft/60 p-4">
        <div class="mb-3 flex items-center gap-2">
          <span class="event-setup__section-icon">
            <Users class="size-4" aria-hidden="true" />
          </span>
          <div>
            <FieldLabel html-for="member-name" class="mb-0">{{ t('event.member.add') }}</FieldLabel>
            <p class="event-setup__member-count">{{ t('event.member.count', { count: members.length }) }}</p>
          </div>
        </div>

        <div class="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            id="member-name"
            v-model="memberName"
            autocomplete="off"
            name="member-name"
            :placeholder="t('event.member.namePlaceholder')"
            @keydown.enter.prevent="addMember"
          />
          <Button variant="secondary" :disabled="!memberName.trim()" @click="addMember">
            <Plus class="size-4" aria-hidden="true" />
            {{ t('action.add') }}
          </Button>
        </div>

        <div v-if="members.length > 0" class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="member in members"
            :key="member"
            type="button"
            class="event-setup__member-chip"
            :aria-label="`Remove ${member}`"
            @click="removeMember(member)"
          >
            {{ member }}
            <Trash2 class="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </section>

      <p v-if="submitted && validationError" class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-bold text-rose-300">
        {{ validationError }}
      </p>

      <footer :class="embedded ? '-mx-6 -mb-6 mt-2 flex justify-end gap-2 border-t border-border px-6 py-4' : ''">
        <Button v-if="embedded" variant="ghost" @click="emit('cancel')">{{ t('action.cancel') }}</Button>
        <Button class="w-full sm:w-auto" @click="submitEvent">{{ t('action.createEvent') }}</Button>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.event-setup__eyebrow {
  @apply text-xs font-black uppercase tracking-wider text-primarySoft;
}

.event-setup__back-button {
  @apply mt-3 inline-flex w-fit items-center gap-1 rounded-lg text-xs font-bold text-zinc-300 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35;
}

.event-setup__section-icon {
  @apply grid size-9 place-items-center rounded-xl bg-primary/15 text-primarySoft;
}

.event-setup__member-count {
  @apply text-xs font-semibold text-zinc-300;
}

.event-setup__member-chip {
  @apply inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-bold text-foreground transition hover:border-rose-500/40 hover:text-rose-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35;
}
</style>
