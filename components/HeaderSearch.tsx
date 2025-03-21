'use client'

import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { IconSearch } from '@tabler/icons-react';
import { Autocomplete, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Button, Select } from '@mantine/core';
import classes from './HeaderSearch.module.css';
import { UserSession } from '@/types/UserTypes';
import Link from 'next/link';

const links = [
  { link: '/my-tenancy', label: 'my tenancy' },
  { link: '/pricing', label: 'pricing' },
  { link: '/classes', label: 'classes' },
  { link: '/schedules', label: 'schedules' },
];

interface props {
  session: UserSession,
  tenancies: any[],
}

export const HeaderSearch: FC<props> = ({session, tenancies}) => {
  // console.log('tenancies in header', tenancies);
  const { update } = useSession();
  const [selectedTenancy, setSelectedTenancy] = useState<string>('');
  const { name, status } = session;
  const router = useRouter();
  const [opened, { toggle }] = useDisclosure(false);
  const items = links.map((link) => (
    <Link
    key={link.label}
    href={link.link}
    className={classes.link}
    onClick={(event) => {console.log('click on menu')}}
    >
      {link.label}
    </Link>
  ));
  
  const getTenancies = () => {
    return tenancies.map((tenancy) => {
      return {
        value: tenancy.TENANCY_ID.toString(),
        label: `${tenancy.TENANCY_NAME} (${tenancy.ROLE_NAME})`,
      };
    });
  };
  const tenancyOptions = getTenancies();

  const tenancyChangeHandler = async (value: any) => {
    const result = await update({ tenancyId: value});
    router.refresh();
    setSelectedTenancy(value);
  };


  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Group>
        {status === 'authenticated' ? (
            <Select
            value={selectedTenancy}
            onChange={tenancyChangeHandler}
            data={tenancyOptions}
            placeholder="Select a tenancy"
          />
        ) : null}
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
        <Group>
          {status === 'authenticated' && name &&
            name
          }
          </Group>
        </Group>

        <Group>
          <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
        </Group>

        <Group>
          <Group ml={50} gap={5} className={classes.links} visibleFrom="sm">
            {items}
          </Group>
         
         {/*} <Autocomplete
            className={classes.search}
            placeholder="Search"
            leftSection={<IconSearch size={16} stroke={1.5} />}
            data={['React', 'Angular', 'Vue', 'Next.js', 'Riot.js', 'Svelte', 'Blitz.js']}
            visibleFrom="xs"
          /> */}
        </Group>
      </div>
    </header>
  );
}