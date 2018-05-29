import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import models from './models';
import { equal } from 'assert';
import { refreshTokens } from './auth';

import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { SubscriptionServer } from 'subscriptions-transport-ws';

const PORT = 8081;
const app = express();
app.use(cors('*'));

const addUser = async( req, resp, next) => {
    const token = req.headers['x-token'];
    let decodedToken;

    if (token) {
        try {
            decodedToken = await jwt.verify(token, SECRET);
        } 
        catch(err) {
            console.log('Token expired...renewing');
        }
    }   

    if (decodedToken) {
       const { user } = decodedToken;
       req.user = user;
    } else {
        const refreshToken = req.headers['x-refresh-token']; 
        const newTokens = await refreshTokens(refreshToken, models, SECRET, SECRET2);
        if (newTokens.token && newTokens.refreshToken) {
           resp.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
           resp.set('x-token', newTokens.token);
           resp.set('x-refesh-token', newTokens.refreshToken);
        }  
        req.user = newTokens.user;     
    }
    next();
}
// merge folders
const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema')));
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './resolvers')));

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

const graphqlEndpoint = '/graphql';

const SECRET = 'djnkjndjknkjnkjnknknnknksdeeewew';
const SECRET2 = 'dnelkjlkmlkmlkdsdfsm ,m m ee';

// Middleware that injects user in the request context
app.use(addUser);
// GraphQL middleware
            // user: { id: 1, }, 
app.use(graphqlEndpoint, 
    bodyParser.json(), 
    graphqlExpress( (req) => ({
        schema, 
        context: { 
            models,
            //user: { id: 1, },
            user: req.user,
            SECRET,
            SECRET2,
        },
        tracing: true,
    }))
);
//Graphiql middleware
app.use('/graphiql', 
    graphiqlExpress({ 
        endpointURL: graphqlEndpoint,
        subscriptionsEndpoint: 'ws://localhost:8081/subscriptions'
     })
);

// const pubsub = new PubSub();
const server = createServer(app);

// Sync models and start server
models.sequelize.sync().then( resolve => {
    server.listen(PORT, () => {
        new SubscriptionServer({
          execute,
          subscribe,
          schema,
          onConnect: async ({ token, refreshToken }, webSocket) => {
            if (token && refreshToken) {
                let user = null;
                try {
                    const payload = jwt.verify(token, SECRET);
                    user = payload.user;
                } catch(error) {
                    const newTokens = await refreshTokens(refreshToken, models, SECRET, SECRET2);
                    user = newTokens.user;
                }
                // console.log({models, user});
                return {models, user}
            }
            // console.log({models});
            return {models}
          },
        }, {
          server: server,
          path: '/subscriptions',
        });
    });
});




