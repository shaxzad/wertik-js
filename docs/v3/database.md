# Database

As of today 28 November 2021, Wertik-js only supports MySQL database. Wertik JS provides a function called `useDatabase` you can use to connect to a database.

```js
import wertik, { useDatabase } from "wertik-js/lib/next";
weritk({
  port: 1200,
  database: {
    default: useDatabase({
      name: "default",
      password: "pass",
      host: "localhost",
      port: 3306,
      username: "root",
    }),
  },
});
```

Now run your code and if you pass database credentials correctly you will see something like this on your console along with other logs from wertik-js:

```
[DB] Succcessfully connected to database default
```

Since database is a object you can pass multiple connections as well.
