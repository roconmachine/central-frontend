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
import UserList from '../../../lib/components/user/list.vue';
import UserResetPassword from '../../../lib/components/user/reset-password.vue';
import testData from '../../data';
import { mockHttp, mockRoute } from '../../http';
import { mockLogin } from '../../session';
import { trigger } from '../../util';

const openModal = (wrapper) =>
  trigger.click(wrapper.first('#user-list-table .dropdown-menu a'))
    .then(() => wrapper);
const confirmResetPassword = (wrapper) =>
  trigger.click(wrapper.first('#user-reset-password-button'))
    .then(() => wrapper);

describe('UserResetPassword', () => {
  beforeEach(mockLogin);

  describe('modal', () => {
    it('is initially hidden', () =>
      mockHttp()
        .mount(UserList)
        .respondWithData(() => testData.administrators.sorted())
        .afterResponse(page => {
          page.first(UserResetPassword).getProp('state').should.be.false();
        }));

    it('opens after button click', () =>
      mockHttp()
        .mount(UserList)
        .respondWithData(() => testData.administrators.sorted())
        .afterResponse(openModal)
        .then(page => {
          page.first(UserResetPassword).getProp('state').should.be.true();
        }));
  });

  it('standard button thinking things', () => {
    const propsData = { user: testData.administrators.first() };
    return mockHttp()
      .mount(UserResetPassword, { propsData })
      .request(confirmResetPassword)
      .standardButton('#user-reset-password-button');
  });

  describe('after successful response', () => {
    let app;
    beforeEach(() => mockRoute('/users')
      .respondWithData(() => testData.administrators.sorted())
      .afterResponse(component => {
        app = component;
      })
      .request(() => openModal(app).then(confirmResetPassword))
      .respondWithSuccess());

    it('modal hides', () => {
      app.first(UserResetPassword).getProp('state').should.be.false();
    });

    it('success message is shown', () => {
      app.should.alert('success');
    });
  });
});
