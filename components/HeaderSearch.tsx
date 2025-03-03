'use client'

import { IconSearch } from '@tabler/icons-react';
import { useSession, signOut } from 'next-auth/react';
import { Autocomplete, Burger, Group } from '@mantine/core';
import classes from './HeaderSearch.module.css';
import { useDisclosure } from '@mantine/hooks';
import { Button } from '@mantine/core';
import { useRouter } from 'next/navigation';

const links = [
  { link: '/about', label: 'Features' },
  { link: '/pricing', label: 'Pricing' },
  { link: '/learn', label: 'Learn' },
  { link: '/community', label: 'Community' },
];

export function HeaderSearch() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [opened, { toggle }] = useDisclosure(false);
  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={classes.link}
      onClick={(event) => event.preventDefault()}
    >
      {link.label}
    </a>
  ));

  console.log('session in header session::', session);
  console.log('status in header session::', status);

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Group>
          <Button
            variant="outline"
            onClick={() => {
              if (status === 'authenticated') {
                signOut();
              } else {
                router.push('/auth/signin');
              }
            }}
          >
            {status === 'authenticated' ? 'Log out' : 'Log in'}
          </Button>
        </Group>
        <Group>
          {status === 'authenticated' && session?.user?.name &&
            session?.user?.name
          }

        </Group>
        <Group>
          <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
        </Group>

        <Group>
          <Group ml={50} gap={5} className={classes.links} visibleFrom="sm">
            {items}
          </Group>
          <Group>
            <Button
              variant="outline"
              onClick={() => {
                router.push('/tenancy');
              }
              }
            >
              {status === 'authenticated' ? 'Log out' : 'Log in'}
            </Button>
          </Group>
          <Autocomplete
            className={classes.search}
            placeholder="Search"
            leftSection={<IconSearch size={16} stroke={1.5} />}
            data={['React', 'Angular', 'Vue', 'Next.js', 'Riot.js', 'Svelte', 'Blitz.js']}
            visibleFrom="xs"
          />
        </Group>
      </div>
    </header>
  );
}