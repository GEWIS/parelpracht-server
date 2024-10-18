<h1 style="text-align: center">
  <img alt="" src="https://raw.githubusercontent.com/GEWIS/parelpracht-client/develop/public/ParelPracht-blacksvg.svg?raw=true" style="width: 25%">
  <br>
  ParelPracht
</h1>

ParelPracht is the successor of Goudglans, the custom Customer Relation
Management system of Study Association GEWIS. This new system is built during
the second lockdown of the corona pandemic. Its main goal is to automate tedious
tasks and to keep a clear and concise overview of the current collaborations.
This is achieved by creating nice structured insights tables and graphs and
automating the generation of contracts, proposals and invoices.

This is the back-end of ParelPracht. The front-end can be found [here](https://github.com/GEWIS/parelpracht-client).

## Development
1. Clone the repository with `git clone git@github.com:GEWIS/parelpracht-server`
2. Install the dependencies with `npm install`.
3. Copy `.env.example` to `.env` and add the remaining environment variables.
4. Start the application with `npm run dev`

It is suggested to use a local MariaDB instance. If you do not have a local
instance, you can use the docker compose file: `docker compose -f
docker-compose-mariadb.yaml up -d`. The environment variables in the
`.env.example` are adjusted to use this container configuration.

## Setup
When running the application, you will first need to create a superuser. This is
done with the `/setup` endpoint.

1. Go to the [swagger docs](http://localhost:3001/api/swagger-ui/).
2. Navigate to `/setup` endpoint, and fill out the data for the request.
3. Check the console for the confirmation link.

Note: the confirmation link will only be logged in development mode. In
production, an actual mail will be send with the confirmation link to the
indicated email address.

## Copyright
Copyright © 2022 The 39th board of GEWIS - Some rights reserved. Created by Roy
Kakkenberg, Koen de Nooij, Jealy van den Aker, Max Opperman, Wouter van der
Heijden en Irne Verwijst. You can use our software freely within the limits of
our license. However, we worked very hard on this project and invested a lot of
time in it, so we ask you to leave our copyright mark in place when modifying
our software. Of course, you are free to add your own.

## License
[GNU AGPLv3](./LICENSE)
