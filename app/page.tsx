"use client"

import { useEffect } from "react"
import Hero from "./home/_components/hero"
import Experience from "./home/_components/experience"
import Skills from "./home/_components/skills"
import Hobbies from "./home/_components/hobbies"
import Projects from "./home/_components/projects"
import Footer from "./home/_components/footer"

export default function Home() {
  useEffect(() => {
    const section = sessionStorage.getItem("homeScrollPosition")
    if (section === "projects") {
      setTimeout(() => {
        const el = document.getElementById("projects")
        if (el) el.scrollIntoView({ behavior: "smooth" })
        sessionStorage.removeItem("homeScrollPosition")
      }, 500)
    }
  }, [])

  return (
    <>
      <Hero />
      <Experience />
      <Skills />
      <Hobbies />
      <Projects />
      <Footer />
    </>
  )
}