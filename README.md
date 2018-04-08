# Live departure board for UK train stations

Default station is Hyndland train station in Glasgow (HYN).

## Configuration
Create a .env file at the root with 3 environment variables:
- `API_TOKEN` token provided by National Rail Enquiries
- `PORT` for the application

For display options, edit `config.json` with `rows` and `csr` attribute

## Launching
- `npm install` to download the dependencies
- `npm run start` to launch the app
- Visit localhost:PORT