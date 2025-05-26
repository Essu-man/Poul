"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import React, { useState } from "react";
import Link from "next/link";
import {Sidebar} from "@/components/Sidebar";

interface FeedEntry {
  date: string;
  feedType: string;
  quantity: number;
  time: string;
  notes: string;
}

export default function FeedManagementPage() {
  // Feed Management State
  const [feedEntry, setFeedEntry] = useState<FeedEntry>({
    date: format(new Date(), "yyyy-MM-dd"),
    feedType: "layer",
    quantity: 0,
    time: format(new Date(), "HH:mm"),
    notes: "",
  });

  const [feedHistory, /*setFeedHistory*/] = useState<FeedEntry[]>([
    {
      date: format(new Date(new Date().setDate(new Date().getDate() - 1)), "yyyy-MM-dd"),
      feedType: "layer",
      quantity: 250,
      time: "08:30",
      notes: "Regular morning feeding",
    },
    {
      date: format(new Date(new Date().setDate(new Date().getDate() - 1)), "yyyy-MM-dd"),
      feedType: "starter",
      quantity: 100,
      time: "16:00",
      notes: "For new chicks",
    },
  ]);

  return (
    <div className="flex h-screen bg-gray-50">
    <Sidebar activeTab="feed-management" />
      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Feed Management</h1>
          <Button variant="default">Export Data</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Record Feed Usage Form */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Record Feed Usage</h2>
              <div className="space-y-4">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={feedEntry.date} onChange={(e) => setFeedEntry({ ...feedEntry, date: e.target.value })} />
                </div>
                <div>
                  <Label>Feed Type</Label>
                  <Select value={feedEntry.feedType} onValueChange={(value) => setFeedEntry({ ...feedEntry, feedType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select feed type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="layer">Layer Feed</SelectItem>
                      <SelectItem value="starter">Starter Feed</SelectItem>
                      <SelectItem value="grower">Grower Feed</SelectItem>
                      <SelectItem value="finisher">Finisher Feed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity (kg)</Label>
                  <Input
                    type="number"
                    value={feedEntry.quantity}
                    onChange={(e) => setFeedEntry({ ...feedEntry, quantity: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input type="time" value={feedEntry.time} onChange={(e) => setFeedEntry({ ...feedEntry, time: e.target.value })} />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={feedEntry.notes}
                    onChange={(e) => setFeedEntry({ ...feedEntry, notes: e.target.value })}
                    placeholder="Enter any additional information"
                  />
                </div>
                <Button className="w-full">Save Record</Button>
              </div>
            </CardContent>
          </Card>

          {/* Feed Inventory */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Feed Inventory</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Layer Feed</h3>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Current: 750kg</span>
                    <span>Capacity: 1000kg</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Starter Feed</h3>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Current: 120kg</span>
                    <span>Capacity: 500kg</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '24%' }}></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Grower Feed</h3>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Current: 350kg</span>
                    <span>Capacity: 500kg</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Finisher Feed</h3>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Current: 0kg</span>
                    <span>Capacity: 500kg</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-2 bg-red-500 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">Order Feed</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feed Distribution History */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Feed Distribution History</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Feed Type</TableHead>
                  <TableHead>Quantity (kg)</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedHistory.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.time}</TableCell>
                    <TableCell>{entry.feedType}</TableCell>
                    <TableCell>{entry.quantity} kg</TableCell>
                    <TableCell>{entry.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}