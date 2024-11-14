const locations = [
  {
    name: "Pinecrest - Main Store",
    position: { lat: 25.6627, lng: -80.3164 },
    address: "12101 S Dixie Hwy, Miami, FL 33156"
  },
  {
    name: "Coral Gables",
    position: { lat: 25.7497, lng: -80.2589 },
    address: "2345 Miracle Mile, Coral Gables, FL 33134"
  },
  {
    name: "South Beach",
    position: { lat: 25.7813, lng: -80.1339 },
    address: "789 Collins Ave, Miami Beach, FL 33139"
  }
];

function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 11,
    center: locations[0].position,
    styles: [
      {
        featureType: "poi.business",
        stylers: [{ visibility: "on" }]
      }
    ]
  });

  locations.forEach(location => {
    const marker = new google.maps.Marker({
      position: location.position,
      map: map,
      title: location.name,
      icon: {
        url: 'assets/images/map-marker.png',
        scaledSize: new google.maps.Size(40, 40)
      }
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="map-info-window">
          <h3>${location.name}</h3>
          <p>${location.address}</p>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${location.position.lat},${location.position.lng}" target="_blank">Get Directions</a>
        </div>
      `
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  });
}
