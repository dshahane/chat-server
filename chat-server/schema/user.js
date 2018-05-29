export default `
    type User {
        id: Int!
        username: String!
        nick: String
        url: String
        email: String!
        teams: [Team!]!
    }

    type RegisterResponse {
        ok: Boolean!
        user: User
        errors: [Error!]
    }

    type LoginResponse {
        ok: Boolean!
        token: String
        refreshToken: String
        errors: [Error!]
    }

    type Mutation {
        register(username: String!, email:String!, password: String!, nick:String, url: String): RegisterResponse!
        login(email:String!, password:String!) : LoginResponse!
    }

    type Query {
        me: User!
        allUsers: [User!]!
    }
`;