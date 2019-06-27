/* eslint-disable camelcase */
const got = require('got');
const jwt = require('jsonwebtoken');

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

const getEasyOrders = async ({accessToken}) => {
  const {CustomerID} = jwt.decode(accessToken);

  const res = await got.get(`https://order.dominos.com/power/customer/${CustomerID}/order`, {
    query: {
      limit: 5,
      lang: 'en'
    },
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    json: true
  });

  const easyOrders = [];

  res.body.customerOrders.forEach(order => {
    if (order.easyOrder) {
      easyOrders.push(order);
    }
  });

  return easyOrders;
};

const getOrderStatus = async ({phoneNumber}) => {
  const res = await got('https://tracker.dominos.com/tracker-presentation-service/v2/orders', {
    query: {
      phonenumber: phoneNumber,
      _: new Date().getTime()
    },
    headers: {
      'DPZ-MARKET': 'UNITED_STATES',
      'DPZ-LANGUAGE': 'en'
    },
    json: true
  });

  return res.body;
};

module.exports = {login, getEasyOrders, getOrderStatus};
