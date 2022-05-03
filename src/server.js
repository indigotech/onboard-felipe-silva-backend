import GraphQL from "graphql";
import express from "express";
import ExpressGraphQL from "express-graphql";

const schema = GraphQL.buildSchema(`
    type Query {
        hello: String
    }
`);

const rootValue = {
  hello: () => "Hello World!",
};

const app = express();

app.use(
  "/graphql",
  ExpressGraphQL.graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
  })
);

app.listen(4000);
console.log(
  "Running a GraphQL API server at localhost - PORT 4000: http://localhost:4000/graphql"
);
