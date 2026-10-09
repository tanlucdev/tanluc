import { PHOTOS } from "@/content/misc";
import { PhotoGallery } from "@/components/PhotoGallery";

export const metadata = { title: "Photography — Tan Luc" };

export default function Photography() {
  return (
    <div className="mx-auto w-[calc(100%-32px)] pb-16 pt-[68px] sm:w-[calc(100%-8.8vw)] sm:pb-24 sm:pt-[82px]">
      <PhotoGallery photos={PHOTOS} />
    </div>
  );
}
