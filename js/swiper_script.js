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
        stretch: 80,
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
    allSlides.forEach(slide => {
        const txt = slide.getElementsByClassName('info')

        const imageRect = slide.getBoundingClientRect();
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const imageCenterX = imageRect.left + imageRect.width / 2;
        const tolerance = 50; // 50 pixels
        const isCenterXWithinTolerance = Math.abs(imageCenterX - viewportWidth / 2) <= tolerance;
        // console.log(isCenterXWithinTolerance)

        if (isCenterXWithinTolerance) {
            txt[0].hidden = false;
        } else {
            txt[0].hidden = true;
        }

    })
}, 500);
