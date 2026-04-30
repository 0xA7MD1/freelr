"use client";

import { Github, Instagram, Linkedin, Twitter } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/shared/ui/logo";
import { useT } from "@/lib/i18n";

const SOCIALS: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
];

export function LandingFooter() {
  const t = useT();
  const year = new Date().getFullYear();

  const columns = [
    {
      titleKey: "landing.footer.product",
      links: [
        { labelKey: "landing.footer.featuresLink", href: "#features" },
        { labelKey: "landing.footer.howItWorksLink", href: "#how-it-works" },
        { labelKey: "landing.footer.pricingLink", href: "#pricing" },
        { labelKey: "landing.footer.updatesLink", href: "#" },
      ],
    },
    {
      titleKey: "landing.footer.resources",
      links: [
        { labelKey: "landing.footer.blog", href: "#" },
        { labelKey: "landing.footer.helpCenter", href: "#" },
        { labelKey: "landing.footer.guide", href: "#" },
        { labelKey: "landing.footer.tools", href: "#" },
      ],
    },
    {
      titleKey: "landing.footer.legal",
      links: [
        { labelKey: "landing.footer.contact", href: "#" },
        { labelKey: "landing.footer.privacy", href: "#" },
        { labelKey: "landing.footer.terms", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-slate-900 text-slate-400 pt-20 pb-10 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 text-white">
              <Logo className="w-8 h-8 text-white" />
              <span className="text-2xl font-bold tracking-tight">Freelr</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              {t("landing.footer.description")}
            </p>
            <div className="flex items-center gap-4 mt-2">
              {SOCIALS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#0052FC] hover:text-white transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.titleKey} className="flex flex-col gap-4">
              <h4 className="text-white font-bold mb-2">{t(col.titleKey)}</h4>
              {col.links.map((link) => (
                <a key={link.labelKey} href={link.href} className="hover:text-white transition-colors w-fit">
                  {t(link.labelKey)}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-500">
            &copy; {year} Freelr Workspace. {t("landing.footer.rights")}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{t("landing.footer.madeWith")}</span>
            <span className="text-red-500">❤️</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
