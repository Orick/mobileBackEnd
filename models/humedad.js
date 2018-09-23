'use strict';
const models = require('../models');

module.exports = (sequelize, DataTypes) => {
    const humedad = sequelize.define('humedad', {
        valor: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    });

    return humedad;
};