<script>
import ScrollPicker from "vue3-scroll-picker";

export default {
  components: {
    ScrollPicker,
  },
  props: {
    startLimit: {
      type: String,
      required: false,
      default: "10:00",
    },
    endLimit: {
      type: String,
      required: false,
      default: "22:00",
    },
    selectedTime: String
  },
  emits: ['update:selectedTime'],
  data() {
    return {
      showPicker: false,
      pickerTime: [this.selectedTime.split(":")[0], this.selectedTime.split(":")[1]],
      timeRange: [
        Array.from(
          {
            length: this.endLimit.split(":")[0] - this.startLimit.split(":")[0] + 1,
          },
          (_, i) => ({
            label: (+this.startLimit.split(":")[0] + i).toString().padStart(2, "0"),
            value: (+this.startLimit.split(":")[0] + i).toString().padStart(2, "0"),
          })
        ),
        Array.from({ length: 4 }, (_, i) => ({
          label: (i * 15).toString().padStart(2, "0"),
          value: (i * 15).toString().padStart(2, "0"),
        })),
      ],
    };
  },
  methods: {
    limitTime(time, startLimit, endLimit) {
      if (time[0] < startLimit[0]) {
        time[0] = startLimit[0];
      } else if (time[0] > endLimit[0]) {
        time[0] = endLimit[0];
      }
      if (time[0] === startLimit[0] && time[1] < startLimit[1]) {
        time[1] = startLimit[1];
      } else if (time[0] === endLimit[0] && time[1] > endLimit[1]) {
        time[1] = endLimit[1];
      }
      return time;
    },
    handleConfirm() {
      this.showPicker = false;
      this.pickerTime = this.limitTime(this.pickerTime, this.startLimit.split(":"), this.endLimit.split(":"));
      this.$emit('update:selectedTime', this.pickerTime.join(":"));
    },
    handleCancel() {
      this.showPicker = false;
      this.pickerTime = [this.selectedTime.split(":")[0], this.selectedTime.split(":")[1]];
    },
  },
};
</script>

<template>
  <div class="time-picker">
    <div @click="showPicker = true">
      {{ selectedTime.split(":")[0] }}:{{ selectedTime.split(":")[1] }}
    </div>
    <div class="picker" v-if="showPicker">
      <div class="overlay" @click="handleCancel"></div>
      <div class="popup">
        <div class="header">
          <button class="cancel" @click="handleCancel">Cancel</button>
          <button class="confirm" @click="handleConfirm">OK</button>
        </div>
        <scroll-picker class="scroll-picker" :options="timeRange" v-model="pickerTime"
          active-style="color: #00acff; font-size: xx-large;" inactive-style="color: lightgrey; font-size: xx-large;">
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
.time-picker {
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
