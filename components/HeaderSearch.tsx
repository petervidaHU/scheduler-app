"use client";

import React, { FC, useState, useEffect, useRef } from "react";
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
  // Initialize with session.tenancyId only, and handle localStorage in useEffect
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
        value: tenancy.ID.toString(),
        label: `${tenancy.NAME} (${tenancy.ROLE_NAME})`,
      };
    });
  };
  const tenancyOptions = getTenancies();

  // Avoid reading localStorage during initial render
  const initializedRef = useRef(false);
  
  useEffect(() => {
    // On mount, restore tenancy from localStorage if available, but only once
    if (typeof window !== "undefined" && !initializedRef.current) {
      initializedRef.current = true;
      const saved = localStorage.getItem("selectedTenancy");
      if (saved) {
        const savedTenancyId = Number(saved);
        if (!isNaN(savedTenancyId)) {
          setSelectedTenancy(savedTenancyId);
        }
      }
    }
  }, []);

  const tenancyChangeHandler = async (value: any) => {
    // Prevent unnecessary updates if value is the same
    const valueNum = value ? Number(value) : null;
    if (valueNum === selectedTenancy) {
      return; // Skip if already selected
    }
  
    // Prevent fetch if no valid tenancy is selected
    if (!valueNum || valueNum === 0) {
      setSelectedTenancy(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("selectedTenancy");
      }
      // Clear store data if tenancy is cleared
      fillTenancyBasedData({
        specialties: {},
        subjects: {},
        teachers: {},
        classRooms: {},
        classes: {},
        frames: {},
      });
      return;
    }

    setLoading(true);
    fillTenancyBasedData({
      specialties: { isLoading: true },
      subjects: { isLoading: true },
      teachers: { isLoading: true },
      classRooms: { isLoading: true },
      classes: { isLoading: true },
      frames: { isLoading: true },
    });
    
    try {
      await update({ tenancyId: valueNum });
      await setTenancyInServer(valueNum);
      setSelectedTenancy(valueNum);
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedTenancy", String(valueNum));
      }
      const res = await getTenancyBasedData();
      fillTenancyBasedData(res);
      router.refresh();
    } catch (error) {
      addToast({
        message: (error as any)["message"] || "Something went wrong",
        title: "Error",
        type: "error",
        autoClose: true,
        id: Date.now().toString(),
      });
      fillTenancyBasedData({
        specialties: { error: true, isLoading: false },
        subjects: { error: true, isLoading: false },
        teachers: { error: true, isLoading: false },
        classRooms: { error: true, isLoading: false },
        classes: { error: true, isLoading: false },
        frames: { error: true, isLoading: false },
      });
    } finally {
      setLoading(false);
    }
  };

  // Get the currently selected tenancy name and status
  const getTenancyStatus = () => {
    if (!session || status !== "authenticated") {
      return {
        name: "Not logged in",
        isLoaded: false
      };
    }
    
    if (!selectedTenancy) {
      return {
        name: "No tenancy loaded",
        isLoaded: false
      };
    }
    
    const selectedTenancyObject = tenancies.find(t => t.ID === selectedTenancy);
    return {
      name: selectedTenancyObject ? selectedTenancyObject.NAME : "No tenancy loaded",
      isLoaded: !!selectedTenancyObject
    };
  };

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Group>
          <ColorModeSwitcher />
          {status === "authenticated" && (
            <div className={classes.tenancyInfo}>
              <span className={classes.tenancyLabel}>Current tenancy:</span>
              {(() => {
                const { name, isLoaded } = getTenancyStatus();
                return (
                  <span 
                    className={`${classes.tenancyName} ${!isLoaded ? classes.noTenancy : ''}`}
                    title={name}
                  >
                    {name}
                  </span>
                );
              })()}
            </div>
          )}
        </Group>
        
        <Group>
          {status === "authenticated" ? (
            <>
              <Select
                key="tenancy-select" 
                value={selectedTenancy ? selectedTenancy.toString() : "0"}
                onChange={tenancyChangeHandler}
                data={tenancyOptions}
                placeholder="Select a tenancy"
                clearable
              />
              {loading && <span className={classes.loadingIndicator}>Loading...</span>}
              <Button
                variant="outline"
                onClick={() => signOut()}
              >
                Log out
              </Button>
              <Group className={classes.userName}>{name && name}</Group>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => router.push("/auth/signin")}
            >
              Log in
            </Button>
          )}
        </Group>

        <Group>
          <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
        </Group>

        <Group ml={50} gap={5} className={classes.links} visibleFrom="sm">
          {items}
          <LocaleSwitcher />
        </Group>
      </div>
    </header>
  );
};
