<script lang="ts">
import type { Entry, WorkInfos } from '@/types';
import { currencyFormat, hourFormat, toTimeStr } from '@/utils';

import { mapStores } from 'pinia';
import { useUserDataStore } from '@/stores/userData';

import BaseDialog from '@/components/BaseDialog.vue';
import ClearEntriesForm from '@/components/ClearEntriesForm.vue';
import EntryForm from '@/components/EntryForm.vue';

export default {
  props: {
    entries: Array as () => Entry[],
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
              id?: number;
              workplace?: string;
              payRate?: number;
              from?: Date;
              to?: Date;
            }
          | undefined
      },
      datetimeWidth: 'auto'
    };
  },
  methods: {
    currencyFormat,
    hourFormat,
    toTimeStr,

    hourDiff(entry: Entry) {
      const fromTime = entry.from.getTime();
      const toTime = entry.to.getTime();
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
      // If not checked in
      if (!this.isCheckIn) {
        // Check in
        this.userDataStore.checkInTime = new Date();
        return;
      }

      // If no check in time found
      if (!this.userDataStore.checkInTime) {
        if (confirm('Check in time is not set. Do you want to set it now?')) {
          this.userDataStore.checkInTime = new Date();
        }
        return;
      }

      if (isNaN(this.userDataStore.checkInTime.getTime())) {
        if (confirm('Invalid check in time. Do you want to remove it?')) {
          this.userDataStore.checkInTime = undefined;
        }
        return;
      }

      // Check out
      this.entryFormData = {
        title: 'Check Out',
        resetForm: false,
        action: 'check in/out',
        placeholderEntry: {
          from: this.userDataStore.checkInTime,
          to: new Date()
        }
      };

      (this.$refs.entryDialog as any).showModal();
    },

    handleAddEntry() {
      this.entryFormData = {
        title: 'Add Entry',
        resetForm: false,
        action: 'add',
        placeholderEntry: {
          // Set the from and to time to the selected date with the current time
          from: new Date(this.selectedDate.setHours(new Date().getHours(), new Date().getMinutes())),
          to: new Date(this.selectedDate.setHours(new Date().getHours(), new Date().getMinutes()))
        }
      };
      (this.$refs.entryDialog as any).showModal();
    },

    updateTimeWidth() {
      this.datetimeWidth = 'auto';

      this.$nextTick(() => {
        this.datetimeWidth =
          Math.max(...Array.from(document.querySelectorAll('.entry .datetime > *')).map((time) => time.clientWidth)) +
          'px';
      });
    }
  },
  computed: {
    ...mapStores(useUserDataStore),
    isCheckIn() {
      return this.userDataStore.checkInTime !== undefined;
    }
  },
  mounted() {
    this.updateTimeWidth();
  },
  updated() {
    this.updateTimeWidth();
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
      <!-- TODO: Seperate to Entry component -->
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
        <div class="datetime">
          <div class="from">
            <div
              class="date"
              v-if="new Date(entry.from).setHours(0, 0, 0, 0) !== new Date(selectedDate).setHours(0, 0, 0, 0)"
            >
              {{
                entry.from.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                })
              }}
            </div>
            <div class="time">{{ toTimeStr(entry.from) }}</div>
          </div>
          <div class="to">
            <div
              class="date"
              v-if="new Date(entry.to).setHours(0, 0, 0, 0) !== new Date(selectedDate).setHours(0, 0, 0, 0)"
            >
              {{
                entry.to.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                })
              }}
            </div>
            <div class="time">{{ toTimeStr(entry.to) }}</div>
          </div>
        </div>
        <div class="divider"></div>
        <div class="info">
          <div class="workplace">{{ entry.workplace }}</div>
          <div class="total">{{ currencyFormat(entryTotalPay(entry)) }}</div>
          <div class="pay-rate">{{ currencyFormat(entry.payRate) }}/hr</div>
          <div class="hour-diff">
            {{ hourFormat(hourDiff(entry)) }}
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
      <EntryForm :entry="entryFormData.placeholderEntry" :action="entryFormData.action" />
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
  margin: var(--padding) 0;
  gap: 0.75em;
}

.entry-list .entry {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: start;
  cursor: pointer;
  text-wrap: balance;
  text-wrap: pretty;
  word-break: break-word;
  overflow-wrap: break-word;
  --divider-width: 4px;
  --divider-border-radius: calc(var(--divider-width) / 2);
}

.divider {
  align-self: stretch;
  width: var(--divider-width);
  border-radius: var(--divider-border-radius);
  background: var(--primary-color);
}

.datetime {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1em;
  align-items: stretch;
  text-align: right;
  width: v-bind('datetimeWidth');
  padding-right: var(--padding);
  white-space: nowrap;
}

.datetime .date {
  font-size: smaller;
  font-weight: bold;
  opacity: 0.5;
}

.info {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'workplace total'
    'pay-rate hour-diff';
  gap: var(--padding);
  justify-items: stretch;
  justify-content: stretch;
  align-items: center;
  align-content: space-between;
  background-color: var(--input-background-color);
  padding: var(--padding);
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  margin: var(--divider-border-radius) 0;
}
.info > * {
  text-wrap: balance;
  text-wrap: pretty;
  word-break: break-word;
  overflow-wrap: break-word;
}

.info > *:nth-child(2n) {
  text-align: right;
}

.info .workplace {
  grid-area: workplace;
  font-weight: bold;
}

.info .total {
  grid-area: total;
  font-weight: bold;
}

.info .pay-rate {
  grid-area: pay-rate;
}

.info .hour-diff {
  grid-area: hour-diff;
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
