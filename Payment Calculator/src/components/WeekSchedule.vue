<script lang="ts">
enum VIEW_MODE {
    MONTH = "month",
    WEEK = "week",
}

export default {
    data() {
        // Sample entries data
        const entries = [
            {
                id: 1,
                workPlace: "PappaRich",
                payRate: 23.23,
                from: "2023-12-26T13:29:22Z",
                to: "2023-12-26T17:29:22Z",
            },
            // Add more entries as needed
        ];

        const today = new Date();

        return {
            title: "Week Schedule",
            weekDays: ["M.", "Tu.", "W.", "Th.", "F", "Sa.", "Su."],
            VIEW_MODE,
            view: VIEW_MODE.MONTH,
            entries,
            today,
        };
    },
    computed: {
        calendar() {
            const firstDayOfMonth = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
            const lastDayOfMonth = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth() + 1, 0);
            const daysInMonth = lastDayOfMonth.getDate();
            const firstDayOfWeek = firstDayOfMonth.getDay();

            let currentDate = new Date(firstDayOfMonth);

            // Set the date to the first day of the week
            // e.g. if the first day of the month is a Wednesday, then the first day of the week is Monday
            currentDate.setDate(1 - firstDayOfWeek);

            const calendar = [];
            while (currentDate <= lastDayOfMonth) {
                const week = [];
                for (let i = 0; i < 7; i++) {
                    const isPrevMonth = currentDate.getMonth() < firstDayOfMonth.getMonth();
                    const isNextMonth = currentDate.getMonth() > firstDayOfMonth.getMonth();
                    week.push({
                        day: currentDate.getDate(),
                        date: new Date(currentDate),
                        prevMonth: isPrevMonth,
                        nextMonth: isNextMonth,
                    });
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                calendar.push(week);
            }

            return calendar;
        },
    },
    methods: {
        getEntriesForDay(date: Date) {
            // Logic to filter entries for the given date
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
    }
};
</script>

<template>
    <div class="week-schedule">
        <div class="title">
            <button class="prev-btn"><img src="@/components/icons/next.svg" alt="prev"></button>
            <b>{{ title }}</b>
            <button class="next-btn"><img src="@/components/icons/next.svg" alt="next"></button>
        </div>
        <div class="calendar">
            <div class="week-day" v-for="day in weekDays" :key="day">{{ day }}</div>
            <div class="week-total">TOTAL</div>

            <template v-for="week in calendar">
                <div v-for="(day, index) in week" :key="index"
                    :class="[{ 'prev-month': day.prevMonth, 'next-month': day.nextMonth, 'has-entry': (getEntriesForDay(day.date).length > 0) }, 'day']">
                    {{ day.day }}
                </div>
                <div class="total">0</div>
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
}

.prev-btn:hover,
.next-btn:hover {
    background-color: rgba(0, 204, 255, 0.15);
}

.prev-btn {
    transform: rotate(180deg);
}

.calendar {
    display: grid;
    grid-template-columns: repeat(7, 1fr) 2fr;
    grid-template-rows: repeat(6, 1fr);
    gap: 0.5rem;
    margin-top: 1rem;
    text-align: center;
}

.calendar .week-day,
.calendar .week-total {
    font-weight: bold;
    font-size: smaller;
}

.calendar .week-day {
    color: rgba(0, 0, 0, 0.5)
}

.calendar .total::before {
    content: "$";
}

.calendar .day {
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

.calendar .day:hover::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 1.7em;
    width: 1.7em;
    border-radius: 50%;
    background: rgba(0, 204, 255, 0.15);
    z-index: -1;
}

.calendar .prev-month,
.calendar .next-month {
    color: rgba(0, 0, 0, 0.5);
}

.calendar .has-entry::after {
    content: "";
    position: absolute;
    bottom: -0.2rem;
    left: 50%;
    transform: translateX(-50%);
    display: block;
    width: 0.3rem;
    height: 0.3rem;
    border-radius: 50%;
    background-color: green;
    margin: 0 auto;
}
</style>