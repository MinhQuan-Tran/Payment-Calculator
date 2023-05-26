<script>
import ScrollPicker from "vue3-scroll-picker";

export default {
    components: {
        ScrollPicker,
    },
    props: {
        selectedTime: String
    },
    emits: ['update:selectedTime'],
    data() {
        return {
            showPicker: false,
            pickerBreakTime: [this.selectedTime],
            timeRange: [
                [
                    {
                        label: "None",
                        value: "0",
                    },
                    {
                        label: "30 mins",
                        value: "30",
                    },
                    {
                        label: "1 hour",
                        value: "60",
                    },
                ],
            ]
        };
    },
    methods: {
        handleConfirm() {
            this.showPicker = false;
            this.$emit('update:selectedTime', this.pickerBreakTime[0]);
        },
        handleCancel() {
            this.showPicker = false;
            this.pickerBreakTime = [this.selectedTime];
        },
    },
};
</script>

<template>
    <div class="break-time-picker">
        <div class="label" @click="showPicker = true">
            {{ timeRange[0].find((item) => item.value === this.selectedTime).label }}
        </div>
        <div class="picker" v-if="showPicker">
            <div class="overlay" @click="handleCancel"></div>
            <div class="popup">
                <div class="header">
                    <button class="cancel" @click="handleCancel">Cancel</button>
                    <button class="confirm" @click="handleConfirm">OK</button>
                </div>
                <scroll-picker class="scroll-picker" :options="timeRange" v-model="pickerBreakTime"
                    active-style="color: #00acff; font-size: xx-large;"
                    inactive-style="color: lightgrey; font-size: xx-large;">
                    <template v-slot:top-overlay>
                        <div class="custom-top-overlay"></div>
                    </template>
                    <template v-slot:bottom-overlay>
                        <div class="custom-bottom-overlay"></div>
                    </template>
                </scroll-picker>
            </div>
        </div>
    </div>
</template>

<style scoped>
.break-time-picker {
    flex: 1;
    text-align: center;
    font-size: 0.9em;
}

.picker {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 999;
}

.overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.5);
}

.popup {
    position: absolute;
    bottom: 0;
    width: 100%;
    background-color: #fff;
}

.header {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    border-bottom: 1px solid #ccc;
}

.cancel,
.confirm {
    background-color: transparent;
    border: none;
    font-size: 1rem;
}

.scroll-picker {
    width: 100%;
}

.custom-top-overlay {
    height: 100%;
    background: linear-gradient(to top,
            rgba(255, 255, 255, 0),
            rgba(0, 0, 0, 0.1));
}

.custom-bottom-overlay {
    height: 100%;
    background: linear-gradient(to bottom,
            rgba(255, 255, 255, 0),
            rgba(0, 0, 0, 0.1));
}

@media (min-width: 768px) {
    .popup {
        position: relative;
        width: auto;
        max-width: 320px;
        margin: 0 auto;
        box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.5);
    }

    .header {
        border: none;
    }
}
</style>
