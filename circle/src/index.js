////////////////////////////////////////// Firebase Setup
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


////////////////////////////////////////// Main Variables
// Get parameter from window
function getUrlParameters() {
    const params = { 'user': 'default', 'group': 'default' };
    const search = window.location.search.substring(1);
    if (search && search.split('&').length == 2) {
        params['user'] = search.split('&')[0];
        params['group'] = search.split('&')[1].replaceAll('%20', ' ');
    }
    return params
}
const urlPrams = getUrlParameters();
console.log(urlPrams)

let shopList = []
let filterShopList = []
let selected = ''


////////////////////////////////////////// Main Functions
async function fetchGroup() {
    const shopRef = ref(database, `FATE_MEAL/Account/${urlPrams['user']}/Meal-pack/${urlPrams['group']}`);
    const snapshot = await get(shopRef);

    if (snapshot.exists()) {
        snapshot.val().forEach((shop) => {
            shopList.push(shop.replaceAll('\"', ''))
        });
        filterShopList = [...shopList];
        console.log(shopList);
    } else {
        console.log("No data available");
    }
}

async function handleFilerList() {
    let snapshot = await get(ref(database, `FATE_MEAL/GlobalShop`));
    let globalShop = snapshot.val();

    let modalBody = document.querySelector('#shopList');
    modalBody.innerHTML = '';

    shopList.forEach(shop => {
        let rate, loc;
        if (shop in globalShop) {
            rate = globalShop[shop]['Rate']
            loc = globalShop[shop]['Location']
        } else {
            rate = 5.0
            loc = 'default'
        }

        let card = document.createElement("div");
        card.classList.add('container-fliud')

        let id = 'flexCheck' + shop
        card.classList.add("restaurant-card", 'mb-2');
        card.innerHTML = `
                <div class="form-check w-100">
                    <input class="form-check-input" type="checkbox" value="" id=${id} checked>
                    <label class="form-check-label w-100" for=${id}>
                        <div class="restaurant-info">
                            <h3 class= 'shop-title'>${shop}</h3>
                            <p>☆ ${rate} ⚲ ${loc}</p>
                        </div>
                    </label>
                </div>
            `;
        modalBody.appendChild(card);
    })
}

function handleFilter() {
    filterShopList = shopList.filter(shop => document.querySelector('#flexCheck' + shop).checked)
    init()
}

async function handleGenModal(selectedShop) {
    let modal = document.querySelector('#resultModal');

    
    let snapshot = await get(ref(database, `FATE_MEAL/GlobalShop/${selectedShop.label}`));
    // let shopData = await get(ref(database, `FATE_MEAL/Account/${urlPrams['user']}/Meal-pack/${urlPrams['group']}`))
    console.log(snapshot.val())
    const url = 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2a/ea/41/c3/sirocco.jpg?w=900&h=500&s=1'
    let data = {}

    if (snapshot.val() == null) {
        snapshot = await get(ref(database, `FATE_MEAL/Account/${urlPrams['user']}/LocalShop/${selectedShop.label}`));
        // console.log(snapshot.val())
        data = {
            Name: selectedShop.label,
            Location: snapshot.val().Location,
            Rate: snapshot.val().Rate,
            Img: url,
            Info: ''
        }
    } else {
        data = {
            Name: selectedShop.label,
            Location: snapshot.val().Location,
            Rate: snapshot.val().Rate,
            Img: snapshot.val().Photo,
            Info: snapshot.val().Info
        }
    }

    modal.querySelector('#selectedImg').src = data.Img;
    modal.querySelector('#selectedShop').innerHTML = data.Name;
    modal.querySelector('#selectedInfo').innerHTML = `<p>${data.Info}</p>`;
    modal.querySelector('#selectedLoc').innerHTML = `☆ ${data.Rate} ⚲ ${data.Location}`;

    const myModal = new bootstrap.Modal(document.getElementById('resultModal'));
    myModal.show();

    const now = new Date(); // Get the current date and time
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed, so add 1
    const day = now.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    console.log(formattedDate); // Output: 2025-03-06

    let recording = await get(ref(database, `FATE_MEAL/Account/${urlPrams['user']}/History/${formattedDate}`))
    if (recording.val() == null) {
        set(ref(database, `FATE_MEAL/Account/${urlPrams['user']}/History/${formattedDate}`), [selectedShop.label]);
    } else {
        let recordList = recording.val()
        recordList.push(selectedShop.label)
    }
    await set(ref(database, `FATE_MEAL/Account/${urlPrams['user']}/History/${formattedDate}`), recordList) 
}

////////////////////////////////////////// Apply Function
await fetchGroup();


////////////////////////////////////////// Apply functions
document.querySelector('#filterBtn').addEventListener('click', () => {handleFilerList()});

document.querySelector('#applyFilter').addEventListener('click', () => {handleFilter()});




////////////////////////////////////////// Spinner 
const colors = ['#ff924e', '#ff9d4e', '#ffa84e', '#ffb34e']
let i = -1
let sectors = filterShopList.map(shop => {
    i += 1
    return { color: colors[i % 4], label: shop }
})
console.log(sectors)

////////////////////////////////////////// Spinner Variables
const rand = (m, M) => Math.random() * (M - m) + m
let tot = sectors.length
const spinEl = document.querySelector('#spin')
const ctx = document.querySelector('#wheel').getContext('2d')
const dia = ctx.canvas.width
const rad = dia / 2
const PI = Math.PI
const TAU = 2 * PI
let arc = TAU / sectors.length

const friction = 0.98 // 0.995=soft, 0.99=mid, 0.98=hard, prev= 0.991
let angVel = 0 // Angular velocity
let ang = 0 // Angle in radians

let getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot

////////////////////////////////////////// Spinner Funcitons
function drawSector(sector, i) {
    const ang = arc * i
    ctx.save()
    // COLOR
    ctx.beginPath()
    ctx.fillStyle = sector.color
    ctx.moveTo(rad, rad)
    ctx.arc(rad, rad, rad, ang, ang + arc)
    ctx.lineTo(rad, rad)
    ctx.fill()
    // TEXT
    ctx.translate(rad, rad)
    ctx.rotate(ang + arc / 2)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#fff'
    ctx.font = '30px Sen'
    ctx.fillText(sector.label, rad - 10, 10)
    //
    ctx.restore()
}

function rotate() {
    const sector = sectors[getIndex()]
    ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`
    spinEl.textContent = !angVel ? 'SPIN' : sector.label
    spinEl.style.background = '#ff7622'
}

function frame() {
    if (!angVel) return

    angVel *= friction // Decrement velocity by friction
    if (angVel < 0.002) {
        angVel = 0 // Bring to stop
        selected = sectors[getIndex()];
        handleGenModal(selected);
        console.log(selected);
    }

    ang += angVel // Update angle
    ang %= TAU // Normalize angle
    rotate()
}

function engine() {
    frame()
    requestAnimationFrame(engine)
}

function init() {
    // reset spinning variable
    i = -1
    sectors = filterShopList.map(shop => {
        i += 1
        return { color: colors[i % 4], label: shop }
    })

    tot = sectors.length
    arc = TAU / sectors.length
    angVel = 0 // Angular velocity
    ang = 0 // Angle in radians
    getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot


    sectors.forEach(drawSector)
    rotate() // Initial rotation
    engine() // Start engine
    spinEl.addEventListener('click', () => {
        if (!angVel) angVel = rand(0.25, 0.45)
    })
}

init()