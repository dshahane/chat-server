import bcrypt from 'bcrypt';

export default (sequelize, DataType) => {
    const User = sequelize.define('user', {
        username: {
            type: DataType.STRING,
            unique: true,
            validate: {
                isAlphanumeric: {
                    args : true,
                    msg: "Username must be alphanumeric value",
                },
                len: {
                    args: [3,50],
                    msg: "Username must be between 3 to 50 characters", 
                }, 
            },
        },
        email: {
            type: DataType.STRING,
            unique: true,
            validate: {
                isEmail: {
                    args : true,
                    msg: "Email must be valid",
                },
            },
        },        
        password: {
            type: DataType.STRING,
            validate: {
                len: {
                    args: [5,100],
                    msg: "Password must be between 5 to 100 characters", 
                },                
            }
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
        url: {
            type: DataType.STRING,
        },
    }, 
    {
        hooks: {
            afterValidate: async (user, options) => {
                user.password = await bcrypt.hash(user.password, 12);
            },
        },
    });

    User.associate = (models) => {
        User.belongsToMany(models.Team, {
            through: models.Member,
            foreignKey: {
                name: 'userId',
                field: 'user_id',
            },
        });
        //N:M
        User.belongsToMany(models.Channel, {
            through: 'channel_member',
            foreignKey: {
                name: 'userId',
                field: 'user_id',
            },           
        });
    };
    return User;
};