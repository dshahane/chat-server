export default `
    type Message {
        id: Int!
        text: String!
        timestamp: String!
        user: User!
        channel: Channel!
    }

    type Subscription {
        createChannelMessage(channelId: Int!) : Message!   
    }

    type Query {
        allMessages(channelId: Int!) : [Message!]!
    }

    type Mutation {
        createMessage(channelId: Int!, text: String!) : Boolean!
    }
`;