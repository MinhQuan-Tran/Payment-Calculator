<script lang="ts">
export default {
  props: {
    value: String,
    list: Array<String>,
    deletable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:value', 'delete-item'],
  data() {
    return {
      isDatalistVisible: false
    };
  },
  methods: {
    handleFocusIn() {
      (this.$refs['input-field'] as HTMLElement).style.zIndex = '1';
      this.isDatalistVisible = true;
    },
    handleFocusOut() {
      setTimeout(() => {
        this.isDatalistVisible = false;
        (this.$refs['input-field'] as HTMLElement).style.zIndex = '0';
      }, 100);
    }
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
  <div class="input-field" ref="input-field" @focusin="handleFocusIn" @focusout="handleFocusOut">
    <div ref="slot">
      <slot></slot>
    </div>

    <div ref="datalist" class="datalist" v-if="filteredList.length > 0 && isDatalistVisible">
      <div v-for="(itemName, index) in filteredList" :key="index" class="item" @click="$emit('update:value', itemName)">
        {{ itemName }}
        <button class="delete-btn" v-if="deletable" @click.stop="$emit('delete-item', itemName)">
          <div class="icons8-close"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  position: relative;
  border-radius: var(--border-radius);
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
  background-color: var(--datalist-background-color);
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.5);
}

.datalist .item {
  border-radius: var(--border-radius);
  padding: var(--padding-small) var(--padding);
  height: fit-content;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 1em;
}

.datalist .item:hover {
  background-color: var(--hover-overlay);
}

.datalist .item .delete-btn {
  --button-color: var(--danger-color);
  font-size: inherit;
  height: 1.2em;
  aspect-ratio: 1 / 1;
  padding: var(--padding-small);
  box-sizing: border-box;
  z-index: 1;
}
</style>
