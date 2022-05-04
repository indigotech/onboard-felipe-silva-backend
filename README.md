# Felipe Pimentel - Onboard Task

An onboard where the user will have his first contact with backend tasks.
Here we're connecting TypeORM with our Database. You can add some data or new entities too.

## Environment and tools

Here are some necessary tools before running this project:

- Docker
- TablePlus/PostSQL
- NodeJS v14.12.0

You can install in your VSCode some extensions like:

- Prettier
- ESLint

## Steps to run and debug

1 - Clone this repository with:

```bash
git clone https://github.com/indigotech/onboard-felipe-silva-backend.git
```

2 - Install project dependencies with:

```bash
npm install
```

3 - Setup your database config in `docker-compose.yml`. You can change your preferences in `.prettierrc.js` and `.eslintrc.js` configs too.
Check if user, password and database infos are correct or your connection may fail!

4 - Run Docker in your machine. You need it running before trying to connect.

5 - Mount yours containers with:

```bash
docker-compose up -d
```

Note: You can stop with `docker-compose stop`

6 - Run the project with:

```bash
npm run start
```

7 - Feel free to create new entities in `src/entity` and save to your DB using TablePlus/PopSQL or this project own code.
