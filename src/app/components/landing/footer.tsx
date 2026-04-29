import { Github, Instagram, Linkedin, Twitter } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/shared/ui/logo";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: "المنتج",
    links: [
      { label: "المميزات", href: "#features" },
      { label: "كيف تعمل المنصة", href: "#how-it-works" },
      { label: "باقات الأسعار", href: "#pricing" },
      { label: "تحديثات المنصة", href: "#" },
    ],
  },
  {
    title: "المصادر",
    links: [
      { label: "المدونة", href: "#" },
      { label: "مركز المساعدة", href: "#" },
      { label: "دليل المستقلين", href: "#" },
      { label: "أدوات مجانية", href: "#" },
    ],
  },
  {
    title: "تواصل وقانوني",
    links: [
      { label: "تواصل معنا", href: "#" },
      { label: "سياسة الخصوصية", href: "#" },
      { label: "الشروط والأحكام", href: "#" },
    ],
  },
];

const SOCIALS: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
];

export function LandingFooter() {
  const year = new Date().getFullYear();

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
              المنصة العربية الأولى المصممة خصيصاً للمستقلين لتسهيل إدارة أعمالهم ومشاريعهم وفواتيرهم بكل احترافية.
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

          {COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-4">
              <h4 className="text-white font-bold mb-2">{column.title}</h4>
              {column.links.map((link) => (
                <a key={link.label} href={link.href} className="hover:text-white transition-colors w-fit">
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-slate-500">
            &copy; {year} Freelr Workspace. جميع الحقوق محفوظة.
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>صُنع بحب للمستقلين العرب</span>
            <span className="text-red-500">❤️</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
