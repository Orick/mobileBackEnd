'use strict';
const models = require('../models');

module.exports = (sequelize, DataTypes) => {
    const notificaciones = sequelize.define('notificaciones', {
        tipo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        descripcion:{
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    return notificaciones;
};