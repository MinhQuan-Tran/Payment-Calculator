<script lang="ts">
import TimePicker from "./TimePicker.vue";
import BreakTimePicker from "./BreakTimePicker.vue";
import type { WeekSchedule } from "./types";

export default {
  components: {
    TimePicker,
    BreakTimePicker,
  },
  props: {
    currentWeekSchedule: {
      type: Object as () => WeekSchedule,
      required: true,
    },
  },
  emits: ['update:currentWeekSchedule'],
  methods: {
    toggleSelected(day: string) {
      const updatedSchedule = { ...this.currentWeekSchedule };
      updatedSchedule[day].selected = !updatedSchedule[day].selected;
      this.$emit('update:currentWeekSchedule', updatedSchedule);
    },
  },
}
</script>

<template>
  <div class="time-schedule">
    <table>
      <tr>
        <th>Day</th>
        <th v-for="(workDay, day) in currentWeekSchedule" :key="day">
          <span :class="{ selected: !workDay.selected }">{{ day.toString().slice(0, 3) }}</span>
          <input type="checkbox" v-model="workDay.selected" @change="toggleSelected(day.toString())" />
          {{ workDay.selected }}
        </th>
      </tr>
      <!-- <tr>
        <th>Start</th>
        <td v-for="(workDay, day) in currentWeekSchedule" :key="day">
          <TimePicker endLimit="17:00" v-model:selectedTime="workDay.start" />
        </td>
      </tr>
      <tr>
        <th>End</th>
        <td v-for="(workDay, day) in currentWeekSchedule" :key="day">
          <TimePicker startLimit="14:00" v-model:selectedTime="workDay.end" />
        </td>
      </tr>
      <tr>
        <th>Break</th>
        <td v-for="(workDay, day) in currentWeekSchedule" :key="day">
          <BreakTimePicker v-model:selectedTime="workDay.break" />
        </td>
      </tr> -->
      <!-- <tr>
        <th>Rate</th>
        <td v-for="(workDay, day) in workSchedule" :key="day">
          <DurationPicker @breakTime="handleUpdateBreak(day, $event)" />
        </td>
      </tr> -->
    </table>
  </div>
</template>

<style scoped>
.time-schedule {
  flex: 1;
  width: 100%;
}

.selected {
  text-decoration: line-through;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

table,
tr,
th,
td {
  line-height: 2.5em;
}

tr:nth-child(even) {
  background-color: rgba(0, 0, 0, 0.06);
}

td:nth-child(even),
th:nth-child(even) {
  background-color: rgba(0, 0, 0, 0.06);
}
</style>
