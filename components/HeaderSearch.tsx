"use client";

import { FC, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Button, Select } from "@mantine/core";
import classes from "./HeaderSearch.module.css";
import { UserSession } from "@/types/UserTypes";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/lib/i18n/navigation";
import LocaleSwitcher from "./LocaleSwitcher";
import { setTenancyInServer } from "@/lib/database/setTenancyInServer";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { getTenancyBasedData } from "@/lib/getTenancyBasedData";
import { useStore } from "@/store/store";

const links = [
  { link: "/my-tenancy", label: "my tenancy" },
  { link: "/pricing", label: "pricing" },
  { link: "/classes", label: "classes" },
  { link: "/schedules", label: "schedules" },
];

interface props {
  session: UserSession;
  tenancies: any[];
}

const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
];

export const HeaderSearch: FC<props> = ({ session, tenancies }) => {
  const t = useTranslations("dashboard");
  // console.log('i18n messages', t('message2'), 'locale in client side:', locale);
  const { fillTenancyBasedData } = useStore();
  const { update } = useSession();
  const [selectedTenancy, setSelectedTenancy] = useState<string>(
    session.tenancyId || ""
  );
  const { name, status } = session;
  const router = useRouter();
  const [opened, { toggle }] = useDisclosure(false);
  const items = links.map((link) => (
    <Link
      key={link.label}
      href={link.link}
      className={classes.link}
      onClick={(event) => {
        console.log("click on menu");
      }}
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
    try {
      await update({ tenancyId: value });
      setTenancyInServer(value);
      setSelectedTenancy(value);
      const data = await getTenancyBasedData();
      // console.log('tenancy value:', data);
      fillTenancyBasedData(data);
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <ColorModeSwitcher />
        <Group>
          {status === "authenticated" ? (
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
              if (status === "authenticated") {
                signOut();
              } else {
                router.push("/auth/signin");
              }
            }}
          >
            {status === "authenticated" ? "Log out" : "Log in"}
          </Button>
          <Group>{status === "authenticated" && name && name}</Group>
        </Group>

        <Group>
          <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
        </Group>

        <Group>
          <Group ml={50} gap={5} className={classes.links} visibleFrom="sm">
            {items}
          </Group>
          <LocaleSwitcher />
        </Group>
      </div>
    </header>
  );
};
