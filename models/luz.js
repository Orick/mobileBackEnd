'use strict';
const models = require('../models');

module.exports = (sequelize, DataTypes) => {
    const luz = sequelize.define('luz', {
        valor: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    });

    return luz;
};