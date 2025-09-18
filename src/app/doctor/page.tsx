"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAll, putItem, uid } from "@/lib/idb";

interface Appointment {
  id: string;
  patient: string;
  date: string; // ISO date
  time: string; // HH:mm
  reason: string;
  doctor: string;
  location: string; // default Nabha Civil Hospital
  createdAt: number;
}

interface RecordItem { id: string; name: string; village: string; diagnosis: string; createdAt: number; }

export default function DoctorPortalPage() {
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<RecordItem[]>([]);
  const [form, setForm] = useState<Omit<Appointment, "id" | "createdAt">>({
    patient: "",
    date: "",
    time: "",
    reason: "",
    doctor: "On-call Doctor",
    location: "Nabha Civil Hospital",
  });
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const [a, p] = await Promise.all([
        getAll<Appointment>("appointments"),
        getAll<RecordItem>("records"),
      ]);
      setAppts(a.sort((x, y) => y.createdAt - x.createdAt));
      setPatients(p);
    })();
  }, []);

  const filteredAppts = useMemo(() => {
    const s = q.toLowerCase();
    return appts.filter((x) => [x.patient, x.reason, x.doctor, x.location].some((v) => v.toLowerCase().includes(s)));
  }, [appts, q]);

  async function addAppt() {
    if (!form.patient || !form.date || !form.time) return alert("Patient, date and time are required");
    const a: Appointment = { id: uid("apt"), createdAt: Date.now(), ...form };
    await putItem("appointments", a);
    setAppts((prev) => [a, ...prev]);
    setForm({ patient: "", date: "", time: "", reason: "", doctor: "On-call Doctor", location: "Nabha Civil Hospital" });
  }

  function exportToday() {
    const today = new Date().toISOString().slice(0, 10);
    const list = appts.filter((x) => x.date === today);
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nabha-schedule-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-6">Doctor Portal</h1>
      <Tabs defaultValue="appointments">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
        </TabsList>
        <TabsContent value="appointments">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label>Patient</Label>
                  <Input value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} placeholder="Name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Reason</Label>
                  <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Follow-up, fever, etc." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Doctor</Label>
                    <Input value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addAppt}>Add Appointment</Button>
                  <Button variant="secondary" onClick={exportToday}>Export Today</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-medium">Scheduled</h2>
                  <Input placeholder="Search..." className="max-w-[200px]" value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppts.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>{a.patient}</TableCell>
                          <TableCell>{a.date}</TableCell>
                          <TableCell>{a.time}</TableCell>
                          <TableCell>{a.doctor}</TableCell>
                          <TableCell>{a.location}</TableCell>
                        </TableRow>
                      ))}
                      {filteredAppts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">No appointments</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patients">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Village</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>{p.village}</TableCell>
                        <TableCell>{p.diagnosis}</TableCell>
                        <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                    {patients.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">No patient records yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}