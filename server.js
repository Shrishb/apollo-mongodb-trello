const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const merge = require("lodash/merge");
const mongoose = require("mongoose");
const { PubSub } = require("apollo-server");
const { createServer } = require("http");
require("dotenv").config();

const typeDefs = gql``;

const resolvers = {};

const MONGO_USER = process.env.MONGO_USER || "root";
const MONGO_PASS = process.env.MONGODB_PASS;

const { sectionResolvers, sectionTypeDefs } = require("./section");
const sectionModel = require("./section/model");
const typeDefs = gql`
  ${cardTypeDefs}
`;


const customResolvers = {
    Section: {
      cards(parent, args, cxt) {
        return cxt.card.getCardBySectionId(parent._id);
      },
    },
  };
  const resolvers = merge(
    sectionResolvers,
  );

mongoose
  .connect(
    `mongodb://${MONGO_USER}:${MONGO_PASS}@cluster0-gvcqb.mongodb.net/test?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("mongodb connected successfully");

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: () => ({
        section: sectionModel
      }),
    });
    
    const app = express();
    server.applyMiddleware({ app });
    const httpServer = createServer(app);

    const PORT = 3000;
    httpServer.listen({ port: PORT }, () => {
      console.log(`Server is running in port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
