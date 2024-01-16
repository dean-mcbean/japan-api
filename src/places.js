const Loader = require("@googlemaps/js-api-loader").Loader

const loader = new Loader({
    apiKey: "KEY",
    version: "weekly",
});

loader.load().then(async () => {
    const { Map } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("map"), {
        center: { lat: 35.689534991191756, lng: 139.78061216325492 },
        zoom: 9,
        mapId: "b683f895f3a47c0a"
    });

    findPlaces('mcdonalds')
});

async function queryPlaces(query, count = 1) {
    const placesService = new google.maps.places.PlacesService(map);
  
    const request = {
      query: query,
      fields: ["name", "geometry"],
      language: "en-US",
      region: "jp",
    };
  
    try {
      const response = await new Promise((resolve, reject) => {
        placesService.textSearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(results.slice(0, count));
          } else {
            reject(new Error("Places API Error: " + status));
          }
        });
      });
  
      return response;
    } catch (error) {
      console.error(error);
      return null;
    }
}


module.exports = {
    queryPlaces
}
