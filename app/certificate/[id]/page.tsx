import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Award, Shield, FileText, CheckCircle2, ChevronRight, LayoutDashboard } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 3600; // Revalidate every hour

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CertificateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: certificate } = await supabase
    .from("certificates")
    .select("*, certificate_supporting_images(*)")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (!certificate) {
    notFound();
  }

  const supportingImages = certificate.certificate_supporting_images || [];
  const timeline = certificate.timeline || [];

  return (
    <main className="min-h-screen bg-[#070709] text-white pb-24">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#070709]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/#certificates"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Portfolio
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6366f1] bg-[#6366f1]/10 px-3 py-1 rounded-full">
              {certificate.category}
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-12 lg:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Header Section */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                {certificate.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Award size={16} className="text-[#6366f1]" />
                  <span>{certificate.organization}</span>
                </div>
                {certificate.issue_date && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-[#6366f1]" />
                    <span>
                      {new Date(certificate.issue_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>
                )}
                {certificate.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-[#6366f1]" />
                    <span>{certificate.location}</span>
                  </div>
                )}
              </div>

              {certificate.achievement && (
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-500 px-4 py-2 rounded-xl text-sm font-semibold">
                  🏆 {certificate.achievement}
                </div>
              )}
            </div>

            {/* Certificate Preview Hero */}
            <div className="relative group rounded-3xl overflow-hidden bg-white/5 border border-white/10 aspect-[1.4/1]">
              {certificate.file_type?.includes("pdf") ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-gray-400">
                  <FileText size={64} className="text-[#6366f1]" />
                  <p className="text-sm font-medium">PDF Certificate</p>
                  <a 
                    href={certificate.file_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-2 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors"
                  >
                    View Document
                  </a>
                </div>
              ) : (
                <Image
                  src={certificate.file_url}
                  alt={certificate.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              )}
              
              {/* Optional: Add click to zoom modal logic here if desired, similar to admin */}
            </div>

            {/* Description & Reflection */}
            <div className="space-y-8">
              {certificate.description && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">About</h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {certificate.description}
                  </p>
                </div>
              )}

              {certificate.reflection && (
                <div className="space-y-4 bg-white/5 border border-white/10 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#6366f1]/20 blur-[64px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                  <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                    <SparklesIcon />
                    Reflection
                  </h3>
                  <p className="text-gray-300 leading-relaxed italic relative z-10">
                    &quot;{certificate.reflection}&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Supporting Images Gallery */}
            {supportingImages.length > 0 && (
              <div className="space-y-6 pt-6">
                <h3 className="text-xl font-semibold text-white">Event Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {supportingImages.map((img: any, i: number) => (
                    <div key={img.id || i} className="relative aspect-square rounded-xl overflow-hidden group">
                      <Image
                        src={img.image_url}
                        alt={img.caption || `Event photo ${i + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        {img.image_type !== 'general' && (
                          <span className="text-[10px] uppercase tracking-wider text-white/70 font-bold mb-1">
                            {img.image_type.replace(/_/g, ' ')}
                          </span>
                        )}
                        {img.caption && (
                          <p className="text-sm text-white font-medium line-clamp-2">{img.caption}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Skills & Technologies */}
            {(certificate.skills?.length > 0 || certificate.technologies?.length > 0) && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                <h3 className="text-lg font-semibold text-white">Skills Demonstrated</h3>
                
                {certificate.technologies?.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Technologies</p>
                    <div className="flex flex-wrap gap-2">
                      {certificate.technologies.map((tech: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-[#6366f1]/10 text-[#6366f1] text-sm font-medium border border-[#6366f1]/20">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {certificate.skills?.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {certificate.skills.map((skill: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 text-sm font-medium border border-white/10 hover:bg-white/10 transition-colors">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Metadata Verification */}
            {certificate.ai_generated && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={18} className="text-[#10b981]" />
                  <h3 className="text-lg font-semibold text-white">AI Analyzed</h3>
                </div>
                
                <div className="space-y-3">
                  {certificate.credibility && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Credibility</span>
                      <span className="text-white capitalize font-medium">{certificate.credibility}</span>
                    </div>
                  )}
                  {certificate.difficulty && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Level</span>
                      <span className="text-white capitalize font-medium">{certificate.difficulty}</span>
                    </div>
                  )}
                  {certificate.domain && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Domain</span>
                      <span className="text-white font-medium">{certificate.domain}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generated Summaries */}
            {(certificate.resume_summary || certificate.linkedin_summary) && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                <h3 className="text-lg font-semibold text-white">Career Summaries</h3>
                
                {certificate.resume_summary && (
                  <div className="space-y-2 group">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Resume Bullet</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-sm text-gray-300">
                      {certificate.resume_summary}
                    </div>
                  </div>
                )}

                {certificate.linkedin_summary && (
                  <div className="space-y-2 group">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">LinkedIn Post</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-sm text-gray-300">
                      {certificate.linkedin_summary}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function SparklesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.8491 2.37891L13.1119 9.15579C13.2388 9.53587 13.5359 9.83296 13.916 9.95992L20.6928 12.2227L13.916 14.4855C13.5359 14.6125 13.2388 14.9095 13.1119 15.2896L10.8491 22.0665L8.5863 15.2896C8.45934 14.9095 8.16226 14.6125 7.78218 14.4855L1.00531 12.2227L7.78218 9.95992C8.16226 9.83296 8.45934 9.53587 8.5863 9.15579L10.8491 2.37891Z" fill="#6366f1" />
      <path d="M20.5 2.5L21.2952 4.88566C21.3414 5.02422 21.4497 5.13247 21.5882 5.17871L23.9739 5.97387L21.5882 6.76903C21.4497 6.81526 21.3414 6.92352 21.2952 7.06208L20.5 9.44774L19.7048 7.06208C19.6586 6.92352 19.5503 6.81526 19.4118 6.76903L17.0261 5.97387L19.4118 5.17871C19.5503 5.13247 19.6586 5.02422 19.7048 4.88566L20.5 2.5Z" fill="#6366f1" />
    </svg>
  );
}
