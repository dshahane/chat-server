import { withFilter } from 'graphql-subscriptions';

import { requiresAuth, requiresTeamAccess } from '../permissions';
import { pubsub } from '../pubsub';

const NEW_CHANNLE_MESSAGE = "newChannelMessage";

export default {
    Message: {
        // Direct message user field
        user: ({ userId }, args, { models }) => {
            return models.User.findOne({where: { id: userId }}, { raw: true } );
        },
        channel: ({ channelId }, args, { models }) => {
            return models.Channel.findOne({where: { id: channelId }}, { raw: true } );
        },
    },
    Query: {
        allMessages: requiresAuth.createResolver(async (parent, {channelId}, { models, user }) => {
            const response = models.Message.findAll( { where : { channelId: channelId } }, { raw: true, });
            //console.log(response);
            return response;
        }),
    },
    Subscription: {
        // Match schema
        createChannelMessage: {
            subscribe: requiresTeamAccess.createResolver(withFilter(
                () => pubsub.asyncIterator(NEW_CHANNLE_MESSAGE),
                (payload, args) => payload.channelId === args.channelId
            )),
        },
    },
    Mutation: {
        createMessage: requiresAuth.createResolver(async (parent, args, { models, user }) => {
            try {
                console.log({
                    ...args, 
                    user
                });
                const message = await models.Message.create({
                    ...args, 
                    userId: user.id
                });
                // publish( <subscription>, {<schema-operation>: <sequalizeObject>.dataValues, <args>})
                pubsub.publish(NEW_CHANNLE_MESSAGE, {
                    channelId: args.channelId,
                    createChannelMessage: {
                        ...message.dataValues,
                        user,
                    },
                });
                return true;
            }
            catch(error) {
                console.log(err);
                return false;
            }
        }),
    }
};