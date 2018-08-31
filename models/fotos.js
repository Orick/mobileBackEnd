'use strict';
const models = require('../models');

module.exports = (sequelize, DataTypes) => {
    const fotos = sequelize.define('fotos', {
        imagen: {
            type: DataTypes.BLOB,
            allowNull: false,
        }
    });

    return fotos;
};