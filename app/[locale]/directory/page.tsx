import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Mail, Phone, Users } from "lucide-react";
import { ChurchesFilter } from "@/components/churches-filter";
import { getTranslations } from "next-intl/server";
import LanguageToggler from "@/components/languageToggler";
import NavPublic from "@/components/nav-public";

const prisma = new PrismaClient();

interface DirectoryPageProps {
  searchParams: {
    search?: string;
  };
}

async function getChurches(search?: string) {
  const whereClause: any = {};

  // Search by name or address if provided
  if (search) {
    whereClause.OR = [
      {
        name: {
          contains: search,
          // mode: "insensitive",
        },
      },
      {
        address: {
          contains: search,
          // mode: "insensitive",
        },
      },
    ];
  }

  return prisma.church.findMany({
    where: whereClause,
    orderBy: {
      name: "asc",
    },
  });
}

export default async function DirectoryPage({
  searchParams,
}: DirectoryPageProps) {
  const { search } = searchParams;
  const churches = await getChurches(search);
  const t = await getTranslations("ChurchDirectoryPage");

  return (
    <div className="min-h-screen bg-slate-50">
      <NavPublic />
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t("pageTitle")}</h1>
            <p className="text-muted-foreground">
              {t("pageDescription")}
            </p>
          </div>
          <ChurchesFilter search={search || ""} />
        </div>

        {churches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t("noChurchesFound")}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/directory">{t("clearFilters")}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {churches.map((church) => (
              <Card key={church.id}>
                <CardHeader>
                  <CardTitle>{church.name}</CardTitle>
                  {church.address && (
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {church.address}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {church.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{church.email}</span>
                      </div>
                    )}
                    {church.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{church.phone}</span>
                      </div>
                    )}
                    {church.servantCount && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{church.servantCount} {t("servants")}</span>
                      </div>
                    )}
                  </div>
                  {church.description && (
                    <div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {church.description}
                      </p>
                    </div>
                  )}
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/directory/${church.id}`}>{t("viewDetails")}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
