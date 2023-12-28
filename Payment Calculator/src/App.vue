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
        workPlace: "PappaRich",
        payRate: 23.23,
        from: "2023-11-01T19:00:00Z", // Converted from Sydney time to UTC
        to: "2023-11-01T23:00:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 2,
        workPlace: "Coffee House",
        payRate: 18.50,
        from: "2023-11-05T21:30:00Z", // Converted from Sydney time to UTC
        to: "2023-11-06T01:30:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 3,
        workPlace: "PappaRich",
        payRate: 23.23,
        from: "2023-11-12T18:45:00Z", // Converted from Sydney time to UTC
        to: "2023-11-12T23:15:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 4,
        workPlace: "Coffee House",
        payRate: 18.50,
        from: "2023-12-01T07:15:00Z", // Converted from Sydney time to UTC
        to: "2023-12-01T12:15:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 5,
        workPlace: "PappaRich",
        payRate: 23.23,
        from: "2023-12-15T20:00:00Z", // Converted from Sydney time to UTC
        to: "2023-12-16T00:30:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 6,
        workPlace: "Coffee House",
        payRate: 18.50,
        from: "2023-12-20T09:30:00Z", // Converted from Sydney time to UTC
        to: "2023-12-20T15:00:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 7,
        workPlace: "PappaRich",
        payRate: 23.23,
        from: "2024-01-05T18:30:00Z", // Converted from Sydney time to UTC
        to: "2024-01-05T23:00:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 8,
        workPlace: "Coffee House",
        payRate: 18.50,
        from: "2024-01-15T08:00:00Z", // Converted from Sydney time to UTC
        to: "2024-01-15T14:00:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 9,
        workPlace: "PappaRich",
        payRate: 23.23,
        from: "2024-02-10T19:45:00Z", // Converted from Sydney time to UTC
        to: "2024-02-11T00:15:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 10,
        workPlace: "Coffee House",
        payRate: 18.50,
        from: "2024-02-20T10:15:00Z", // Converted from Sydney time to UTC
        to: "2024-02-20T15:45:00Z",   // Converted from Sydney time to UTC
      },
      {
        id: 11,
        workPlace: "PappaRich",
        payRate: 23.23,
        from: "2023-12-16T05:00:00Z", // Converted from Sydney time to UTC
        to: "2023-12-16T10:30:00Z",   // Converted from Sydney time to UTC
      },
    ];

    return {
      entries,
      selectedEntries: [] as Entry[],
    }
  },
  methods: {
    setSelectedEntries(entries: Entry[]) {
      this.selectedEntries = entries;
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
  <WeekSchedule :entries="entries" @selected-entries="setSelectedEntries" />
  <hr>
  <DaySchedule :entries="selectedEntries" />
</template>

<style scoped>
hr {
  margin: 0.8rem;
}
</style>
