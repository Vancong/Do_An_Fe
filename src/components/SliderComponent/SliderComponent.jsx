import React from 'react'
import Slider from "react-slick"
import { Image } from 'antd';
import "./Slider.scss"
import { useNavigate } from 'react-router-dom';
const SliderComponent = ({ arrImages, autoplay, type = '' }) => {
  const navigate = useNavigate();

  if (arrImages?.length === 1) {
    return (
      <Image
        src={arrImages[0]}
        alt="Slider"
        preview={false}
        className="slider-image"
      />
    );
  }
  let settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: autoplay,
    autoplaySpeed: 2000,
    arrows: true,

  };
  const handleClick = () => {
    if (type === 'banner') {
      navigate('/type/deal-thom', { state: 'Deal thơm' })
    }
  }
  return (
    <Slider {...settings}  >
      {arrImages.map(image => {
        return <Image src={image} alt="Slider" preview={false}
          className={`slider-image ${type ? 'click_img' : ''}`}
          onClick={handleClick}

        />
      })}
    </Slider>
  )
}

export default SliderComponent