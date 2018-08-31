'use strict';
const models = require('../models');

module.exports = (sequelize, DataTypes) => {
    const luz = sequelize.define('luz', {
        valor: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        descripcion:{
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    return luz;
};