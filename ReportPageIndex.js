
const submitBtn = document.getElementById('Btn');
const networkType = document.getElementById("network-type");
const MainIssue = document.getElementById("Network-issue");
const UserLocation = document.getElementById("location");
const bodyDiv = document.getElementById("MainDiv");
const form = document.getElementById("form");
const description = document.getElementById("Problem-description");
const notification = document.getElementById("notification");

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
    networkType.style.color = "blue";
    networkType.style.backgroundColor = "rgba(255, 255, 255, 1)";
    form.style.backgroundColor = "blue";
    submitBtn.style.backgroundColor = "blue";
    MainIssue.style.backgroundColor = "rgba(255, 255, 255, 1)";
    MainIssue.style.color = "blue";
    description.style.backgroundColor = "rgba(255, 255, 255, 1)";
    description.style.color = "blue";
    submitBtn.style.outline = "3px solid blue" ;
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

UserLocation.addEventListener("click", function(){
  if (!UserLocation.checked){

    alert("Alert! Please we need your location to pinpoint network issues in your area and provide  faster resolution. Please enable location.");
};

if (UserLocation.checked){

}});
submitBtn.addEventListener("click",function (){
  notification.style.zIndex = 1000;
})
