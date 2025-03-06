'use client';

import {  Container, Group, Button } from '@mantine/core';
import  Link  from 'next/link';
import { useRouter } from 'next/navigation';

export const TenancyHeader = () => {
  const router = useRouter();

  const secondaryLinks = [
    { link: '/tenancy-settings', label: 'Settings' },
    { link: '/users', label: 'Users' },
  ];

  return (
    <Container fluid>
      <Group style={{ height: 56 }}>
        <Button
          variant="outline"
          onClick={() => router.push('/tenancy')}
        >
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
      <Group>
              <Link href="/classes">
                <Button variant="subtle">Classes</Button>
              </Link>
              <Link href="/schedules">
                <Button variant="subtle">Schedules</Button>
              </Link>
            </Group>
    </Container>
  );
};
