<script lang="ts">
export default {};
</script>

<template>
  <fieldset>
    <label for="input">{{ label }}</label>
    <div class="input-field">
      <input
        type="text"
        id="input"
        name="workplace"
        placeholder="e.g. RestaurantName"
        v-model="formData.workplace"
        required
        list="workplace-list"
        autocomplete="off"
      />
      <div class="datalist" id="workplace-list">
        <div v-for="(workInfo, workplace) in prevWorkInfos" :key="workplace" :value="workplace" class="item">
          {{ workplace }}
        </div>
      </div>
    </div>
  </fieldset>
</template>

<style scoped>
fieldset {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--border-radius);
  border: none;
  padding: var(--padding-small) 0;
  margin: 0;
}

fieldset > * {
  flex: 1;
}

.input-field {
  border-radius: var(--border-radius);
  border: 1px solid var(--text-color-faded);
}

.datalist {
  border-radius: var(--border-radius);
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
