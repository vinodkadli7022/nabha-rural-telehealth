"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const T = {
  en: {
    title: "Telemedicine Consultation",
    start: "Start Call",
    stop: "End Call",
    mute: "Mute",
    unmute: "Unmute",
    audioOnly: "Audio only",
    lowBw: "Low bandwidth",
    tips: "Tip: If video stutters, switch to Audio only or Low bandwidth.",
  },
  hi: {
    title: "टेलीमेडिसिन परामर्श",
    start: "कॉल शुरू करें",
    stop: "कॉल समाप्त करें",
    mute: "म्यूट",
    unmute: "अनम्यूट",
    audioOnly: "केवल ऑडियो",
    lowBw: "कम बैंडविड्थ",
    tips: "सलाह: यदि वीडियो अटक रहा है, केवल ऑडियो या कम बैंडविड्थ चुनें।",
  },
  pa: {
    title: "ਟੈਲੀਮੇਡਿਸਿਨ ਸਲਾਹ-ਮਸ਼ਵਰਾ",
    start: "ਕਾਲ ਸ਼ੁਰੂ ਕਰੋ",
    stop: "ਕਾਲ ਖਤਮ ਕਰੋ",
    mute: "ਮਿਊਟ",
    unmute: "ਅਨਮਿਊਟ",
    audioOnly: "ਸਿਰਫ਼ ਆਡੀਓ",
    lowBw: "ਘੱਟ ਬੈਂਡਵਿਡਥ",
    tips: "ਸੁਝਾਅ: ਜੇ ਵੀਡੀਓ ਅਟਕਦੀ ਹੈ, ਸਿਰਫ਼ ਆਡੀਓ ਜਾਂ ਘੱਟ ਬੈਂਡਵਿਡਥ ਵਰਤੋ।",
  },
};

type Lang = keyof typeof T;

export default function ConsultPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioOnly, setAudioOnly] = useState(false);
  const [lowBw, setLowBw] = useState(true);
  const localRef = useRef<HTMLVideoElement | null>(null);
  const remoteRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    // Basic environment checks to avoid silent failures
    const isSecure = typeof window !== "undefined" && (location.protocol === "https:" || location.hostname === "localhost");
    if (!isSecure) {
      toast.error("Camera/mic requires HTTPS. Please use https or localhost.");
      return;
    }
    if (!navigator?.mediaDevices?.getUserMedia) {
      toast.error("Camera/mic not supported on this device/browser.");
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: audioOnly
          ? false
          : {
              width: lowBw ? { ideal: 320 } : { ideal: 640 },
              frameRate: lowBw ? { ideal: 12, max: 15 } : { ideal: 24, max: 30 },
            },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (localRef.current) {
        localRef.current.srcObject = stream;
        await localRef.current.play().catch(() => {});
      }
      // Simulate remote by cloning local stream (for demo only)
      const clone = stream.clone();
      if (remoteRef.current) {
        remoteRef.current.srcObject = clone;
        await remoteRef.current.play().catch(() => {});
      }
      setStarted(true);
    } catch (e: any) {
      console.error(e);
      const messageMap: Record<string, string> = {
        NotAllowedError: "Permission denied. Please allow camera/mic.",
        NotFoundError: "No camera/mic found. Please connect a device.",
        NotReadableError: "Device is in use by another app.",
        OverconstrainedError: "Requested media constraints not supported.",
        SecurityError: "Permissions blocked by browser settings.",
      };
      const name = e?.name as string | undefined;
      toast.error(messageMap[name || ""] || "Camera/mic permission denied or unavailable.");
    }
  };

  const stopStream = () => {
    setStarted(false);
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      const s = streamRef.current;
      s?.getAudioTracks().forEach((t) => (t.enabled = !next));
      return next;
    });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="flex items-end justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">{T[lang].title}</h1>
        <div className="w-48">
          <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
            <SelectTrigger aria-label="Language">
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

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardContent className="pt-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <video ref={localRef} playsInline muted className="w-full aspect-video bg-black rounded" />
              <video ref={remoteRef} playsInline className="w-full aspect-video bg-black rounded" />
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {!started ? (
                <Button onClick={start}>{T[lang].start}</Button>
              ) : (
                <>
                  <Button variant="destructive" onClick={stopStream}>{T[lang].stop}</Button>
                  <Button variant="secondary" onClick={toggleMute}>{muted ? T[lang].unmute : T[lang].mute}</Button>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-3">{T[lang].tips}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">{T[lang].audioOnly}</span>
              <Switch checked={audioOnly} onCheckedChange={setAudioOnly} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{T[lang].lowBw}</span>
              <Switch checked={lowBw} onCheckedChange={setLowBw} />
            </div>
            <p className="text-xs text-muted-foreground">Changing options takes effect when you (re)start the call.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}