import Hero from "./home/_components/hero"
import Experience from "./home/_components/experience"
import Projects from "./home/_components/projects"
import Skills from "./home/_components/skills"
import Competitive from "./home/_components/competitive"
import Footer from "./home/_components/footer"

export default function Home() {
  return (
    <>
      <Hero />
      <Experience />
      <Projects />
      <Skills />
      <Competitive />
      <Footer />
    </>
  )
}