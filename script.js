const list1Password = "m1";
const list2Password = "group1";

function unlockList(listNumber) {
  const password = prompt("Enter password to access List " + listNumber);

  if (listNumber === 1 && password === list1Password) {
    document.getElementById('list1').style.display = 'block';
    document.getElementById('list2').style.display = 'none';
  } else if (listNumber === 2 && password === list2Password) {
    document.getElementById('list2').style.display = 'block';
    document.getElementById('list1').style.display = 'none';
  } else {
    alert("Incorrect password.");
  }
}

// Add Spot to List 1
document.getElementById("spotForm1").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("spotName1").value.trim();
  const link = document.getElementById("spotLink1").value.trim();

  if (name !== "") {
    const li = document.createElement("li");
    li.innerHTML = link ? `<strong>${name}</strong><a href="${link}" target="_blank">${link}</a>` : `<strong>${name}</strong>`;
    document.getElementById("spotList1").appendChild(li);
    this.reset();
  }
});

// Add Spot to List 2
document.getElementById("spotForm2").addEventListener("submit", function(e) {
  e.preventDefault();
  const name = document.getElementById("spotName2").value.trim();
  const link = document.getElementById("spotLink2").value.trim();

  if (name !== "") {
    const li = document.createElement("li");
    li.innerHTML = link ? `<strong>${name}</strong><a href="${link}" target="_blank">${link}</a>` : `<strong>${name}</strong>`;
    document.getElementById("spotList2").appendChild(li);
    this.reset();
  }
});


