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
  <div>
    <float-row class="table-actions">
      <refresh-button slot="left" :fetching="awaitingResponse"
        @refresh="fetchData({ clear: false })"/>
      <button id="field-key-list-new-button" slot="right" type="button"
        class="btn btn-primary" @click="newFieldKey.state = true">
        <span class="icon-plus-circle"></span> Create app user
      </button>
    </float-row>
    <loading v-if="fieldKeys == null" :state="awaitingResponse"/>
    <p v-else-if="fieldKeys.length === 0">
      There are no app users yet. You will need to create some to download forms
      and submit data from your device.
    </p>
    <table v-else id="field-key-list-table" class="table">
      <thead>
        <tr>
          <th>Nickname</th>
          <th>Created</th>
          <th>Last Used</th>
          <th>Configure Client</th>
          <th class="field-key-list-actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        <field-key-row v-for="fieldKey of fieldKeys" :key="fieldKey.key"
          :field-key="fieldKey" :highlighted="highlighted"
          @show-code="showPopover" @revoke="showRevoke"/>
      </tbody>
    </table>

    <field-key-new v-bind="newFieldKey" @hide="newFieldKey.state = false"
      @success="afterCreate"/>
    <field-key-revoke v-bind="revoke" @hide="revoke.state = false"
      @success="afterRevoke"/>
  </div>
</template>

<script>
import FieldKey from '../../presenters/field-key';
import FieldKeyNew from './new.vue';
import FieldKeyRevoke from './revoke.vue';
import FieldKeyRow from './row.vue';
import modal from '../../mixins/modal';
import request from '../../mixins/request';

const POPOVER_CONTENT_TEMPLATE = `
  <div id="field-key-list-popover-content">
    <div class="field-key-list-img-container"></div>
    <div>
      <a href="https://docs.opendatakit.org/collect-import-export/" target="_blank">
        What’s this?
      </a>
    </div>
  </div>
`;

export default {
  name: 'FieldKeyList',
  components: { FieldKeyRow, FieldKeyNew, FieldKeyRevoke },
  mixins: [
    request(),
    modal(['newFieldKey', 'revoke'])
  ],
  data() {
    return {
      requestId: null,
      fieldKeys: null,
      highlighted: null,
      enabledPopoverLinks: new Set(),
      // The <a> element whose popover is currently shown.
      popoverLink: null,
      newFieldKey: {
        state: false
      },
      revoke: {
        state: false,
        fieldKey: {
          displayName: ''
        }
      }
    };
  },
  created() {
    this.fetchData({ clear: false });
  },
  activated() {
    $('body').on('click.app-field-key-list', this.hidePopoverAfterClickOutside);
  },
  deactivated() {
    this.hidePopover();
    $('body').off('click.app-field-key-list', this.hidePopoverAfterClickOutside);
  },
  methods: {
    fetchData({ clear }) {
      if (clear) this.fieldKeys = null;
      const headers = { 'X-Extended-Metadata': 'true' };
      this
        .get('/field-keys', { headers })
        .then(({ data }) => {
          this.fieldKeys = data.map(fieldKey => new FieldKey(fieldKey));
          this.enabledPopoverLinks = new Set();
          if (!clear) this.highlighted = null;
        })
        .catch(() => {});
    },
    hidePopover() {
      if (this.popoverLink == null) return;
      $(this.popoverLink).popover('hide');
      this.popoverLink = null;
    },
    // Hides the popover upon a click outside the popover and outside a popover
    // link.
    hidePopoverAfterClickOutside(event) {
      if (this.popoverLink == null) return;
      const popover = $('#field-key-list-popover-content').closest('.popover')[0];
      if (event.target === popover || $.contains(popover, event.target))
        return;
      // If the target is a different popover link from the one whose popover is
      // currently shown, showPopover() will hide the popover: we do not need to
      // do so here.
      if ($(event.target).closest('.field-key-row-popover-link').length !== 0)
        return;
      this.hidePopover();
    },
    popoverContent(fieldKey) {
      const $content = $(POPOVER_CONTENT_TEMPLATE);
      $content
        .find('.field-key-list-img-container')
        .append(fieldKey.qrCodeHtml());
      return $content[0].outerHTML;
    },
    enablePopover(fieldKey, $popoverLink) {
      if (this.enabledPopoverLinks.has(fieldKey.id)) return;
      $popoverLink.popover({
        animation: false,
        container: 'body',
        trigger: 'manual',
        placement: 'left',
        content: this.popoverContent(fieldKey),
        html: true
      });
      this.enabledPopoverLinks.add(fieldKey.id);
    },
    showPopover(fieldKey, popoverLink) {
      if (popoverLink === this.popoverLink) return;
      this.hidePopover();
      const $popoverLink = $(popoverLink);
      this.enablePopover(fieldKey, $popoverLink);
      $popoverLink.popover('show');
      this.popoverLink = popoverLink;
    },
    showRevoke(fieldKey) {
      this.revoke.fieldKey = fieldKey;
      this.revoke.state = true;
    },
    afterCreate(fieldKey) {
      this.fetchData({ clear: true });
      this.$alert().success(`The app user “${fieldKey.displayName}” was created successfully.`);
      this.highlighted = fieldKey.id;
    },
    afterRevoke() {
      this.fetchData({ clear: true });
      this.$alert().success(`Access was revoked for the app user “${this.revoke.fieldKey.displayName}.”`);
      this.highlighted = null;
    }
  }
};
</script>

<style lang="sass">
@import '../../../assets/scss/variables';

// 8px is the Bootstrap default.
$padding-left-actions: 8px;
$padding-right-actions: 23px;
$width-dropdown: 44px;
$width-dropdown-toggle: 42px;

#field-key-list-table {
  th, td {
    &.field-key-list-actions {
      padding-left: $padding-left-actions;
      padding-right: $padding-right-actions;
      // Setting the width so that the .dropdown-menu-right is correctly
      // aligned.
      width: $width-dropdown + $padding-left-actions + $padding-right-actions;

      .dropdown-menu-right {
        margin-right: $width-dropdown - $width-dropdown-toggle;
      }
    }
  }

  td {
    vertical-align: middle;
  }
}

#field-key-list-popover-content {
  padding: 3px;

  .field-key-list-img-container {
    border: 3px solid $color-subpanel-border;
    margin-bottom: 3px;
  }

  a {
    color: white;
  }
}
</style>
