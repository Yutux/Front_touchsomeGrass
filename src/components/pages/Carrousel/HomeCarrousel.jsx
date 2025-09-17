
// import React from 'react';
// import { MDBCarousel, MDBCarouselItem, MDBCarouselCaption } from 'mdb-react-ui-kit';

// const HomeCarousel = () => {
//   return (
//     <MDBCarousel showControls showIndicators>
//       <MDBCarouselItem itemId={1}>
//         <img src='https://mdbootstrap.com/img/new/slides/041.jpg' className='d-block w-100' alt='...' />
//         <MDBCarouselCaption>
//           <h5>First slide label</h5>
//           <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
//         </MDBCarouselCaption>
//       </MDBCarouselItem>
//       <MDBCarouselItem itemId={2}>
//         <img src='https://mdbootstrap.com/img/new/slides/042.jpg' className='d-block w-100' alt='...' />

//         <MDBCarouselCaption>
//           <h5>Second slide label</h5>
//           <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
//         </MDBCarouselCaption>
//       </MDBCarouselItem>
//       <MDBCarouselItem itemId={3}>
//         <img src='https://mdbootstrap.com/img/new/slides/043.jpg' className='d-block w-100' alt='...' />
//         <MDBCarouselCaption>
//           <h5>Third slide label</h5>
//           <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
//         </MDBCarouselCaption>
//       </MDBCarouselItem>
//     </MDBCarousel>
//   );
// };

// export default HomeCarousel;


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
