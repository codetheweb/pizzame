/* eslint-disable camelcase */

const got = require('got');

const login = async ({email, password}) => {
  const params = {
    scope: 'customer:card:read customer:profile:read:extended customer:orderHistory:read customer:card:update customer:profile:read:basic customer:loyalty:read customer:orderHistory:update customer:card:create customer:loyaltyHistory:read order:place:cardOnFile customer:card:delete customer:orderHistory:create customer:profile:update',
    grant_type: 'password',
    validator_id: 'VoldemortCredValidatorCustID',
    username: email,
    password,
    client_id: 'iOS-rm'
  };

  const res = await got.post('https://api.dominos.com/as/token.oauth2', {form: true, body: params});

  return JSON.parse(res.body);
};

module.exports = {login};
