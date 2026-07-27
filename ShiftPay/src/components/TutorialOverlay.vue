<script lang="ts">
import { useShiftsStore } from '@/stores/shiftsStore';
import Shift from '@/models/Shift';
import Duration from '@/models/Duration';
export interface TutorialStep {
  /** CSS selector for the target element to spotlight (null = full-screen overlay only) */
  target: string | null;
  /** Main instruction text */
  message: string;
  /** Sub-text shown below the message */
  subText?: string;
  /** Tooltip position preference */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** Whether to advance once the target input has a non-empty value (handles programmatic fills like ComboBox selection) */
  waitForFill?: boolean;
  /** Whether this step targets an element inside the main menu (which may be closed) */
  /** Cannot be selected if the main menu is closed */
  inMainMenu?: boolean;
}

const STEPS: TutorialStep[] = [
  // Step 0: Welcome
  {
    target: null,
    message: 'Welcome to ShiftPay! 👋',
    subText: "<b>ShiftPay</b> is a simple shift-tracking app that helps you log your work hours, calculate earnings, and keep everything organised.",
    position: 'center'
  },
  // Step 1: Calendar
  {
    target: '#week-schedule',
    message: 'This is your calendar',
    subText: 'Days with shifts are highlighted. The column on the right shows your earnings and hours.',
    position: 'bottom'
  },
  // Step 2: Add Shift button (info-only)
  {
    target: '#add-btn',
    message: 'Add your first shift',
    subText: 'Select here to open the shift form.',
    position: 'top'
  },
  // Step 3: Job details (inside dialog)
  {
    target: '#job-details',
    message: 'Job details',
    subText: 'Enter your workplace and pay rate here.',
    position: 'top'
  },
  // Step 4: Start/End time (inside dialog)
  {
    target: '#schedule',
    message: 'Set your shift times',
    subText: 'Adjust the start and end time for your shift.',
    position: 'top',
  },
  // Step 5: Submit button (info-only)
  {
    target: '#add-shift-btn',
    message: 'Save your shift',
    subText: 'Add other information and select the button to add your shift.',
    position: 'top',
  },
  // Step 6: View the shift card
  {
    target: '#shift-list .shift:first-child',
    message: 'Sample shift card',
    subText:
      'This is sample data for the tutorial.<br>The card shows shift start/end times, workplace, working hours (excluding breaks), and total income.',
    position: 'top'
  },
  // Step 6: Select to expand
  {
    target: '#shift-list .shift:first-child .info',
    message: 'Open your shift',
    subText:
      'Select the card to see pay rate, breaks, total duration, and options to edit or delete the shift.',
    position: 'top'
  },
  // Step 7: Edit button
  {
    target: '#shift-list .shift:first-child .info .actions .edit-btn',
    message: 'Edit or delete your shift',
    subText: 'Use the Edit button to update shift details or delete the shift.',
    position: 'top'
  },
  // Step 8: Week stats
  {
    target: '.weekly.stats, .monthly.stats',
    message: 'Your weekly earnings',
    subText: 'Earnings and hours for each week are shown here.',
    position: 'left'
  },
  // Step 9: Calendar overview
  {
    target: '.calendar',
    message: 'Your calendar',
    subText: 'The selected range is highlighted.',
    position: 'bottom'
  },
  // Step 10: Day schedule
  {
    target: '#day-schedule',
    message: 'Day schedule',
    subText: 'This section shows all shifts for the selected day, week or month.',
    position: 'top'
  },
  // Step 11: Open main menu (closing step 1) - always shown even after skip
  {
    target: '.menu-btn',
    message: 'Open the menu',
    subText:
      'Select here to open the menu. From here you can log in to sync your data across devices, replay this tutorial, and more.',
    position: 'bottom'
  },
  // Step 12: Login button
  {
    target: '.main-menu #menu-login-btn',
    message: 'Sync your data (Under testing)',
    subText: 'Log in to back up your shifts and access them from any device.',
    position: 'bottom',
    inMainMenu: true
  },
  // Step 13: Tutorial button
  {
    target: '.main-menu #menu-tutorial-btn',
    message: 'Replay this tutorial',
    subText: 'You can revisit this guide anytime from here.',
    position: 'bottom',
    inMainMenu: true
  },
  // Step 14: Completion
  {
    target: null,
    message: "You're all set!",
    subText: 'Start tracking your shifts and earnings. <br>Happy working! 🎉',
    position: 'center'
  }
];

