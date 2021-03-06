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
  <div :class="{ spinner: true, active: state }">
    <div class="spinner-glyph"></div>
  </div>
</template>

<script>
export default {
  name: 'Spinner',
  props: {
    state: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="sass">
@import '../../assets/scss/variables';

$spinner-size: 16px;
$spinner-width: 3px;

@keyframes spin {
  from { transform: rotateZ(0deg); }
  to { transform: rotateZ(360deg); }
}

.spinner {
  $adjusted-position: calc(50% - (#{$spinner-size} / 2));
  display: block;
  left: $adjusted-position;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  top: $adjusted-position;
  transition: 0.3s opacity;

  &.active {
    animation-duration: 0.6s;
    animation-iteration-count: infinite;
    animation-name: spin;
    animation-timing-function: linear;
    opacity: 1;
    transition-delay: 0.15s;
  }
}
.spinner-glyph {
  height: $spinner-size;
  width: $spinner-size;

  &:before {
    border: $spinner-width solid #fff;
    border-radius: 999px;
    content: '';
    display: block;
    height: $spinner-size;
    width: $spinner-size;

    .btn-primary & {
      box-shadow: 0 0 20px 10px $color-action-background,
                  0 0 6px 3px $color-action-background inset;
    }

    .btn-secondary & {
      box-shadow: 0 0 20px 10px $color-action-background,
                  0 0 6px 3px $color-action-background inset;
    }

    .btn-danger & {
      box-shadow: 0 0 20px 10px $color-danger,
                  0 0 6px 3px $color-danger inset;
    }
  }

  &:after {
    border: 2px solid transparent;
    border-radius: 50%;
    content: '';
    display: block;
    left: ($spinner-size / 2) - ($spinner-width / 2);
    height: $spinner-width;
    position: absolute;
    top: 0;
    transform: rotate(45deg);
    width: $spinner-width;

    .btn-primary & {
      border-right-color: $color-action-background;
      border-top-color: $color-action-background;
    }

    .btn-secondary & {
      border-right-color: $color-action-background;
      border-top-color: $color-action-background;
    }

    .btn-danger & {
      border-right-color: $color-danger;
      border-top-color: $color-danger;
    }
  }
}
</style>
