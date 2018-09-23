'use strict';
const models = require('../models');

module.exports = (sequelize, DataTypes) => {
    const planta = sequelize.define('planta', {
        tipoPlanta: {
            type: DataTypes.STRING,
            allowNull: false
        },
        humedadOptima:{
            type: DataTypes.FLOAT,
            allowNull: false
        },
        humedadMinima:{
            type: DataTypes.FLOAT,
            allowNull: false
        },
        luzOptima:{
            type: DataTypes.FLOAT,
            allowNull: false
        },
        luzMinima:{
            type: DataTypes.FLOAT,
            allowNull: false
        }
    });
    // planta.associate =  (models) => {
    //     planta.hasMany(models.plantaAsignada, {
    //         as: 'asignadaPlantaX',
    //         through: 'asignadaPlanta'
    //     });
    // };

    return planta;
};