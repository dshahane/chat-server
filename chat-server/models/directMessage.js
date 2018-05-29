export default (sequelize, DataType) => {
    const DirectMessage = sequelize.define('direct_message', {
        text: {
            type: DataType.STRING,
        },
        timestamp: {
            type: DataType.DATE(3),
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP(3)'),
        },        
    });

    DirectMessage.associate = (models) => {
        DirectMessage.belongsTo(models.Team, {
            foreignKey: {
                name: 'teamId',
                field: 'team_id',
            }
        });
        DirectMessage.belongsTo(models.User, {
            foreignKey: {
                name: 'senderId',
                field: 'sender_id',
            }
        });
        DirectMessage.belongsTo(models.User, {
            foreignKey: {
                name: 'receiverId',
                field: 'receiver_id',
            }
        });
    };
    return DirectMessage;
};