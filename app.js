const slots = {

    Outdoor: ["O1", "O2", "O3", "O4", "O5", "O6"],
    Indoor: ["I1", "I2"]

};

let currentType = "Outdoor";
let selectedSlot = "";

function getBookings() {

    return JSON.parse(localStorage.getItem("parking") || "[]");

}

function saveBookings(data) {

    localStorage.setItem("parking", JSON.stringify(data));

}

function showSlots(type) {

    currentType = type;

    let date = document.getElementById("checkDate").value;

    let bookings = getBookings();

    let html = "";

    slots[type].forEach(slot => {

        let booked = false;

        if (date !== "") {

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

}

function selectSlot(slot) {

    let date = document.getElementById("checkDate").value;

    let bookings = getBookings();

    if (date !== "") {

        let booked = bookings.some(b =>
            b.slot === slot &&
            Array.isArray(b.dates) &&
            b.dates.includes(date)
        );

        if (booked) {

            alert("This slot is already booked on selected date.");

            return;

        }

    }

    selectedSlot = slot;

    document.getElementById("slotTitle").innerText =
        "Selected Slot: " + slot;

}

function saveBooking() {

    if (selectedSlot === "") {

        alert("Please select a slot.");

        return;

    }

    let name = document.getElementById("name").value.trim();

    let plate = document.getElementById("plate").value.trim();

    if (name === "" || plate === "") {

        alert("Please enter name and plate.");

        return;

    }

    let dates = [...document.querySelectorAll(".date")]
        .map(d => d.value)
        .filter(d => d !== "");

    if (dates.length === 0) {

        alert("Please select at least one date.");

        return;

    }

    let bookings = getBookings();

    for (let b of bookings) {

        if (b.slot !== selectedSlot) continue;

        let existingDates = Array.isArray(b.dates) ? b.dates : [];

        for (let d of dates) {

            if (existingDates.includes(d)) {

                alert(selectedSlot + " already booked on " + d);

                return;

            }

        }

    }

    bookings.push({

        slot: selectedSlot,
        name: name,
        plate: plate,
        dates: dates

    });

    saveBookings(bookings);

    alert("Reservation saved successfully.");

    // reset form
    document.getElementById("form").reset();
    selectedSlot = "";
    document.getElementById("slotTitle").innerText = "Select a Slot";

    loadTable();
    showSlots(currentType);

}

function loadTable() {

    let bookings = getBookings();

    if (!bookings || bookings.length === 0) {

        document.getElementById("table").innerHTML =
            `<tr><td colspan="5">No reservations yet</td></tr>`;

        return;

    }

    let html = "";

    bookings.forEach((b, index) => {

        let dates = Array.isArray(b.dates) ? b.dates : [];

        html += `
        <tr>
            <td>${b.slot}</td>
            <td>${b.name}</td>
            <td>${b.plate}</td>
            <td>${dates.join("<br>")}</td>
            <td>
                <button class="deleteBtn"
                    onclick="deleteBooking(${index})">
                    Delete
                </button>
            </td>
        </tr>
        `;

    });

    document.getElementById("table").innerHTML = html;

}

function deleteBooking(index) {

    let deletedBy = prompt("Enter your name:");

    if (!deletedBy || deletedBy.trim() === "") {

        alert("Name is required.");

        return;

    }

    let reason = prompt("Reason for deletion:");

    if (!reason || reason.trim() === "") {

        alert("Reason is required.");

        return;

    }

    if (!confirm("Are you sure you want to delete this reservation?")) {

        return;

    }

    let bookings = getBookings();

    console.log({

        deletedBy: deletedBy,
        reason: reason,
        deletedBooking: bookings[index]

    });

    bookings.splice(index, 1);

    saveBookings(bookings);

    alert("Reservation deleted.");

    loadTable();
    showSlots(currentType);

}


window.addEventListener("DOMContentLoaded", function () {

    if (!localStorage.getItem("parking")) {
        localStorage.setItem("parking", "[]");
    }

    showSlots("Outdoor");
    loadTable();

});
