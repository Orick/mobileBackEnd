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

        // macetero.hasMany(models.agua, {
        //     as: 'maceteroAgua'
        // });

        // macetero.hasMany(models.humedad, {
        //     as: 'maceteroHumedad'
        // });

        // macetero.hasMany(models.luz, {
        //     as: 'maceteroLuz'
        // });

        macetero.hasMany(models.plantaAsignada, {
            as: 'maceteroPlanta'
        });
    };
    return macetero;
};
