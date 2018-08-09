/*
Copyright 2017 ODK Central Developers
See the NOTICE file at the top-level directory of this distribution and at
https://github.com/opendatakit/central-frontend/blob/master/NOTICE.

This file is part of ODK Central. It is subject to the license terms in
the LICENSE file found in the top-level directory of this distribution and at
https://www.apache.org/licenses/LICENSE-2.0. No part of ODK Central,
including this file, may be copied, modified, propagated, or distributed
except according to the terms contained in the LICENSE file.
*/
import Base from './base';

const props = [
  'xmlFormId',
  'name',
  'version',
  'xml',
  'hash',
  'state',
  'createdBy',
  'createdAt',
  'updatedAt',
  // Extended metadata
  'submissions',
  'lastSubmission'
];

export default class Form extends Base(props) {
  constructor(data) {
    super();
    this._data = data;
  }

  nameOrId() { return this.name != null ? this.name : this.xmlFormId; }

  updatedOrCreatedAt() {
    return this.updatedAt != null ? this.updatedAt : this.createdAt;
  }
}