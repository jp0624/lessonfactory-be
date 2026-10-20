# Lessonfactory Be

Express backend for the Lesson Factory application, with lesson routes, file upload middleware and MySQL access.

## Local development

Run these commands from the repository root:

```sh
npm install
```

## Main dependencies

`express`, `mysql`. See `package.json` for the full dependency list and versions.

Configure the external services used by the application before testing data-dependent features. Use your own development credentials and keep secrets out of Git.

Start the service with `node server`. It requires a configured MySQL database; review the server configuration before running it.
