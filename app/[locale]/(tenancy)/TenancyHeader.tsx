"use client";

import { Link, useRouter } from "@/lib/i18n/navigation";
import { Container, Group, Button } from "@mantine/core";

const basePath='/my-tenancy'

export const TenancyHeader = () => {
  const router = useRouter();

  const secondaryLinks = [
    { link: `${basePath}/admin`, label: "Admin settings" },
    { link: `${basePath}/users`, label: "Users" },
    { link: `${basePath}/schedules`, label: "Schedules" },
  ];

  return (
    <Container fluid>
      <Group style={{ height: 56 }}>
        <Button variant="outline" onClick={() => router.push("/my-tenancy")}>
          Dashboard
        </Button>
        <Group>
          {secondaryLinks.map((link) => (
            <Link key={link.label} href={link.link}>
              <Button variant="subtle">{link.label}</Button>
            </Link>
          ))}
        </Group>
      </Group>
          </Container>
  );
};
