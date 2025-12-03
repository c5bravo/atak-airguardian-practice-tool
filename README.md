# TAK Air Ops Simulator
This application is made for simulating flight data for our [ATAK plugin.](https://github.com/c5bravo/atak-airguardian-plugin)

## Running
### Without docker
  1. Clone this repository
  2. Create `local.db` and `.env` files
  3. In the `.env` file set the variable `DB_FILE_NAME=file:local.db`
  4. Install dependencies with `npm i`
  5. Run with `npm run build && npm run start`
### With docker
  1. `docker build . -t "practice-tool`
  2. `docker run practice-tool`

## Notes
The `app/api/route.ts` is meant for the applications internal communication. The `app/api/craft/route.ts` is the endpoint for fetching flight data to be used in the plugin.

