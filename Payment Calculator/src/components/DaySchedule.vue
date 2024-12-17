<script lang="ts">
import type { Entry } from '@/types';
import {
  currencyFormat,
  hourMinuteFormat,
  toTimeStr,
  getEntries,
  entryDuration,
  entryBillableTime,
  entryTotalPay,
  sumDuration
} from '@/utils';

import { mapStores } from 'pinia';
import { useUserDataStore } from '@/stores/userData';

import BaseDialog from '@/components/BaseDialog.vue';
import ClearEntriesForm from '@/components/ClearEntriesForm.vue';
import EntryForm from '@/components/EntryForm.vue';

export default {
  props: {
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
    hourMinuteFormat,
    toTimeStr,
    entryDuration,
    entryBillableTime,
    entryTotalPay,
    sumDuration,

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
    },

    entries() {
      // from 12am on the given day
      const from = new Date(this.selectedDate);
      from.setHours(0, 0, 0, 0);

      // to 12am on the next day
      const to = new Date(this.selectedDate);
      to.setDate(to.getDate() + 1);
      to.setHours(0, 0, 0, 0);

      console.log('Updating entries');

      this.$forceUpdate();

      return getEntries(this.userDataStore.entries, from, to);
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
      <button @click="($refs.clearEntriesDialog as any).showModal()" class="danger" id="clear-btn">Clear</button>

      <Transition>
        <button
          v-if="selectedDate.setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0)"
          @click="handleCheckInOut"
          id="check-in-out-btn"
          :class="{ primary: !isCheckIn, warning: isCheckIn }"
        >
          Check {{ isCheckIn ? 'Out' : 'In' }}
        </button>
      </Transition>

      <button @click="handleAddEntry" class="success" id="add-btn">Add Entry</button>
    </div>

    <div class="entry-list">
      <!-- TODO: Seperate to Entry component -->
      <div
        v-for="entry in entries!.sort((a: Entry, b: Entry) => {
          // Sort by from time, then by to time
          return a.from.getTime() - b.from.getTime() || a.to.getTime() - b.to.getTime();
        })"
        :key="entry.id"
        class="entry"
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
        <!-- Allow user to open multiple entries to compare -->
        <details class="info">
          <summary>
            <div class="workplace">{{ entry.workplace }}</div>
            <div class="billable-time">
              {{ hourMinuteFormat(entryBillableTime(entry), 'short') }}
              <img
                width="48"
                height="48"
                src="https://img.icons8.com/fluency/48/time-card.png"
                alt="time-card"
                class="inline-icon"
              />
            </div>
            <div class="earning">{{ currencyFormat(entryTotalPay(entry)) }}</div>
            <div class="unpaid-breaks">
              {{ hourMinuteFormat(sumDuration(entry.unpaidBreaks), 'short') }}
              <img
                width="48"
                height="48"
                src="https://img.icons8.com/fluency/48/tea.png"
                alt="tea"
                class="inline-icon"
              />
            </div>
          </summary>
          <div class="details">
            <!-- TODO: Add Hourly Rate, Shift Duration (Before Breaks), Notes or Description -->
            <div class="secondary-info">
              <div class="hourly-rate">{{ currencyFormat(entry.payRate) }}/hr</div>
            </div>
            <!-- TODO: Add actions Edit, Delete -->
          </div>
        </details>
      </div>
    </div>

    <BaseDialog
      ref="clearEntriesDialog"
      title="Clear Entries"
      open-dialog-text="Clear"
      class="danger"
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

.actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--gap-horizontal);
  margin-bottom: var(--padding);
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

.entry-list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: var(--padding) 0;
  gap: calc(var(--padding) * 2);
}

.entry-list .entry {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: start;
  text-wrap: balance;
  text-wrap: pretty;
  word-break: break-word;
  overflow-wrap: break-word;
  --divider-width: 4px;
  /* --divider-border-radius: calc(var(--divider-width) / 2); */
  border-radius: var(--border-radius);
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.5);
  transition: all 0.3s;
}

.entry-list .entry:hover,
.entry-list .entry:has(.info[open]) {
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.8);
}

.entry-list:has(.info[open]) .entry:not(:has(.info[open])) {
  opacity: 0.5;
}

.divider {
  align-self: stretch;
  width: var(--divider-width);
  /* border-radius: var(--divider-border-radius); */
  background: var(--primary-color);
}

.datetime {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  text-align: right;
  gap: 1em;
  width: v-bind('datetimeWidth');
  padding: var(--padding-small) var(--padding);
  border-radius: var(--border-radius) 0 0 var(--border-radius);
  white-space: nowrap;
  background-color: var(--input-background-color);
}

.datetime .date {
  font-size: smaller;
  font-weight: bold;
  opacity: 0.5;
}

.info {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex: 1;
  background: light-dark(#d8d8d8, #343434);
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  padding: 0;
  transition: all 0.3s;
}

.info summary::marker,
.info summary::-webkit-details-marker {
  display: none !important;
}

.info summary {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'workplace billable-time'
    'earning   unpaid-breaks';
  gap: var(--padding);
  justify-items: stretch;
  justify-content: stretch;
  align-items: center;
  align-content: space-between;
  background-color: var(--input-background-color);
  padding: var(--padding);
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  position: relative;
  cursor: pointer;
}

.info summary > * {
  text-wrap: balance;
  text-wrap: pretty;
  word-break: break-word;
  overflow-wrap: break-word;
}

.info summary > *:nth-child(2n) {
  text-align: right;
}

.info summary .workplace {
  grid-area: workplace;
  font-weight: bold;
}

.info summary .earning {
  grid-area: earning;
}

.info summary .billable-time {
  grid-area: billable-time;
}

.info summary .unpaid-breaks {
  grid-area: unpaid-breaks;
}

.info[open] summary {
  transition: all 0.3s;
  flex-grow: 1;
}

.details {
  display: grid;
  padding: var(--padding);
  border-radius: 0 0 var(--border-radius) 0;
  transform: scaleY(0);
  transform-origin: top;
  transition: transform 0.26s ease;
}

.info[open] .details {
  transform: scaleY(1);
}
</style>
