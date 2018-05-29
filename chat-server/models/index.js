import Sequelize from 'sequelize';

const sequelize = new Sequelize( 'slack', 'postgres', 'password', {
        dialect: 'postgres',
        operatorsAliases: Sequelize.Op,
        sync: {
            force: false,
        },
        define: {
            underscored: true,
        }
    }, 
);

const models = {
    User: sequelize.import('./user'),
    Channel: sequelize.import('./channel'),
    Member: sequelize.import('./member'),
    Team: sequelize.import('./team'),
    Message: sequelize.import('./message'),
    DirectMessage: sequelize.import('./directMessage'),
};


Object.keys(models).forEach((modelName) => {
    if ('associate' in models[modelName]) {
        models[modelName].associate(models);
    }
});

models.sequelize = sequelize;

export default models;