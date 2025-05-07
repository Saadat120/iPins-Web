let map;

async function initMap() {
  // Get search query from URL
  const params = new URLSearchParams(window.location.search);
  const locationQuery = params.get("location") || "New York, NY"; // fallback location

  // Load Google Maps libraries
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const { Geocoder } = await google.maps.importLibrary("geocoding");

  // Geocode the search query
  const geocoder = new Geocoder();

  geocoder.geocode({address: locationQuery }, (results, status) => {
    if (status === "OK" && results[0]) {
      const position = results[0].geometry.location;

      // Initialize map centered at the result
      map = new Map(document.getElementById("map"), {
        zoom: 13,
        center: position,
        mapId: "DEMO_MAP_ID",
        disableDefaultUI: true,
      });

      // Add a marker
      const marker = new AdvancedMarkerElement({
        map: map,
        position: position,
        title: locationQuery,
      });
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

initMap();
