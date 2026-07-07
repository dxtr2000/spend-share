<script setup lang="ts">
import {
  BarChart3,
  CalendarDays,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-vue-next";

import Button from "@/components/ui/Button.vue";
import { useI18n } from "@/i18n";
import { formatMoney } from "@/lib/money";
import type { EventSummary } from "@spend-share/types";

const props = defineProps<{
  events: EventSummary[];
}>();

const { t } = useI18n();

defineEmits<{
  deleteEvent: [eventId: string];
  editEvent: [eventId: string];
  openEvent: [eventId: string];
  newEvent: [];
  viewStats: [];
}>();

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}
</script>

<template>
  <section class="grid min-w-0 gap-4">
    <header
      class="grid min-w-0 gap-3 sm:flex sm:items-center sm:justify-between"
    >
      <div class="min-w-0">
        <h1 class="text-2xl font-black tracking-tight">
          {{ t("events.title") }}
        </h1>
        <p class="text-sm font-semibold text-muted">
          {{ t("events.description") }}
        </p>
      </div>
      <div class="flex min-w-0 items-center gap-2 sm:shrink-0">
        <Button
          v-if="props.events.length > 0"
          variant="secondary"
          size="sm"
          class="min-w-0 flex-1 sm:flex-none"
          @click="$emit('viewStats')"
        >
          <BarChart3 class="size-4" aria-hidden="true" />
          <span class="truncate">{{ t("action.stats") }}</span>
        </Button>
        <Button
          variant="primary"
          size="sm"
          class="min-w-0 flex-1 sm:flex-none"
          @click="$emit('newEvent')"
        >
          <Plus class="size-4" aria-hidden="true" />
          <span class="truncate">{{ t("action.newEvent") }}</span>
        </Button>
      </div>
    </header>

    <div
      v-if="props.events.length === 0"
      class="grid place-items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-16 text-center"
    >
      <span class="events-list__empty-icon">
        <CalendarDays class="size-6" aria-hidden="true" />
      </span>
      <p class="text-base font-bold">{{ t("event.empty.title") }}</p>
      <p class="max-w-xs text-sm text-muted">
        {{ t("event.empty.description") }}
      </p>
      <Button
        variant="secondary"
        size="sm"
        class="mt-1"
        @click="$emit('newEvent')"
      >
        <Plus class="size-4" aria-hidden="true" />
        {{ t("action.createEvent") }}
      </Button>
    </div>

    <div v-else class="grid min-w-0 gap-4">
      <TransitionGroup
        name="list"
        tag="div"
        class="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <button
          v-for="event in props.events"
          :key="event.id"
          type="button"
          class="events-list__card group"
          @click="$emit('openEvent', event.id)"
        >
          <div class="flex min-w-0 items-start justify-between gap-3">
            <span class="events-list__card-icon">
              <CalendarDays class="size-5" aria-hidden="true" />
            </span>
            <div class="flex shrink-0 items-center gap-1">
              <span
                class="inline-flex rounded-lg border border-border bg-cardSoft p-0.5 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100"
              >
                <button
                  type="button"
                  class="events-list__icon-button"
                  :aria-label="t('action.edit')"
                  @click.stop="$emit('editEvent', event.id)"
                >
                  <Pencil class="size-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  class="events-list__icon-button events-list__icon-button--danger"
                  :aria-label="t('action.delete')"
                  @click.stop="$emit('deleteEvent', event.id)"
                >
                  <Trash2 class="size-3.5" aria-hidden="true" />
                </button>
              </span>
            </div>
          </div>
          <div class="min-w-0">
            <h3
              class="truncate text-lg font-black tracking-tight group-hover:text-primarySoft"
            >
              {{ event.name }}
            </h3>
            <p class="mt-0.5 text-xs font-semibold text-muted">
              {{ formatDate(event.createdAt) }}
            </p>
          </div>
          <div
            class="flex min-w-0 items-center gap-4 border-t border-border pt-3 text-xs font-semibold text-muted"
          >
            <span class="inline-flex items-center gap-1.5">
              <Users class="size-3.5" aria-hidden="true" />
              {{ t("common.peopleCount", { count: event.memberCount }) }}
            </span>
            <span
              class="ml-auto min-w-0 truncate font-mono font-bold text-foreground"
              style="font-variant-numeric: tabular-nums"
            >
              {{ formatMoney(event.expenseTotalMinor, event.defaultCurrency) }}
            </span>
          </div>
        </button>
      </TransitionGroup>
    </div>
  </section>
</template>

<style scoped>
.events-list__empty-icon {
  @apply grid size-12 place-items-center rounded-full bg-primary/15 text-primarySoft;
}

.events-list__card {
  @apply grid min-w-0 gap-3 rounded-2xl border border-border bg-card p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-primarySoft/60 hover:bg-cardSoft active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35;
}

.events-list__card-icon {
  @apply grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primarySoft;
}

.events-list__icon-button {
  @apply grid size-7 place-items-center rounded-md text-zinc-300 transition hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35;
}

.events-list__icon-button--danger {
  @apply hover:bg-rose-500/15 hover:text-rose-300;
}
</style>
