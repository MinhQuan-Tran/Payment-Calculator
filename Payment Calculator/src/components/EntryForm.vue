<script lang="ts">
import { type Entry } from '@/types';

export default {
    props: {
        entry: {
            type: Object as () => Entry,
            default: undefined,
        },
        selectedDate: {
            type: Date,
            required: true,
        },
    },
    data() {
        return {
            formData: {
                id: this.entry?.id,
                workplace: this.entry?.workplace,
                payRate: this.entry?.payRate,
                from: this.toHHmmString(this.entry?.from), // formData.from will be in the format of 'HH:mm'
                to: this.toHHmmString(this.entry?.to),     // instead of Date object
            } as Entry,
        };
    },
    emits: {
        entryChange(payload: { action: string, entry: Entry; }) {
            const actions = ['add', 'edit', 'delete'];
            return actions.includes(payload.action);
        },
    },
    methods: {
        entryAction(event: Event) {
            const form = event.currentTarget as HTMLFormElement;

            if (!form || !form.checkValidity()) {
                throw new Error('Form is invalid');
            }

            const entry = {
                id: this.formData.id,
                workplace: this.formData.workplace,
                payRate: this.formData.payRate,
                from: this.toISOString(this.formData.from),
                to: this.toISOString(this.formData.from)
            } as Entry;

            const action = (document.activeElement as HTMLButtonElement)?.value;

            if (action === 'delete') {
                if (!confirm('Are you sure you want to delete this entry?\nThis action cannot be undone.')) {
                    return;
                }
            }

            this.$emit('entryChange', {
                action: action,
                entry
            });

            form.reset();

            const dialog = form.closest('dialog') as HTMLDialogElement;
            dialog?.close();
        },
        toHHmmString(ISOString: string | undefined) {
            if (!ISOString) {
                return '00:00';
            }

            const date = new Date(ISOString);
            return date.toLocaleTimeString('en-AU', { hourCycle: 'h23', hour: '2-digit', minute: '2-digit' });
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
            console.log('resetForm');
            this.formData = {
                id: this.entry?.id,
                workplace: this.entry?.workplace,
                payRate: this.entry?.payRate,
                from: this.toHHmmString(this.entry?.from),
                to: this.toHHmmString(this.entry?.to),
            } as Entry;
        },
    },
    watch: {
        entry() {
            this.resetForm();
        },
    },
};
</script>

<template>
    <form @submit.prevent="entryAction" @reset.prevent="resetForm">
        <span class="selected-date">{{ selectedDate.toDateString() }}</span>
        <input type="hidden" name="id" v-if="entry" v-model="formData.id">
        <label for="workplace">Workplace</label>
        <input type="text" id="workplace" name="workplace" placeholder="e.g. PappaRich" v-model="formData.workplace"
            required />
        <label for="pay-rate">Pay Rate</label>
        <input type="number" id="pay-rate" name="payRate" placeholder="e.g. 23.23" v-model="formData.payRate" step="0.01"
            min="0" max="1000" required />
        <label for="from">From</label>
        <input type="time" id="from" name="from" v-model="formData.from" required />
        <label for="to">To</label>
        <input type="time" id="to" name="to" v-model="formData.to" required />

        <div v-if="entry" class="actions">
            <button type="submit" name="action" value="delete" class="warning-btn">Delete</button>
            <button type="submit" name="action" value="edit">Edit Entry</button>
        </div>

        <button v-else type="submit" name="action" value="add">Add Entry</button>
    </form>
</template>

<style scoped>
.selected-date {
    display: block;
    text-align: center;
}

.actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--gap-horizontal);
}

.actions button {
    flex: 1;
}
</style>