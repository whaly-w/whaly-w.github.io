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
    const params = {'user': 'default', 'group': 'default'};
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


// Function to fetch restaurant/shop data from Firebase
async function fetchGroup() {
    const shopRef = ref(database, `FATE_MEAL/Account/${urlPrams['user']}/Meal-pack/${urlPrams['group']}`);
    const snapshot = await get(shopRef);

    if (snapshot.exists()) {
        snapshot.val().forEach((shop) => {
            shopList.push(shop)
        });
        console.log(shopList)
    } else {
        console.log("No data available");
    }
}

await fetchGroup();
















let colors = ['#ff924e', '#ff9d4e', '#ffa84e', '#ffb34e']
let i= -1
const sectors = shopList.map(shop => {
    i+=1
    return {color: colors[i%4], label: shop.replaceAll('\"', '')}
})
console.log(sectors)
// const sectors = [
//     { color: '#f82', label: 'Stack' },
//     { color: '#0bf', label: '10' },
//     { color: '#fb0', label: '200' },
//     { color: '#0fb', label: '50' },
//     { color: '#b0f', label: '100' },
//     { color: '#f0b', label: '5' },
//     { color: '#bf0', label: '500' }
// ]

////////////////////////////////////////// Spinner Variables
const rand = (m, M) => Math.random() * (M - m) + m
const tot = sectors.length
const spinEl = document.querySelector('#spin')
const ctx = document.querySelector('#wheel').getContext('2d')
const dia = ctx.canvas.width
const rad = dia / 2
const PI = Math.PI
const TAU = 2 * PI
const arc = TAU / sectors.length

const friction = 0.991 // 0.995=soft, 0.99=mid, 0.98=hard
let angVel = 0 // Angular velocity
let ang = 0 // Angle in radians

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot

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
        const selected = sectors[getIndex()];
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
    sectors.forEach(drawSector)
    rotate() // Initial rotation
    engine() // Start engine
    spinEl.addEventListener('click', () => {
        if (!angVel) angVel = rand(0.25, 0.45)
    })
}

init()