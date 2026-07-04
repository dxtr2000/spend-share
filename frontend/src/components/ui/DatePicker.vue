<script setup lang="ts">
import { computed, shallowRef, watch } from "vue";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-vue-next";
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from "reka-ui";

import Button from "./Button.vue";
import { cn } from "@/lib/utils";

interface CalendarDay {
  date: Date;
  day: number;
  inMonth: boolean;
  iso: string;
}

const model = defineModel<string>({ default: "" });

const props = withDefaults(
  defineProps<{
    ariaLabel?: string;
    class?: string;
    id: string;
    locale?: string;
  }>(),
  {
    ariaLabel: "Choose date",
    class: "",
    locale: undefined,
  },
);

const open = shallowRef(false);
const visibleMonth = shallowRef(
  startOfMonth(parseIsoDate(model.value) ?? new Date()),
);
const todayIso = toIsoDate(new Date());
const weekdayLabels = Array.from({ length: 7 }, (_, index) =>
  new Intl.DateTimeFormat(props.locale, { weekday: "short" }).format(
    new Date(2026, 0, 5 + index),
  ),
);

const monthLabel = computed(() =>
  new Intl.DateTimeFormat(props.locale, {
    month: "long",
    year: "numeric",
  }).format(visibleMonth.value),
);
const selectedDateLabel = computed(() => {
  const selectedDate = parseIsoDate(model.value);
  if (!selectedDate) return "Select date";
  return new Intl.DateTimeFormat(props.locale, {
    day: "numeric",
    month: "short",
    weekday: "short",
    year: "numeric",
  }).format(selectedDate);
});
const selectedIsoLabel = computed(() => model.value || "YYYY-MM-DD");
const calendarDays = computed<CalendarDay[]>(() => {
  const month = visibleMonth.value;
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    return {
      date,
      day: date.getDate(),
      inMonth: date.getMonth() === month.getMonth(),
      iso: toIsoDate(date),
    };
  });
});

watch(model, (value) => {
  const selectedDate = parseIsoDate(value);
  if (selectedDate) visibleMonth.value = startOfMonth(selectedDate);
});

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  )
    return null;
  return date;
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(amount: number) {
  visibleMonth.value = new Date(
    visibleMonth.value.getFullYear(),
    visibleMonth.value.getMonth() + amount,
    1,
  );
}

function selectDate(iso: string) {
  model.value = iso;
  open.value = false;
}

function selectToday() {
  model.value = todayIso;
  visibleMonth.value = startOfMonth(new Date());
  open.value = false;
}

function clearDate() {
  model.value = "";
  open.value = false;
}

function dayClasses(day: CalendarDay) {
  return cn(
    "grid size-8 place-items-center rounded-lg text-sm font-extrabold outline-none transition focus-visible:ring-4 focus-visible:ring-primary/30",
    day.inMonth
      ? "text-foreground hover:bg-cardSoft"
      : "text-muted/45 hover:bg-cardSoft/60",
    day.iso === todayIso && "ring-1 ring-border",
    day.iso === model.value &&
      "bg-primary text-white shadow-glow hover:bg-primary",
  );
}

function formatDayLabel(day: CalendarDay) {
  return new Intl.DateTimeFormat(props.locale, { dateStyle: "full" }).format(
    day.date,
  );
}
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <button
        :id="id"
        type="button"
        :aria-label="ariaLabel"
        :class="
          cn(
            'flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-cardSoft px-4 text-left outline-none transition hover:border-muted/60 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20',
            props.class,
          )
        "
      >
        <span class="min-w-0">
          <span
            class="block truncate text-base font-semibold text-foreground"
            >{{ selectedIsoLabel }}</span
          >
        </span>
        <CalendarDays class="size-5 shrink-0 text-muted" aria-hidden="true" />
      </button>
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        align="start"
        position="popper"
        :side-offset="8"
        class="z-[70] w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-black/50 outline-none"
      >
        <header class="mb-2 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="icon"
            class="size-8 min-h-8 rounded-lg"
            aria-label="Previous month"
            @click="shiftMonth(-1)"
          >
            <ChevronLeft class="size-4" aria-hidden="true" />
          </Button>
          <p class="text-sm font-black capitalize text-foreground">
            {{ monthLabel }}
          </p>
          <Button
            variant="ghost"
            size="icon"
            class="size-8 min-h-8 rounded-lg"
            aria-label="Next month"
            @click="shiftMonth(1)"
          >
            <ChevronRight class="size-4" aria-hidden="true" />
          </Button>
        </header>

        <div class="grid grid-cols-7 gap-1">
          <span
            v-for="weekday in weekdayLabels"
            :key="weekday"
            class="grid h-7 place-items-center text-[10px] font-black uppercase text-muted"
          >
            {{ weekday }}
          </span>
          <button
            v-for="day in calendarDays"
            :key="day.iso"
            type="button"
            :aria-label="formatDayLabel(day)"
            :aria-current="day.iso === todayIso ? 'date' : undefined"
            :aria-pressed="day.iso === model"
            :class="dayClasses(day)"
            @click="selectDate(day.iso)"
          >
            {{ day.day }}
          </button>
        </div>

        <footer
          class="mt-2 flex items-center justify-between border-t border-border pt-2"
        >
          <button
            type="button"
            class="px-2 text-xs font-black text-muted transition hover:text-foreground"
            @click="clearDate"
          >
            Clear
          </button>
          <button
            type="button"
            class="px-2 text-xs font-black text-primarySoft transition hover:text-foreground"
            @click="selectToday"
          >
            Today
          </button>
        </footer>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
