"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Spinner } from "~/components/ui/spinner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

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

interface ApiResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

const LIMIT = 12;

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const totalPages = Math.ceil(totalUsers / LIMIT);
  const skip = (currentPage - 1) * LIMIT;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      try {
        const url = searchQuery
          ? `https://dummyjson.com/users/search?q=${encodeURIComponent(searchQuery)}&limit=${LIMIT}&skip=${skip}`
          : `https://dummyjson.com/users?limit=${LIMIT}&skip=${skip}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data: ApiResponse = await response.json();

        setUsers(data.users);
        setTotalUsers(data.total);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchQuery, skip]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  <div className="grid gap-8 p-8 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
    {loading ? (
      <div className="col-span-full flex justify-center">
        <Spinner />
      </div>
    ) : (
      users.map((user) => <Card key={user.id}>...</Card>)
    )}
  </div>;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <main>
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

      <div className="grid gap-8 p-8 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user.image} />
                <AvatarFallback>
                  {`${user.firstName?.[0]?.toUpperCase() ?? ""}${user.lastName?.[0]?.toUpperCase() ?? ""}`}
                </AvatarFallback>
              </Avatar>

              <CardTitle>
                {user.firstName} {user.lastName}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
              <p>
                <span className="text-gray-400">email:</span> {user.email}
              </p>
              <p>
                <span className="text-gray-400">age:</span> {user.age}
              </p>
              <p>
                <span className="text-gray-400">phone:</span> {user.phone}
              </p>
              <p>
                <span className="text-gray-400">city:</span> {user.address.city}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center py-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {getPageNumbers().map((page, idx) => (
                <PaginationItem key={idx}>
                  {page === "..." ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(page as number)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </main>
  );
}
