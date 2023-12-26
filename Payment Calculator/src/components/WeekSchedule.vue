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
    <div>
        <div class="title">
            <button class="prev-btn"><img src="@/components/icons/next.svg" alt="prev"></button>
            <b>{{ title }}</b>
            <button class="next-btn"><img src="@/components/icons/next.svg" alt="next"></button>
        </div>
    </div>
</template>

<style scoped>
.title {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
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
</style>