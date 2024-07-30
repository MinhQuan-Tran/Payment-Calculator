<script lang="ts">
import { mapWritableState } from 'pinia';
import { useUserDataStore } from '@/stores/userData';

import ButtonConfirm from './ButtonConfirm.vue';

import type { Entry } from '@/types';

export default {
  props: {
    entry: Object as () => Partial<Entry>,
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
        from: this.entry?.from?.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
        to: this.entry?.to?.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })
      },
      hiddenElements: [] as Element[]
    };
  },
  computed: {
    ...mapWritableState(useUserDataStore, ['entries', 'checkInTime', 'prevWorkInfos'])
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
        from: new Date(
          this.selectedDate.setHours(
            parseInt(this.formData.from?.split(':')[0] || ''),
            parseInt(this.formData.from?.split(':')[1] || '')
          )
        ),
        to: new Date(
          this.selectedDate.setHours(
            parseInt(this.formData.to?.split(':')[0] || ''),
            parseInt(this.formData.to?.split(':')[1] || '')
          )
        )
      } as Entry;

      let action = ((event as SubmitEvent)?.submitter as HTMLButtonElement).value;

      switch (action) {
        case 'add':
          entry.id = this.entries.length + 1;
          this.entries.push(entry);
          this.prevWorkInfos[entry.workplace] = this.prevWorkInfos[entry.workplace] || { payRate: [] };
          this.prevWorkInfos[entry.workplace].payRate.push(entry.payRate);
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

    resetForm() {
      this.formData = {
        id: this.entry?.id,
        workplace: this.entry?.workplace,
        payRate: this.entry?.payRate,
        from: this.entry?.from?.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
        to: this.entry?.to?.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })
      };
    },

    focusButtonConfirm(isHolding: boolean) {
      if (isHolding) {
        // Hide all elements except this button and the bar
        (this.$refs.actionBar as HTMLElement)
          ?.querySelectorAll('*:not(.slider:has(.button-confirm.active))')
          .forEach((el) => {
            this.hiddenElements.push(el);
            el.classList.add('hide');
          });
      } else {
        this.hiddenElements.forEach((el) => {
          el.classList.remove('hide');
        });
        this.hiddenElements = [];
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

    <fieldset>
      <label for="workplace">Workplace</label>
      <div class="input-field">
        <input
          type="text"
          id="workplace"
          name="workplace"
          placeholder="e.g. RestaurantName"
          v-model="formData.workplace"
          required
          list="workplace-list"
          autocomplete="off"
        />
        <div class="datalist" id="workplace-list">
          <div v-for="(workInfo, workplace) in prevWorkInfos" :key="workplace" :value="workplace" class="item">
            {{ workplace }}
          </div>
        </div>
      </div>
    </fieldset>

    <fieldset>
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
        list="pay-rate-list"
        autocomplete="off"
      />
      <datalist id="pay-rate-list" v-if="formData.workplace">
        <option v-for="rate in prevWorkInfos[formData.workplace].payRate" :key="rate" :value="rate"></option>
      </datalist>
    </fieldset>

    <fieldset>
      <label for="from">From</label>
      <input type="time" id="from" name="from" v-model="formData.from" required />
    </fieldset>

    <fieldset>
      <label for="to">To</label>
      <input type="time" id="to" name="to" v-model="formData.to" required />
    </fieldset>

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

fieldset {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--border-radius);
  border: none;
  padding: var(--padding-small) 0;
  margin: 0;
}

fieldset > * {
  flex: 1;
}

.input-field {
  border-radius: var(--border-radius);
  border: 1px solid var(--text-color-faded);
}

.datalist {
  border-radius: var(--border-radius);
  box-sizing: border-box;
  width: 100%;
  padding: var(--padding-small);
  font-size: inherit;
  display: none;
}

.input-field:focus-within .datalist {
  display: block;
}

.datalist .item {
  border-radius: var(--border-radius);
  padding: var(--padding-small) var(--padding);
  cursor: pointer;
}

.datalist .item:hover {
  background-color: var(--hover-overlay);
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
