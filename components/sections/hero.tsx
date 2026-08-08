"use client";

import { motion } from "framer-motion";
import { Download, Mail, ChevronDown } from "lucide-react";
import { personalInfo, socialLinks, stats } from "@/lib/constants";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { AnimatedText } from "@/components/ui/animated-text";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { AuroraBackground } from "@/components/effects/aurora-background";
import { GridBackground } from "@/components/effects/grid-background";
import { FloatingShapes } from "@/components/effects/floating-shapes";
import { ParticleField } from "@/components/effects/particle-field";
import { fadeInUp, staggerContainer } from "@/lib/animations";

/**
 * Jaw-dropping hero section with layered effects, typing animation, stats, and CTAs
 */
export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* === Background layers === */}
      <AuroraBackground />
      <GridBackground />
      <FloatingShapes />
      <ParticleField />

      {/* === Content === */}
      <div className="container-custom relative z-10 pt-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
        >
          {/* Status badge */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs font-medium text-muted">
              {personalInfo.availability}
            </span>
          </motion.div>

          {/* Greeting */}
          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-muted mb-4 font-body"
          >
            Hello, I&apos;m
          </motion.p>

          {/* Name — large display */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-heading tracking-tight mb-4"
          >
            <AnimatedText
              text={personalInfo.name}
              variant="char"
              className="gradient-text"
            />
          </motion.h1>

          {/* Typing roles */}
          <motion.div
            variants={fadeInUp}
            className="text-xl sm:text-2xl md:text-3xl font-heading font-semibold mb-6 min-h-[2.5rem] flex items-center"
          >
            <span className="text-muted mr-2">I&apos;m a</span>
            <TypingAnimation
              words={personalInfo.roles}
              className="text-xl sm:text-2xl md:text-3xl font-heading font-semibold"
            />
          </motion.div>

          {/* Bio */}
          <motion.p
            variants={fadeInUp}
            className="text-muted text-base md:text-lg leading-relaxed max-w-2xl mb-10"
          >
            {personalInfo.bio}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center gap-4 mb-12"
          >
            <MagneticButton
              href={personalInfo.resumeUrl}
              target="_blank"
              variant="primary"
              size="lg"
            >
              <Download className="w-5 h-5" />
              Download Resume
            </MagneticButton>
            <MagneticButton
              href="#contact"
              variant="secondary"
              size="lg"
              onClick={() => {
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Mail className="w-5 h-5" />
              Get in Touch
            </MagneticButton>
          </motion.div>

          {/* Social Icons */}
          <motion.div
            variants={fadeInUp}
            className="flex items-center gap-3 mb-16"
          >
            {socialLinks.map((link, i) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                whileHover={{ y: -3, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-primary/10 transition-all duration-300 group"
                aria-label={link.name}
                title={link.name}
              >
                <link.icon className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
              </motion.a>
            ))}
          </motion.div>

          {/* Statistics Bar */}
          <motion.div
            variants={fadeInUp}
            className="w-full max-w-2xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl glass border border-white/5">
              {stats.map((stat) => (
                <AnimatedCounter
                  key={stat.label}
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-muted-dark tracking-widest uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-primary/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
