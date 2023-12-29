<script lang="ts">
import WeekSchedule from "@/components/WeekSchedule.vue";
import DaySchedule from "@/components/DaySchedule.vue";
import { type Entry } from "@/types";

export default {
  data() {
    return {
      entries: [] as Entry[],
      selectedDate: new Date(),
    }
  },
  computed: {
    selectedEntries(): Entry[] {
      if (!this.selectedDate) {
        return [];
      }

      return this.entries.filter(entry => {
        const fromDate = new Date(entry.from);
        const toDate = new Date(entry.to);

        // Set the time to 00:00:00:000
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(0, 0, 0, 0);

        return fromDate <= this.selectedDate && this.selectedDate <= toDate;
      });
    },
  },
  methods: {
    addEntry(entry: Entry) {
      this.entries.push(entry);
    },
  },
  watch: {
    selectedEntry(entry: Entry | null) {
      console.log(entry);
    },
    entries: {
      handler(entries: Entry[]) {
        localStorage.setItem("entries", JSON.stringify(entries));
      },
      deep: true,
    }
  },
  components: {
    WeekSchedule,
    DaySchedule,
  },
  mounted() {
    const entries = localStorage.getItem("entries");
    if (entries) {
      this.entries = JSON.parse(entries);
    }
  },
};
</script>

<template>
  <WeekSchedule :entries="entries" v-model:selected-date="selectedDate" />
  <hr>
  <DaySchedule :entries="selectedEntries" :selected-date="selectedDate" @add-entry="addEntry" />
</template>

<style scoped>
hr {
  margin: 0.8rem;
}
</style>
