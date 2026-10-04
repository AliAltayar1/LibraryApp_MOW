import React from "react";
import { Container } from "@/shared/Container";
import { Breadcrumbs } from "@/shared/Breadcrumbs";
import { FavoritesHeader } from "@/favorites/FavoritesHeader";
import { FavoritesGrid } from "@/favorites/FavoritesGrid";

export const metadata = {
  title: "الكتب المحفوظة | المكتبة الإلكترونية لوزارة الأوقاف",
  description: "قائمتك المفضلة للمراجع والكتب والمصنفات الوقفية المحفوظة.",
};

export default function FavoritesPage() {
  return (
    <div className="w-full py-8 min-h-[70vh] bg-background">
      <Container>
        <Breadcrumbs items={[{ label: "الكتب المحفوظة" }]} />
        <FavoritesHeader />
        <FavoritesGrid />
      </Container>
    </div>
  );
}
