'use strict';
const models = require('../models');

module.exports = (sequelize, DataTypes) => {
    const macetero = sequelize.define('macetero', {
        idMacetero: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        nombrePlanta:{
            type: DataTypes.STRING,
            allowNull: false
        },
        nombreRed:{
            type: DataTypes.STRING,
            allowNull: false
        },
        passRed:{
            type: DataTypes.STRING,
            allowNull: false
        },
        estado:{
            type: DataTypes.STRING,
            allowNull: false
        },
        ip:{
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    // macetero.associate =  (models) => {
    //     user.BelongsTo(models.summoner, {
    //         through: 'associateUser',
    //         as : 'user',
    //         unique: true
    //     });
    // };
    return macetero;
};
