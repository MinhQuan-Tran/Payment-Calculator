<script lang="ts">
import type { Entry, WorkInfos } from '@/types';
import { currencyFormat, toTimeStr } from '@/utils';

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
      timeWidth: 'auto'
    };
  },
  methods: {
    currencyFormat,
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
            from: this.userDataStore.checkInTime,
            to: new Date()
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
    },

    updateTimeWidth() {
      this.timeWidth = 'auto';

      this.$nextTick(() => {
        const timeWidth = Math.max(
          ...Array.from(document.querySelectorAll('.entry .time > *')).map((time) => time.clientWidth)
        );
        this.timeWidth = timeWidth + 'px';
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
          <div>{{ toTimeStr(entry.from) }}</div>
          <div>{{ toTimeStr(entry.to) }}</div>
        </div>
        <div class="divider"></div>
        <div class="info">
          <div class="workplace">{{ entry.workplace }}</div>
          <div class="total">{{ currencyFormat(entryTotalPay(entry)) }}</div>
          <div class="pay-rate">{{ currencyFormat(entry.payRate) }}/hr</div>
          <div class="hour-diff">
            <!-- Check if hourDiff is a whole number with 2 decimal places or not -->
            {{ (hourDiff(entry) * 100) % 1 != 0 ? '≈ ' + Math.round(hourDiff(entry) * 100) / 100 : hourDiff(entry) }}
            hours
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
  margin: var(--padding) 0;
  gap: var(--padding);
}

.entry-list .entry {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: start;
  line-height: 1.5em;
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

.time {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  text-align: right;
  width: v-bind('timeWidth');
  padding-right: var(--padding);
}

.info {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'workplace total'
    'pay-rate hour-diff';
  gap: var(--padding);
  justify-content: stretch;
  align-items: stretch;
  background-color: var(--input-background-color);
  padding: var(--padding-small) var(--padding);
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
