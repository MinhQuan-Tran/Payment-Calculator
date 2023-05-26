<script lang="ts">
import type { WeekSchedule } from "./types";
export default {
  props: {
    currentWeekSchedule: {
      type: Object as () => WeekSchedule,
      required: true,
    },
  },
  computed: {
    workTime() {
      return Object.values(this.currentWeekSchedule).reduce((total: number, day: any) => {
        if (day.selected) {
          const workTime = day.schedule.to.getTime() - day.schedule.from.getTime() - day.schedule.break * 60 * 1000;
          return total + workTime / 1000 / 60 / 60;
        }
        return total;
      }, 0);
    },
  },
};
</script>

<template>
  <div class="result-display">
    <p>Work Time: {{ workTime }}</p>
  </div>
</template>

<style scoped>
.result-display {
  flex: 1;
}
</style>
