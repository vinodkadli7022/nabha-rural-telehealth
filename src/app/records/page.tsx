"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAll, putItem, deleteItem, uid } from "@/lib/idb";

interface RecordItem {
  id: string;
  name: string;
  age: number;
  village: string;
  phone: string;
  symptoms: string;
  diagnosis: string;
  prescription: string;
  createdAt: number;
}

export default function RecordsPage() {
  const [items, setItems] = useState<RecordItem[]>([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState<Omit<RecordItem, "id" | "createdAt">>({
    name: "",
    age: 0,
    village: "",
    phone: "",
    symptoms: "",
    diagnosis: "",
    prescription: "",
  });

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return items.filter((x) =>
      [x.name, x.village, x.phone, x.symptoms, x.diagnosis].some((v) => v.toLowerCase().includes(s))
    );
  }, [q, items]);

  useEffect(() => {
    (async () => {
      const all = await getAll<RecordItem>("records");
      setItems(all.sort((a, b) => b.createdAt - a.createdAt));
    })();
  }, []);

  async function save() {
    const item: RecordItem = { id: uid("rec"), createdAt: Date.now(), ...form };
    await putItem("records", item);
    setItems((prev) => [item, ...prev]);
    setForm({ name: "", age: 0, village: "", phone: "", symptoms: "", diagnosis: "", prescription: "" });
  }

  async function remove(id: string) {
    await deleteItem("records", id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-4">Digital Health Records</h1>
      <p className="text-sm text-muted-foreground mb-6">Offline-ready storage using your device. Data stays local unless exported.</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label htmlFor="name">Patient Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: Number(e.target.value || 0) })} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="village">Village</Label>
                <Input id="village" value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input id="diagnosis" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="symptoms">Symptoms</Label>
              <Textarea id="symptoms" rows={3} value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="prescription">Prescription</Label>
              <Textarea id="prescription" rows={2} value={form.prescription} onChange={(e) => setForm({ ...form, prescription: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button onClick={save}>Save Record</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium">Saved Records</h2>
              <Input placeholder="Search..." className="max-w-[200px]" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Village</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.village}</TableCell>
                      <TableCell>{r.diagnosis}</TableCell>
                      <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="destructive" onClick={() => remove(r.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No records yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}