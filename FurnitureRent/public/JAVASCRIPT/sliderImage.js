// const initSlider = ()=>{
//     const imageList = document.querySelector(".image-list");
//     const slideButton = document.querySelectorAll(".slider-wrapper .slider-button");
//     const slideScrollBar = document.querySelector(".container-1 .slider-scrollbar");
//     const scrollBarThumb = slideScrollBar.querySelector(".scrollbar-thumb");
//     const maxScrollLeft = imageList.scrollWidth - imageList.clientWidth;

//     scrollBarThumb.addEventListener('mousedown',(e) =>{
//         const startX = e.clientX;
//         const thumbPosition = scrollBarThumb.offsetLeft;

//         const handelMouseMove = () =>{
//             const deltaX = e.clientX - startX;
//             const newThumbPosition = thumbPosition + deltaX;
//             scrollBarThumb.style.left = `${newThumbPosition}px`;
//         }

//         document.addEventListener('mousemove',handelMouseMove);

//     })

//     slideButton.forEach(button =>{
//         button.addEventListener('click',()=>{
//             const direction = button.id === "prev-slide" ? -1 : 1;
//             const scrollAmount = imageList.clientWidth * direction;
//             imageList.scrollBy({ left : scrollAmount , behavior : "smooth"});
//         }) 
//     })

//     // const handelSlideButtons = () =>{
//     //     slideButton[0].style.display = imageList.scrollLeft <= 0 ? "none" : "block";
//     //     slideButton[1].style.display = imageList.scrollLeft >= maxScrollLeft ? "none" : "block";
//     // }

//     const updateThumbPosition  = () =>{
//         const scrollPosition = imageList.scrollLeft;
//         const thumbPosition = (scrollPosition/maxScrollLeft) * (slideScrollBar.clientWidth - scrollBarThumb.offsetWidth);
//         scrollBarThumb.style.left = `${thumbPosition}px`;
//     }

//     imageList.addEventListener('scroll',() =>{
//        updateThumbPosition();
//     })
// }

// window.addEventListener('load',initSlider);

const initSlider = () => {
    const imageList = document.querySelector(".image-list");
    const slideButton = document.querySelectorAll(".slider-wrapper .slider-button");
    const slideScrollBar = document.querySelector(".container-1 .slider-scrollbar");
    const scrollBarThumb = slideScrollBar.querySelector(".scrollbar-thumb");
    const maxScrollLeft = imageList.scrollWidth - imageList.clientWidth;

    // Handle scroll thumb dragging
    scrollBarThumb.addEventListener('mousedown', (e) => {
        const startX = e.clientX;
        const thumbStartLeft = scrollBarThumb.offsetLeft;

        const handleMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            let newThumbPosition = thumbStartLeft + deltaX;

            // Ensure the thumb stays within bounds
            if (newThumbPosition < 0) {
                newThumbPosition = 0;
            } else if (newThumbPosition > slideScrollBar.clientWidth - scrollBarThumb.offsetWidth) {
                newThumbPosition = slideScrollBar.clientWidth - scrollBarThumb.offsetWidth;
            }

            scrollBarThumb.style.left = `${newThumbPosition}px`;

            // Scroll the image list based on the thumb position
            const scrollRatio = newThumbPosition / (slideScrollBar.clientWidth - scrollBarThumb.offsetWidth);
            const scrollPosition = scrollRatio * maxScrollLeft;
            imageList.scrollTo({ left: scrollPosition, behavior: 'auto' });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    });

    // Handle slider button clicks
    slideButton.forEach(button => {
        button.addEventListener('click', () => {
            const direction = button.id === "prev-slide" ? -1 : 1;
            const scrollAmount = imageList.clientWidth * direction;
            imageList.scrollBy({ left: scrollAmount, behavior: "smooth" });
        });
    });

    // Update scroll thumb position when images scroll
    const updateThumbPosition = () => {
        const scrollPosition = imageList.scrollLeft;
        const thumbPosition = (scrollPosition / maxScrollLeft) * (slideScrollBar.clientWidth - scrollBarThumb.offsetWidth);
        scrollBarThumb.style.left = `${thumbPosition}px`;
    };

    imageList.addEventListener('scroll', () => {
        updateThumbPosition();
    });
};

window.addEventListener('load', initSlider);


// Check if the URL has a "scrollTo=categories" parameter
const urlParams = new URLSearchParams(window.location.search);
const scrollTo = urlParams.get('scrollTo');

if (scrollTo === 'categories') {
    const categoriesSection = document.getElementById('categories');

    // Delay the scroll to ensure the page is fully loaded
    window.addEventListener('load', () => {
        categoriesSection?.scrollIntoView({ behavior: 'smooth' });
    });
}
