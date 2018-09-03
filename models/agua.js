'use strict';
const models = require('../models');

module.exports = (sequelize, DataTypes) => {
    const agua = sequelize.define('agua', {
        valor: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });

    return agua;
};