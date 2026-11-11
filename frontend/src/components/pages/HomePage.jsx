import HeroSection from "@/components/cine/HeroSection";
import FeatureStrip from "@/components/cine/FeatureStrip";
import MovieGrid from "@/components/cine/MovieGrid";
import FeaturedMovie from "@/components/cine/FeaturedMovie";
import ComingSoon from "@/components/cine/ComingSoon";
import TrendingMovies from "@/components/cine/TrendingMovies";
import OffersSection from "@/components/cine/OffersSection";
import CinemaExperience from "@/components/cine/CinemaExperience";
import Newsletter from "@/components/cine/Newsletter";
import { useMovies } from "@/hooks/useMovies";

export default function HomePage() {
  const { nowShowing, comingSoon, trending, topRated } = useMovies();
  return (
    <>
      <HeroSection />
      <FeatureStrip />
      <MovieGrid movies={nowShowing} />
      <FeaturedMovie />
      <ComingSoon movies={comingSoon} />
      <TrendingMovies trending={trending} topRated={topRated} />
      <OffersSection />
      <CinemaExperience />
      <Newsletter />
    </>
  );
}
