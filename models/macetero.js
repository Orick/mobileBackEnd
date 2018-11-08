'use strict';
const models = require('../models');

module.exports = (sequelize, DataTypes) => {
    const macetero = sequelize.define('macetero', {
        idMacetero: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        nombreRed:{
            type: DataTypes.STRING,
            allowNull: false
        },
        passRed:{
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    macetero.associate =  (models) => {

        macetero.hasMany(models.sensores, {
            as: 'maceteroSensores'
        });

        macetero.hasMany(models.fotos, {
            as: 'maceteroFotos'
        });

        macetero.hasMany(models.plantaAsignada, {
            as: 'maceteroPlanta'
        });
    };
    return macetero;
};
