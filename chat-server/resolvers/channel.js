import { formatErrors, makeError } from "./formatErrors";

export default {
    Mutation: {
        createChannel: async (parent, args, { models, user }) => {
            try {
                const member = await models.Member.findOne(
                    { where: { teamId: args.teamId, userId: user.id } }, 
                    { raw: true }
                );
                if(!member.admin) {
                    return {
                        ok: false,
                        errors: makeError('The user is not an owner of the team', 'name'),
                    }
                }
                /*
                console.log(parent);
                console.log(args);
                console.log(user);
                */
                const channel = await models.Channel.create(args);
                return {
                    ok: true,
                    channel,
                }
            }
            catch(error) {
                console.log(error);
                return {
                    ok: false,
                    errors: formatErrors(error, models),
                }
            }
        }
    }
};