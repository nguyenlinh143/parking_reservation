
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyDpu1y9bgzETejQZlafcEm9Td-lFsim5M",
  authDomain: "parkingreservation-7a499.firebaseapp.com",
  projectId: "parkingreservation-7a499",
  storageBucket: "parkingreservation-7a499.firebasestorage.app",
  messagingSenderId: "56068870868",
  appId: "1:56068870868:web:d4c6091fcc566072aaa141",
  measurementId: "G-4PJMHP6DWZ"
};

// INIT FIREBASE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const colRef = collection(db, "parking");


const slots = {

  Indoor: ["I1", "I2"],

  Outdoor: ["O3", "O4", "O5", "O6", "O7", "O8"],

  Bike: ["B1","B2","B3","B4","B5","B6","B7","B8","B9","B10","B11","B12"]

};

let currentType = "Outdoor";
let selectedSlot = "";

async function getBookings() {

  const snapshot = await getDocs(colRef);

  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

}


async function showSlots(type) {

  currentType = type;

  await renderSlots();

}


async function renderSlots() {
console.log("renderSlots running");
console.log("currentType:", currentType);
console.log("slots:", slots[currentType]);
  const bookings = await getBookings();

  const date = document.getElementById("checkDate")?.value || "";

  let html = "";

  slots[currentType].forEach(slot => {

    let booked = false;

    if (date) {

      booked = bookings.some(b =>
        b.slot === slot &&
        Array.isArray(b.dates) &&
        b.dates.includes(date)
      );

    }

    html += `
      <div class="slot ${booked ? "booked" : "available"}"
           onclick="selectSlot('${slot}')">
        ${slot}
      </div>
    `;
  });

  document.getElementById("slots").innerHTML = html;

  loadTable(bookings);

}


function selectSlot(slot) {

  selectedSlot = slot;

  document.getElementById("slotTitle").innerText =
    "Selected Slot: " + slot;

}

async function saveBooking() {

  if (!selectedSlot) {
    alert("Please select a slot.");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const plate = document.getElementById("plate").value.trim();

  const dates = [...document.querySelectorAll(".date")]
    .map(d => d.value)
    .filter(d => d);

  if (!name || !plate || dates.length === 0) {
    alert("Please fill all fields.");
    return;
  }

  const bookings = await getBookings();

  // prevent duplicate booking
  for (let b of bookings) {

    if (b.slot !== selectedSlot) continue;

    const existingDates = Array.isArray(b.dates) ? b.dates : [];

    for (let d of dates) {

      if (existingDates.includes(d)) {
        alert(`${selectedSlot} already booked on ${d}`);
        return;
      }
    }
  }

  await addDoc(colRef, {
    slot: selectedSlot,
    name,
    plate,
    dates
  });

  alert("Reservation saved.");

  document.getElementById("form").reset();
  selectedSlot = "";

  await renderSlots();

}


function loadTable(bookings) {

  const table = document.getElementById("table");

  if (!bookings.length) {
    table.innerHTML = `<tr><td colspan="5">No reservations yet</td></tr>`;
    return;
  }

  let html = "";

  bookings.forEach(b => {

    html += `
      <tr>
        <td>${b.slot}</td>
        <td>${b.name}</td>
        <td>${b.plate}</td>
        <td>${(b.dates || []).join("<br>")}</td>
        <td>
          <button onclick="deleteBooking('${b.id}')">
            Delete
          </button>
        </td>
      </tr>
    `;
  });

  table.innerHTML = html;

}


async function deleteBooking(id) {

  const deletedBy = prompt("Enter your name:");
  if (!deletedBy) return;

  const reason = prompt("Reason for deletion:");
  if (!reason) return;

  if (!confirm("Are you sure?")) return;

  await deleteDoc(doc(db, "parking", id));

  console.log({ deletedBy, reason });

  alert("Deleted successfully");

  await renderSlots();

}

window.showSlots = showSlots;
window.selectSlot = selectSlot;
window.saveBooking = saveBooking;
window.deleteBooking = deleteBooking;


window.addEventListener("DOMContentLoaded", async () => {

  currentType = "Outdoor";

  await renderSlots();

});