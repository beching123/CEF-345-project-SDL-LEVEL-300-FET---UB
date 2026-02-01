
// Grab DOM elements
const formData = {
  networkType: document.getElementById("network-type"),
  Tel: document.getElementById("phoneNumber"),
  mainIssue: document.getElementById("Network-issue"),
  description: document.getElementById("Problem-description"),
  UserLocation: document.getElementById("location"),
};

const submitBtn = document.getElementById('Btn');
const form = document.getElementById("form");

// Handling Visual Changes
formData.networkType.addEventListener("input", function () {
    const NetType = formData.networkType.value;
    const colors = { 'MTN': '#ffcb05', 'ORANGE': '#ff7900', 'CAMTEL': '#00abe7' };
    submitBtn.style.backgroundColor = colors[NetType] || "#007aff";
});

// Submit Logic
submitBtn.addEventListener("click", function (event) {
  event.preventDefault();

  const NetType = formData.networkType.value;

  // Basic Frontend Check
  if (NetType === "" || !formData.Tel.value || !formData.UserLocation.checked) {
    alert("Alert! Please select a network, enter a phone number, and enable location to proceed.");
    return;
  }

  const reportPayload = {
    networkType: NetType,
    phone: formData.Tel.value,
    issue: formData.mainIssue.value,
    description: formData.description.value,
    locationAllowed: formData.UserLocation.checked
  };

  // SENDING DATA TO SERVER
  fetch("/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reportPayload)
  })
  .then(response => response.json())
  .then(data => {
    // We use the message sent back by the server
    alert(data.message); 
    if (data.status === "success") form.reset();
  })
  .catch(error => {
    alert("Connection Error: Could not reach the Netlink Server.");
  });
});
