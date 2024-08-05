<script lang="ts">
export default {
  props: {
    label: {
      type: String,
      required: true
    }
  }
};
</script>

<template>
  <div class="input">
    <!-- Intentionally not using "for" to let user clicks outside to lose input focus -->
    <label>{{ label }}</label>
    <slot></slot>
  </div>
</template>

<style scoped>
.input {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--border-radius);
  border: none;
  padding: var(--padding-small) 0;
  margin: 0;
}

.input > * {
  flex: 1;
}
</style>
