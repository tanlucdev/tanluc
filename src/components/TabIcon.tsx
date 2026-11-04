"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const inactiveIcon = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#93938c"/></svg>')}`;

export function TabIcon() {
  const pathname = usePathname();

  useEffect(() => {
    const activeIcon = document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]')?.href || `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icon.svg`;
    const icon = document.createElement("link");
    icon.rel = "icon";
    icon.type = "image/svg+xml";
    icon.sizes.add("any");
    icon.dataset.tabIcon = "true";
    const update = () => { icon.href = document.hidden ? inactiveIcon : activeIcon; };
    update();
    document.head.append(icon);
    document.addEventListener("visibilitychange", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
      icon.remove();
    };
  }, [pathname]);

  return null;
}
