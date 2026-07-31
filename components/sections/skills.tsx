"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { skillCategories, techMarqueeItems } from "@/lib/constants";
import { SectionHeading } from "@/components/ui/section-heading";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { InfiniteMarquee } from "@/components/ui/infinite-marquee";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { cn, hexToRgb } from "@/lib/utils";

/**
 * Interactive skills section with category tabs, progress bars, and tech marquee
 */
export function Skills() {
  const [activeCategory, setActiveCategory] = useState(0);
  const category = skillCategories[activeCategory];

  return (
    <section id="skills" className="relative section-padding overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-radial from-secondary/5 to-transparent pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Skills"
          title="My Tech Stack"
          subtitle="Technologies and tools I use to bring ideas to life."
        />

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {skillCategories.map((cat, i) => (
            <button
              key={cat.title}
              onClick={() => setActiveCategory(i)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                activeCategory === i
                  ? "bg-primary/15 text-white border border-primary/30 shadow-glow"
                  : "text-muted hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <cat.icon className="w-4 h-4" />
              {cat.title}
            </button>
          ))}
        </motion.div>

        {/* Active Category Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mb-16"
          >
            {/* Category header */}
            <div className="text-center mb-8">
              <p className="text-muted text-sm">{category.description}</p>
            </div>

            {/* Skills grid */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto"
            >
              {category.skills.map((skill) => (
                <motion.div key={skill.name} variants={fadeInUp}>
                  <SpotlightCard
                    spotlightColor={hexToRgb(category.color)}
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white">
                          {skill.name}
                        </span>
                        <span className="text-xs font-mono" style={{ color: category.color }}>
                          {skill.level}%
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${category.color}, ${category.color}80)`,
                          }}
                        />
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Tech Marquee */}
        <div className="pt-8 border-t border-white/5">
          <InfiniteMarquee items={techMarqueeItems} speed="slow" />
          <InfiniteMarquee
            items={[...techMarqueeItems].reverse()}
            speed="slow"
            direction="right"
          />
        </div>
      </div>
    </section>
  );
}
