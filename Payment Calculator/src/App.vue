<script lang="ts">
import WeekSchedule from "@/components/WeekSchedule.vue";
import DaySchedule from "@/components/DaySchedule.vue";
import { type Entry } from "@/types";

export default {
  data() {
    // Sample entries data
    const entries = [
      {
        id: 1,
        workplace: "PappaRich",
        payRate: 23.23,
        from: "2023-11-01T19:00:00Z", // Converted from Sydney time to UTC
        to: "2023-11-01T23:00:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 2,
        workplace: "Coffee House",
        payRate: 18.50,
        from: "2023-11-05T21:30:00Z", // Converted from Sydney time to UTC
        to: "2023-11-06T01:30:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 3,
        workplace: "PappaRich",
        payRate: 23.23,
        from: "2023-11-12T18:45:00Z", // Converted from Sydney time to UTC
        to: "2023-11-12T23:15:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 4,
        workplace: "Coffee House",
        payRate: 18.50,
        from: "2023-12-01T07:15:00Z", // Converted from Sydney time to UTC
        to: "2023-12-01T12:15:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 5,
        workplace: "PappaRich",
        payRate: 23.23,
        from: "2023-12-15T20:00:00Z", // Converted from Sydney time to UTC
        to: "2023-12-16T00:30:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 6,
        workplace: "Coffee House",
        payRate: 18.50,
        from: "2023-12-20T09:30:00Z", // Converted from Sydney time to UTC
        to: "2023-12-20T15:00:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 7,
        workplace: "PappaRich",
        payRate: 23.23,
        from: "2024-01-05T18:30:00Z", // Converted from Sydney time to UTC
        to: "2024-01-05T23:00:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 8,
        workplace: "Coffee House",
        payRate: 18.50,
        from: "2024-01-15T08:00:00Z", // Converted from Sydney time to UTC
        to: "2024-01-15T14:00:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 9,
        workplace: "PappaRich",
        payRate: 23.23,
        from: "2024-02-10T19:45:00Z", // Converted from Sydney time to UTC
        to: "2024-02-11T00:15:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 10,
        workplace: "Coffee House",
        payRate: 18.50,
        from: "2024-02-20T10:15:00Z", // Converted from Sydney time to UTC
        to: "2024-02-20T15:45:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 11,
        workplace: "PappaRich",
        payRate: 23.23,
        from: "2023-12-16T05:00:00Z", // Converted from Sydney time to UTC
        to: "2023-12-16T10:30:00Z",   // Converted from Sydney time to UTC
      },
    ];

    return {
      entries,
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
  },
  components: {
    WeekSchedule,
    DaySchedule,
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
