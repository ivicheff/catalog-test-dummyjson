"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  phone: string;
  address: {
    city: string;
  };
  image: string;
}

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("https://dummyjson.com/users");
        const data = await response.json();
        setUsers(data.users);
        setFilteredUsers(data.users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const filtered = users.filter((user) =>
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(value.toLowerCase()),
    );
    setFilteredUsers(filtered);
  };

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center">
        <Spinner />
      </main>
    );
  }

  return (
    <main className="">
      <div className="bg-secondary py-8">
        <div className="mx-auto max-w-[18.75rem]">
          <Input
            className="bg-white"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-4 p-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader className="flex gap-2">
              <Avatar>
                <AvatarImage src={`${user.image}`} />
                <AvatarFallback>
                  {`${user.firstName?.[0]?.toUpperCase() ?? ""}${user.lastName?.[0]?.toUpperCase() ?? ""}`}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{`${user.firstName} ${user.lastName}`}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{user.email}</p>
              <p>{user.age}</p>
              <p>{user.phone}</p>
              <p>{user.address.city}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
