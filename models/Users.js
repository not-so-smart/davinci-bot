module.exports = (sequelize, DataTypes) => {
    return sequelize.define('users', {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        heartCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        heartsGiven: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        lastHeartGiven: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        lastHeartTimestamp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        lastHeartID: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        lastLastHeartID: {
            type: DataTypes.STRING,
            defaultValue: null,
        }
    }, {
        timestamps: true,
    });
};