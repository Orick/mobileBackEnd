'use strict';
const models = require('../models');

module.exports = (sequelize, DataTypes) => {
    const sensores = sequelize.define('sensores', {
        humedad: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        luz: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        agua: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        estadoHumedad:{
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        estadoLuz:{
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        estadoAgua:{
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    });

    return sensores;
};