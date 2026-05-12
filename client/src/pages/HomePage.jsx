import HeroSection from '../components/sections/HeroSection'
import LatestPublications from '../components/sections/LatestPublications'
import EntrevistasBanner from '../components/sections/EntrevistasBanner'
import RecentShows from '../components/sections/RecentShows'
import ArtistCTA from '../components/sections/ArtistCTA'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <LatestPublications />
      <EntrevistasBanner />
      <RecentShows />
      <ArtistCTA />
    </>
  )
}
