<script lang="ts">
import packageJson from "@/../package.json";
import changelog from "@/../changelog.json";
import WeekSchedule from "@/components/WeekSchedule.vue";
import DaySchedule from "@/components/DaySchedule.vue";
import BaseDialog from "./components/BaseDialog.vue";
import { type Entry } from "@/types";
import { version } from "vue";

export default {
  data() {
    return {
      entries: [] as Entry[],
      selectedDate: new Date(),
      openChangelogDialog: Function,
    };
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
    versionChanges(): {
      version: string;
      date: string;
      changes: string[];
    }[] {
      return changelog.filter((log: { version: string; }) => {
        // Compare version numbers within currentVersion and change.version
        const latestVersion = version.split(".").map(Number);
        const currentVersion = localStorage.getItem("appVersion")?.split(".").map(Number) || [0, 0, 0];
        const logVersion = log.version.split(".").map(Number);


        for (let i = 0; i < logVersion.length; i++) {
          if (latestVersion[i] >= logVersion[i] && logVersion[i] > currentVersion[i]) {
            return true;
          }
        }
      }).reverse();
    },
  },
  methods: {
    addEntry(entry: Entry) {
      entry.id = this.entries.length + 1;
      this.entries.push(entry);
    },
    editEntry(entry: Entry) {
      // Replace the entry with the same id
      const index = this.entries.findIndex(e => e.id === entry.id);
      this.entries.splice(index, 1, entry);
    },
    clearData(option: string) {
      const startTime = new Date(this.selectedDate);
      const endTime = new Date(this.selectedDate);

      startTime.setHours(0, 0, 0, 0);
      endTime.setHours(23, 59, 59, 999);

      switch (option) {
        case "day":
          break;
        case "week":
          startTime.setDate(startTime.getDate() - startTime.getDay() + 1); // Monday
          endTime.setDate(endTime.getDate() - endTime.getDay() + 7); // Sunday
          break;
        case "all":
          this.entries = [];
          break;
        default:
          alert("Something went wrong. Please try again.");
          throw new Error("Invalid option");
      }

      if (option !== "all") {
        this.entries = this.entries.filter(entry => {
          const fromDate = new Date(entry.from);
          const toDate = new Date(entry.to);

          // Filter out entries that have from and to time are between the start and end time
          return !((startTime <= fromDate && fromDate <= endTime) && (startTime <= toDate && toDate <= endTime));
        });
      }
    },
    handleEntryChange(payload: { action: string, entry: Entry; }) {
      switch (payload.action) {
        case "add":
          this.addEntry(payload.entry);
          break;
        case "edit":
          this.editEntry(payload.entry);
          break;
        case "delete":
          this.entries = this.entries.filter(entry => entry.id !== payload.entry.id);
          break;
      }
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
    BaseDialog
  },
  mounted() {
    const entries = localStorage.getItem("entries");
    if (entries) {
      this.entries = JSON.parse(entries);
    }

    const currentVersion = localStorage.getItem("appVersion");
    if (currentVersion !== changelog[changelog.length - 1].version) {
      localStorage.setItem("appVersion", packageJson.version);
      (this.$refs.dialog as any).showModal();
    }
  },
};
</script>

<template>
  <WeekSchedule :entries="entries" v-model:selected-date="selectedDate" />
  <hr>
  <DaySchedule :entries="selectedEntries" :selected-date="selectedDate" @entry-change="handleEntryChange"
    @clear-data="clearData" />

  <BaseDialog ref="dialog" title="What's new">
    <div class="what-new">
      <div v-for="log in versionChanges" :key="log.version">
        <div class="info">
          <h2 class="version">{{ log.version }}</h2>
          <span class="date">{{ new Date(log.date).toLocaleDateString() }}</span>
        </div>
        <hr>
        <ul class="changes">
          <li v-for="(change, index) in log.changes" :key="index">{{ change }}</li>
        </ul>
      </div>
    </div>
  </BaseDialog>
</template>

<style scoped>
hr {
  margin: 0.8rem;
}

.what-new {
  overflow-y: auto;
}

.what-new .info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.what-new .version {
  margin: 0;
}
</style>
