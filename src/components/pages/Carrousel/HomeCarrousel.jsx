import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const HomeCarrousel = () => {
  return (
    <div className="carousel-container">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={50}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop={true}
        className="swiper-container"
      >
        <SwiperSlide>
          <img src="https://mdbootstrap.com/img/new/slides/043.jpg" alt="Nature" />
        </SwiperSlide>
        <SwiperSlide>
          <img src="https://mdbootstrap.com/img/new/slides/042.jpg" alt="City" />
        </SwiperSlide>
        <SwiperSlide>
          <img src="https://mdbootstrap.com/img/new/slides/041.jpg" alt="Beach" />
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default HomeCarrousel;
