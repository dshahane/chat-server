const createResolver = (resolver) => {
    const baseResolver = resolver;
    baseResolver.createResolver = (childResolver) => {
      const newResolver = async (parent, args, context) => {
        await resolver(parent, args, context);
        return childResolver(parent, args, context);
      };
      return createResolver(newResolver);
    };
    return baseResolver;
  };
  
  export const requiresAuth = createResolver((parent, args, context) => {
    if (!context.user || !context.user.id) {
      throw new Error('Not authenticated');
    }
  });
  
  export const requiresAdmin = requiresAuth.createResolver(
    (parent, args, context) => {
      if (!context.user.isAdmin) {
        throw new Error('Requires admin access');
      }
    },
  );

export const requiresTeamAccess = createResolver(async (parent, { channelId }, { user, models }) => {
  if (!user || !user.id) {
    throw new Error('Not authenticated');
  }
  // Check if the user is part of the team
  const channel =  await models.Channel.findOne({ where: { id: channelId } });
  const member = await  models.Member.findOne({ 
      where: { teamId: channel.teamId, userId: user.id }
  });
  if (!member) {
      throw new Error('You must be member to subscribe');
  }
});

export const requiresDirectMessageAccess = createResolver(async (parent, { teamId, userId }, { user, models }) => {
  if (!user || !user.id) {
    throw new Error('Not authenticated');
  }
  // Check if the user is part of the team
  const members = await  models.Member.findAll({ 
      where : { 
        [models.sequelize.Op.and]:[{teamId: teamId}, {[models.sequelize.Op.or]: [{userId}, {userId: user.id}] }]
      },
    } 
  );
  if (members.length !== 2) {
      throw new Error('Unable to get direct message access');
  }
});