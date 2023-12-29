<script lang="ts">
import { type Entry } from "@/types";
import { currencyFormat } from "@/utils";

export default {
    props: {
        entries: {
            type: Array as () => Entry[],
        },
    },
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
    </div>
</template>

<style scoped>
.entry-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-right: 0.35rem;
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
</style>