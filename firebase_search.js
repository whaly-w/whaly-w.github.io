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


///////////////////////////////////////////// Functions
// Get parameter from window
function getUrlParameters() {
    const params = {};
    const search = window.location.search.substring(1);
    return search? search : 'whaly-w'
}
const username = getUrlParameters();
console.log('login as ' + username)

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
            const id = folderName

            restaurantCard.innerHTML = `
                <div class="restaurant-image" style="background-image: url('${photo}');"></div>
                <div class="restaurant-info">
                    <h3>${name}</h3>
                </div>
                <button class="add-button" id=${id} data-bs-toggle="modal" data-bs-target="#exampleModal">+</button>
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
                <button class="add-button" data-bs-toggle="modal" data-bs-target="#exampleModal">+</button>
            `;
            restaurantList.appendChild(restaurantCard);
        }
    });
});

// Function to handle the "+" button click event
async function addRestaurantToMealPack(folderName) {
    let globalShop = await get(ref(database, `FATE_MEAL/GlobalShop`));
    let globalShopVal = globalShop.val();

    let modalTitle = document.querySelector('#modelTitle');
    modalTitle.innerHTML = folderName;

    let modalBody = document.querySelector('#shopList');
    modalBody.innerHTML = ''

    let shopList = await get(ref(database, `FATE_MEAL/GlobalGroup/${folderName}`));
    shopList.val().forEach(shop => {
        let rate, loc;
        console.log(shop)
        if (shop == 'Default') {
            rate = 5.0
            loc = 'default'
        } else {
            rate = globalShopVal[shop]['Rate']
            loc = globalShopVal[shop]['Location']
        }
        
        let card = document.createElement("div");
        card.classList.add("restaurant-card", 'mb-2');
        card.innerHTML =`
                <div class="restaurant-info">
                    <h3>${shop}</h3>
                    <p>☆ ${rate} ⚲ ${loc}</p>
                </div>
            `;
        modalBody.appendChild(card);
    })
}

async function addGroupToUser() {
    const userGroup = await get(ref(database, `FATE_MEAL/Account/${username}/Meal-pack`));
    let folderName = document.querySelector('#modelTitle').innerHTML;
    console.log(folderName)
    
    // Get the data from the restaurant folder in GlobalGroup

    const mealPackData = userGroup.exists() ? userGroup.val() : {};

    let txt = ['', '', '#ff9100']
    if (!mealPackData[folderName]) {
        // Add the restaurant data to Meal-pack
        await set(ref(database, `FATE_MEAL/Account/${username}/Meal-pack/${folderName}`), ['0_Default']);
        console.log(`Added ${folderName} to Meal-pack`);
        txt = ['Success', `Saved \'${folderName}\' to you favorite`, '#ff9100']
    } else {
        console.log(`${folderName} already exists in favorite`);
        txt = ['Fail', `\'${folderName}\' already exists in favorite`, '#ff0000']
    }

    const myModal = new bootstrap.Modal(document.getElementById('notifyModal'));
    document.querySelector('#notifyTitle').innerHTML = txt[0];
    document.querySelector('#notifyInfo').innerHTML = txt[1];
    document.getElementById('notifyBtn').style.backgroundColor = txt[2]

    myModal.show();
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

document.querySelector('#addGroupBtn').addEventListener('click', () => {addGroupToUser()})
