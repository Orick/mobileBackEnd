'use strict';

module.exports = (sequelize, DataTypes) => {
    const summoner = sequelize.define('summoner', {
        summonerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        accountId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        profileIconId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        summonerLevel: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        revisionDate:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        server: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    // summoner.associate =  (models) => {
    //
    //     summoner.belongsToMany(models.matchlist, {
    //         through: 'summonerMatchList',
    //         foreignKey: 'accountId',
    //         as: 'sumlist',
    //         unique: true
    //     });
    //
    //     summoner.belongsToMany(models.userSummoner, {
    //         through: 'associateUserSum',
    //         as : 'summonerUserX',
    //         unique: true
    //     });
    //
    //     summoner.belongsToMany(models.league, {
    //         through: 'sleague',
    //         as : 'summonerLeague',
    //         unique: true
    //     });
    // };


    return summoner;
};
