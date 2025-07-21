import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";
import { useController, UseControllerProps } from "react-hook-form";
import { AVATARS } from "@/lib/config";
import { ChooseYourAvatarRequestDTO } from "@/types/dtos";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@nextui-org/react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

const AvatarSlider: React.FC<UseControllerProps<ChooseYourAvatarRequestDTO>> = ({
  name = "avatarId",
  control,
  ...props
}) => {
  const { field, formState } = useController({
    control,
    name,
    ...props,
  });

  const initialIndex = useMemo(() => {
    const index = AVATARS.findIndex(avatar => avatar.pose_id === field.value);
    return index !== -1 ? index : 0;
  }, [field.value]);

  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const previous = () => {
    if (!swiper) return;

    swiper.slidePrev();
  };

  const next = () => {
    if (!swiper) return;

    swiper.slideNext();
  };

  useEffect(() => {
    if (!swiper) return;

    if (field.value !== AVATARS[swiper.activeIndex].pose_id) {
      field.onChange(AVATARS[swiper.activeIndex].pose_id);
    }
  }, [field, swiper]);

  return (
    <div className="flex items-center">
      <Button isIconOnly={true} variant="light" onPress={previous} isDisabled={isBeginning}>
        <CaretLeft size={32} />
      </Button>
      <div
        className={`max-w-[600px] m-auto text-center ${
          formState.disabled ? "pointer-events-none" : "pointer-events-auto"
        }`}
      >
        <Swiper
          {...field}
          modules={[Pagination, Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          pagination={{
            clickable: !formState.disabled,
            el: ".swiper-custom-pagination",
            bulletActiveClass: "bg-primary opacity-100",
          }}
          initialSlide={initialIndex}
          enabled={!formState.disabled}
          onInit={swiper => {
            setSwiper(swiper);
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSlideChange={({ isBeginning, isEnd }) => {
            setIsBeginning(isBeginning);
            setIsEnd(isEnd);
          }}
        >
          {AVATARS.map(avatar => (
            <SwiperSlide
              key={avatar.pose_id}
              onClick={() => !formState.disabled && field.onChange(avatar.pose_id)}
              style={{ opacity: formState.disabled ? 0.5 : 1 }}
            >
              <h1 className="text-xl mb-4">{avatar.pose_name}</h1>
              <img
                src={avatar.normal_preview}
                alt={`Avatar: ${avatar.pose_name}`}
                className={`w-full h-300px object-cover rounded-lg border-3 ${
                  formState.disabled ? "" : "cursor-pointer"
                }`}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="swiper-custom-pagination mt-2" />
      </div>
      <Button isIconOnly={true} variant="light" onPress={next} isDisabled={isEnd}>
        <CaretRight size={32} />
      </Button>
    </div>
  );
};

export default AvatarSlider;
