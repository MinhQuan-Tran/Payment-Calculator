<script lang="ts">
import packageJson from '@/../package.json';
import changelog from '@/../changelog.json';
import type { Entry } from '@/types';
import { version } from 'vue';

import { mapStores } from 'pinia';
import { useUserDataStore } from '@/stores/userData';

import WeekSchedule from '@/components/WeekSchedule.vue';
import DaySchedule from '@/components/DaySchedule.vue';
import BaseDialog from '@/components/BaseDialog.vue';

export default {
  data() {
    return {
      selectedDate: new Date(),
      openChangelogDialog: Function
    };
  },
  methods: {
    versionChanges(): {
      version: string;
      date: string;
      changes: string[];
    }[] {
      return changelog
        .filter((log: { version: string; date: string; changes: string[] }) => {
          // Compare version numbers within currentVersion and change.version
          const latestVersion = version.split('.').map(Number);
          const currentVersion = localStorage.getItem('appVersion')?.split('.').map(Number) || [0, 0, 0];
          const logVersion = log.version.split('.').map(Number);

          for (let i = 0; i < logVersion.length; i++) {
            if (latestVersion[i] >= logVersion[i] && logVersion[i] > currentVersion[i]) {
              return true;
            }
          }
        })
        .reverse();
    }
  },
  computed: {
    ...mapStores(useUserDataStore),

    selectedEntries(): Entry[] {
      if (!this.selectedDate) {
        return [];
      }

      return this.userDataStore.entries.filter((entry) => {
        const fromDate = new Date(entry.from).setHours(0, 0, 0, 0);
        const toDate = new Date(entry.to).setHours(0, 0, 0, 0);

        return (
          fromDate == new Date(this.selectedDate).setHours(0, 0, 0, 0) &&
          toDate == new Date(this.selectedDate).setHours(0, 0, 0, 0)
        );
      });
    }
  },
  components: {
    WeekSchedule,
    DaySchedule,
    BaseDialog
  },
  mounted() {
    window.addEventListener('storage', this.userDataStore.handleStorageChange);

    this.userDataStore.$subscribe((mutation, state) => {
      for (const [key, value] of Object.entries(state)) {
        this.userDataStore.saveToLocalStorage(key, value);
      }
    });

    const currentVersion = localStorage.getItem('appVersion');
    if (currentVersion !== changelog[changelog.length - 1].version) {
      localStorage.setItem('appVersion', packageJson.version);
      (this.$refs.dialog as any).showModal();
    }
  }
};
</script>

<template>
  <WeekSchedule :entries="userDataStore.entries" v-model:selected-date="selectedDate" />
  <hr />
  <DaySchedule :entries="selectedEntries" :selected-date="selectedDate" />

  <BaseDialog ref="dialog" title="What's new">
    <div class="what-new">
      <div v-for="log in versionChanges()" :key="log.version">
        <div class="info">
          <h2 class="version">{{ log.version }}</h2>
          <span class="date">{{ new Date(log.date).toLocaleDateString() }}</span>
        </div>
        <hr />
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
