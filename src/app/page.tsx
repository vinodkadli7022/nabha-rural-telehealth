"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const translations = {
  en: {
    title: "Telemedicine for Rural Nabha",
    subtitle: "Accessible, low-bandwidth healthcare for every village in Nabha.",
    ctaConsult: "Start Consultation",
    ctaRecords: "Health Records",
    ctaPharmacy: "Medicine & Symptoms",
    ctaDoctor: "Doctor Portal",
    statsTitle: "Why it matters",
    stat1: "60+ villages served",
    stat2: "< 200 kbps friendly",
    stat3: "3 languages supported",
    problemTitle: "The challenge",
    problemText:
      "Rural families in Nabha travel long distances for basic care. Poor connectivity, language barriers, and limited specialist access delay treatment.",
  },
  hi: {
    title: "नाभा के ग्रामीणों के लिए टेलीमेडिसिन",
    subtitle: "हर गाँव के लिए कम-बैंडविड्थ स्वास्थ्य सेवा।",
    ctaConsult: "परामर्श शुरू करें",
    ctaRecords: "स्वास्थ्य रिकॉर्ड",
    ctaPharmacy: "दवा व लक्षण",
    ctaDoctor: "डॉक्टर पोर्टल",
    statsTitle: "यह क्यों ज़रूरी है",
    stat1: "60+ गांव कवर",
    stat2: "200 kbps पर भी चले",
    stat3: "3 भाषाएँ",
    problemTitle: "समस्या",
    problemText:
      "नाभा के ग्रामीणों को प्राथमिक इलाज के लिए भी दूर जाना पड़ता है। कमजोर कनेक्टिविटी, भाषा अवरोध और सीमित विशेषज्ञ पहुंच से इलाज में देरी होती है।",
  },
  pa: {
    title: "ਨਭਾ ਪੇਂਡੂ ਇਲਾਕਿਆਂ ਲਈ ਟੈਲੀਮੇਡਿਸਿਨ",
    subtitle: "ਹਰ ਪਿੰਡ ਲਈ ਘੱਟ-ਬੈਂਡਵਿਡਥ ਸਿਹਤ ਸੇਵਾ।",
    ctaConsult: "ਸਲਾਹ-ਮਸ਼ਵਰਾ ਸ਼ੁਰੂ ਕਰੋ",
    ctaRecords: "ਹੈਲਥ ਰਿਕਾਰڈ",
    ctaPharmacy: "ਦਵਾਈ ਅਤੇ ਲੱਛਣ",
    ctaDoctor: "ਡਾਕਟਰ ਪੋਰਟਲ",
    statsTitle: "ਇਹ ਕਿਉਂ ਜ਼ਰੂਰੀ ਹੈ",
    stat1: "60+ ਪਿੰਡ ਕਵਰ",
    stat2: "200 kbps ’ਤੇ ਵੀ ਚੱਲੇ",
    stat3: "3 ਭਾਸ਼ਾਵਾਂ",
    problemTitle: "ਚੁਣੌਤੀ",
    problemText:
      "ਨਭਾ ਦੇ ਪੇਂਡੂ ਪਰਿਵਾਰਾं ਨੂੰ ਬੁਨਿਆਦੀ ਇਲਾਜ ਲਈ ਵੀ ਦੂਰ ਜਾਣਾ ਪੈਂਦਾ ਹੈ। ਕਮਜ਼ੋਰ ਕਨੈਕਟੀਵਿਟੀ, ਭਾਸ਼ਾਈ ਰੁਕਾਵटਾਂ ਅਤੇ ਸੀਮਿਤ ਮਾਹਿਰਾ� ਦੀ ਪਹੁੰਚ ਕਾਰਨ ਇਲਾਜ ਵਿੱਚ ਦੇਰੀ ਹੁੰਦੀ ਹੈ।",
  },
};

type Lang = keyof typeof translations;

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const t = translations[lang];

  return (
    <main className="min-h-[100svh] font-sans">
      {/* Hero */}
      <section
        className="relative isolate overflow-hidden"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1504439468489-c8920d796a29?q=80&w=2070&auto=format&fit=crop)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-20 sm:py-28 text-white">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">{t.title}</h1>
              <p className="mt-3 sm:mt-4 text-base sm:text-lg max-w-2xl opacity-90">{t.subtitle}</p>
            </div>
            <div className="w-full sm:w-56">
              <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
                <SelectTrigger aria-label="Language" className="bg-white/10 backdrop-blur text-white border-white/30">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिन्दी</SelectItem>
                  <SelectItem value="pa">ਪੰਜਾਬੀ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/consult"><Button size="lg" className="w-full">{t.ctaConsult}</Button></Link>
            <Link href="/records"><Button size="lg" className="w-full">{t.ctaRecords}</Button></Link>
            <Link href="/pharmacy"><Button size="lg" className="w-full">{t.ctaPharmacy}</Button></Link>
            <Link href="/doctor"><Button size="lg" className="w-full">{t.ctaDoctor}</Button></Link>
          </div>
        </div>
      </section>

      {/* Problem & Stats */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl sm:text-2xl font-semibold">{t.problemTitle}</h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground">{t.problemText}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold">60+</p>
                <p className="text-muted-foreground">{t.stat1}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold">200kbps</p>
                <p className="text-muted-foreground">{t.stat2}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold">3</p>
                <p className="text-muted-foreground">{t.stat3}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/50 border-t">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
          <h3 className="text-lg sm:text-xl font-semibold mb-6">How it works</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="font-medium">1. Join a call</p>
                <p className="text-sm text-muted-foreground mt-1">Low-bandwidth video/audio optimized for patchy 2G/3G.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="font-medium">2. Share symptoms</p>
                <p className="text-sm text-muted-foreground mt-1">Use Punjabi/Hindi to describe issues. We auto-translate basics.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="font-medium">3. Get Rx & follow-up</p>
                <p className="text-sm text-muted-foreground mt-1">Track nearby pharmacy stock and save prescriptions offline.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}