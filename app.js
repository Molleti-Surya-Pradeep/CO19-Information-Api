const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

app.use(express.json());
let db = null;
const dbpath = path.join(__dirname, "covid19India.db");

const intilizeserverandDB = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running Successfully");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};
intilizeserverandDB();

function conversionofDbtoresponse(dataobject) {
  return {
    stateId: dataobject.state_id,
    stateName: dataobject.state_name,
    population: dataobject.population,
    districtId: dataobject.district_id,
    districtName: dataobject.district_name,
    cases: dataobject.cases,
    cured: dataobject.cured,
    active: dataobject.active,
    deaths: dataobject.deaths,
  };
}
// Api 1

app.get("/states", async (request, response) => {
  const dataQuery = "SELECT * FROM state;";
  const dataArray = await db.all(dataQuery);
  response.send(dataArray.map((item) => conversionofDbtoresponse(item)));
});

// Api 2

app.get("/states/:stateId", async (request, response) => {
  const { stateId } = request.params;
  const dataQuery = `SELECT * FROM state WHERE state_id = ${stateId};`;
  dataArray = await db.get(dataQuery);
  response.send(conversionofDbtoresponse(dataArray));
});

// Api 3

app.post("/districts", async (request, response) => {
  const datadetails = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = datadetails;
  const dataQuery = `
    INSERT INTO district(district_name,state_id,cases,cured,active,deaths)
    VALUES(
        '${districtName}',
        '${stateId}',
        '${cases}',
        '${cured}',
        '${active}',
        '${deaths}'
    );`;

  const dataadded = await db.run(dataQuery);
  const district_id = dataadded.lastID;
  response.send("District Successfully Added");
});

// Api 4

app.get("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const dataQuery = `SELECT * FROM district WHERE district_id = ${districtId};`;
  dataArray = await db.get(dataQuery);
  response.send(conversionofDbtoresponse(dataArray));
});

// Api 5

app.delete("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const dataQuery = `DELETE FROM district WHERE district_id = ${districtId};`;
  dataArray = await db.run(dataQuery);
  response.send("District Removed");
});

// Api 6

app.put("/districts/:districtId", async (request, response) => {
  const { districtId } = request.params;
  const datadetails = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = datadetails;
  const dataQuery = `UPDATE district
  SET 
  district_name = '${districtName}',
  state_id = '${stateId}',
  cases = '${cases}',
  cured = '${cured}',
  active = '${active}',
  deaths = '${deaths}'
   WHERE district_id = ${districtId};`;
  await db.get(dataQuery);
  response.send("District Details Updated");
});

// Api 7

app.get("/states/:stateId/stats", async (request, response) => {
  const { stateId } = request.params;
  const dataQuery = `
    SELECT sum(cases) AS totalCases,
    sum(cured) AS totalCured,
    sum(active) AS totalActive,
    sum(deaths) AS totalDeaths
    FROM district  WHERE state_id=${stateId};`;

  const dataarray = await db.get(dataQuery);
  response.send(dataarray);
});

// Api 8

app.get("/districts/:districtId/details", async (request, response) => {
  const { districtId } = request.params;
  const dataQuery = `SELECT state_id FROM district WHERE district_id = ${districtId};`;
  dataArray = await db.get(dataQuery);
  const dataQuery2 = `SELECT state_name As stateName FROM state WHERE state_id = ${dataArray.state_id};`;
  dataArray2 = await db.get(dataQuery2);
  response.send(dataArray2);
});

module.exports = app;
