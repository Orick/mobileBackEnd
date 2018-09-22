'use strict';
const models = require('../models');

module.exports = (sequelize, DataTypes) => {
    const plantaAsignada = sequelize.define('plantaAsignada', {
        fechaFin: {
            type: DataTypes.DATE,
            allowNull: true
        },
        estado:{
            type: DataTypes.STRING,
            allowNull: false
        },
        nombrePlanta:{
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    plantaAsignada.associate =  (models) => {
        plantaAsignada.hasMany(models.fotos, {
            as: 'asignadaFoto'
        });

        // plantaAsignada.hasMany(models.notificaciones, {
        //      as: 'asignadaNotificaciones'
        // });
        plantaAsignada.belongsToMany(models.planta, {
            through: 'asignadaPlanta'
        });

    };


    return plantaAsignada;
};