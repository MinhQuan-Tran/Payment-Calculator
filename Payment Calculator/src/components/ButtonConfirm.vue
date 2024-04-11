<script lang="ts">
export default {
  // WARNING: animation only works correctly when the button is in the most left position
  data() {
    return {
      cursorStartX: 0, // Initial x position of the cursor when pressing down
      confirmed: false,
      isHolding: false
    };
  },
  emits: ['isHolding'],
  methods: {
    pointerdown(event: PointerEvent) {
      this.cursorStartX = event.clientX;
      this.isHolding = true;
      this.$emit('isHolding', this.isHolding);

      const button = this.$refs.button as HTMLButtonElement;
      const slider = this.$refs.slider as HTMLDivElement;
      const placeholder = this.$refs.placeholder as HTMLSpanElement;

      button.style.transition = '';

      slider.style.transition = 'flex-grow 0.3s ease';
      slider.style.flexGrow = '1';

      placeholder.style.transition = 'opacity 0.3s ease 0.2s';
      placeholder.style.opacity = '0.5';

      // Add event listeners to the document to handle the pointer movement and release when not hovering over the button
      document.addEventListener('pointermove', this.pointermove);
      document.addEventListener('pointerup', this.pointerup);
    },

    pointermove(event: PointerEvent) {
      if (!this.isHolding) {
        return;
      }

      const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
      const button = this.$refs.button as HTMLButtonElement;
      const slider = this.$refs.slider as HTMLDivElement;
      const maxDistance = slider.getBoundingClientRect().width - button.getBoundingClientRect().width;

      const distanceMoved = clamp(event.clientX - this.cursorStartX, 0, maxDistance);

      button.style.transform = `translateX(${distanceMoved}px)`;

      if (distanceMoved == maxDistance) {
        this.confirmed = true;
      } else {
        this.confirmed = false;
      }
    },

    pointerup() {
      this.isHolding = false;
      this.$emit('isHolding', this.isHolding);

      // Remove the event listeners
      document.removeEventListener('pointermove', this.pointermove);
      document.removeEventListener('pointerup', this.pointerup);

      const button = this.$refs.button as HTMLButtonElement;
      const slider = this.$refs.slider as HTMLDivElement;
      const placeholder = this.$refs.placeholder as HTMLSpanElement;

      button.click();

      button.style.transition = 'transform 0.2s ease';
      button.style.transform = 'translateX(0)';

      slider.style.transition = 'flex-grow 0.3s ease';
      slider.style.flexGrow = '0';

      placeholder.style.transition = 'opacity 0.3s ease';
      placeholder.style.opacity = '0';
    },

    handleClick(event: Event) {
      if (!this.confirmed) {
        return event.preventDefault();
      }

      this.confirmed = false;
      return true;
    }
  },
  inheritAttrs: false // Pass all attributes to the button instead of the slider
};
</script>

<template>
  <div ref="slider" class="slider">
    <span ref="placeholder" class="placeholder">Slide to confirm</span>
    <button ref="button" class="button-confirm" v-bind="$attrs" @pointerdown="pointerdown" @click="handleClick">
      <slot></slot>
    </button>
  </div>
</template>

<style scoped>
.slider {
  position: relative;
  background-color: darkred;
  border-radius: var(--border-radius);
  text-align: center;
  flex-shrink: 1;
  flex-grow: 0;
}

.placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.8em;
  letter-spacing: 3px;
  opacity: 0;
  pointer-events: none;
  text-wrap: nowrap;
}

button {
  user-select: none;
  transition: none;
  height: 100%;
  z-index: 1;
}

button:hover {
  background: rgba(var(--button-color), 1);
}
</style>
