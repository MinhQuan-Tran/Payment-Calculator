<script lang="ts">
import { type Entry } from '@/types';
import { currencyFormat } from '@/utils';

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
  emits: ['addEntry', 'clearData'],
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
    entryPay(entry: Entry) {
      const hours = this.hourDiff(entry);
      return entry.payRate * hours;
    },
    openDialog(dialogRef: string) {
      const dialog = this.$refs[dialogRef] as HTMLDialogElement;
      if (dialog) {
        dialog.showModal();
      }
    },
    closeDialog(event: Event) {
      const target = event.target as HTMLElement;
      const dialog = target.closest('dialog') as HTMLDialogElement;
      if (dialog) {
        dialog.close();
      }
    },
    addEntry(event: Event) {
      const dialog = document.querySelector('dialog#add-entry-dialog') as HTMLDialogElement;
      if (dialog) {
        const form = dialog.querySelector('form#add-entry-form') as HTMLFormElement;
        if (form && form.checkValidity()) {
          event.preventDefault();

          const formData = new FormData(form);

          const from = new Date(this.selectedDate)
          const selectedFrom = formData.get('from')?.toString() as string;
          from.setHours(Number(selectedFrom.split(':')[0]), Number(selectedFrom.split(':')[1]));

          const to = new Date(this.selectedDate);
          const selectedTo = formData.get('to')?.toString() as string;
          to.setHours(Number(selectedTo.split(':')[0]), Number(selectedTo.split(':')[1]));

          const entry = {
            id: (this.entries?.length ?? 0) + 1,
            workplace: formData.get('workplace') as string,
            payRate: Number(formData.get('payRate')),
            from: from.toISOString(),
            to: to.toISOString()
          }

          this.$emit('addEntry', entry);

          form.reset();

          dialog.close();
        }
      }
    },
    clearData(event: Event) {
      const dialog = document.querySelector('dialog#clear-data-dialog') as HTMLDialogElement;
      if (dialog) {
        const form = dialog.querySelector('form#clear-data-form') as HTMLFormElement;
        if (form && form.checkValidity()) {
          event.preventDefault();

          const formData = new FormData(form)

          const clearOption = formData.get('clearOption') as string

          this.$emit('clearData', clearOption)

          form.reset()

          dialog.close()
        }
      }
    },
    currencyFormat
  }
}
</script>

<template>
  <div class="day-schedule">
    <div class="entry-list">
      <div v-for="entry in entries" :key="entry.id" class="entry">
        <div class="time">
          <span>{{ toTime(entry.from) }}</span>
          <span>{{ toTime(entry.to) }}</span>
        </div>
        <div class="divider"></div>
        <div class="info">
          <div class="primary">
            <span>{{ entry.workplace }}</span>
            <span>{{ currencyFormat(entryPay(entry)) }}</span>
          </div>
          <div class="secondary">
            <span>{{ currencyFormat(entry.payRate) }}/hr</span>
            <span>{{ hourDiff(entry) }} hours</span>
          </div>
        </div>
      </div>
    </div>
    <div class="actions">
      <button @click="openDialog('clear-data-dialog')" class="clear">Clear</button>
      <button @click="openDialog('add-entry-dialog')">Add Entry</button>
    </div>
    <dialog id="add-entry-dialog" ref="add-entry-dialog">
      <button class="close-btn" @click="closeDialog">X</button>
      <div class="content">
        <h1 class="title">Add Entry</h1>
        <span>{{ selectedDate.toDateString() }}</span>
        <form id="add-entry-form">
          <label for="workplace">Workplace</label>
          <input type="text" id="workplace" name="workplace" placeholder="e.g. PappaRich" required />
          <label for="pay-rate">Pay Rate</label>
          <input type="number" id="pay-rate" name="payRate" step="0.01" placeholder="e.g. 23.23" required />
          <label for="from">From</label>
          <input type="time" id="from" name="from" placeholder="10:00" required />
          <label for="to">To</label>
          <input type="time" id="to" name="to" placeholder="10:00" required />
          <br />
          <button @click="addEntry" type="submit">Add</button>
        </form>
      </div>
    </dialog>
    <dialog id="clear-data-dialog" ref="clear-data-dialog">
      <button class="close-btn" @click="closeDialog">X</button>
      <div class="content">
        <h1 class="title">Clear Data</h1>
        <form id="clear-data-form">
          <span>What data do you want to clear?</span>
          <div>
            <input type="radio" id="clear-option-day" name="clearOption" value="day" required />
            <label for="clear-option-day">Today</label>
          </div>
          <div>
            <input type="radio" id="clear-option-all" name="clearOption" value="all" required />
            <label for="clear-option-all">All</label>
          </div>

          <br />

          <div>
            <input type="checkbox" id="clear-confirm" name="clearConfirm" required />
            <label for="clear-confirm">This action cannot be undone. Are you sure?</label>
          </div>
          <button @click="clearData" type="submit">Clear</button>
        </form>
      </div>
    </dialog>
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
  gap: 1rem;
  padding: 0 0.35rem;
}

.entry {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: start;
  justify-content: start;
  margin-bottom: 0.5rem;
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
  gap: 0.5rem;
}

.actions .clear {
  background: rgba(var(--warning-color), 1);
  font-weight: normal;
}

.actions button:last-child {
  flex: 10;
}

.close-btn {
  position: absolute;
  top: 0;
  right: 0;
  line-height: 1em;
  padding: 1em;
  background: transparent;
  user-select: none;
}

#add-entry-form label {
  margin-top: 0.5em;
}

#add-entry-form input {
  border: 1px solid rgba(0, 0, 0, 0.5);
  background-color: inherit;
  border-radius: var(--border-radius);
  box-sizing: border-box;
  width: 100%;
  padding: 0.5em;
}

#add-entry-form input:focus {
  outline: 2px solid rgba(var(--primary-color), 1);
}

#clear-data-form {
  gap: 0.5em;
}

#clear-data-form label {
  margin-left: 0.5em;
}

#clear-data-form input {
  margin-left: 0;
}

#clear-data-form button[type='submit'] {
  background: rgba(var(--warning-color), 1);
  font-weight: normal;
}
</style>
