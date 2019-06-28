const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgresql'
  });

const orderToEnglish = order => {
  let description = '';

  order.order.Products.forEach(product => {
    description += ' - ' + product.name;

    if (product.descriptions[0] && product.descriptions[0].value) {
      description += ' with ' + product.descriptions[0].value;
    }

    description += '\n';
  });

  description += '\n';

  if (order.order.ServiceMethod === 'Delivery') {
    description += `**Delivering** to your address starting with **${order.order.Address.StreetNumber}**, `;
  } else {
    description += `Ordering **carryout** from the store at ${order.store.address.Street}, `;
  }

  description += `paying **$${order.order.Amounts.Payment}** with your ${order.order.Payments[0].CardType}.\n`;

  description += `Ready in **${order.order.EstimatedWaitMinutes}** minutes.`;

  return description;
};

module.exports = {db: sequelize, orderToEnglish};
