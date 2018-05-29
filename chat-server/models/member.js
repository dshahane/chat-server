export default (sequelize, DataType) => {
    const Member = sequelize.define('member', {
        admin: {
            type: DataType.BOOLEAN,
            defaultValue: false,
        }
    });
    return Member;
};