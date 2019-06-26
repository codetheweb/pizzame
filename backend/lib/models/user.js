/* eslint-disable new-cap */
module.exports = (sequelize, type) => {
  return sequelize.define('user', {
    discordId: {
      type: type.STRING,
      primaryKey: true
    },
    accessToken: type.STRING(800),
    orderId: type.INTEGER,
    storeId: type.INTEGER,
    isOrderInProgress: {
      type: type.BOOLEAN,
      defaultValue: false
    },
    isLinked: {
      type: type.BOOLEAN,
      defaultValue: false
    },
    linkToken: type.UUID
  });
};
