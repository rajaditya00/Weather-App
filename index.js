const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container")

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");

const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorContainer =document.querySelector("[error-container]");

// initial variable needs

let currentTab = userTab;
const API_key = "74b4a5028e76d0b54e13c32a6b1b125d";
currentTab.classList.add("current-tab");

// ek kaam aur pending hai ??
getfromSessionStorage();

function switchTab(clickedTab){
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab =clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
          

        }
        else{
            // main pehle search wale tab pr tha , ab your weather tab visible krna hain
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
     

            //ab main your weather tab main aa gya hun, toh weather bhi display krna parega . so lets check local storage first for coordinates, if we have saved them there.
           getfromSessionStorage();
        }
    }
}



userTab.addEventListener("click",()=>{
    //pass clicked tab as input parameter
    switchTab(userTab)
})

searchTab.addEventListener("click",()=>{
    //pass clicked tab as input parameter
    switchTab(searchTab)
})

// check if coordinates are already present in sesion storage
function  getfromSessionStorage(){
    const localCoordinates =sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        //agar local coordinates nhi mile
        grantAccessContainer.classList.add("active")
    }
    else{
        const usercoordinates=JSON.parse(localCoordinates);
        fetchUserWeatherInfo(usercoordinates);
}

    }
 

 async function fetchUserWeatherInfo(coordinates){
    const {lat,lon} = coordinates;
    // make grantcontainer invisible
    loadingScreen.classList.add("active");

    // API CALL
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`);

        const data = await response.json();
        loadingScreen.classList.remove("active");
        grantAccessContainer.classList.remove("active");
        // errorContainer.classList.remove("active");
        userInfoContainer.classList.add("active");
         

        renderWeatherInfo(data);

    }
    catch(err){
        loadingScreen.classList.remove("active");
        // errorContainer.classList.add("active");
       

      // hw
    }
}

function renderWeatherInfo(weatherInfo){
    // firstly we have to fetch the element
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryName]");
    const desc =document.querySelector("[data-WeatherDesc]");
    const weatherIcon =document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]")
    const windspeed =document.querySelector("[data-windspeed]");
    const humidity =document.querySelector("[data-humidity]");
    const cloudiness =document.querySelector("[data-cloudiness]");

    // fetch values from weatherINfo object and put its UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src =`https://flagcdn.com/48x36/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    // countryIcon.src =`https://flagcdn.com/48x36/${weatherInfo?.name}.png`;

  
    desc.innerText =weatherInfo?.weather?.[0]?.description;
    weatherIcon.src =`http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText =`${weatherInfo?.main?.temp}°C`;
    windspeed.innerText =`${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
    
}


function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
       // -> show  an alert for no geolocationsupport available
  

    }
}

function showPosition(position){
    const usercoordinates = {
        lat : position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates",JSON.stringify(usercoordinates));
    fetchUserWeatherInfo(usercoordinates)
}

const grantAccessButton =document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click",getLocation);




const searchInput =document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName ==="")
    return;
    else
    fetchSearchWeatherInfo(searchInput.value);
})

// async function fetchSearchWeatherInfo(city){
//     loadingScreen.classList.add("active");
//     userInfoContainer.classList.remove("active");
//     grantAccessContainer.classList.remove("active");
//     errorContainer.classList.remove("active");


//     try{
//         const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`);
//         const data = await response.json();
//         loadingScreen.classList.remove("active");
//         // loadingScreen.classList.add("active");
//         userInfoContainer.classList.add("active");
//         renderWeatherInfo(data);
//     }
//     catch(err){
//          loadingScreen.classList.add("active");
//          errorContainer.classList.add("active");

      

//     }

// }


async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    errorContainer.classList.remove("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`);
        const data = await response.json();

        if (response.status === 404) {
            // City not found
            loadingScreen.classList.remove("active");
            errorContainer.classList.add("active");
            errorContainer.querySelector(".error-message").textContent = "Sorry, city not found";
        } else if (response.ok) {
            // Data retrieved successfully
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        } else {
            // Handle other API errors here
            loadingScreen.classList.remove("active");
            errorContainer.classList.add("active");
            errorContainer.querySelector(".error-message").textContent = "An error occurred while fetching weather data.";
        }
    } catch (err) {
        loadingScreen.classList.remove("active");
        errorContainer.classList.add("active");
        errorContainer.querySelector(".error-message").textContent = "An error occurred while fetching weather data.";
    }
}
