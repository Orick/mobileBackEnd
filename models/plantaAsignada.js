'use strict';
const models = require('../models');

module.exports = (sequelize, DataTypes) => {
    const plantaAsignada = sequelize.define('plantaAsignada', {
        fechaFin: {
            type: DataTypes.DATE,
            allowNull: true
        }
    });



    return plantaAsignada;
};