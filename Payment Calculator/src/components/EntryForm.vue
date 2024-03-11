<script lang="ts">
import { type Entry } from '@/types';

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
            default: undefined,
        },
        selectedDate: {
            type: Date,
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            formData: {
                id: this.entry?.id,
                workplace: this.entry?.workplace,
                payRate: this.entry?.payRate,
                from: this.entry?.from ? this.toHHmmString(this.entry.from) : undefined, // formData.from will be in the format of 'HH:mm'
                to: this.entry?.to ? this.toHHmmString(this.entry.to) : undefined,   // instead of Date object
            },
        };
    },
    emits: {
        entryChange(payload: { action: string, entry: Entry; }) {
            const actions = ['add', 'edit', 'delete', 'check in/out'];
            return actions.includes(payload.action);
        },
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

            let action = (document.activeElement as HTMLButtonElement)?.value;

            switch (action) {
                case 'add':
                    if (entry) {
                        action = 'check in/out';
                    }
                    break;
                case 'edit':
                    break;
                case 'delete':
                    if (!confirm('Are you sure you want to delete this entry?\nThis action cannot be undone.')) {
                        return;
                    }
                    break;
                case 'remove check in':
                    if (!confirm('Are you sure you want to remove the check in time?\nThis action cannot be undone.')) {
                        return;
                    }
                    break;
                default:
                    alert('Invalid action');
                    throw new Error('Invalid action');
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
            this.formData = {
                id: this.entry?.id,
                workplace: this.entry?.workplace,
                payRate: this.entry?.payRate,
                from: this.entry?.from ? this.toHHmmString(this.entry.from) : undefined,
                to: this.entry?.to ? this.toHHmmString(this.entry.to) : undefined,
            };
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
        <span class="selected-date">
            {{ selectedDate.toLocaleString(undefined, { dateStyle: 'full' }) }}
        </span>
        <input type="hidden" name="id" v-if="entry" v-model="formData.id">
        <label for="workplace">Workplace</label>
        <input type="text" id="workplace" name="workplace" placeholder="e.g. PappaRich" v-model="formData.workplace"
            required />
        <label for="pay-rate">Pay Rate</label>
        <input type="number" id="pay-rate" name="payRate" placeholder="e.g. 23.23" v-model="formData.payRate"
            step="0.01" min="0" max="1000" required />
        <label for="from">From</label>
        <input type="time" id="from" name="from" v-model="formData.from" required />
        <label for="to">To</label>
        <input type="time" id="to" name="to" v-model="formData.to" required />

        <div class="actions">
            <template v-if="action == 'edit'">
                <button type="submit" name="action" value="delete" class="warning-btn" formnovalidate>Delete</button>
                <button type="submit" name="action" value="edit">Edit Entry</button>
            </template>
            <template v-else-if="action == 'add'">
                <button type="submit" name="action" value="add">Add Entry</button>
            </template>
            <template v-else-if="action == 'check in/out'">
                <button type="submit" name="action" value="remove check in" class="warning-btn" formnovalidate>
                    Remove
                </button>
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
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--gap-horizontal);
}

.actions button {
    flex: 1;
}

.actions .warning-btn {
    flex-grow: 0;
}
</style>