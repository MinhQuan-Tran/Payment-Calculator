<script lang="ts">
export default {
    data() {
        return {
            title: "Week Schedule",
        };
    },
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
            <div class="week-day">M.</div>
            <div class="week-day">Tu.</div>
            <div class="week-day">W.</div>
            <div class="week-day">Th.</div>
            <div class="week-day">F</div>
            <div class="week-day">Sa.</div>
            <div class="week-day">Su.</div>
            <div class="week-total">TOTAL</div>

            <!-- DaySchedule component will be here -->

            <div class="day">1</div>
            <div class="day">2</div>
            <div class="day">3</div>
            <div class="day">4</div>
            <div class="day">5</div>
            <div class="day">6</div>
            <div class="day">7</div>
            <div class="total">0</div>

            <div class="day">8</div>
            <div class="day">9</div>
            <div class="day">10</div>
            <div class="day">11</div>
            <div class="day">12</div>
            <div class="day">13</div>
            <div class="day">14</div>
            <div class="total">0</div>

            <div class="day">15</div>
            <div class="day">16</div>
            <div class="day">17</div>
            <div class="day">18</div>
            <div class="day">19</div>
            <div class="day">20</div>
            <div class="day">21</div>
            <div class="total">0</div>

            <div class="day">22</div>
            <div class="day">23</div>
            <div class="day">24</div>
            <div class="day">25</div>
            <div class="day">26</div>
            <div class="day">27</div>
            <div class="day">28</div>
            <div class="total">0</div>
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
    background-color: rgba(0, 204, 255, 0.1);
}

.prev-btn {
    transform: rotate(180deg);
}

.calendar {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: repeat(6, 1fr);
    column-gap: 0.5rem;
    row-gap: 0.8rem;
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
</style>