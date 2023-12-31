<script lang="ts">
import { type Entry } from "@/types";
import { currencyFormat } from "@/utils";

enum VIEW_MODE {
    MONTH = "month",
    WEEK = "week",
}

export default {
    props: {
        entries: {
            type: Array as () => Entry[],
            required: true,
        },
        selectedDate: {
            type: Date,
            required: true,
        },
    },
    emits: ["update:selectedDate"],
    data() {
        const today = new Date();

        return {
            title: "Week Schedule",
            weekDays: ["M.", "Tu.", "W.", "Th.", "F", "Sa.", "Su."],
            VIEW_MODE,
            view: VIEW_MODE.MONTH,
            today,
            monthChange: 0,
        };
    },
    computed: {
        calendar() {
            const changedDate = new Date(this.today);
            changedDate.setMonth(changedDate.getMonth() + this.monthChange);

            const firstDayOfMonth = new Date(changedDate.getFullYear(), changedDate.getMonth(), 1);
            const lastDayOfMonth = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth() + 1, 0);
            const firstDayOfWeek = firstDayOfMonth.getDay();

            let currentDate = new Date(firstDayOfMonth);

            // Set the date to the first day of the week (Monday)
            // e.g. if the first day of the month is on Friday 1 December 2023, 
            // then the first day of the week is 1 December 2023 - 5 days = Sunday 26 November 2023
            // Sunday 26 November 2023 + 1 day = Monday 27 November 2023
            currentDate.setDate(currentDate.getDate() - firstDayOfWeek + 1);

            const calendar = [];
            while (currentDate <= lastDayOfMonth) {
                const week = {
                    days: [] as {
                        day: number,
                        date: Date,
                        prevMonth: boolean,
                        nextMonth: boolean
                    }[],
                    total: 0,
                };

                for (let i = 0; i < 7; i++) {
                    const isPrevMonth = currentDate.getMonth() < firstDayOfMonth.getMonth();
                    const isNextMonth = currentDate.getMonth() > firstDayOfMonth.getMonth();

                    week.days.push({
                        day: currentDate.getDate(),
                        date: new Date(currentDate),
                        prevMonth: isPrevMonth,
                        nextMonth: isNextMonth,
                    });

                    week.total += this.getEntriesForDay(currentDate).reduce((acc, entry) => {
                        const fromDate = new Date(entry.from);
                        const toDate = new Date(entry.to);

                        const workTime = toDate.getTime() - fromDate.getTime();
                        const workHours = workTime / (1000 * 60 * 60);

                        acc += workHours * entry.payRate;
                        return acc;
                    }, 0);

                    currentDate.setDate(currentDate.getDate() + 1);
                }

                // Round the total to 2 decimal places
                week.total = Math.round(week.total * 100) / 100;

                calendar.push(week);
            }

            return calendar;
        },
    },
    methods: {
        getEntriesForDay(date: Date) {
            // Filter entries for the given date
            return this.entries.filter(entry => {
                const fromDate = new Date(entry.from);
                const toDate = new Date(entry.to);

                // Set the time to 00:00:00:000
                fromDate.setHours(0, 0, 0, 0);
                toDate.setHours(0, 0, 0, 0);

                // Compare the dates only
                return fromDate.getTime() === date.getTime() || toDate.getTime() === date.getTime();
            });
        },
        updateTitleByMonth() {
            const date = new Date(this.today);
            date.setMonth(date.getMonth() + this.monthChange);
            this.title = date.toLocaleString("default", { month: "long", year: "numeric" });
        },
        goToNextMonth() {
            this.monthChange++;
            this.updateTitleByMonth();
        },
        goToPrevMonth() {
            this.monthChange--;
            this.updateTitleByMonth();
        },
        currencyFormat,
    },
    watch: {
        selectedDate() {
            console.log(this.selectedDate);
        },
    },
    mounted() {
        this.updateTitleByMonth();
    },
};
</script>

<template>
    <div class="week-schedule">
        <div class="title">
            <button class="prev-btn" @click="goToPrevMonth">
                <img src="@/components/icons/next.svg" alt="prev">
            </button>
            <b>{{ title }}</b>
            <button class="next-btn" @click="goToNextMonth">
                <img src="@/components/icons/next.svg" alt="next">
            </button>
        </div>
        <div class="calendar">
            <div class="week-day" v-for="day in weekDays" :key="day">{{ day }}</div>
            <div class="week-total">TOTAL</div>

            <template v-for="(week, weekIndex) in calendar" :key="weekIndex">
                <div v-for="(day, dayIndex) in week.days" :key="dayIndex">
                    <div @click="$emit('update:selectedDate', day.date)" :class="[
                        {
                            'prev-month': day.prevMonth,
                            'next-month': day.nextMonth,
                            'has-entry': (getEntriesForDay(day.date).length > 0),
                            // Compare the dates only
                            'selected': selectedDate && selectedDate.setHours(0, 0, 0, 0) === day.date.setHours(0, 0, 0, 0),
                        },
                        'day'
                    ]">
                        {{ day.day }}
                    </div>
                </div>
                <div class="total">
                    {{ currencyFormat(week.total) }}
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.week-schedule {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
}

.title {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    font-size: larger;
    margin: 0.5rem 0 1rem 0;
}

.prev-btn,
.next-btn {
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius);
    height: 32px;
    width: 32px;
    transition: all 0.3s ease-in-out;
    user-select: none;
}

.prev-btn:hover,
.next-btn:hover {
    background-color: rgba(150, 218, 255, 0.3);
}

.prev-btn {
    transform: rotate(180deg);
}

.calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr) minmax(min-content, 2fr);
    grid-template-rows: repeat(auto-fill, 2em);
    text-align: center;
    width: 100%;
}

.calendar>* {
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: visible;
    box-sizing: border-box;
}

.week-day,
.week-total {
    font-weight: bold;
    font-size: smaller;
}

.week-day {
    color: rgba(0, 0, 0, 0.5);
}

.week-total {
    background-color: rgba(var(--primary-color), 1);
    border-top-left-radius: var(--border-radius);
    border-top-right-radius: var(--border-radius);
    border-bottom: 2px solid white;
}

.total {
    text-align: left;
    justify-content: start;
    background-color: rgba(var(--primary-color), 1);
    padding: 0 0.5rem;
}

.total:last-child {
    border-bottom-left-radius: var(--border-radius);
    border-bottom-right-radius: var(--border-radius);
}

.day {
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    height: 2em;
    width: 2em;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
}

.day:hover {
    background-color: rgba(0, 0, 0, 0.15);
}

.day:focus {
    background-color: rgba(0, 0, 0, 0.15);
}

.prev-month,
.next-month {
    color: rgba(0, 0, 0, 0.5);
}

.has-entry::after {
    content: "";
    position: absolute;
    bottom: 0rem;
    left: 50%;
    transform: translateX(-50%);
    display: block;
    width: 0.3rem;
    height: 0.3rem;
    border-radius: 50%;
    background-color: green;
    margin: 0 auto;
}

.selected {
    background-color: rgba(var(--primary-color), 1) !important;
}
</style>