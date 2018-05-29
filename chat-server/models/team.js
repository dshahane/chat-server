export default (sequelize, DataType) => {
    const Team = sequelize.define('team', {
        name: {
            type: DataType.STRING,
            unique: true,
        },
        nick: {
            type: DataType.STRING,
            validate: {
                len: {
                    args: [1,3],
                    msg: "Nickname must be between 1 to 3 characters", 
                },                
            }
        },
        image: {
            type: DataType.STRING,
        },
    });

    Team.associate = (models) => {
        Team.belongsToMany(models.User, {
            through: models.Member,
            foreignKey: {
                name: 'teamId',
                field: 'team_id',
            }
        });
    };
    return Team;
};