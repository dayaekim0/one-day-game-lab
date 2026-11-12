import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "월 1,000만 원 퇴사 파이프라인",
    short_name: "퇴사 파이프라인",
    description: "2027.12.31 퇴사를 위한 하루 15분 데일리 체크리스트",
    start_url: "./",
    display: "standalone",
    background_color: "#f1f5f9",
    theme_color: "#0f172a",
    icons: [{ src: "./icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
