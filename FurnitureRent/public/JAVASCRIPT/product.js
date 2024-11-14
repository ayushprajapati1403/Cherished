document.addEventListener("DOMContentLoaded", () => {
    let mainImage = document.getElementById("main-img");
    let firstImage = document.getElementById('first-img');
    let secondImage = document.getElementById("second-img");
    let thirdImage = document.getElementById("third-img");

    firstImage.addEventListener('click', () => {
        let tempUrl = mainImage.src;
        mainImage.src = firstImage.src;
        firstImage.src = tempUrl;
    });

    secondImage.addEventListener('click', () => {
        let tempUrl = mainImage.src;
        mainImage.src = secondImage.src;
        secondImage.src = tempUrl;
    });

    thirdImage.addEventListener('click', () => {
        let tempUrl = mainImage.src;
        mainImage.src = thirdImage.src;
        thirdImage.src = tempUrl;
    });
});