<script lang="ts">
import type { Entry, Duration } from '@/types';
import { getWorkDuration } from '@/utils';

import { mapWritableState } from 'pinia';
import { useUserDataStore } from '@/stores/userData';

import ButtonConfirm from './ButtonConfirm.vue';
import ComboBox from './ComboBox.vue';
import InputLabel from './InputLabel.vue';

export default {
  props: {
    entry: {
      type: Object as () => Partial<Entry>,
      default: () => ({}) as Entry
    },
    action: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      formData: this.entry,
      hiddenElements: [] as Element[]
    };
  },
  computed: {
    ...mapWritableState(useUserDataStore, ['entries', 'checkInTime', 'prevWorkInfos']),

    // TODO: Make UI for unpaid breaks

    // Work hours remaining after unpaid breaks
    workHoursRemain(): number {
      return (
        getWorkDuration(this.formData)?.hours -
        (this.formData?.unpaidBreaks?.reduce((acc, curr) => acc + curr.hours, 0) || 0)
      );
    }
  },
  emits: {
    entryChange(payload: { action: string; entry: Entry }) {
      const actions = ['add', 'edit', 'delete', 'check in/out'];
      return actions.includes(payload.action);
    }
  },
  methods: {
    getWorkDuration,

    // Cannot use alert directly on event
    alert(message: string) {
      alert(message);
    },

    entryAction(event: Event) {
      const form = event.currentTarget as HTMLFormElement;

      let action = ((event as SubmitEvent)?.submitter as HTMLButtonElement).value;

      switch (action) {
        case 'add':
        case 'check in':
          // TODO: Check formDate valid before saving (Number, Date, 'from' cannot be later than 'to')
          try {
            const entry = { ...this.formData, id: this.entries.length + 1 } as Entry;

            this.entries.push(entry);

            if (entry.workplace in this.prevWorkInfos && this.prevWorkInfos[entry.workplace].payRate instanceof Set) {
              this.prevWorkInfos[entry.workplace].payRate.add(Number(entry.payRate));
            } else {
              this.prevWorkInfos[entry.workplace] = {
                payRate: new Set<number>([Number(entry.payRate)])
              };
            }

            if (action === 'check in') {
              this.checkInTime = undefined;
            }
          } catch (error) {
            alert('Invalid entry');
            throw new Error('Invalid entry');
          }

          break;

        case 'edit':
          try {
            const entry = this.formData as Entry;

            this.entries.splice(
              this.entries.findIndex((e) => e.id === entry.id),
              1,
              entry
            );
          } catch (error) {
            alert('Invalid entry');
            throw new Error('Invalid entry');
          }

          break;

        case 'delete':
          this.formData?.id
            ? this.entries.splice(
                this.entries.findIndex((e) => e.id === this.formData!.id),
                1
              )
            : alert('Invalid entry');
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
      this.formData = this.entry;
    },

    focusButtonConfirm(isHolding: boolean) {
      if (isHolding) {
        // Hide all elements except this button and the bar
        return (this.$refs.actionBar as HTMLElement)
          ?.querySelectorAll('*:not(.slider:has(.button-confirm.active))')
          .forEach((el) => {
            this.hiddenElements.push(el);
            el.classList.add('hide');
          });
      }

      this.hiddenElements.forEach((el) => {
        el.classList.remove('hide');
      });
      this.hiddenElements = [];
    },

    toDateTimeLocal(date: Date | undefined) {
      if (!date) {
        return '';
      }

      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - offset * 60 * 1000);
      return localDate.toISOString().slice(0, 16);
    }
  },
  components: {
    ButtonConfirm,
    ComboBox,
    InputLabel
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
    <input type="hidden" name="id" v-if="formData?.id" v-model="formData.id" />

    <InputLabel label="Workplace">
      <ComboBox
        :value="formData?.workplace || ''"
        @update:value="(newValue) => (formData.workplace = newValue)"
        :list="Object.keys(prevWorkInfos)"
        @delete-item="delete prevWorkInfos[$event]"
        deletable
      >
        <input
          type="text"
          id="workplace"
          name="workplace"
          placeholder="e.g. RestaurantName"
          v-model="formData.workplace"
          required
        />
      </ComboBox>
    </InputLabel>

    <InputLabel label="Pay Rate">
      <ComboBox
        :value="formData.payRate ? formData.payRate.toString() : ''"
        @update:value="(newValue: number | undefined) => (formData.payRate = Number(newValue))"
        :list="
          formData.workplace && prevWorkInfos[formData.workplace]?.payRate
            ? Array.from(prevWorkInfos[formData.workplace]?.payRate).map((pr) => pr.toString())
            : []
        "
        @delete-item="formData.workplace && prevWorkInfos[formData.workplace]?.payRate?.delete(parseFloat($event))"
        deletable
      >
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
      </ComboBox>
    </InputLabel>

    <InputLabel label="From">
      <input
        type="datetime-local"
        id="from"
        name="from"
        :value="toDateTimeLocal(formData.from)"
        :max="toDateTimeLocal(formData.to)"
        @input="(event) => (formData.from = new Date((event.target as HTMLInputElement).value))"
        required
      />
    </InputLabel>

    <InputLabel label="To">
      <input
        type="datetime-local"
        id="to"
        name="to"
        :value="toDateTimeLocal(formData.to)"
        :min="toDateTimeLocal(formData.from)"
        @input="(event) => (formData.to = new Date((event.target as HTMLInputElement).value))"
        required
      />
    </InputLabel>

    <InputLabel label="Unpaid Break(s)">
      <div v-for="(unpaidBreak, index) in formData.unpaidBreaks" :key="index">
        <!-- Hours -->
        <ComboBox
          :value="unpaidBreak.hours?.toString()"
          @update:value="
            (hours) => {
              !isNaN(Number(hours))
                ? (formData.unpaidBreaks![index].hours = Number(hours))
                : alert('Invalid input: Please enter a valid number.');
            }
          "
          :list="[...Array(workHoursRemain + 1).keys()].map(String)"
        >
          <input
            type="number"
            name="unpaidBreak-hours"
            placeholder="hours"
            v-model="formData.unpaidBreaks![index].hours"
            step="1"
            min="0"
            max="24"
          />
        </ComboBox>

        <!-- Minutes (0, 15, 30, 45) -->
        <ComboBox
          :value="unpaidBreak.minutes?.toString()"
          @update:value="
            (minutes) => {
              !isNaN(Number(minutes))
                ? (formData.unpaidBreaks![index].minutes = Number(minutes))
                : alert('Invalid input: Please enter a valid number.');
            }
          "
          :list="[...Array(4).keys()].map((i) => (i * 15).toString())"
        >
          <input
            type="number"
            name="unpaidBreak-minutes"
            placeholder="minutes"
            v-model="formData.unpaidBreaks![index].minutes"
            step="1"
            min="0"
            max="59"
          />
        </ComboBox>
      </div>
      <button type="button" @click="(formData.unpaidBreaks ??= [] as Duration[]).push({} as Duration)">+</button>
    </InputLabel>

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
        <button type="submit" name="action" value="check in">Add Entry</button>
      </template>
    </div>
  </form>
</template>

<style scoped>
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
