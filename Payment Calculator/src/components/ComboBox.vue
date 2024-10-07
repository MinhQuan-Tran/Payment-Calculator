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
  computed: {
    filteredList() {
      if (!this.value) return this.list || [];

      return this.list?.filter((item) => item.toLowerCase().includes(this.value!.toLowerCase())) || [];
    }
  },
  created() {
    this.$nextTick(() => {
      ((this.$refs.slot as HTMLDivElement).querySelector('input') as HTMLInputElement).addEventListener('focus', () => {
        (this.$refs.datalist as HTMLDivElement).classList.add('show');
        (this.$refs['input-field'] as HTMLDivElement).style.zIndex = '1';
      });
      ((this.$refs.slot as HTMLDivElement).querySelector('input') as HTMLInputElement).addEventListener('blur', () => {
        // Fire the click event after the hide the datalist
        (this.$refs.datalist as HTMLDivElement).classList.remove('show');
        setTimeout(() => {
          (this.$refs['input-field'] as HTMLDivElement).style.zIndex = '0';
        }, 500);
      });
    });
  },
  updated() {
    const slot = this.$refs.slot as HTMLElement;
    const datalist = this.$refs.datalist as HTMLElement;

    datalist.style.paddingTop = `${slot.getBoundingClientRect().height}px`;
  }
};
</script>

<template>
  <div class="input-field" ref="input-field">
    <div ref="slot">
      <slot></slot>
    </div>

    <div ref="datalist" class="datalist">
      <div class="list">
        <div
          v-for="(itemName, index) in filteredList"
          :key="index"
          class="item"
          @click="$emit('update:value', itemName)"
        >
          {{ itemName }}
          <button class="delete-btn" v-if="deletable" @click.stop="$emit('delete-item', itemName)">
            <div class="icons8-close"></div>
          </button>
        </div>
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
  left: 1px;
  z-index: -1;
  border-radius: var(--border-radius);
  border: 1px solid var(--text-color-faded);
  box-sizing: border-box;
  overflow: hidden;
  width: calc(100% - 2px);
  font-size: inherit;
  background-color: var(--input-background-color);
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.5);
  /* Small delay when closing to let the click event fire */
  transition: all 0.3s allow-discrete 0.2s;
  transform-origin: top;
  transform: scaleY(0);
}

.datalist.show {
  transform: scaleY(1);
  /* No delaying when showing */
  transition: all 0.3s;
}

.list {
  box-sizing: border-box;
  padding: 0 var(--padding-small);
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
}

.list .item {
  border-radius: var(--border-radius);
  padding: var(--padding-small) var(--padding);
  height: fit-content;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 1em;
  text-wrap: balance;
  text-wrap: pretty;
  word-break: break-word;
  overflow-wrap: break-word;
}

.list .item:first-child {
  margin-top: var(--padding-small);
}

.list .item:last-child {
  margin-bottom: var(--padding-small);
}

.list .item:hover {
  background-color: var(--hover-overlay);
}

.list .item .delete-btn {
  --button-color: var(--danger-color);
  font-size: inherit;
  height: 1.5em;
  width: 1.5em;
  padding: var(--padding-small);
  box-sizing: border-box;
  z-index: 1;
}
</style>
