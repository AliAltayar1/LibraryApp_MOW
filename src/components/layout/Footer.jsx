import React from "react";
import Link from "next/link";
import { MinistryLogo } from "@/shared/MinistryLogo";
import { Container } from "@/shared/Container";
import { APP_CONFIG, NAVIGATION_LINKS } from "@/lib/constants";
import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ShieldAlert,
  Globe,
  Share2,
} from "lucide-react";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="w-full bg-primary-900 text-white mt-auto border-t-4 border-secondary">
      {/* Upper Footer: Branding, Links & Academic Portals */}
      <div className="py-12 sm:py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10">
            {/* Branding Column (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <MinistryLogo variant="footer" />
              <p className="text-xs sm:text-sm text-primary-100/80 leading-relaxed max-w-md pt-2">
                {APP_CONFIG.description}
              </p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 max-w-md text-xs text-secondary-light flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  هذه المنصة تمثل النموذج الرقمي المعتمد للبحث العلمي وإتاحة المراجع الوقفية والتراثية لجمهور الباحثين والدارسين.
                </span>
              </div>
            </div>

            {/* Quick Links Column (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h3 className="text-sm font-bold text-secondary-light tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span>أقسام المكتبة الرئيسية</span>
              </h3>
              <ul className="space-y-2 text-xs text-primary-100/70">
                {NAVIGATION_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-white hover:ps-1 transition-all inline-block py-1"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/profile"
                    className="hover:text-white hover:ps-1 transition-all inline-block py-1"
                  >
                    حساب الباحث وسجل القراءة
                  </Link>
                </li>
                <li>
                  <Link
                    href="/books?category=endowment-studies"
                    className="hover:text-white hover:ps-1 transition-all inline-block py-1"
                  >
                    الدراسات الوقفية التخصصية
                  </Link>
                </li>
              </ul>
            </div>

            {/* Official Portals & Contact Placeholders (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-sm font-bold text-secondary-light tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span>معلومات الاتصال والبوابة الرسمية</span>
              </h3>
              <p className="text-xs text-primary-100/70 leading-relaxed">
                قنوات التواصل والاستعلام (بيانات افتراضية للنموذج الرقمي):
              </p>
              <ul className="space-y-2.5 text-xs text-primary-100/80">
                <li className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-secondary shrink-0" />
                  <span>دمشق، شارع الملك فيصل - مبنى وزارة الأوقاف</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-secondary shrink-0" />
                  <span dir="ltr">+963 11 231 0000</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-secondary shrink-0" />
                  <span>library-support@mow.gov.sy</span>
                </li>
                <li className="pt-1">
                  <a
                    href="https://mow.gov.sy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-secondary-light hover:text-white font-semibold underline underline-offset-4"
                  >
                    <span>الموقع الرسمي لوزارة الأوقاف (mow.gov.sy)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Bar: Copyright & Government Disclaimers */}
      <div className="border-t border-white/10 py-5 bg-black/20 text-xs text-primary-100/60">
        <Container className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-start">
          <p>
            جميع الحقوق محفوظة © {currentYear} {APP_CONFIG.ministryName}
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-white transition-colors cursor-pointer">
              سياسة الخصوصية والاستخدام الأكاديمي
            </span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">
              شروط الاقتباس والتوثيق
            </span>
          </div>
        </Container>
      </div>
    </footer>
  );
}
