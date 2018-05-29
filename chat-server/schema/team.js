export default `
    type Team {
        id: Int!
        name: String!
        nick: String
        image: String
        admin: Boolean!
        channels: [Channel!]!
    }

    type CreateTeamResponse {
        ok: Boolean!
        team: Team
        errors: [Error!]
    }

    type VoidResponse {
        ok: Boolean!
        errors: [Error!]
    }

    type Query {
        allTeams: [Team!]!
        invitedTeams: [Team!]!
        getUsers(teamId: Int!): [User!]!
    }

    type Mutation {
        createTeam(name: String!, nick:String, image:String): CreateTeamResponse!
        addMemberToTeam(email: String!, teamId: Int!): VoidResponse!
    }
`;