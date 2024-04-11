<script lang="ts">
import { type Entry } from '@/types';
import { currencyFormat } from '@/utils';

import { mapStores } from 'pinia';
import { useUserDataStore } from '@/stores/userData';

import BaseDialog from '@/components/BaseDialog.vue';
import ClearEntriesForm from '@/components/ClearEntriesForm.vue';
import EntryForm from '@/components/EntryForm.vue';

export default {
  props: {
    entries: {
      type: Array as () => Entry[]
    },
    selectedDate: {
      type: Date,
      required: true
    }
  },
  data() {
    return {
      selectedEntry: undefined as Entry | undefined,
      entryFormData: {
        title: 'Entry',
        resetForm: true, // Reset the form when the dialog is closed
        action: '',
        placeholderEntry: undefined as
          | {
              id: number | undefined;
              workplace: string | undefined;
              payRate: number | undefined;
              from: string | undefined;
              to: string;
            }
          | undefined
      }
    };
  },
  methods: {
    currencyFormat,

    toTime(dateStr: string) {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-AU', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit'
      });
    },

    hourDiff(entry: Entry) {
      const fromTime = new Date(entry.from).getTime();
      const toTime = new Date(entry.to).getTime();
      const diff = toTime - fromTime;
      return diff / 1000 / 60 / 60;
    },

    entryTotalPay(entry: Entry) {
      const hours = this.hourDiff(entry);
      return entry.payRate * hours;
    },

    handleEditEntry(entry: Entry) {
      this.selectedEntry = entry;
      this.entryFormData = {
        title: 'Edit Entry',
        resetForm: true,
        action: 'edit',
        placeholderEntry: this.selectedEntry
      };
      (this.$refs.entryDialog as any).showModal();
    },

    handleCheckInOut() {
      if (!this.isCheckIn) {
        this.userDataStore.checkInTime = new Date();
        return;
      }

      if (!this.userDataStore.checkInTime) {
        if (confirm('Check in time is not set. Do you want to set it now?')) {
          this.userDataStore.checkInTime = new Date();
        }
        return;
      }

      // If the check in time is today
      if (new Date(this.userDataStore.checkInTime).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0)) {
        this.entryFormData = {
          title: 'Check Out',
          resetForm: false,
          action: 'check in/out',
          placeholderEntry: {
            id: undefined,
            workplace: undefined,
            payRate: undefined,
            from: this.userDataStore.checkInTime.toISOString(),
            to: new Date().toISOString()
          }
        };

        (this.$refs.entryDialog as any).showModal();
      } else {
        // If the check in time is not today
        if (
          !confirm(
            `Your check in time is not today (${this.userDataStore.checkInTime.toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}). Do you want to remove it?`
          )
        ) {
          // Will work on it later
          return;
        }
        this.userDataStore.checkInTime = undefined;
      }
    },

    handleAddEntry() {
      this.entryFormData = {
        title: 'Add Entry',
        resetForm: false,
        action: 'add',
        placeholderEntry: undefined
      };
      (this.$refs.entryDialog as any).showModal();
    }
  },
  computed: {
    ...mapStores(useUserDataStore),
    isCheckIn() {
      return this.userDataStore.checkInTime !== undefined;
    }
  },
  components: { BaseDialog, ClearEntriesForm, EntryForm }
};
</script>

<template>
  <div class="day-schedule">
    <div class="actions">
      <button @click="($refs.clearEntriesDialog as any).showModal()" class="danger-btn" id="clear-btn">Clear</button>

      <Transition>
        <button
          v-if="selectedDate.setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0)"
          @click="handleCheckInOut"
          id="check-in-out-btn"
          :class="{ 'warning-btn': isCheckIn }"
        >
          Check {{ isCheckIn ? 'Out' : 'In' }}
        </button>
      </Transition>

      <button @click="handleAddEntry" class="success-btn" id="add-btn">Add Entry</button>
    </div>

    <div class="entry-list">
      <div
        v-for="entry in entries!.sort((a: Entry, b: Entry) => {
          if (new Date(a.from) < new Date(b.from)) {
            return -1;
          } else {
            return 1;
          }
        })"
        :key="entry.id"
        class="entry"
        @click="handleEditEntry(entry)"
      >
        <div class="time">
          <span>{{ toTime(entry.from) }}</span>
          <span>{{ toTime(entry.to) }}</span>
        </div>
        <div class="divider"></div>
        <div class="info">
          <div class="primary">
            <span>{{ entry.workplace }}</span>
            <span>{{ currencyFormat(entryTotalPay(entry)) }}</span>
          </div>
          <div class="secondary">
            <span>{{ currencyFormat(entry.payRate) }}/hr</span>
            <span>
              <!-- Check if hourDiff is a whole number with 2 decimal places or not -->
              {{ (hourDiff(entry) * 100) % 1 != 0 ? '≈ ' + Math.round(hourDiff(entry) * 100) / 100 : hourDiff(entry) }}
              hours
            </span>
          </div>
        </div>
      </div>
    </div>

    <BaseDialog
      ref="clearEntriesDialog"
      title="Clear Entries"
      open-dialog-text="Clear"
      class="danger-btn"
      :reset-forms="true"
    >
      <ClearEntriesForm :selected-date="selectedDate" />
    </BaseDialog>

    <BaseDialog ref="entryDialog" :title="entryFormData.title" :reset-forms="entryFormData.resetForm">
      <EntryForm :selected-date="selectedDate" :entry="entryFormData.placeholderEntry" :action="entryFormData.action" />
    </BaseDialog>
  </div>
</template>

<style scoped>
.day-schedule {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.entry-list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0 var(--padding);
}

.entry-list .entry {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: start;
  justify-content: start;
  margin: 0.5rem 0;
  line-height: 1.5em;
  cursor: pointer;
}

.divider {
  align-self: stretch;
  width: 4px;
  border-radius: 2px;
  background: green;
  margin: 0 8px;
}

.time,
.info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.time {
  text-align: right;
  width: 4.2rem;
}

.info {
  flex: 1;
}

.info > * {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.info .primary {
  font-weight: bold;
}

.actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--gap-horizontal);
}

.actions > * {
  flex: 1;
  text-wrap: nowrap;
}

.actions #clear-btn {
  flex-grow: 0;
}

.actions #check-in-out-btn {
  overflow: hidden;
  flex-grow: 10;
}

.actions #check-in-out-btn.v-enter-from,
.actions #check-in-out-btn.v-leave-to {
  flex-grow: 0;
  width: 0;
}
</style>
import type { computed } from 'vue';
