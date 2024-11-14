const mobie_nav = document.querySelector(".mobile-navbar-btn");
const nav_header = document.querySelector(".header");

const togglenavbar = () =>{
    nav_header.classList.toggle('active');
}

mobie_nav.addEventListener('click',() => togglenavbar());

let mainImage = document.getElementById("main-img");
let mainImageUrl = mainImage.src;

let firstImage = document.getElementById('first-img');
let firstImageUrl = firstImage.src;

let secondImage = document.getElementById("second-img");
let secondImageUrl = secondImage.src;

let thirdImage = document.getElementById("third-img");
let thirdImageUrl = thirdImage.src;

let fourthImage = document.getElementById("fourth-img");
let fourthImageUrl = fourthImage.src;

firstImage.addEventListener('click', () => {
    // Swap the src values of mainImage and firstImage
    let tempUrl = mainImage.src;
    mainImage.src = firstImage.src;
    firstImage.src = tempUrl;
});

secondImage.addEventListener('click', () => {
    // Swap the src values of mainImage and firstImage
    let tempUrl = mainImage.src;
    mainImage.src = secondImage.src;
    secondImage.src = tempUrl;
});

thirdImage.addEventListener('click', () => {
    // Swap the src values of mainImage and firstImage
    let tempUrl = mainImage.src;
    mainImage.src = thirdImage.src;
    thirdImage.src = tempUrl;
});

fourthImage.addEventListener('click', () => {
    // Swap the src values of mainImage and firstImage
    let tempUrl = mainImage.src;
    mainImage.src = fourthImage.src;
    fourthImage.src = tempUrl;
});