export default {
  data() {
    return {
      active: false,
      currentStepIndex: 0,
      spotlightRect: null as DOMRect | null,
      tooltipStyle: {} as Record<string, string>,
      resizeObserver: null as ResizeObserver | null,
      pollTimer: null as ReturnType<typeof setInterval> | null,
      advanceTimer: null as ReturnType<typeof setTimeout> | null,
      eventCleanup: null as (() => void) | null,
      // Track demo shifts added for the tutorial so we can remove them later
      demoShiftIds: [] as string[],
      demoInjected: false,
      dialogOpening: null as HTMLDialogElement | null,
    };
  },

  computed: {
    steps(): TutorialStep[] {
      return STEPS;
    },

    currentStep(): TutorialStep {
      return this.steps[this.currentStepIndex];
    },

    isCenterOverlay(): boolean {
      return !this.currentStep.target || this.currentStep.position === 'center';
    },

    isLastStep(): boolean {
      return this.currentStepIndex === this.steps.length - 1;
    },

    showSkip(): boolean {
      // Jump to the tutorial button step (first closing step with target '#menu-tutorial-btn')
      const tutorialStepIndex = this.steps.findIndex((s: TutorialStep) => s.target?.includes('#menu-tutorial-btn'));
      return this.currentStepIndex < tutorialStepIndex;
    },

    spotlightOverlayStyle(): Record<string, string> {
      if (!this.spotlightRect) return {};
      const r = this.spotlightRect;
      const pad = 8;
      return {
        top: `${r.top - pad}px`,
        left: `${r.left - pad}px`,
        width: `${r.width + pad * 2}px`,
        height: `${r.height + pad * 2}px`,
        borderRadius: '8px'
      };
    }
  },

  methods: {
    isTargetInDialog(step: TutorialStep): boolean {
      if (!step.target) return false;
      const targetEl = document.querySelector(step.target);
      if (!targetEl) return false;
      const dialog = targetEl.closest('dialog');
      return !!dialog;
    },

    async ensureElementOpen(step: TutorialStep) {
      if (!step.target) return;

      if (step.inMainMenu) {
        const menuBtn = document.querySelector('.menu-btn:not(.open)') as HTMLElement | null;
        console.log('Menu button found:', menuBtn);
        menuBtn?.click();
        await this.$nextTick();
      }

      console.log('step.target:', step.target);

      const target = document.querySelector(step.target);
      if (!target) return;

      console.log('Target element found:', target);

      const details = target.closest('details');
      if (details) details.open = true;

      const dialog = target.closest('dialog');
      if (!dialog) {
        console.log('No dialog found for target:', step.target);
        this.dialogOpening?.close();
        this.dialogOpening = null;
      } else
        // Only open if it's not already the currently opened dialog 
        if (this.dialogOpening !== dialog) {
          console.log('Opening dialog for tutorial step:', dialog);

          this.dialogOpening = dialog;
          dialog.showModal();

          // Display the tutorial dialog on top of the opened dialog
          (this.$refs['tutorial-dialog'] as HTMLDialogElement | null)?.close();
          this.$nextTick(() => {
            (this.$refs['tutorial-dialog'] as HTMLDialogElement | null)?.showModal();
          });
        }
    },

    start() {
      this.currentStepIndex = 0;
      this.active = true;
      // Inject demo shifts for the tutorial preview (local-only)
      this.injectDemoShifts();
      this.$nextTick(() => this.setupStep());
    },

    advance() {
      this.cleanupStep();
      if (this.currentStepIndex < this.steps.length - 1) {
        this.currentStepIndex++;
        this.$nextTick(() => this.setupStep());
      } else {
        this.finish();
      }
    },

    skip() {
      this.cleanupStep();
      // Jump to the tutorial button step (first closing step with target '#menu-tutorial-btn')
      const tutorialStepIndex = this.steps.findIndex((s: TutorialStep) => s.target?.includes('#menu-tutorial-btn'));
      if (tutorialStepIndex >= 0) {
        this.currentStepIndex = tutorialStepIndex;
        this.$nextTick(() => this.setupStep());
      } else {
        this.finish();
      }
    },

    finish() {
      this.cleanupStep();
      // Remove demo shifts when tutorial completes
      try {
        this.removeDemoShifts();
      } catch (e) {
        console.error('Failed to remove demo shifts', e);
      }
      this.active = false;
      localStorage.setItem('tutorialCompleted', 'true');
    },

    /** Add temporary demo shifts to the local store for the tutorial. */
    injectDemoShifts() {
      if (this.demoInjected) return;
      try {
        const shiftsStore = useShiftsStore();

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const demo1 = new Shift({
          id: `tutorial-demo-1`,
          workplace: 'Demo Café',
          payRate: 18,
          startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
          endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0),
          unpaidBreaks: [
            new Duration({
              minutes: 30
            })
          ]
        });

        const demo2 = new Shift({
          id: `tutorial-demo-2`,
          workplace: 'Demo Office',
          payRate: 22,
          startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
          endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 30)
        });

        // Directly push to local store state to avoid API calls
        shiftsStore.shifts.push(demo1, demo2);
        this.demoShiftIds = [demo1.id, demo2.id];
        this.demoInjected = true;
      } catch (err) {
        console.error('Error injecting demo shifts for tutorial:', err);
      }
    },

    /** Remove temporary demo shifts that were added for the tutorial. */
    removeDemoShifts() {
      if (!this.demoInjected || !this.demoShiftIds.length) return;
      try {
        const shiftsStore = useShiftsStore();
        shiftsStore.shifts = shiftsStore.shifts.filter((s) => !this.demoShiftIds.includes(s.id));
        this.demoShiftIds = [];
        this.demoInjected = false;
      } catch (err) {
        console.error('Error removing demo shifts:', err);
      }
    },

    setupStep() {
      const step = this.currentStep;

      this.ensureElementOpen(step);

      if (!step.target) {
        this.spotlightRect = null;
        this.positionTooltipCenter();
        return;
      }

      // Poll for element appearance (handles dialogs opening, elements rendering)
      this.pollForTarget(step.target, (elements) => {
        elements[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const rect = this.getCombinedRect(elements);
        this.updateSpotlight(rect);
        this.positionTooltip(rect);
        // Constantly update for the first 0.5s to handle transitions
        const updateInterval = setInterval(() => this.handleChanges(), 10);
        setTimeout(() => clearInterval(updateInterval), 500);
        this.observeChanges(elements);
        this.attachEvent(step, elements);
      });
    },

    pollForTarget(selector: string, callback: (elements: Element[]) => void) {
      const tryFind = (): Element[] | null => {
        const els = Array.from(document.querySelectorAll(selector));
        if (els.length === 0) return null;
        return els;
      };

      // Try immediately
      const els = tryFind();
      if (els) {
        callback(els);
        return;
      }

      // Poll every 100ms for up to 5 seconds
      let attempts = 0;
      this.pollTimer = setInterval(() => {
        attempts++;
        const targets = tryFind();
        if (targets) {
          clearInterval(this.pollTimer!);
          this.pollTimer = null;
          callback(targets);
        } else if (attempts > 50) {
          clearInterval(this.pollTimer!);
          this.pollTimer = null;
          // Element not found — skip this step
          this.advance();
        }
      }, 100);
    },

    getCombinedRect(elements: Element[]): DOMRect {
      const rects = elements.map((el) => el.getBoundingClientRect());
      const top = Math.min(...rects.map((r) => r.top));
      const left = Math.min(...rects.map((r) => r.left));
      const bottom = Math.max(...rects.map((r) => r.bottom));
      const right = Math.max(...rects.map((r) => r.right));
      return new DOMRect(left, top, right - left, bottom - top);
    },

    updateSpotlight(rect: DOMRect) {
      this.spotlightRect = rect;
    },

    positionTooltip(rect: DOMRect) {
      const step = this.currentStep;
      const pad = 16;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const preferredPosition = step.position || 'bottom';

      const provisionalStyle: Record<string, string> = {
        position: 'fixed',
        visibility: 'hidden',
        top: '0px',
        left: '0px'
      };

      this.tooltipStyle = provisionalStyle;

      const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));
      const fallbackPositions = ['bottom', 'top', 'right', 'left'] as const;
      const candidates = [preferredPosition, ...fallbackPositions.filter((position) => position !== preferredPosition)];

      this.$nextTick(() => {
        const tooltip = document.querySelector('.tutorial-tooltip') as HTMLElement | null;
        if (!tooltip) return;

        const tr = tooltip.getBoundingClientRect();
        const tooltipW = tr.width;
        const tooltipH = tr.height;
        const maxWidth = Math.max(0, vw - pad * 2);
        const maxHeight = Math.max(0, vh - pad * 2);
        const fitsVertically = tooltipH <= maxHeight;
        const fitsHorizontally = tooltipW <= maxWidth;

        const placeTooltip = (position: 'top' | 'bottom' | 'left' | 'right' | 'center') => {
          const nextStyle: Record<string, string> = {
            position: 'fixed',
            visibility: 'visible'
          };

          if (!fitsHorizontally) nextStyle.maxWidth = `${maxWidth}px`;
          if (!fitsVertically) {
            nextStyle.maxHeight = `${maxHeight}px`;
            nextStyle.overflowY = 'auto';
          }

          switch (position) {
            case 'top': {
              const top = clamp(rect.top - tooltipH - pad, pad, vh - tooltipH - pad);
              const left = clamp(rect.left + rect.width / 2 - tooltipW / 2, pad, vw - tooltipW - pad);
              nextStyle.top = `${top}px`;
              nextStyle.left = `${left}px`;
              break;
            }
            case 'bottom': {
              const top = clamp(rect.bottom + pad, pad, vh - tooltipH - pad);
              const left = clamp(rect.left + rect.width / 2 - tooltipW / 2, pad, vw - tooltipW - pad);
              nextStyle.top = `${top}px`;
              nextStyle.left = `${left}px`;
              break;
            }
            case 'left': {
              const left = clamp(rect.left - tooltipW - pad, pad, vw - tooltipW - pad);
              const top = clamp(rect.top + rect.height / 2 - tooltipH / 2, pad, vh - tooltipH - pad);
              nextStyle.top = `${top}px`;
              nextStyle.left = `${left}px`;
              break;
            }
            case 'right': {
              const left = clamp(rect.right + pad, pad, vw - tooltipW - pad);
              const top = clamp(rect.top + rect.height / 2 - tooltipH / 2, pad, vh - tooltipH - pad);
              nextStyle.top = `${top}px`;
              nextStyle.left = `${left}px`;
              break;
            }
            case 'center':
              nextStyle.top = `${clamp(vh / 2 - tooltipH / 2, pad, vh - tooltipH - pad)}px`;
              nextStyle.left = `${clamp(vw / 2 - tooltipW / 2, pad, vw - tooltipW - pad)}px`;
              break;
          }

          this.tooltipStyle = nextStyle;
        };

        for (const position of candidates) {
          if (position === 'center') {
            placeTooltip(position);
            return;
          }

          if (position === 'top' && rect.top >= tooltipH + pad) {
            placeTooltip(position);
            return;
          }

          if (position === 'bottom' && vh - rect.bottom >= tooltipH + pad) {
            placeTooltip(position);
            return;
          }

          if (position === 'left' && rect.left >= tooltipW + pad) {
            placeTooltip(position);
            return;
          }

          if (position === 'right' && vw - rect.right >= tooltipW + pad) {
            placeTooltip(position);
            return;
          }
        }

        const bestPosition =
          candidates.find((position) => position === 'top' && rect.top >= tooltipH / 2)
          ?? candidates.find((position) => position === 'bottom' && vh - rect.bottom >= tooltipH / 2)
          ?? candidates.find((position) => position === 'left' && rect.left >= tooltipW / 2)
          ?? candidates.find((position) => position === 'right' && vw - rect.right >= tooltipW / 2)
          ?? 'center';

        placeTooltip(bestPosition);
      });
    },

    positionTooltipCenter() {
      this.tooltipStyle = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    },

    observeChanges(elements: Element[]) {
      // Element Resize
      this.resizeObserver?.disconnect();
      this.resizeObserver = new ResizeObserver(() => {
        const rect = this.getCombinedRect(elements);
        this.updateSpotlight(rect);
        this.positionTooltip(rect);
      });
      for (const el of elements) this.resizeObserver.observe(el);
      this.resizeObserver.observe(document.documentElement);

      // Window Resize
      window.addEventListener('resize', this.handleChanges);

      // Scroll
      window.addEventListener('scroll', this.handleChanges, true);

      // Handle cases where the element is removed from the DOM (e.g. dialog closed)
      const mutationObserver = new MutationObserver(() => {
        for (const el of elements) {
          if (!document.body.contains(el)) {
            mutationObserver.disconnect();
            break;
          }
        }
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    },

    handleChanges() {
      const step = this.currentStep;
      if (!step.target) return;
      const els = Array.from(document.querySelectorAll(step.target));
      if (els.length > 0) {
        const rect = this.getCombinedRect(els);
        this.updateSpotlight(rect);
        this.positionTooltip(rect);
      }
    },

    attachEvent(step: TutorialStep, elements: Element[]) {
      if (step.waitForFill) {
        // Poll the input value — works for both typing and ComboBox dropdown selection
        const input = elements[0] as HTMLInputElement;
        const initialValue = input.value;
        const fillTimer = setInterval(() => {
          if (input.value && input.value !== initialValue) {
            clearInterval(fillTimer);
            this.advanceTimer = setTimeout(() => this.advance(), 150);
          }
        }, 200);
        this.eventCleanup = () => clearInterval(fillTimer);
        return;
      }
    },

    cleanupStep() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
      this.resizeObserver?.disconnect();
      this.resizeObserver = null;
      window.removeEventListener('scroll', this.handleChanges, true);
      window.removeEventListener('resize', this.handleChanges);
      if (this.advanceTimer) {
        clearTimeout(this.advanceTimer);
        this.advanceTimer = null;
      }
      if (this.eventCleanup) {
        this.eventCleanup();
        this.eventCleanup = null;
      }
    }
  },

  beforeUnmount() {
    this.cleanupStep();
    try {
      this.removeDemoShifts();
    } catch {
      /* ignore */
    }
  }
};
</script>

