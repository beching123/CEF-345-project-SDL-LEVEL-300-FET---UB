
const submitBtn = document.getElementById('Btn');
const networkType = document.getElementById("network-type");
const MainIssue = document.getElementById("Network-issue");
const UserLocation = document.getElementById("location");
const bodyDiv = document.getElementById("MainDiv");
const form = document.getElementById("form");
const description = document.getElementById("Problem-description");
const notification = document.getElementById("notification");
const Ntnpar = document.getElementById("NtnPar");
const OkBtn = document.getElementById("OkBtn");

networkType.addEventListener("input", function (){

  const NetType = networkType.value;

  if (NetType == "MTN"){
    networkType.style.color = "yellow";
    networkType.style.backgroundColor = "rgba(59, 58, 58, 1)";
    form.style.backgroundColor = "yellow";
    submitBtn.style.backgroundColor = "yellow";
    MainIssue.style.backgroundColor = "rgba(59, 58, 58, 1)";
    MainIssue.style.color = "yellow";
    description.style.backgroundColor = "rgba(59, 58, 58, 1)";
    description.style.color = "yellow";
    submitBtn.style.outline = "3px solid rgb(230, 230, 3);";
  };

  if(NetType == "ORANGE"){
    networkType.style.color = "orange";
    networkType.style.backgroundColor = "rgba(59, 58, 58, 1)";
    form.style.backgroundColor = "orange";
    submitBtn.style.backgroundColor = "orange";
    MainIssue.style.backgroundColor = "rgba(59, 58, 58, 1)";
    MainIssue.style.color = "orange";
    description.style.backgroundColor = "rgba(59, 58, 58, 1)";
    description.style.color = "orange";
    submitBtn.style.outline = "3px solid orange";
  };

  if (NetType === "CAMTEL"){
    networkType.style.color = "rgba(9, 138, 218, 1)";
    networkType.style.backgroundColor = "rgba(255, 255, 255, 1)";
    form.style.backgroundColor = "rgba(9, 138, 218, 1)";
    submitBtn.style.backgroundColor = "rgba(9, 138, 218, 1)";
    MainIssue.style.backgroundColor = "rgba(255, 255, 255, 1)";
    MainIssue.style.color = "rgba(9, 138, 218, 1)";
    description.style.backgroundColor = "rgba(255, 255, 255, 1)";
    description.style.color = "rgba(9, 138, 218, 1)";
    submitBtn.style.outline = "3px solid rgba(9, 138, 218, 1)" ;
  };

   if (NetType !== "CAMTEL" && NetType !== "ORANGE" && NetType !== "MTN") {
    networkType.style.color = "black";
    networkType.style.backgroundColor = "white";
    form.style.backgroundColor = "white";
    MainIssue.style.backgroundColor = "white";
    MainIssue.style.color = "black";
    description.style.backgroundColor = "white";
    description.style.color = "black";
  };
});


//event to handle users device location
UserLocation.addEventListener("click", function(){
  if (!UserLocation.checked){//If they refuse to give us permission to their location
    notification.style.display = "block";
    notification.style.zIndex = 1;
    Ntnpar.textContent = "Alert! Please we need your location to pinpoint network issues in your area and provide  faster resolution. Please enable location."
};

//when the user accept to give their location
if (UserLocation.checked){
  getLocation();
}});

submitBtn.addEventListener("click",function (){
  notification.style.zIndex = 1;
});
OkBtn.addEventListener("click",function (){
  notification.style.display = "none";
});

//function to get user location
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else { 
      notification.style.display = "block";
      notification.style.zIndex = 1;
      Ntnpar = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
   
   notification.style.display = "block";
   notification.style.zIndex = 1;
   Ntnpar.textContent = "Latitude: " + position.coords.latitude + 
  "Longitude: " + position.coords.longitude;
}

function showError(error) {

  notification.style.display = "block";
  notification.style.zIndex = 1;

  switch(error.code) {
    case error.PERMISSION_DENIED:
        Ntnpar.textContent =  "User denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
         Ntnpar.textContent =  "Location information is unavailable.";
      break;
    case error.TIMEOUT:
       Ntnpar.textContent =  "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
        Ntnpar.textContent = "An unknown error occurred.";
      break;
  }
}