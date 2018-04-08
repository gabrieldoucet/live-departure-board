#Live departure board for UK train stations

Default station is Hyndland train station in Glasgow (HYN).

##Configuration
create a .env file at the root with 3 environment variables:
- `API_TOKEN` token provided by National Rail Enquiries
- `CRS` for default train station
- `PORT` for the application

##Launching
`npm run start` to launch the app
Visit localhost:PORT