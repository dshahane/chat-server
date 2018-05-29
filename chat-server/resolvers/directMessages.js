import { withFilter } from 'graphql-subscriptions';

import { requiresAuth, requiresDirectMessageAccess } from '../permissions';
import { pubsub } from '../pubsub';

const NEW_DIRECT_MESSAGE = "newDirectMessage";

export default {
    DirectMessage: {
        // Direct message user field
        user: ({ senderId }, args, { models }) => {
            return models.User.findOne({where: { id: senderId }}, { raw: true } );
        },
    },
    Subscription: {
        // Match schema
        createDirectMessage: {
            subscribe: requiresDirectMessageAccess.createResolver(withFilter(
                () => pubsub.asyncIterator(NEW_DIRECT_MESSAGE),
                (payload, args, {user}) => {
                /*
                console.log(payload);
                console.log(args);
                console.log(user);
                */
                return (
                    payload.teamId === args.teamId && 
                    (((payload.senderId === user.id) && (payload.receiverId === args.userId)) ||
                    ((payload.senderId === args.userId) && (payload.receiverId === user.id)))
                )},
            )),
        },
    },
    Query: {
        activeUsers: requiresAuth.createResolver(async (parent, {teamId}, { models, user }) => {
            const result = models.sequelize.query('select distinct(users.id), users.username from direct_messages  as dm join users on (users.id = dm.sender_id or users.id = dm.receiver_id) where dm.team_id = ?', { 
                replacements: [teamId], 
                models: models.User, 
                type: models.sequelize.QueryTypes.SELECT,
                raw: true,
            });
            //console.log(result);
            return result;
        }),
        directMessages: requiresAuth.createResolver(async (parent, {teamId, otherUserId}, { models, user }) => {
            const Op = models.sequelize.Op;
            const response = models.DirectMessage.findAll( { 
                //include: [models.User], 
                where : { teamId: teamId, 
                    [Op.or]: [
                        { [Op.and]: [{senderId: otherUserId}, {receiverId: user.id}] }, 
                        { [Op.and]: [{senderId: user.id}, {receiverId: otherUserId}] }, 
                    ]
                } 
            }, { raw: true, });
            //console.log(response);
            return response;
        }),
    },

    Mutation: {
        createDirectMessage: requiresAuth.createResolver(async (parent, args, { models, user }) => {
            try {
                /*
                console.log({
                    ...args, 
                    user
                });*/
                const message = await models.DirectMessage.create({
                    ...args, 
                    teamId: args.teamId,
                    senderId: user.id,
                    receiverId: args.receiverId,
                });

                // publish( <subscription>, {<schema-operation>: <sequalizeObject>.dataValues, <args>})
                /*
                console.log({createDirectMessage: {
                    ...message.dataValues,
                    user,
                }});*/
                pubsub.publish(NEW_DIRECT_MESSAGE, {
                    teamId: args.teamId,
                    senderId: user.id,
                    receiverId: args.receiverId,
                    createDirectMessage: {
                        ...message.dataValues,
                        sender: {
                            id: user.id,
                            username: user.username,
                        },
                    },
                });
                return true;
            }
            catch(error) {
                console.log(error);
                return false;
            }
        }),
    }
};