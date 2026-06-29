"use client";

import { Link, useRouter } from "@/lib/i18n/navigation";
import { Container, Group, Button } from "@mantine/core";
import classes from "@/components/HeaderSearch.module.css";

const basePath='/my-tenancy'

export const TenancyHeader = () => {
  const router = useRouter();

  const secondaryLinks = [
    { link: `${basePath}/admin`, label: "Admin settings" },
    //{ link: `${basePath}/users`, label: "Users" },
    { link: `${basePath}/schedules`, label: "Schedules" },
    { link: `${basePath}/timeslots`, label: "Timeslots manager" },
  ];

  return (
    <div className={classes.secondaryHeader}>
      <Container fluid>
        <Group style={{ height: 56 }}>
          <Link
            href="/my-tenancy"
            className={classes.link}
            style={{ color: 'hsla(25, 19%, 26%, 1)' }}
          >
            Dashboard
          </Link>
          <Group>
            {secondaryLinks.map((link) => (
              <Link
                key={link.label}
                href={link.link}
                className={classes.link}
                style={{ color: 'hsla(25, 19%, 26%, 1)' }}
              >
                {link.label}
              </Link>
            ))}
          </Group>
        </Group>
      </Container>
    </div>
  );
};
