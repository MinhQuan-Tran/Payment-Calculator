<script lang="ts">
export default {
  props: {
    value: String,
    list: Array<String>
  },
  computed: {
    filteredList() {
      if (!this.value) return this.list || [];

      return this.list?.filter((item) => item.toLowerCase().includes(this.value!.toLowerCase())) || [];
    }
  },
  updated() {
    const slot = this.$refs.slot as HTMLElement;
    const datalist = this.$refs.datalist as HTMLElement;

    if (datalist) datalist.style.paddingTop = `calc(${slot.getBoundingClientRect().height}px + var(--padding-small))`;
  }
};
</script>

<template>
  <div class="input-field">
    <div ref="slot">
      <slot></slot>
    </div>

    <div ref="datalist" class="datalist" v-if="filteredList.length > 0">
      <div
        v-for="(itemName, index) in filteredList"
        :key="index"
        class="item"
        @mousedown="$emit('update:value', itemName)"
      >
        {{ itemName }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  position: relative;
  border-radius: var(--border-radius);
}

.input-field:focus-within {
  z-index: 1;
}

.datalist {
  position: absolute;
  top: 0;
  z-index: -1;
  border-radius: var(--border-radius);
  border: 1px solid var(--text-color-faded);
  box-sizing: border-box;
  width: 100%;
  padding: var(--padding-small);
  font-size: inherit;
  display: none;
}

.input-field:focus-within .datalist {
  display: block;
}

.datalist .item {
  border-radius: var(--border-radius);
  padding: var(--padding-small) var(--padding);
  cursor: pointer;
}

.datalist .item:hover {
  background-color: var(--hover-overlay);
}
</style>
