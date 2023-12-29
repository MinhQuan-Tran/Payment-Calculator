<script lang="ts">
import { type Entry } from "@/types";
import { currencyFormat } from "@/utils";

export default {
    props: {
        entries: {
            type: Array as () => Entry[],
        },
        selectedDate: {
            type: Date,
            required: true,
        },
    },
    emits: ["addEntry"],
    methods: {
        toTime(dateStr: string) {
            const date = new Date(dateStr);
            return date.toLocaleTimeString('en-AU', { hour12: true, hour: "numeric", minute: "2-digit" });
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
        openAddEntryDialog() {
            const dialog = document.querySelector("dialog#add-entry-dialog") as HTMLDialogElement;
            if (dialog) {
                dialog.showModal();
            }
        },
        closeAddEntryDialog() {
            const dialog = document.querySelector("dialog#add-entry-dialog") as HTMLDialogElement;
            if (dialog) {
                dialog.close();
            }
        },
        addEntry(event: Event) {
            event.preventDefault();

            const dialog = document.querySelector("dialog#add-entry-dialog") as HTMLDialogElement;
            if (dialog) {
                const form = dialog.querySelector("form.add-entry-dialog") as HTMLFormElement;
                if (form) {
                    const formData = new FormData(form);

                    const from = new Date(this.selectedDate);
                    from.setHours(Number(formData.get("from")?.toString().split(":")[0]));

                    const to = new Date(this.selectedDate);
                    to.setHours(Number(formData.get("to")?.toString().split(":")[0]));

                    const entry = {
                        id: (this.entries?.length ?? 0) + 1,
                        workplace: formData.get("workplace") as string,
                        payRate: Number(formData.get("payRate")),
                        from: from.toISOString(),
                        to: to.toISOString(),
                    };
                    this.$emit("addEntry", entry);
                    dialog.close();
                }
            }
        },
        currencyFormat,
    },
};
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
        <button @click="openAddEntryDialog">Add Entry</button>
        <dialog id="add-entry-dialog">
            <button class="close-btn" @click="closeAddEntryDialog">X</button>
            <h1>Add Entry</h1>
            <span>{{ selectedDate.toDateString() }}</span>
            <form class="add-entry-dialog">
                <label for="workplace">Workplace</label>
                <input type="text" id="workplace" name="workplace" required>
                <label for="payRate">Pay Rate</label>
                <input type="number" id="payRate" name="payRate" step="0.01" required>
                <label for="from">From</label>
                <input type="time" id="from" name="from" required>
                <label for="to">To</label>
                <input type="time" id="to" name="to" required>
                <br>
                <button @click="addEntry" type="submit">Add</button>
            </form>
        </dialog>
    </div>
</template>

<style scoped>
.day-schedule {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
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

.primary {
    font-weight: bold;
}

dialog {
    border: none;
    outline: none;
    border-radius: var(--border-radius);
}

button {
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius);
    line-height: 2em;
    padding: 0.5em;
    font-weight: bold;
    transition: all 0.3s ease-in-out;
    background: rgba(var(--primary-color), 1);
}

.close-btn {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0.5em;
    background: transparent;
    user-select: none;
}

.add-entry-dialog {
    display: flex;
    flex-direction: column;
    align-items: stretch;
}

.add-entry-dialog label {
    margin-top: 0.5em;
}
</style>