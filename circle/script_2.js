// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase Configuration (Replace with your actual Firebase project details)
const firebaseConfig = {
    databaseURL: "https://fate-meal-mba-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

console.log("Initializing Firebase...");

// Fetch restaurant data from Firebase for a specific category
async function getRestaurants(category) {
    const mealPackRef = ref(db, `FATE_MEAL/Account/whaly-w/Meal-pack/${category}`);
    const globalGroupRef = ref(db, `GlobalGroup/${category}`);
    let restaurants = [];

    try {
        const mealPackSnapshot = await get(mealPackRef);
        if (!mealPackSnapshot.exists()) {
            console.log(`Meal-pack data for category '${category}' not found.`);
            return [];
        }

        console.log(`Meal-pack snapshot for '${category}':`, mealPackSnapshot.val());
        let restaurantList = mealPackSnapshot.val();

        if (restaurantList && restaurantList[0] === "0_Default") {
            console.log(`Category '${category}' is 0_Default. Fetching from GlobalGroup...`);

            // Fetch from GlobalGroup
            const globalSnapshot = await get(globalGroupRef);

            if (globalSnapshot.exists()) {
                console.log(`GlobalGroup '${category}' data:`, globalSnapshot.val());
                restaurants = Object.values(globalSnapshot.val());
            } else {
                console.log(`GlobalGroup '${category}' not found.`);
            }
        } else {
            console.log(`Category '${category}' contains:`, restaurantList);
            restaurants = Object.values(restaurantList);
        }

        console.log(`Final restaurant list for '${category}':`, restaurants);
        return restaurants;
    } catch (error) {
        console.error(`Error fetching restaurants for '${category}':`, error);
        return [];
    }
}

let globalRestaurants = []; // Store restaurant data for spin selection
let globalAngles = []; // Store initial angles for each restaurant section
let currentRotation = 0; // Track the accumulated rotation

// Populate the wheel with restaurant names
async function populateWheel() {
    let wheel = document.getElementById("wheel");
    wheel.innerHTML = ""; // Clear previous items
    globalRestaurants = await getRestaurants("my type"); // Store globally

    globalRestaurants = globalRestaurants.filter(item => item !== "Default");

    console.log("Fetched Restaurants:", globalRestaurants); // Debugging line

    if (globalRestaurants.length === 0) {
        alert("No restaurants found!");
        return;
    }

    let numSections = globalRestaurants.length;
    let angleStep = 360 / numSections;

    // Reset angles
    globalAngles = globalRestaurants.map((_, index) => index * angleStep);

    wheel.innerHTML = ""; // Clear previous sections
    globalRestaurants.forEach((name, index) => {
        let section = document.createElement("div");
        section.className = "wheel-section";
        section.innerText = name;
        
        let angle = globalAngles[index];
        console.log(angle, "degrees");
        section.style.transform = `rotate(${angle}deg) translate(130px) rotate(-${angle}deg)`;
        
        wheel.appendChild(section);
    });

    // Enable the spin button
    document.getElementById("spinButton").disabled = false;
}

// Function to spin the wheel
window.spinWheel = function () {
    let wheel = document.getElementById("wheel");

    if (globalRestaurants.length === 0) {
        alert("No restaurants available to spin.");
        return;
    }

    let numSections = globalRestaurants.length;
    let randomSpin = 360 + Math.floor(Math.random() * 360); // Ensure full spins

    // Update total rotation
    currentRotation = (currentRotation + randomSpin) % 360;

    console.log("Spinning to:", currentRotation, "degrees"); // Debugging

    // Apply rotation smoothly
    wheel.style.transition = "transform 3s ease-out";
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        let targetAngle = 270; // The target angle we want to find the closest section to
        let closestIndex = 0;
        let closestDifference = 360; // Start with a large difference

        // Find the closest angle to 270 degrees
        globalAngles.forEach((angle, index) => {
            let shiftedAngle = (angle + currentRotation) % 360; // Adjusted angle after rotation
            let diff = Math.abs(shiftedAngle - targetAngle);
            if (diff < closestDifference) {
                closestDifference = diff;
                closestIndex = index;
            }
        });
        

        let selectedRestaurant = globalRestaurants[closestIndex];
        alert(`You got: ${selectedRestaurant}! 🎉`);
    }, 3000);
};

// Load wheel on page load
document.addEventListener("DOMContentLoaded", populateWheel);

