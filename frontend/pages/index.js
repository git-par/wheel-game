// pages/index.js

import PrizeWheel from "@/components/HomePage/PrizeWheel";
import MediaCarousel from "@/components/MediaCarousel";
import Wheel from "@/components/Wheel";

export default function Home() {
  // Sample media items
  const mediaItems = [
    {
      id: 1,
      type: "image",
      src: "https://10turtle.sgp1.cdn.digitaloceanspaces.com/banner/VoiceGen_AI.webp",
      alt: "Beach scene",
      isFavorite: false,
    },
    {
      id: 2,
      type: "video",
      src: "https://videos.pexels.com/video-files/4620563/4620563-uhd_1440_2732_25fps.mp4",
      muted: false,
      loop: false,
      isFavorite: true,
    },
    {
      id: 3,
      type: "image",
      src: "https://10turtle.sgp1.cdn.digitaloceanspaces.com/banner/VoiceGen_AI.webp",
      alt: "People at beach",
      isFavorite: false,
    },
    {
      id: 4,
      type: "video",
      src: "https://10turtle.com//homeslider/second.mp4",
      alt: "Beach scene",
      isFavorite: false,
    },
    {
      id: 5,
      type: "video",
      src: "https://10turtle.com//homeslider/first.mp4",
      muted: false,
      loop: false,
      isFavorite: true,
    },
    {
      id: 6,
      type: "image",
      src: "https://10turtle.sgp1.cdn.digitaloceanspaces.com/banner/VoiceGen_AI.webp",
      alt: "People at beach",
      isFavorite: false,
    },
  ];

  return (
    <>
      {/* <Wheel /> */}
      <PrizeWheel />

      {/* <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Media Carousel</h1>

      <div className="max-w-md mx-auto">
        <MediaCarousel mediaItems={mediaItems} />
        
      </div>
    </div> */}
    </>
  );
}
