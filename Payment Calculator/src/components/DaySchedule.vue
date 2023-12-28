<script lang="ts">
import { type Entry } from "@/types";

export default {
    props: {
        entries: {
            type: Array as () => Entry[],
        },
    },
    methods: {
        toTime(dateStr: string) {
            const date = new Date(dateStr);
            return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
        },
    },
};
</script>

<template>
    <div class="day-schedule">
        <ul class="entry-list">
            <li v-for="entry in entries" :key="entry.id" class="entry">
                <div class="time">
                    <span>{{ toTime(entry.from) }}</span>
                    <span>{{ toTime(entry.to) }}</span>
                </div>
                <div class="divider"></div>
                <div class="info">
                    <b>{{ entry.workPlace }}</b>
                    <span>${{ entry.payRate }}/hr</span>
                </div>
            </li>
        </ul>
    </div>
</template>

<style scoped>
.entry-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.entry {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: start;
    justify-content: start;
    padding: 8px;
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
}

.time {
    text-align: right;
    width: 80px;
}
</style>