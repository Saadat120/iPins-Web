import { db } from './firebase.js';
import { collection, getDocs, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';
import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

let map;
let AdvancedMarkerElement = null;
let useAdvancedMarkers = false;

// Initialize map
async function initMap() {
  document.getElementById("addPinBtn").addEventListener("click", () => {
    if (!currentUser) {
      alert("Please log in first to add a pin.");
      return;
    }
    document.getElementById("addPinModal").style.display = "block";
  });
  
  document.getElementById("closeAddPinModal").addEventListener("click", () => {
    document.getElementById("addPinModal").style.display = "none";
  });
  
  document.getElementById("addPinForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const eventName = document.getElementById("eventName").value.trim();
    const address = document.getElementById("eventAddress").value.trim();
    const LocationName = document.getElementById("locationName").value.trim();
    const subject = document.getElementById("subjectSelect").value;
    const errorEl = document.getElementById("pinError");
  
    errorEl.textContent = ""; // Clear old errors
  
    if (!eventName || !address || !LocationName || !subject) {
      errorEl.textContent = "Please fill in all fields.";
      return;
    }
  
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, async (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        const coords = {
          lat: location.lat(),
          lng: location.lng()
        };
  
        // Store in Firestore
        try {
          const pinRef = doc(db, "pins", eventName);
          await setDoc(pinRef, {
            Address: address,
            LocationName,
            subject,
            latitude: coords.lat,
            longitude: coords.lng
          });
  
          placeMarker(coords, LocationName, subject); // place on map
          document.getElementById("addPinModal").style.display = "none";
          document.getElementById("addPinForm").reset();
        } catch (error) {
          errorEl.textContent = "Error saving pin: " + error.message;
        }
  
      } else {
        errorEl.textContent = "Geocoding failed: " + status;
      }
    });
  });
  
  const params = new URLSearchParams(window.location.search);
  const locationQuery = params.get("location") || "New York, NY";

  // Load Maps API modules
  const { Map } = await google.maps.importLibrary("maps");
  const { Geocoder } = await google.maps.importLibrary("geocoding");

  try {
    const markerLib = await google.maps.importLibrary("marker");
    AdvancedMarkerElement = markerLib.AdvancedMarkerElement;
    useAdvancedMarkers = true;
  } catch (e) {
    console.warn("AdvancedMarkerElement not available, using standard Marker.");
  }

  // Geocode location for map center
  const geocoder = new Geocoder();
  geocoder.geocode({ address: locationQuery }, (results, status) => {
    if (status === "OK" && results[0]) {
      const center = results[0].geometry.location;

      map = new Map(document.getElementById("map"), {
        center,
        zoom: 13,
        disableDefaultUI: false,
        mapTypeControl: false,
        fullscreenControl: false,
        mapId: 'DEMO_MAP_ID'
      });

      // Load pins from Firestore
      loadPinsOnMap(map);
    } else {
      alert("Geocoding failed: " + status);
    }
  });
}

// Place a marker (supports advanced fallback)
function placeMarker(position, title, subject) {
  if (useAdvancedMarkers && AdvancedMarkerElement) {
    const img = document.createElement("img");
    img.src = `././assets/${subject || 'default'}.png`;
    img.style.width = "48px";
    img.style.height = "48px";

    new AdvancedMarkerElement({
      map,
      position,
      content: img,
      title
    });
  } else {
    new google.maps.Marker({
      map,
      position,
      title
    });
  }
}

// Load pins from Firestore and place them on map
async function loadPinsOnMap(map) {
  const snapshot = await getDocs(collection(db, "pins"));

  for (const doc of snapshot.docs) {
    const data = doc.data();

    if (data.latitude != null && data.longitude != null) {
      const position = {
        lat: data.latitude,
        lng: data.longitude
      };

      placeMarker(position, data.LocationName || "Untitled", data.subject || "coffee");
      console.log(data.Address)
    } else {
      console.warn("Skipping pin with missing coordinates:", data);
    }
  }
}

// Start
initMap();
