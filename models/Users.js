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
        lastHeartName: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        lastHeartTimestamp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        lastHeart0: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        lastHeart1: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        skin: {
            type: DataTypes.STRING,
            defaultValue: "default",
            allowNull: false,
        },
        flags: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        }
    }, {
        timestamps: true,
    });
};