<script lang="ts">
export default {
    data() {
        return {
            formData: {
                clearOption: '',
            }
        };
    },
    emits: {
        clearEntries(payload: string) {
            const options = ['day', 'week', 'all'];
            return options.includes(payload);
        },
    },
    methods: {
        clearEntries(event: Event) {
            const form = event.currentTarget as HTMLFormElement;

            if (!confirm('Are you sure you want to clear this data?\nThis action cannot be undone.')) {
                return;
            }

            this.$emit('clearEntries', this.formData.clearOption);

            form.reset();

            const dialog = form.closest('dialog') as HTMLDialogElement;
            dialog?.close();
        }
    }
};
</script>

<template>
    <form @submit.prevent="clearEntries">
        <span>What entries do you want to clear?</span>
        <div>
            <input type="radio" id="clear-option-day" v-model="formData.clearOption" name="clearOption" value="day"
                required />
            <label for="clear-option-day">Day</label>
        </div>
        <div>
            <input type="radio" id="clear-option-week" v-model="formData.clearOption" name="clearOption" value="week"
                required />
            <label for="clear-option-week">Week</label>
        </div>
        <div>
            <input type="radio" id="clear-option-all" v-model="formData.clearOption" name="clearOption" value="all"
                required />
            <label for="clear-option-all">All</label>
        </div>

        <button type="submit">Clear Entries</button>
    </form>
</template>

<style scoped>
input[type='radio'],
input[type='checkbox'] {
    margin-left: 0;
}
</style>