<script lang="ts">

export default {
    props: {
        title: {
            type: String,
            required: true,
        },
        resetForms: {
            type: Boolean,
            default: false,
        },
    },
    // Emitting events allows parent components to access methods in this component
    emits: ['showModal'],
    methods: {
        showModal() {
            const dialog = this.$refs.dialog as HTMLDialogElement;
            dialog.showModal();
        },
        closeDialog() {
            const dialog = this.$refs.dialog as HTMLDialogElement;
            if (this.resetForms) {
                this.$el.querySelectorAll('form').forEach((form: HTMLFormElement) => {
                    form.reset();
                });
            }
            dialog.close();
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.$emit('showModal', this.showModal);
        });
    },
};
</script>

<template>
    <dialog ref="dialog">
        <button class="close-btn" @click="closeDialog">X</button>
        <div class="dialog">
            <h1 class="title">{{ title }}</h1>
            <div class="content">
                <slot></slot>
            </div>

        </div>
    </dialog>
</template>

<style scoped>
dialog {
    border: none;
    outline: none;
    border-radius: var(--border-radius);
    width: clamp(300px, 85vw, 500px);
    max-height: 90vh;
    overflow-y: hidden;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
    padding: 0;
}

.close-btn {
    position: absolute;
    top: 0;
    right: 0;
    line-height: 1em;
    padding: 1em;
    background: transparent;
    user-select: none;
}

.dialog {
    width: inherit;
    max-height: inherit;
    display: flex;
    flex-direction: column;
    align-items: stretch;
}

.title {
    text-align: center;
}

.content {
    flex: 1;
    overflow-y: auto;
    padding: 0.8rem;
}
</style>