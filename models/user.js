'use strict';
const models = require('../models');

module.exports = (sequelize, DataTypes) => {
    const user = sequelize.define('user', {
        token: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        }
    });
    user.associate =  (models) => {
        user.hasMany(models.macetero, {
            foreignKey: 'idMacetero',
            sourceKey: 'token'
        });
    };
    return user;
};
