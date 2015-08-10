# About

This is the Factual-supported Node.js driver for [Factual's public API](http://developer.factual.com).

# Install

```bash
$ npm install factual-api
```

# Get Started

Include this driver in your project:
```javascript
var Factual = require('factual-api');
var factual = new Factual('YOUR_KEY', 'YOUR_SECRET');
```
If you don't have a Factual API key yet, [it's free and easy to get one](https://www.factual.com/api-keys/request).

## Schema
Use the schema API call to determine which fields are available, the datatypes of those fields, and which operations (sorting, searching, writing, facetting) can be performed on each field.

Full documentation: http://developer.factual.com/api-docs/#Schema
```javascript
factual.get('/t/places-us/schema', function (error, res) {
  console.log(res.view);
});
```

## Read
Use the read API call to query data in Factual tables with any combination of full-text search, parametric filtering, and geo-location filtering.

Full documentation: http://developer.factual.com/api-docs/#Read

Related place-specific documentation:
* Categories: http://developer.factual.com/working-with-categories/
* Placerank, Sorting: http://developer.factual.com/search-placerank-and-boost/

```javascript
// Full-text search:
factual.get('/t/places-us',{q:"century city mall", "include_count":"true"}, function (error, res) {
  console.log("show "+ res.included_rows +"/"+ res.total_row_count +" rows:", res.data);
});

// Row filters:
//  search restaurants (http://developer.factual.com/working-with-categories/)
//  note that this will return all sub-categories of 347 as well.
factual.get('/t/places-us', {filters:{category_ids:{"$includes":347}}}, function (error, res) {
  console.log(res.data);
});

//  search restaurants or bars
factual.get('/t/places-us', {filters:{category_ids:{"$includes_any":[312,347]}}}, function (error, res) {
  console.log(res.data);
});

//  search entertainment venues but NOT adult entertainment
factual.get('/t/places-us', {filters:{"$and":[{category_ids:{"$includes":317}},{category_ids:{"$excludes":318}}], function (error, res) {
  console.log(res.data);
});

//  search for Starbucks in Los Angeles
factual.get('/t/places-us', {q:"starbucks", filters:{"locality":"los angeles"}}, function (error, res) {
  console.log(res.data);
});

//  search for starbucks in Los Angeles or Santa Monica 
factual.get('/t/places-us', {q:"starbucks", filters:{"$or":[{"locality":{"$eq":"los angeles"}},{"locality":{"$eq":"santa monica"}}]}}, function (error, res) {
  console.log(res.data);
});

// Paging:
//  search for starbucks in Los Angeles or Santa Monica (second page of results):
factual.get('/t/places-us', {q:"starbucks", filters:{"$or":[{"locality":{"$eq":"los angeles"}},{"locality":{"$eq":"santa monica"}}]}, offset:2, limit:1}, function (error, res) {
  console.log(res.data);
});

// Geo filter:
//  coffee near the Factual office
factual.get('/t/places-us', {q:"coffee", geo:{"$circle":{"$center":[34.058583, -118.416582],"$meters":1000}}}, function (error, res) {
  console.log(res.data);
});

// Existence threshold:
//  prefer precision over recall:
factual.get('/t/places-us', {threshold:"confident"}, function (error, res) {
  console.log(res.data);
});

// Get a row by factual id:
factual.get('/t/places-us/03c26917-5d66-4de9-96bc-b13066173c65', function (error, res) {
  console.log(res.data[0]);
});

```

## Facets
Use the facets call to get summarized counts, grouped by specified fields.

Full documentation: http://developer.factual.com/api-docs/#Facets
```javascript
// show top 5 cities that have more than 20 Starbucks in California
factual.get('/t/places-us/facets', {q:"starbucks", filters:{"region":"CA"}, select:"locality", "min_count":20, limit:5}, function (error, res) {
  console.log(res.data);
});
```

## Resolve
Use resolve to generate a confidence-based match to an existing set of place attributes.

Full documentation: http://developer.factual.com/api-docs/#Resolve
```javascript
// resovle from name and address info
factual.get('/t/places-us/resolve?values={"name":"McDonalds","address":"10451 Santa Monica Blvd","region":"CA","postcode":"90025"}', function (error, res) {
  console.log(res.data);
});

// resolve from name and geo location
factual.get('/t/places-us/resolve?values={"name":"McDonalds","latitude":34.05671,"longitude":-118.42586}', function (error, res) {
  console.log(res.data);
});
```

## Crosswalk
Crosswalk contains third party mappings between entities.

Full documentation: http://developer.factual.com/places-crosswalk/

```javascript
// Query with factual id, and only show entites from Yelp:
factual.get('/t/crosswalk?filters={"factual_id":"3b9e2b46-4961-4a31-b90a-b5e0aed2a45e","namespace":"yelp"}', function (error, res) {
  console.log(res.data);
});
```

```javascript
// query with an entity from Foursquare:
factual.get('/t/crosswalk?filters={"namespace":"foursquare", "namespace_id":"4ae4df6df964a520019f21e3"}', function (error, res) {
  console.log(res.data);
});
```

## World Geographies
World Geographies contains administrative geographies (states, counties, countries), natural geographies (rivers, oceans, continents), and assorted geographic miscallaney.  This resource is intended to complement the Global Places and add utility to any geo-related content.

```javascript
// find California, USA
factual.get('/t/world-geographies?', {q:"los angeles",filters:{"$and":[{"name":{"$eq":"California"}},{"country":{"$eq":"US"}},{"placetype":{"$eq":"region"}}]},select:"contextname,factual_id"}, function (error, res) {
  console.log(res.data);
});
// returns 08649c86-8f76-11e1-848f-cfd5bf3ef515 as the Factual Id of "California, US"
```

```javascript
// find cities and town in California (first 20 rows)
factual.get('/t/world-geographies?', {q:"los angeles",filters:{"$and":[{"ancestors":{"$includes":"08649c86-8f76-11e1-848f-cfd5bf3ef515"}},{"country":{"$eq":"US"}},{"placetype":{"$eq":"locality"}}]},select:"contextname,factual_id"}, function (error, res) {
  console.log(res.data);
});
```

## Submit
Submit new data, or update existing data. Submit behaves as an "upsert", meaning that Factual will attempt to match the provided data against any existing places first. Note: you should ALWAYS store the *commit ID* returned from the response for any future support requests.

Full documentation: http://developer.factual.com/api-docs/#Submit

Place-specific Write API documentation: http://developer.factual.com/write-api/

```javascript
factual.post('/t/us-sandbox/submit', {
  values: JSON.stringify({
    name: "Factual",
    address: "1999 Avenue of the Stars",
    address_extended: "34th floor",
    locality: "Los Angeles",
    region: "CA",
    postcode: "90067",
    country: "us",
    latitude: 34.058743,
    longitude: -118.41694,
    category_ids: [209,213],
    hours: "Mon 11:30am-2pm Tue-Fri 11:30am-2pm, 5:30pm-9pm Sat-Sun closed"
  }),
  user: "a_user_id"
}, function (error, res) {
  console.log(res);
});
```

## Flag
Use the flag API to flag problems in existing data.

Full documentation: http://developer.factual.com/api-docs/#Flag

Flag a place that is a duplicate of another. The *preferred* entity that should persist is passed as a GET parameter.
```javascript
factual.post('/t/us-sandbox/4e4a14fe-988c-4f03-a8e7-0efc806d0a7f/flag', {
  problem: "duplicate",
  preferred: "9d676355-6c74-4cf6-8c4a-03fdaaa2d66a",
  user: "a_user_id"
}, function (error, res) {
  if (!error) console.log("success");
});
```

Flag a place that is closed.
```javascript
factual.post('/t/us-sandbox/4e4a14fe-988c-4f03-a8e7-0efc806d0a7f/flag', {
  problem: "closed",
  user: "a_user_id",
  comment: "was shut down when I went there yesterday."
}, function (error, res) {
  if (!error) console.log("success");
});
```

Flag a place that has been relocated, so that it will redirect to the new location. The *preferred* entity (the current location) is passed as a GET parameter. The old location is identified in the URL.
```javascript
factual.post('/t/us-sandbox/4e4a14fe-988c-4f03-a8e7-0efc806d0a7f/flag', 
{
  problem: "relocated",
  preferred: "9d676355-6c74-4cf6-8c4a-03fdaaa2d66a",
  user: "a_user_id"
}, function (error, res) {
  if (!error) console.log("success");
});
```

## Error Handling
The error object is the first argument of the callback functions, it will be null if no errors.

## Debug Mode
To see detailed debug information at runtime, you can turn on Debug Mode:
```javascript
// start debug mode
factual.startDebug();

// run your querie(s)

// stop debug mode
factual.stopDebug();
```
Debug Mode will output useful information about what's going on, including  the request sent to Factual and the response from Factual, outputting to stdout and stderr.


## Custom timeouts
You can set the request timeout (in milliseconds):
```javascript
// set the timeout as 1 second
factual.setRequestTimeout(1000);
// clear the custom timeout setting
factual.setRequestTimeout();
```
You will get [Error: socket hang up] for custom timeout errors.


# Where to Get Help

If you think you've identified a specific bug in this driver, please file an issue in the github repo. Please be as specific as you can, including:

  * What you did to surface the bug
  * What you expected to happen
  * What actually happened
  * Detailed stack trace and/or line numbers

If you are having any other kind of issue, such as unexpected data or strange behaviour from Factual's API (or you're just not sure WHAT'S going on), please contact us through the [Factual support site](http://support.factual.com/factual).
