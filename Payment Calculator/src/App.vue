<script lang="ts">
import WeekSchedule from "@/components/WeekSchedule.vue";
import DaySchedule from "@/components/DaySchedule.vue";

export default {
  components: {
    WeekSchedule,
    DaySchedule,
  },
};
</script>

<template>
  <WeekSchedule />
  <DaySchedule />
</template>

<style scoped></style>
