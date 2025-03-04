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
    console.log(search)
    if (!search) {
        params['Username'] = 'whaly-w'
    } else {
        params['Username'] = search.split('&')
    }
    return params;
}
const urlParams = getUrlParameters();
console.log(urlParams)


// Function to reset all variable at the beginning 
async function resetVariables() {
    await set(ref(database, `FATE_MEAL/Account/${urlParams['Username']}/MyGroupVariable/SelectedList`), ['Default']);
    await set(ref(database, `FATE_MEAL/Account/${urlParams['Username']}/MyGroupVariable/Name`), '');
}

// Function to handle the 'X" button click event
async function handleDeleteBtn(folderName) {
    console.log(`delete ${folderName}`);

    let restaurantCard = document.querySelector("#restaurant-card-" + folderName);
    if (restaurantCard != null) {
        restaurantCard.classList.add('restaurant-card');
        restaurantCard.classList.remove('restaurant-card-selected');
    }
    

    let deleteBtn = document.querySelector("#delete-btn-" + folderName);
    deleteBtn.parentNode.removeChild(deleteBtn)


    // update database
    const SelectedListRef = ref(database, `FATE_MEAL/Account/${urlParams['Username']}/MyGroupVariable/SelectedList`);
    const snapshot = await get(SelectedListRef)
    let MyGroupVariableSelectedList = snapshot.val();
    MyGroupVariableSelectedList = MyGroupVariableSelectedList.filter(selected => selected != folderName);

    // console.log(MyGroupVariableSelectedList)
    await set(ref(database, `FATE_MEAL/Account/${urlParams['Username']}/MyGroupVariable/SelectedList`), MyGroupVariableSelectedList);
}

// Function to handle the "+" button click event
async function handleAddRestaurant(folderName) {
    console.log(folderName)

    let restaurantCard = document.querySelector("#restaurant-card-" + folderName);
    console.log(restaurantCard)

    if (restaurantCard != null) {
        restaurantCard.classList.add('restaurant-card-selected');
        restaurantCard.classList.remove('restaurant-card');
    }


    let selectedList = document.querySelector(".selected-list");

    let deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn')
    deleteBtn.id = 'delete-btn-' + folderName
    deleteBtn.addEventListener('click', () => {handleDeleteBtn(folderName)});
    deleteBtn.innerHTML = `${folderName} ✖`;
    
    selectedList.appendChild(deleteBtn);
    
    // Add selected info to database
    const SelectedListRef = ref(database, `FATE_MEAL/Account/${urlParams['Username']}/MyGroupVariable/SelectedList`);
    const snapshot = await get(SelectedListRef)
    let MyGroupVariableSelectedList = snapshot.val();
    MyGroupVariableSelectedList.push(folderName) 

    console.log(MyGroupVariableSelectedList)
    await set(ref(database, `FATE_MEAL/Account/${urlParams['Username']}/MyGroupVariable/SelectedList`), MyGroupVariableSelectedList);
}

// Function to fetch restaurant/shop data from Firebase
async function fetchRestaurants() {
    const shopRef = ref(database, 'FATE_MEAL/GlobalShop');
    const snapshot = await get(shopRef);

    if (snapshot.exists()) {
        let restaurantList = document.querySelector("#restaurant-list");
        restaurantList.innerHTML = ""; // Clear existing content

        snapshot.forEach((childSnapshot) => {
            let folderName = childSnapshot.key; // Get the folder name (restaurant name)
            let data = childSnapshot.val();
            console.log(data); // Debugging: log data to check if 'Photo' and 'Location' exist
            let restaurantCard = document.createElement("div");
            restaurantCard.classList.add("restaurant-card", "restaurant-add-btn");
            restaurantCard.addEventListener('click', () => {handleAddRestaurant(folderName)})

            restaurantCard.id = 'restaurant-card-' + folderName;

            // Ensure data exists before assigning
            const name = folderName || "Unknown"; // Use the folder name as the restaurant name
            const photo = data.Photo || 'placeholder.jpg';
            const location = data.Location || "Unknown Location";

            const btn_id = 'btn-' + folderName;
            restaurantCard.innerHTML = `
                <div class="restaurant-image" style="background-image: url('${photo}');"></div>
                <div class="restaurant-info">
                    <h3>${name}</h3>
                    <p>${location}</p>
                </div>
            `;
            restaurantList.appendChild(restaurantCard);
        });
    } else {
        console.log("No data available");
    }
}



///////////////////////////////////////////// Call function to load restaurant data
resetVariables();
fetchRestaurants();



///////////////////////////////////////////// Add Events
// Add event to search-bar
document.querySelector("#search-msg input").addEventListener("input", async function() {
    let searchQuery = this.value.toLowerCase();
    let restaurantDiv = document.querySelector("#restaurant-list");

    if (restaurantDiv) {
        console.log(searchQuery.length)
        let newRestaurant = document.querySelector('#new-restuarant')
        if (searchQuery.length == 0) {
            newRestaurant.classList.add('restaurant-card-hidden')
        } else {
            newRestaurant.classList.remove('restaurant-card-hidden')
        }
        
        let newRestaurantInfo = newRestaurant.querySelector('#new-restuarant-info')
        console.log(newRestaurantInfo)
        newRestaurantInfo.innerHTML = `<h3>${searchQuery}</h3>`
        

        let restaurantList = restaurantDiv.querySelectorAll('div');
        
        // console.log(restaurantList)
        restaurantList.forEach((restaurant) => {
            const id = restaurant.id
            if (!id) { return; }
            
            let target_rest = restaurantDiv.querySelector('#' + id);
            // console.log(target_rest)

            if (id.toLocaleLowerCase().includes(searchQuery)) {
                target_rest.classList.remove('restaurant-card-hidden')
            } else {
                target_rest.classList.add('restaurant-card-hidden')
            }
        })
    }
});

// Add event to Name-msg
document.querySelector('#name-msg input').addEventListener("input", async function() {
    let inputName = this.value;
    console.log(inputName)
    await set(ref(database, `FATE_MEAL/Account/${urlParams['Username']}/MyGroupVariable/Name`), inputName);
});