export default (sequelize, DataType) => {
    const Message = sequelize.define('message', {
        text: {
            type: DataType.STRING,
        },
        timestamp: {
            type: DataType.DATE(3),
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP(3)'),
        },        
    });

    Message.associate = (models) => {
        Message.belongsTo(models.Channel, {
            foreignKey: {
                name: 'channelId',
                field: 'channel_id',
            },
        });
        Message.belongsTo(models.User, {
            foreignKey: {
                name: 'userId',
                field: 'user_id',
            },
            targetKey: 'id',
        });
    };
    return Message;
};