<template>
  <dialog v-if="active" open ref="tutorial-dialog" class="tutorial-dialog">
    <div class="tutorial-overlay">
      <div class="tutorial-backdrop" :class="{ 'tutorial-backdrop--has-spotlight': spotlightRect }">
        <div v-if="spotlightRect" class="tutorial-spotlight" :style="spotlightOverlayStyle">
        </div>
      </div>

      <div class="tutorial-tooltip" :style="tooltipStyle" :class="{ 'tutorial-tooltip--center': isCenterOverlay }">
        <img v-if="currentStepIndex === 0" src="/logo.png" alt="ShiftPay logo" class="tutorial-logo" />

        <h3 class="tutorial-title">{{ currentStep.message }}</h3>
        <p v-if="currentStep.subText" class="tutorial-sub" v-html="currentStep.subText"></p>

        <div class="tutorial-actions">
          <button v-if="showSkip" class="tutorial-btn tutorial-btn--skip" @click="skip">
            Skip
          </button>

          <button v-if="!isLastStep" class="tutorial-btn tutorial-btn--next" @click="advance">
            Next
          </button>

          <button v-if="isLastStep" class="tutorial-btn tutorial-btn--finish" @click="finish">
            Got it!
          </button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.tutorial-dialog {
  position: fixed;
  inset: 0;
  z-index: 10000;
  width: 100vw;
  height: 100dvh;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  overflow: visible;
}

