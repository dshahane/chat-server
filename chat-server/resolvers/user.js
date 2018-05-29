import bcrypt from 'bcrypt';
import formatErrors from './formatErrors';
import { tryLogin } from '../auth';
import { requiresAuth } from '../permissions';

export default {
    User: {
        teams: requiresAuth.createResolver((parent, args, { models, user }, info) => {
            /*
            return [{
                id: 0,
                name: 'foo',
                admin: true,
                channels: [],
            }];*/
            //console.log(`User.teams - info: `, JSON.stringify(info))
            const result = models.sequelize.query('select * from teams as team join members as member on team.id = member.team_id where member.user_id = ?', { 
                replacements: [user.id], 
                models: models.Team, 
                type: models.sequelize.QueryTypes.SELECT,
                raw: true,
            });
            return result;
        }),
     },
    Query: {
        me: requiresAuth.createResolver((parent, args, { models, user }) => 
            models.User.findOne({where: {id: user.id}})
        ),
        allUsers: (parent, args, { models }) => models.User.findAll(),
        /*
        // User:/teams: resolver addresses this now
        allTeams: requiresAuth.createResolver(async (parent, args, { models, user }) => {
            return models.Team.findAll( { where : { owner: user.id } }, { raw: true, })
        }),
        invitedTeams: requiresAuth.createResolver(async (parent, args, { models, user }) => {

            console.log(user);
            const invited = models.Team.findAll( {
                // Join table
                include: [
                    { model: models.User, where: { id: user.id }}
                 ],
            }, { raw: true, });
            return invited;
        }),*/
    },
    Mutation: {
        login: async (parent, {email, password}, { models, SECRET, SECRET2 }) => 
            tryLogin(email, password, models, SECRET, SECRET2),

        register: async (parent, args, { models }) => {
            try {
                const user = await models.User.create(args);
                return {
                    ok: true,
                    user
                };
            }
            catch(err) {
                return {
                    ok: false,
                    errors: formatErrors(err, models)
                }
            }
        }
    },
};