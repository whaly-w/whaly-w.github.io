// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase Configuration (Replace with your actual Firebase project details)
const firebaseConfig = {
    databaseURL: "https://fate-meal-mba-default-rtdb.firebaseio.com/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to fetch restaurant/shop data from Firebase
async function fetchRestaurants() {
    const shopRef = ref(database, 'FATE_MEAL/GlobalGroup');
    const snapshot = await get(shopRef);

    if (snapshot.exists()) {
        let restaurantList = document.querySelector(".restaurant-list");
        restaurantList.innerHTML = ""; // Clear existing content

        snapshot.forEach((childSnapshot) => {
            let folderName = childSnapshot.key; // Get the folder name (restaurant name)
            let data = childSnapshot.val();
            console.log(data); // Debugging: log data to check if 'Photo' and 'Location' exist
            let restaurantCard = document.createElement("div");
            restaurantCard.classList.add("restaurant-card");

            // Ensure data exists before assigning
            const name = folderName || "Unknown"; // Use the folder name as the restaurant name
            const photo = data.Photo || 'placeholder.jpg';
            const location = data.Location || "Unknown Location";

            restaurantCard.innerHTML = `
                <div class="restaurant-image" style="background-image: url('${photo}');"></div>
                <div class="restaurant-info">
                    <h3>${name}</h3>
                </div>
                <button class="add-button">+</button>
            `;
            restaurantList.appendChild(restaurantCard);
        });
    } else {
        console.log("No data available");
    }
}

// Call function to load restaurant data
fetchRestaurants();

document.querySelector(".search-bar input").addEventListener("input", async function() {
    let searchQuery = this.value.toLowerCase();
    const shopRef = ref(database, 'FATE_MEAL/GlobalGroup');
    const snapshot = await get(shopRef);
    let restaurantList = document.querySelector(".restaurant-list");
    restaurantList.innerHTML = "";

    snapshot.forEach((childSnapshot) => {
        let folderName = childSnapshot.key; // Get the folder name (restaurant name)
        let data = childSnapshot.val();
        console.log(data); // Debugging: log data here as well to check during search
        if (folderName.toLowerCase().includes(searchQuery)) {
            let restaurantCard = document.createElement("div");
            restaurantCard.classList.add("restaurant-card");

            const name = folderName || "Unknown"; // Use the folder name as the restaurant name
            const photo = data.Photo || 'placeholder.jpg';
            const location = data.Location || "Unknown Location";

            restaurantCard.innerHTML = `
                <div class="restaurant-image" style="background-image: url('${photo}');"></div>
                <div class="restaurant-info">
                    <h3>${name}</h3>
                </div>
                <button class="add-button">+</button>
            `;
            restaurantList.appendChild(restaurantCard);
        }
    });
});

// Function to handle the "+" button click event
async function addRestaurantToMealPack(folderName) {
    const mealPackRef = ref(database, 'FATE_MEAL/Account/whaly-w/Meal-pack');
    const globalGroupRef = ref(database, `FATE_MEAL/GlobalGroup/${folderName}`);
    
    // Get the data from the restaurant folder in GlobalGroup
    const globalGroupSnapshot = await get(globalGroupRef);

    if (globalGroupSnapshot.exists()) {
        const restaurantData = globalGroupSnapshot.val();  // Get the data from the folder

        // Check if the folder already exists in Meal-pack
        const mealPackSnapshot = await get(mealPackRef);
        const mealPackData = mealPackSnapshot.exists() ? mealPackSnapshot.val() : {};

        if (!mealPackData[folderName]) {
            // Add the restaurant data to Meal-pack
            await set(ref(database, `FATE_MEAL/Account/whaly-w/Meal-pack/${folderName}`), restaurantData);
            console.log(`Added ${folderName} to Meal-pack`);
        } else {
            console.log(`${folderName} already exists in Meal-pack`);
        }
    } else {
        console.log(`${folderName} does not exist in GlobalGroup`);
    }
}

// Add event listener for "+" buttons
document.querySelector(".restaurant-list").addEventListener("click", function(event) {
    // Check if the clicked target is a "+" button
    if (event.target && event.target.classList.contains("add-button")) {
        // Get the parent folder name (restaurant name) using parent or ancestor element
        const restaurantCard = event.target.closest(".restaurant-card"); // Find the closest .restaurant-card
        const folderName = restaurantCard ? restaurantCard.querySelector(".restaurant-info h3").textContent : null;
        

        console.log(`${folderName}`)
        // Ensure folderName is valid before calling the function
        if (folderName) {
            addRestaurantToMealPack(folderName);
        }
    }
});
