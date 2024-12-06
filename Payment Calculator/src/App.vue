<script lang="ts">
import packageJson from '@/../package.json';
import changelog from '@/../changelog.json';
import type { Entry } from '@/types';

import { mapStores } from 'pinia';
import { useUserDataStore } from '@/stores/userData';

import WeekSchedule from '@/components/WeekSchedule.vue';
import DaySchedule from '@/components/DaySchedule.vue';
import BaseDialog from '@/components/BaseDialog.vue';

export default {
  data() {
    return {
      selectedDate: new Date(new Date().setHours(0, 0, 0, 0)),
      openChangelogDialog: Function
    };
  },
  methods: {
    versionChanges(): {
      version: string;
      date: string;
      changes: string[];
    }[] {
      const currentVersion = localStorage.getItem('appVersion')?.split('.').map(Number) || [0, 0, 0];

      return changelog
        .filter((log: { version: string; date: string; changes: string[] }) => {
          const logVersion = log.version.split('.').map(Number);

          // Compare version numbers
          for (let i = 0; i < logVersion.length; i++) {
            if (logVersion[i] > currentVersion[i]) {
              return true;
            } else if (logVersion[i] < currentVersion[i]) {
              return false;
            }
          }

          return false;
        })
        .reverse();
    },
    handleCloseChangelogDiaglog() {
      console.log('here');
      localStorage.setItem('appVersion', packageJson.version);
    }
  },
  computed: {
    ...mapStores(useUserDataStore)
  },
  components: {
    WeekSchedule,
    DaySchedule,
    BaseDialog
  },
  mounted() {
    window.addEventListener('storage', this.userDataStore.handleStorageChange);

    // Run on update
    this.userDataStore.$subscribe((mutation, state) => {
      for (const [key, value] of Object.entries(state)) {
        this.userDataStore.saveToLocalStorage(key, this.userDataStore.fixState(key, value));
      }
    });

    // Run once when mounted
    Object.entries(this.userDataStore.$state).forEach(([key, value]) => {
      this.userDataStore.saveToLocalStorage(key, this.userDataStore.fixState(key, value));
    });

    const currentVersion = localStorage.getItem('appVersion');
    if (currentVersion !== packageJson.version) {
      (this.$refs['changelog-dialog'] as any).showModal();
    }
  }
};
</script>

<template>
  <WeekSchedule :entries="userDataStore.entries" v-model:selected-date="selectedDate" />
  <hr />
  <DaySchedule :selected-date="selectedDate" />

  <BaseDialog ref="changelog-dialog" title="What's new" @close-dialog="handleCloseChangelogDiaglog">
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
  margin: var(--padding);
}

.what-new {
  overflow-y: auto;
}

.what-new .info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 0 var(--padding);
}

.what-new .version {
  margin: 0;
}
</style>
