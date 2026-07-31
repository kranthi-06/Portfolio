"use client";

import { motion } from "framer-motion";
import { ExternalLink, Award } from "lucide-react";
import { certifications } from "@/lib/constants";
import { SectionHeading } from "@/components/ui/section-heading";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { fadeInUp, staggerContainer } from "@/lib/animations";

/**
 * Certifications gallery with spotlight cards
 */
export function Certifications() {
  return (
    <section id="certifications" className="relative section-padding overflow-hidden">
      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Certifications"
          title="Credentials & Learning"
          subtitle="Continuous learning validated through industry-recognized certifications."
        />

        {/* Certifications Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto"
        >
          {certifications.map((cert, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <SpotlightCard spotlightColor="168, 85, 247">
                <div className="p-6 space-y-4">
                  {/* Icon */}
                  <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 w-fit">
                    <Award className="w-5 h-5 text-accent" />
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-base font-semibold font-heading text-white mb-1">
                      {cert.title}
                    </h3>
                    <p className="text-sm text-muted">{cert.issuer}</p>
                  </div>

                  {/* Date and link */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-xs text-muted-dark font-mono">
                      {cert.date}
                    </span>
                    {cert.credentialUrl && cert.credentialUrl !== "#" && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:text-secondary transition-colors"
                      >
                        Verify
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
