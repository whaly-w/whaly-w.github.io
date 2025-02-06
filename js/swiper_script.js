const swiper = new Swiper('.mySwiper', {
    // Swiper options (configure as needed)
    effect: 'coverflow',
    loop: true,
    grabCursor: true,
    centeredSlide: false,
    // initialSlide: 2,
    speed: 600,
    // preventClicks: true,
    slidesPerView: 3,
    // spaceBetween: 20,
    coverflowEffect: {
        rotate: 15,
        stretch: 200,
        depth: 350,
        modifier: 1,
        slideShadows: false,
    },

    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    on: {
        slideChangeTransitionEnd: function () {

        }
    }
});

setInterval(function () {
    const allSlides = document.querySelectorAll('.swiper-slide');
    var data = [0]
    allSlides.forEach(slide => {
        const info_element = slide.getElementsByClassName('info')

        const imageRect = slide.getBoundingClientRect();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const imageCenterX = imageRect.left + imageRect.width / 2;
        const tolerance = 10; // 50 pixels
        const isCenterXWithinTolerance = Math.abs(imageCenterX - viewportWidth / 2) <= tolerance;

        data = info_element[0].textContent.split('-')
        console.log(data)
        // console.log(isCenterXWithinTolerance)

        const display_element = document.querySelector('.swiper-info');
        console.log(display_element)
        const nick_name_element = display_element.querySelector('.nick-name');
        const name_element = display_element.querySelector('.name');
        const id_element = display_element.querySelector('.ID');
        if (isCenterXWithinTolerance) {
            console.log('world')
            nick_name_element.textContent = data[1];
            name_element.textContent = data[2];
            id_element.textContent = data[3];
        }

    })


}, 500);
