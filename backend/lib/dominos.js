/* eslint-disable camelcase */
const got = require('got');
const jwt = require('jsonwebtoken');
const awsParamStore = require('aws-param-store');

class Dominos {
  constructor(user) {
    this.user = user;
  }

  async login({email, password}) {
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
  }

  async getEasyOrders() {
    return this.authWrapper(async () => {
      const {CustomerID} = jwt.decode(this.user.accessToken);

      if (CustomerID === undefined) {
        const error = new Error();
        error.statusCode = 401;
        throw error;
      }

      const res = await got.get(`https://order.dominos.com/power/customer/${CustomerID}/order`, {
        query: {
          limit: 5,
          lang: 'en'
        },
        headers: {
          Authorization: `Bearer ${this.user.accessToken}`
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
    });
  }

  async getOrderStatus({phoneNumber}) {
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

    const statuses = res.body;

    if (statuses.length === 0) {
      await this.user.update({
        isOrderInProgress: false
      });

      return false;
    }

    // Check if order is finished

    return statuses;
  }

  async placeOrder(order) {
    return this.authWrapper(async () => {
      const res = await got.post('https://order.dominos.com/power/place-order', {
        json: true,
        body: {Order: order},
        headers: {
          Authorization: `Bearer ${this.user.accessToken}`
        }
      });

      await this.user.update({
        phoneNumber: order.order.Phone,
        isOrderInProgress: true
      });

      return res;
    });
  }

  async authWrapper(func) {
    try {
      return await func();
    } catch (error) {
      if (error.statusCode === 401) {
        // Re-auth
        const getEmail = awsParamStore.getParameter(`/user/${this.user.discordId}/email`);
        const getPassword = awsParamStore.getParameter(`/user/${this.user.discordId}/password`);

        const [{Value: email}, {Value: password}] = await Promise.all([getEmail, getPassword]);

        const {access_token} = await this.login({email, password});

        this.user.accessToken = access_token;

        await this.user.update({
          accessToken: access_token
        });

        // Re-run original function
        return func();
      }

      throw error;
    }
  }
}

module.exports = Dominos;
