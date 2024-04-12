<script lang="ts">
import { mapWritableState } from 'pinia';
import { useUserDataStore } from '@/stores/userData';

import ButtonConfirm from './ButtonConfirm.vue';

import type { Entry } from '@/types';

export default {
  props: {
    entry: {
      type: Object as () => {
        id: number | undefined;
        workplace: string | undefined;
        payRate: number | undefined;
        from: string | undefined;
        to: string | undefined;
      },
      default: undefined
    },
    selectedDate: {
      type: Date,
      required: true
    },
    action: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      formData: {
        id: this.entry?.id,
        workplace: this.entry?.workplace,
        payRate: this.entry?.payRate,
        from: this.entry?.from ? this.toHHmmString(this.entry.from) : undefined, // formData.from will be in the format of 'HH:mm'
        to: this.entry?.to ? this.toHHmmString(this.entry.to) : undefined // instead of Date object
      }
    };
  },
  computed: {
    ...mapWritableState(useUserDataStore, ['entries', 'checkInTime'])
  },
  emits: {
    entryChange(payload: { action: string; entry: Entry }) {
      const actions = ['add', 'edit', 'delete', 'check in/out'];
      return actions.includes(payload.action);
    }
  },
  methods: {
    entryAction(event: Event) {
      const form = event.currentTarget as HTMLFormElement;

      const entry = {
        id: this.formData.id,
        workplace: this.formData.workplace,
        payRate: this.formData.payRate,
        from: this.toISOString(this.formData.from),
        to: this.toISOString(this.formData.to)
      } as Entry;

      let action = ((event as SubmitEvent)?.submitter as HTMLButtonElement).value;

      switch (action) {
        case 'add':
          entry.id = this.entries.length + 1;
          this.entries.push(entry);
          break;

        case 'edit':
          this.entries.splice(
            this.entries.findIndex((e) => e.id === entry.id),
            1,
            entry
          );
          break;

        case 'delete':
          this.entries.splice(
            this.entries.findIndex((e) => e.id === entry.id),
            1
          );
          break;

        case 'remove check in':
          this.checkInTime = undefined;
          break;

        default:
          alert('Invalid action');
          throw new Error('Invalid action');
      }

      form.reset();

      const dialog = form.closest('dialog') as HTMLDialogElement;
      dialog?.close();
    },

    toHHmmString(ISOString: string | undefined) {
      if (!ISOString) {
        return '00:00';
      }

      const date = new Date(ISOString);
      return date.toLocaleTimeString('en-AU', {
        hourCycle: 'h23',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    toISOString(HHmmString: string | undefined) {
      if (!HHmmString) {
        return undefined;
      }

      const date = new Date(this.selectedDate);
      const [hours, minutes] = HHmmString.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      return date.toISOString();
    },

    resetForm() {
      this.formData = {
        id: this.entry?.id,
        workplace: this.entry?.workplace,
        payRate: this.entry?.payRate,
        from: this.entry?.from ? this.toHHmmString(this.entry.from) : undefined,
        to: this.entry?.to ? this.toHHmmString(this.entry.to) : undefined
      };
    },

    focusButtonConfirm(isHolding: boolean) {
      if (isHolding) {
        (this.$refs.actionBar as HTMLElement)
          ?.querySelectorAll('*:not(.slider:has(.button-confirm.active))')
          .forEach((el) => {
            el.classList.add('hide');
          });
      } else {
        (this.$refs.actionBar as HTMLElement)?.querySelectorAll('.hide').forEach((el) => {
          el.classList.remove('hide');
        });
      }
    }
  },
  components: {
    ButtonConfirm
  },
  watch: {
    entry() {
      this.resetForm();
    }
  }
};
</script>

<template>
  <form @submit.prevent="entryAction" @reset.prevent="resetForm">
    <span class="selected-date">
      {{ selectedDate.toLocaleString(undefined, { dateStyle: 'full' }) }}
    </span>
    <input type="hidden" name="id" v-if="entry" v-model="formData.id" />
    <label for="workplace">Workplace</label>
    <input
      type="text"
      id="workplace"
      name="workplace"
      placeholder="e.g. RestaurantName"
      v-model="formData.workplace"
      required
    />
    <label for="pay-rate">Pay Rate</label>
    <input
      type="number"
      id="pay-rate"
      name="payRate"
      placeholder="e.g. 23.23"
      v-model="formData.payRate"
      step="0.01"
      min="0"
      max="1000"
      required
    />
    <label for="from">From</label>
    <input type="time" id="from" name="from" v-model="formData.from" required />
    <label for="to">To</label>
    <input type="time" id="to" name="to" v-model="formData.to" required />

    <div ref="actionBar" class="actions">
      <template v-if="action == 'edit'">
        <ButtonConfirm
          @is-holding="focusButtonConfirm"
          type="submit"
          name="action"
          value="delete"
          class="danger-btn"
          formnovalidate
        >
          Delete
        </ButtonConfirm>
        <button type="submit" name="action" value="edit">Edit Entry</button>
      </template>

      <template v-else-if="action == 'add'">
        <button type="submit" name="action" value="add">Add Entry</button>
      </template>

      <template v-else-if="action == 'check in/out'">
        <ButtonConfirm
          @is-holding="focusButtonConfirm"
          type="submit"
          name="action"
          value="remove check in"
          class="danger-btn"
          formnovalidate
        >
          Remove
        </ButtonConfirm>
        <button type="submit" name="action" value="add">Add Entry</button>
      </template>
    </div>
  </form>
</template>

<style scoped>
.selected-date {
  display: block;
  text-align: center;
}

.actions {
  transition: gap 0.3s ease;
}

.actions > * {
  max-width: 100%;
  overflow: hidden;
  transition: max-width 0.3s ease;
}

.actions button {
  flex: 1;
}

.actions .danger-btn {
  flex-grow: 0;
}

.actions:has(.hide) {
  gap: 0;
}

.hide {
  max-width: 0;
  padding: 0;
}
</style>
