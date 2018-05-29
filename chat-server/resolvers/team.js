import formatErrors, { makeError } from "./formatErrors";
import { requiresAuth } from '../permissions';

export default {
    Query: {
        getUsers: requiresAuth.createResolver(async (parent, {teamId}, { models, user }) => {
            const result = models.sequelize.query('select * from members join users on users.id = members.user_id where members.team_id = ?', { 
                replacements: [teamId], 
                models: models.User, 
                type: models.sequelize.QueryTypes.SELECT,
                raw: true,
            });
            return result;
        }),
    },
    Mutation: {
        addMemberToTeam: requiresAuth.createResolver(async (parent, { email, teamId }, { models, user }) => {
            try {
                const loginMemberPromise = models.Member.findOne( { where : { teamId, userId: user.id } }, { raw: true, } );                
                const userToAddPromise = models.User.findOne( { where : { email } }, { raw: true, } );
                const [loginMember, userToAdd] = await Promise.all([loginMemberPromise, userToAddPromise]);
                if (!userToAdd) {
                    return {
                        ok: false,
                        errors: makeError('User not found with this email', 'email'), 
                    }
                } 
                if (!loginMember.admin) {
                    return {
                        ok: false,
                        errors: makeError('User is not the owner of this team', 'teamId'), 
                    }
                }
                const member = await models.Member.create({
                    teamId,
                    userId: userToAdd.id
                });
                return {
                    ok: true,
                }
            }
            catch(err) {
                console.log(err);
                return {
                    ok: false,
                    errors: formatErrors(err, models),
                } 
            }
        }),
        createTeam: requiresAuth.createResolver(async (parent, args, { models, user }) => {
            try {
                console.log(models.sequalize);
                const response = await models.sequelize.transaction(async () => {
                        const team = await models.Team.create({...args });
                        await models.Channel.create({ name: 'general', public: true, teamId: team.id, });
                        await models.Member.create({ userId: user.id, admin: true, teamId: team.id, });
                        return team;
                    }
                );

                return {
                    ok: true,
                    team: response,
                }
            }
            catch(err) {
                console.log(err);
                return {
                    ok: false,
                    errors: formatErrors(err, models),
                } 
            }
        })
    },
    Team: {
        /* (parent, args, conetx) */
        channels: ({ id }, args, { models }) => models.Channel.findAll({ where: { teamId: id, } } )
    },
};