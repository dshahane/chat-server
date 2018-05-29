export default (sequelize, DataType) => {
    const Channel = sequelize.define('channel', {
        name: {
            type: DataType.STRING,
        },
        public: {
            type: DataType.BOOLEAN,
            defaultValue: true,
        },
    });

    Channel.associate = (models) => {
        Channel.belongsTo(models.Team, {
            foreignKey: {
                name: 'teamId',
                field: 'team_id',
            },
        });
        //N:M
        Channel.belongsToMany(models.User, {
            through: 'channel_member',
            foreignKey: {
                name: 'channelId',
                field: 'channel_id',
            },           
        });
    };
    return Channel;
};