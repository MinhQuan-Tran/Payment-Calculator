<script lang="ts">
import TimeSchedule from "./components/TimeSchedule.vue";
import ResultDisplay from "./components/ResultDisplay.vue";
import * as Types from "./components/types";

export default {
  components: {
    TimeSchedule,
    ResultDisplay,
  },
  data() {
    const today = new Date();
    return {
      workSchedule: [] as Types.DaySchedule[],
      currentWeek: new Date(today.setDate(today.getDate() - today.getDay())), // Monday of current week
    }
  },
  computed: {
    currentWeekSchedule() {
      const dayInWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const weekSchedule = {} as Types.WeekSchedule;
      dayInWeek.forEach((day, index) => {
        index++;
        const dayRecord = this.workSchedule.find((record) => {
          const day = new Date(record.from).getDay();
          return day === index;
        })
        const fromDate = new Date(this.currentWeek);
        fromDate.setDate(this.currentWeek.getDate() + index);
        fromDate.setHours(0, 0, 0);
        const toDate = new Date(this.currentWeek);
        toDate.setDate(this.currentWeek.getDate() + index + 1);
        toDate.setHours(0, 0, 0);
        weekSchedule[day] = {
          selected: dayRecord ? true : false,
          schedule: dayRecord || {
            from: fromDate,
            to: toDate,
            break: 0,
          } as Types.DaySchedule,
        };
      })
      return weekSchedule;
    },
  },
  methods: {
    goToNextWorkSchedule() {
      this.currentWeek.setDate(this.currentWeek.getDate() + 7);
    },
    goToPreviousWorkSchedule() {
      this.currentWeek.setDate(this.currentWeek.getDate() - 7);
    },
  },
}
</script>

<template>
  <TimeSchedule v-model:currentWeekSchedule="currentWeekSchedule" />
  <hr />
  <ResultDisplay :currentWeekSchedule="currentWeekSchedule" />
  {{ currentWeekSchedule }}
</template>

<style scoped>
hr {
  width: 90%;
}
</style>
