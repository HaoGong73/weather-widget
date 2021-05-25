// api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
// Parameters lat, lon	required	Geographical coordinates (latitude, longitude)
const appid =  '&appid=6cf1bc4601966648a8cbb5f80e540508';
const urlHead = 'https://api.openweathermap.org/data/2.5/';
const currentConditions = document.querySelector('.current-conditions');
const forecast = document.querySelector('.forecast');
currentConditions.innerHTML = '';
forecast.innerHTML = '';

const getTodayTimestring  = () => {
  const date = new Date();
  return date.toLocaleString('en-CA').substr(0,10);
}

const getHighestTempInADay = (array) => {
  let tempHighest = array[0].main.temp_max;
  array.forEach(element => {
    if(element.main.temp_max > tempHighest) {
      tempHighest = element.main.temp_max;
    }
  })

  return Math.round(tempHighest);
}

const getLowestTempInADay = (array) => {
  let tempLowest = array[0].main.temp_min;
  array.forEach(element => {
    if(element.main.temp_min < tempLowest) {
      tempLowest = element.main.temp_min;
    }
  })

  return Math.round(tempLowest);
}

const getWeekDayByTimestring = (timestring) => {
  const date = new Date(timestring + ' UTC');

  return date.toLocaleString('en-CA', {weekday: 'long'});
}

const getForecastSeq = () => {
  let date = new Date();

  return Math.floor(parseInt(date.getHours())/3);
}

const getCurrent = async (latitude, longitude) => {
  let urlCurrent = `${urlHead}weather?lat=${latitude}&lon=${longitude}&units=metric${appid}`;
  
  const response = await fetch(urlCurrent);
  const data = await response.json();
  
  return data;
}

const getForecast = async (latitude, longitude) => {
  let urlForecast = `${urlHead}forecast?lat=${latitude}&lon=${longitude}&units=metric${appid}`;

  const response = await fetch(urlForecast);
  const data = await response.json();
  
  return data.list;
}

const renderCurrentHTML = (current) => {
  currentConditions.innerHTML = 
    `<h2>Current Conditions</h2>
    <img src="http://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png" />
    <div class="current">
    <div class="temp">${parseInt(current.main.temp)}℃</div>
    <div class="condition">${current.weather[0].description}</div>
    </div>`
}

const getDayStringFromUTC = (UTCDayString) => {
  return new Date(UTCDayString + ' UTC').toLocaleString('en-CA').substr(0,10);
}

const organizeData = (forecastOBJ) => {
  let tempArr = [];
  let forecastArray =[];
  let today = getTodayTimestring();
  let tempObj = forecastOBJ.filter(element => {
    return getDayStringFromUTC(element.dt_txt) !== today;
  });
  let dateOfForecast = getDayStringFromUTC(tempObj[0].dt_txt);

  tempObj.forEach(element => {
    let elementDayUTC = getDayStringFromUTC(element.dt_txt);
    if (dateOfForecast !== elementDayUTC) {
      dateOfForecast = elementDayUTC;
      forecastArray[forecastArray.length] = tempArr;
      tempArr = [];
    }
    tempArr[tempArr.length] = element;
  });

  if (forecastArray.length < 5) {
    forecastArray[forecastArray.length] = tempArr;
  }

  console.log(forecastArray);
  return forecastArray;
}

const renderOneDayHTML = (oneDay) => {
  const weekDay = getWeekDayByTimestring(oneDay[0].dt_txt);
  let sequence = getForecastSeq() ;
  sequence = sequence > oneDay.length - 1 ? oneDay.length - 1 : sequence;
  forecast.innerHTML +=   
  `<div class="day">
    <h3>${weekDay}</h3>
    <img src="http://openweathermap.org/img/wn/${oneDay[sequence].weather[0].icon}@2x.png" />
    <div class="description">${oneDay[sequence].weather[0].description}</div>
    <div class="temp">
      <span class="high">${getHighestTempInADay(oneDay)}℃</span>/<span class="low">${getLowestTempInADay(oneDay)}℃</span>
    </div>
  </div>`;
}

const renderForecastHTML = (forecastArray) => {
  forecastArray.forEach(oneDay => {
    renderOneDayHTML(oneDay);
  })
}

let options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

function success(pos) {
  let crd = pos.coords;

  getCurrent(crd.latitude, crd.longitude)
  .then((data) => renderCurrentHTML(data));

  getForecast(crd.latitude, crd.longitude)
  .then((data) => {return organizeData(data)})
  .then((forecast5DaysArray) => renderForecastHTML(forecast5DaysArray));
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);