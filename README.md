# Wertik-JS V3

Wertik is a tiny Node JS framework that helps you setting up servers with support for

- MySQL Database
- Emailing
- GraphQL
- Modules
- Rest Api
- Storage
- Sockets
- Cron Jobs

## Installation

You can install wertik-js by using yarn or npm:

Yarn

```
yarn add wertik-js
```

Npm

```
npm install wertik-js
```

## Setting up server

To start wertik-js server you need to import wertik and start it:

```js
import wertik from "wertik-js/lib/next";

weritk({
  port: 1200,
});
```

In your console you will see something like this:

```log
Wertik JS app listening at http://localhost:1200
```

If you visit [http://localhost:1200](http://localhost:1200), you will see a response like this:

```log
Cannot GET /
```

🚀 You have successfully started wertik server. Right now there is nothing in wertik app right now. Let's make it interactive by adding:

- MySQL Database
- Mailer
- GraphQL
- Modules
- Rest Api
- Storage
- Sockets
- Cron Jobs

## Accessing Wertik Inside GraphQL Resolver and Express Handler

You can access Wertik instance inside GraphQL and Express handler through:

- Express

```javascript
app.get("/somepath", (req, res) => {
  console.log(req.wertik); // Wertik App
  res.send("Some Info");
});
```

For more please see [This line](https://github.com/Uconnect-Technologies/wertik-js/blob/master/src/next/index.ts#:~:text=req.wertik%20%3D%20wertikApp%3B).

- GraphQL Resolver

```javascript
function Resolver(_, args, context, info) => {
  console.log(context.wertik); // Wertik App
  return "Some Info"
}
```

For more please see: [This line](<https://github.com/Uconnect-Technologies/wertik-js/blob/master/src/next/graphql/index.ts#:~:text=context%3A%20async%20()%20%3D%3E%20%7B>)

With keyword Wertik you can access everything that lies inside wertik from database, modules, sockets, mailer, cron jobs to everything in Wertik app.

## Why you should use Wertik JS

If you have a small project that requires a backend as well. Wertik-js is perfect for it because the recipe is ready you have to just use it. If you have a small blog you just have to create a database and add a connection to the database and then you are all set. Wertik JS will automatically create CRUD operations for you and using events you can secure those operations based on user roles. You can easily add relationships between modules which makes you powerful.

## How Wertik JS works internally

Wertik JS v3 is setup in a clean way and easy way. Here is the main file which initializes Wertik JS: [Show File](https://github.com/Uconnect-Technologies/wertik-js/blob/master/src/next/index.ts).

You can check the code and if you find something that needs to be changed, you can create a new Issue [here](https://github.com/Uconnect-Technologies/wertik-js/issues/new).

## Did you find a grammar mistake in the documentation?

If you came across a grammar mistake please create a new issue with more details in the description: [here](https://github.com/Uconnect-Technologies/wertik-js/issues/new?title=I%20have%20found%20a%20grammar%20mistake).

## Contribute & Support

Pull requests are welcome. If you have discovered a bug or have a feature suggestion, feel free to create an issue on GitHub.

If you'd like to make some changes yourself, see the following:

- Fork this repository to your own GitHub account and then clone it to your local device
- Make sure yarn is globally installed (npm install -g yarn)
- Run yarn to download required packages.
- Build and start the application: yarn `dev-next`
- If you contributed something new, run yarn contrib:add <your GitHub username> <contribution type> to add yourself to the contributors list
- Finally, submit a pull request with your changes!
