"use client";

import { useEffect, useState, useCallback } from "react";
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
import { useDebounce } from "~/hooks/use-debounce";

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

async function fetchUsers(query: string, skip: number): Promise<ApiResponse> {
  const url = query
    ? `https://dummyjson.com/users/search?q=${encodeURIComponent(query)}&limit=${LIMIT}&skip=${skip}`
    : `https://dummyjson.com/users?limit=${LIMIT}&skip=${skip}`;

  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch users: ${response.status}`);
  return response.json() as Promise<ApiResponse>;
}

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearch = useDebounce(searchQuery, 400);

  const totalPages = Math.ceil(totalUsers / LIMIT);
  const skip = (currentPage - 1) * LIMIT;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchUsers(debouncedSearch, skip);
      setUsers(data.users);
      setTotalUsers(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, skip]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [1];

    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="col-span-full flex justify-center py-16">
          <Spinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="col-span-full">
          <span>something went wrong</span>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="text-muted-foreground col-span-full py-16 text-center">
          No users found{debouncedSearch ? ` for "${debouncedSearch}"` : ""}
        </div>
      );
    }

    return users.map((user) => (
      <Card key={user.id}>
        <CardHeader className="flex flex-row items-center gap-3">
          <Avatar>
            <AvatarImage
              src={user.image}
              alt={`${user.firstName} ${user.lastName}`}
            />
            <AvatarFallback>
              {`${user.firstName?.[0]?.toUpperCase() ?? ""}${user.lastName?.[0]?.toUpperCase() ?? ""}`}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-base">
            {user.firstName} {user.lastName}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 text-sm">
          <p>
            <span className="text-gray-400">Email:</span>{" "}
            <a href={`mailto:${user.email}`} className="hover:underline">
              {user.email}
            </a>
          </p>
          <p>
            <span className="text-gray-400">Age:</span> {user.age}
          </p>
          <p>
            <span className="text-gray-400">Phone:</span> {user.phone}
          </p>
          <p>
            <span className="text-gray-400">City:</span>{" "}
            {user.address.city}
          </p>
        </CardContent>
      </Card>
    ));
  };

  return (
    <main>
      <div className="bg-secondary py-8">
        <div className="mx-auto max-w-xs">
          <Input
            className="bg-white"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search users by name"
          />
        </div>
      </div>

      <div className="grid gap-8 p-8 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {renderContent()}
      </div>

      {!loading && !error && totalPages > 1 && (
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
                  aria-disabled={currentPage === 1}
                />
              </PaginationItem>

              {getPageNumbers().map((page, idx) => (
                <PaginationItem key={idx}>
                  {page === "..." ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
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
