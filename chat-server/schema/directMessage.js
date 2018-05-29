export default `
    type DirectMessage {
        id: Int!
        text: String!
        timestamp: String!
        user: User!
        receiverId: Int!
    }

    type Subscription {
        createDirectMessage(teamId: Int!, userId: Int!) : DirectMessage!   
    }

    type Query {
        directMessages(teamId: Int!, otherUserId: Int!): [DirectMessage!]!
        activeUsers(teamId: Int!): [User!]
    }

    type Mutation {
        createDirectMessage(receiverId: Int!, text: String!, teamId: Int!) : Boolean!
    }
`;