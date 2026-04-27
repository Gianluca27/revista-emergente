import HeroSection from '../components/sections/HeroSection'
import LatestPublications from '../components/sections/LatestPublications'
import PodcastBanner from '../components/sections/PodcastBanner'
import RecentShows from '../components/sections/RecentShows'
import ArtistCTA from '../components/sections/ArtistCTA'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <LatestPublications />
      <PodcastBanner />
      <RecentShows />
      <ArtistCTA />
    </>
  )
}
