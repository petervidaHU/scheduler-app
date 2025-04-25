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

export const HeaderSearch: FC<props> = ({ session, tenancies }) => {
  const t = useTranslations("dashboard");
  const [loading, setLoading] = useState(false);
  const { fillTenancyBasedData, addToast } = useStore();
  const { update } = useSession();
  const [selectedTenancy, setSelectedTenancy] = useState<number | null>(
    session.tenancyId || null
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
    setLoading(true);
    try {
      await update({ tenancyId: value });
      await setTenancyInServer(value);
      setSelectedTenancy(value);
      const res = await getTenancyBasedData();
      if (res.success && res.data) {
        fillTenancyBasedData(res.data);
      }

      router.refresh();
    } catch (error) {
      addToast({
        message: (error as any)["message"] || "Something went wrong",
        title: "Error",
        type: "error",
        autoClose: true,
        id: Date.now().toString(),
      });
    } finally {
      setLoading(false);
    }
  };
console.log('selectedTenancy', selectedTenancy)
  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <ColorModeSwitcher />
        <Group>
          {status === "authenticated" ? (
            <>
              <Select
                value={selectedTenancy ? selectedTenancy.toString() : '0'}
                onChange={tenancyChangeHandler}
                data={tenancyOptions}
                placeholder="Select a tenancy"
              />
              {loading && <span>Loading...</span>}
            </>
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
