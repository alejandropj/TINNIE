var mapa = L.map("mapa").setView([40.300, -3.44], 10);


L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
}).addTo(mapa);

var icono = L.icon({
  iconUrl: 'img/marcador.ico',
  iconSize: [60,60]
});

var marcador = L.marker([40.303, -3.438], {icon:icono}).addTo(mapa);
ubicacion();

function ubicacion(){
  var ubi = document.getElementById("ubi");
  if (!"geolocation" in navigator) {
      ubi.textContent = "Tu navegador no soporta el acceso a la ubicación. Intenta con otro";
  }

  const onUbicacionConcedida = ubicacion => {
    var marcadorPos = L.marker([ubicacion.coords.latitude, ubicacion.coords.longitude]).addTo(mapa);
  }

  const onErrorDeUbicacion = err => {
      ubi.textContent ="Error obteniendo tu ubicación.";
  }

  const opcionesDeSolicitud = {
      enableHighAccuracy: true,
      maximumAge: 0, 
      timeout: 5000
  };
 
  navigator.geolocation.getCurrentPosition(onUbicacionConcedida, onErrorDeUbicacion, opcionesDeSolicitud);

}