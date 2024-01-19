<script lang="ts">
import { type Entry } from '@/types';
import { currencyFormat } from '@/utils';
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
  emits: {
    entryChange(payload: { action: string, entry: Entry; }) {
      const actions = ['add', 'edit', 'delete'];
      return actions.includes(payload.action);
    },
    clearData(payload: string) {
      const options = ['day', 'week', 'all'];
      return options.includes(payload);
    },
  },
  data() {
    return {
      // clearDataForm: undefined as HTMLFormElement | undefined,
      selectedEntry: undefined as Entry | undefined,
    };
  },
  methods: {
    toTime(dateStr: string) {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-AU', { hour12: true, hour: 'numeric', minute: '2-digit' });
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
    clearEntries(option: string) {
      this.$emit('clearData', option);
    },
    entryChange(payload: { action: string, entry: Entry; }) {
      this.$emit('entryChange', payload);
    },
    selectEntry(event: Event, entry: Entry) {
      this.selectedEntry = entry;
      (this.$refs.editEntryDialog as any).showModal();
    },
    currencyFormat,
  },
  components: { BaseDialog, ClearEntriesForm, EntryForm },
};
</script>

<template>
  <div class="day-schedule">
    <div class="entry-list">
      <div v-for="entry in entries!.sort((a: Entry, b: Entry) => {
        if (new Date(a.from) < new Date(b.from)) {
          return -1;
        } else {
          return 1;
        }
      })" :key="entry.id" class="entry" @click="selectEntry($event, entry)">
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
            <span>{{ hourDiff(entry) }} hours</span>
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
      <button @click="($refs.clearEntriesDialog as any).showModal()" class="open-btn warning-btn">Clear</button>
      <button @click="($refs.addEntryDialog as any).showModal()" class="open-btn">Add Entry</button>
    </div>

    <BaseDialog ref="clearEntriesDialog" title="Clear Entries" open-dialog-text="Clear" class="warning-btn"
      :reset-forms="true">
      <ClearEntriesForm @clear-entries="clearEntries" />
    </BaseDialog>

    <BaseDialog ref="addEntryDialog" title="Add Entry">
      <EntryForm :selected-date="selectedDate" @entry-change="entryChange" />
    </BaseDialog>

    <BaseDialog ref="editEntryDialog" title="Edit Entry" :reset-forms="true">
      <EntryForm :selected-date="selectedDate" @entry-change="entryChange" :entry="selectedEntry" />
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
  padding: 0 0.35rem;
}

.entry {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: start;
  justify-content: start;
  margin: 0.5rem 0;
  line-height: 1.5em;
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

.info>* {
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

.actions>*:last-child {
  flex-grow: 1;
}
</style>