.tutorial-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.tutorial-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 10000;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

/* Hide backdrop background when spotlight is visible (box-shadow handles the darkening) */
.tutorial-backdrop--has-spotlight {
  background: transparent;
}

.tutorial-spotlight {
  position: fixed;
  z-index: 10001;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6);
  pointer-events: none;
  transition: all 0.3s ease;
  background: transparent;
}

.tutorial-tooltip {
  overflow-x: hidden;
  overflow-y: auto;
  position: fixed;
  z-index: 10002;
  width: 300px;
  max-width: calc(100vw - 32px);
  padding: 1.2em 1.4em;
  border-radius: 14px;
  background: var(--popup-background-color, #fff);
  color: var(--text-color, #222);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  pointer-events: auto;
  animation: tooltip-enter var(--transition-duration) ease-out;
}

.tutorial-tooltip--center {
  width: 340px;
  text-align: center;
}

@keyframes tooltip-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tutorial-tooltip--center {
  animation-name: tooltip-center-enter;
}

@keyframes tooltip-center-enter {
  from {
    opacity: 0;
    scale: 0.95;
  }

  to {
    opacity: 1;
    scale: 1;
  }
}

.tutorial-logo {
  display: block;
  width: 72px;
  height: 72px;
  margin: 0 auto 0.6em;
  border-radius: 16px;
}

.tutorial-title {
  margin: 0 0 0.3em;
  font-size: 1.15em;
  font-weight: 700;
}

.tutorial-sub {
  margin: 0 0 1em;
  font-size: 0.9em;
  line-height: 1.45;
  color: var(--text-color-faded, #666);
}

.tutorial-actions {
  display: flex;
  gap: 0.6em;
  justify-content: flex-end;
}

.tutorial-tooltip--center .tutorial-actions {
  justify-content: center;
}

.tutorial-btn {
  padding: 0.5em 1.2em;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9em;
  cursor: pointer;
  transition: opacity 0.15s, background 0.15s;
}

.tutorial-btn:hover {
  opacity: 0.85;
  box-shadow: none;
}

.tutorial-btn--skip {
  background: transparent;
  color: var(--text-color-faded, #888);
}

.tutorial-btn--skip:hover {
  background: var(--hover-overlay, rgba(0, 0, 0, 0.05));
}

.tutorial-btn--next {
  background: var(--primary-color, #47acff);
  color: var(--text-color-black, #000);
}

.tutorial-btn--finish {
  background: var(--success-color, #64ff64);
  color: var(--text-color-black, #000);
}
</style>
