"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAll, putItem, uid } from "@/lib/idb";

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  pharmacy: string; // e.g., "Nabha Civil Hospital"
  updatedAt: number;
}

const seedItems: Omit<InventoryItem, "id" | "updatedAt">[] = [
  { name: "Paracetamol 500mg", stock: 42, pharmacy: "Nabha Civil Hospital" },
  { name: "Azithromycin 250mg", stock: 20, pharmacy: "Nabha Civil Hospital" },
  { name: "ORS Pack", stock: 80, pharmacy: "Village PHC" },
  { name: "Amoxicillin 500mg", stock: 12, pharmacy: "Village PHC" },
  { name: "Cetirizine 10mg", stock: 50, pharmacy: "Private Chemist" },
];

function symptomRules(input: string) {
  const s = input.toLowerCase();
  const suggestions: string[] = [];
  if (/fever|temperature|bukhar|bukhaar|ਬੁਖਾਰ/.test(s)) {
    suggestions.push("Possible: Viral fever. Hydration + Paracetamol 500mg if no contraindications.");
  }
  if (/cough|khansi|ਖੰਘ/.test(s)) {
    suggestions.push("Possible: Upper respiratory infection. Warm fluids, steam; see doctor if >3 days.");
  }
  if (/diarrh|loose|dast|ਦਸਤ/.test(s)) {
    suggestions.push("Possible: Gastroenteritis. ORS, zinc; watch dehydration signs.");
  }
  if (suggestions.length === 0) suggestions.push("No clear match. Please consult a doctor.");
  return suggestions;
}

export default function PharmacyPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [q, setQ] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      const existing = await getAll<InventoryItem>("inventory");
      if (existing.length === 0) {
        const seeded: InventoryItem[] = seedItems.map((x) => ({ id: uid("med"), updatedAt: Date.now(), ...x }));
        await Promise.all(seeded.map((s) => putItem("inventory", s)));
        setItems(seeded);
      } else {
        setItems(existing);
      }
    })();
  }, []);

  useEffect(() => {
    // Simulate real-time updates by random stock change
    timer.current = setInterval(async () => {
      setItems((prev) => {
        if (prev.length === 0) return prev;
        const idx = Math.floor(Math.random() * prev.length);
        const delta = Math.random() < 0.5 ? -1 : 1;
        const copy = [...prev];
        const it = { ...copy[idx] };
        it.stock = Math.max(0, it.stock + delta);
        it.updatedAt = Date.now();
        copy[idx] = it;
        // persist
        putItem("inventory", it);
        return copy;
      });
    }, 4000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return items.filter((x) => [x.name, x.pharmacy].some((v) => v.toLowerCase().includes(s)));
  }, [items, q]);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Medicine Availability & Symptom Checker</h1>
      <p className="text-sm text-muted-foreground mb-6">Live inventory simulation across Nabha pharmacies. This tool does not provide medical advice.</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium">Inventory</h2>
              <Input placeholder="Search medicine or pharmacy" className="max-w-[260px]" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Pharmacy</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.name}</TableCell>
                      <TableCell>{m.pharmacy}</TableCell>
                      <TableCell>{m.stock}</TableCell>
                      <TableCell>{new Date(m.updatedAt).toLocaleTimeString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-3">
            <div>
              <Label htmlFor="symptoms">Describe symptoms (English/Hindi/Punjabi)</Label>
              <Textarea id="symptoms" rows={5} value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
            </div>
            <Button onClick={() => alert(symptomRules(symptoms).join("\n\n"))}>Check Symptoms</Button>
            <p className="text-xs text-muted-foreground">Results are informational only. For emergencies, visit Nabha Civil Hospital.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}