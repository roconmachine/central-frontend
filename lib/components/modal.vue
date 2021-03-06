<!--
Copyright 2017 ODK Central Developers
See the NOTICE file at the top-level directory of this distribution and at
https://github.com/opendatakit/central-frontend/blob/master/NOTICE.

This file is part of ODK Central. It is subject to the license terms in
the LICENSE file found in the top-level directory of this distribution and at
https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
including this file, may be copied, modified, propagated, or distributed
except according to the terms contained in the LICENSE file.
-->
<template>
  <div ref="modal" :aria-labelledby="titleId" :data-backdrop="bsBackdrop"
    class="modal" tabindex="-1" role="dialog"
    data-keyboard="false" @keydown.esc="hideIfCan"
    @mousedown="modalMousedown" @click="modalClick">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button :disabled="!hideable" type="button" class="close"
            aria-label="Close" @click="hideIfCan">
            <span aria-hidden="true">&times;</span>
          </button>
          <h4 :id="titleId" class="modal-title"><slot name="title"></slot></h4>
        </div>
        <div class="modal-body">
          <alert v-bind="alert" @close="alert.state = false"/>
          <slot name="body"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { blankAlert, hideAncestorAlerts } from '../alert';

export default {
  name: 'Modal',
  props: {
    state: {
      type: Boolean,
      default: false
    },
    backdrop: {
      type: Boolean,
      default: false
    },
    // Indicates whether the user is able to hide the modal by clicking ×,
    // pressing escape, or clicking outside the modal.
    hideable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const id = this.$uniqueId();
    return {
      titleId: `modal-title${id}`,
      alert: blankAlert(),
      mousedownOutsideDialog: false
    };
  },
  computed: {
    bsBackdrop() {
      // We use 'static' rather than 'true', because using 'true' would make it
      // possible for the modal to hide without communicating that change to its
      // parent component. See toggle() for more details.
      return this.backdrop ? 'static' : 'false';
    }
  },
  watch: {
    state(newState) {
      if (newState) hideAncestorAlerts(this);
      this.toggle(newState);
    }
  },
  mounted() {
    $(this.$refs.modal)
      .on('shown.bs.modal', () => this.$emit('shown'))
      .on('hidden.bs.modal', () => this.$emit('hidden'));
    if (this.state) this.toggle(this.state);
  },
  updated() {
    // Wait a tick so that all child components are re-rendered:
    // https://vuejs.org/v2/api/#updated.
    this.$nextTick(this.refocus);
  },
  beforeDestroy() {
    this.toggle(false);
    $(this.$refs.modal).off();
  },
  methods: {
    /* toggle() manually toggles the modal. It is the only way the modal is
    shown or hidden: we do not use Bootstrap's listeners to toggle the modal. If
    we used Bootstrap's listeners to do so, the modal would hide without
    communicating the change to its parent component -- adding complexity to the
    communication between the modal and its parent. Foregoing those listeners
    also aids modularity, because parent components can use this modal component
    without knowing that it uses Bootstrap. */
    toggle(state) {
      // For tests in which the component is not attached to the document, we
      // return immediately rather than calling modal(), because it has side
      // effects on the document.
      if ($(this.$refs.modal).closest('body').length === 0) return;
      $(this.$refs.modal).modal(state ? 'show' : 'hide');
    },
    hideIfCan() {
      if (this.hideable) this.$emit('hide');
    },
    modalMousedown(event) {
      this.mousedownOutsideDialog = event.target === event.currentTarget;
    },
    modalClick(event) {
      const mouseupOutsideDialog = event.target === event.currentTarget;
      if (this.mousedownOutsideDialog && mouseupOutsideDialog) this.hideIfCan();
    },
    // Refocuses the modal if it has lost focus. This is needed so that the
    // escape key still hides the modal.
    refocus() {
      // Do not focus the modal if it has lost focus because it is hidden.
      if (!this.state) return;
      // Do not focus the modal if it contains the active element.
      if (document.activeElement != null &&
        $(document.activeElement).closest('.modal')[0] === this.$refs.modal)
        return;
      this.$refs.modal.focus();
    }
  }
};
</script>

<style lang="sass">
@import '../../assets/scss/variables';

.modal-dialog {
  margin-top: 20vh;

  .modal-content {
    border: none;
    border-radius: 0;
    box-shadow: 0 0 24px rgba(0, 0, 0, 0.25), 0 35px 115px rgba(0, 0, 0, 0.28);

    .modal-header {
      background-color: $color-accent-primary;
      color: #fff;
      padding: 10px 15px 9px;

      .close {
        color: #fff;
        font-weight: normal;
        margin-top: 0;
        opacity: 1;

        &[disabled] {
          cursor: not-allowed;
        }
      }

      h4 {
        font-size: 18px;
        font-weight: bold;
        letter-spacing: -0.02em;
      }
    }

    .modal-body {
      padding: $padding-modal-body;

      .modal-introduction {
        font-size: 14px;
        line-height: 1.2em;
        margin-bottom: 18px;
      }

      .modal-actions {
        background: $color-subpanel-background;
        border-top: 1px solid $color-subpanel-border;
        margin: -15px;
        margin-top: 20px;
        padding: 10px 15px;
      }
    }
  }
}
</style>
