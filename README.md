# Live departure board for UK train stations

Based on a project by Dan Taylor. More information on his project:
- https://logicalgenetics.com/train-departure-board/
- https://github.com/DanteLore/national-rail

## Pre-install configuration
Create a .env file at the root of the project with the following variables:
- `API_TOKEN`: an API token provided by National Rail Enquiries (more information available here: https://www.nationalrail.co.uk/100296.aspx) (mandatory)
- `PORT`: the desired port for the application (default: 3000)
- `DEFAULT_STATION_CODE`: a default station code (default: "GLC" for Glasgow Central)

## Launching
1. `npm install` to download the dependencies
2. `npm run gulp build` to build the project and the front-end app folder
3. `npm start` to launch the app
4. Visit `localhost:{PORT}` to launch the app

## Further information
The file `server/data/settings.json` contains the default values as specified in the OpenLDBWS documentation (http://lite.realtime.nationalrail.co.uk/openldbws/) for the `GetDepBoardWithDetails` operation.
