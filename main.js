const key = "2b047b0d609130b82cbffdfc1c93e1fc";

async function search() {
  const phaser = document.querySelector("input[type=text]").value;
  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${phaser}&limit=5&appid=${key}`
  );
  const data = await response.json();
  const ul = document.querySelector("form ul");

  ul.innerHTML = "";
  for (let i = 0; i < data.length; i++) {
    const { name, lat, lon, country } = data[i];
    ul.innerHTML += `<li data-lat="${lat}" data-lon="${lon}" data-name="${name}">${name}<span>${country}</span></li>`;
  }
}

const debouncedSearch = _.debounce(() => {
  search();
}, 600);

async function showWeather(lat, lon, name) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`
  );
  const data = await response.json();

  const temp = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const humidity = Math.round(data.main.humidity);
  const wind = data.wind.speed;
  const icon = data.weather[0].icon;
  const clouds = data.clouds.all;
  const visibility = Math.floor(data.visibility / 1000) + "km";

  document.getElementById("city").innerHTML = name;
  document.getElementById("degrees").innerHTML = temp + "<span>&#8451;</span>";
  document.getElementById("feelsLikeValue").innerHTML =
    feelsLike + "<span>&#8451;</span>";
  document.getElementById("windValue").innerHTML = wind + "<span>km/h</span>";
  document.getElementById("humidityValue").innerHTML =
    humidity + "<span>%</span>";
  document.getElementById("cloudsValue").innerHTML = clouds + "<span>%</span>";
  document.getElementById("visibilityValue").innerHTML = visibility;
  document.getElementById(
    "icon"
  ).src = `https://openweathermap.org/img/wn/${icon}@4x.png`;
  document.querySelector("form").style.display = "none";
  document.getElementById("weather").style.display = "block";
}

document
  .querySelector("input[type=text]")
  .addEventListener("keyup", debouncedSearch);

document.body.addEventListener("click", (ev) => {
  const li = ev.target;
  const { lat, lon, name } = li.dataset;

  localStorage.setItem("lat", lat);
  localStorage.setItem("lon", lon);
  localStorage.setItem("name", name);
  if (!lat) {
    return;
  }
  showWeather(lat, lon, name);
  addMarker(lat, lon, name);
});

document.getElementById("change").addEventListener("click", () => {
  document.getElementById("weather").style.display = "none";
  document.querySelector("form").style.display = "block";
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });
});

document.body.onload = () => {
  if (localStorage.getItem("lat")) {
    const lat = localStorage.getItem("lat");
    const lon = localStorage.getItem("lon");
    const name = localStorage.getItem("name");
    showWeather(lat, lon, name);
  }
};

function addMarker(lat, lon, name) {
  var addMk = L.marker([lat, lon]);
  addMk.addTo(map).bindPopup(`${name}`);
  map.setView(addMk.getLatLng(), 8);
}

let config = {
  minZoom: 7,
  maxZoom: 25,
  fullscreenControl: true,
};

const latDf = 16.075284;
const lngDf = 108.21273956718721;

const map = L.map("map", config).setView([latDf, lngDf], 10);

L.tileLayer(
  "https://{s}.tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token={accessToken}",
  {
    attribution:
      '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 7,
    maxZoom: 20,
    subdomains: "abcd",
    accessToken:
      "yN0ESgFsBwgdpSy0MoyaFsDI66mXptDz4cWH0wArMflMJCBK7TkuyjQY8OtqEViZ",
  }
).addTo(map);

L.control
.scale({ maxWidth: 440, metric: true, position: "bottomleft" })
.addTo(map);

// L.control
// .polylineMeasure({
//   position: "topleft",
//   imperial: false,
//   clearMeasurementsOnStop: false,
//   showMeasurementsClearControl: true,
// })
// .addTo(map);
