import Hero from "./home/_components/hero"
import Experience from "./home/_components/experience"
import Hobbies from "./home/_components/hobbies"
import Projects from "./home/_components/projects"
import Skills from "./home/_components/skills"
import Footer from "./home/_components/footer"

export default function Home() {
  return (
    <>
      <Hero />
      <Experience />
      <Projects />
      <Skills />
      <Hobbies />
      <Footer />
    </>
  )
}