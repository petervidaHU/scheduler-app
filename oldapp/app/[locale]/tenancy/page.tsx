"use client";

import CreateTenancyLogic from "@/components/CreateTenancyLogic";
import SessionWrapper from "../SessionWrapper";

export default function CreateTenancyPage() {
 
  return (
   <SessionWrapper>
    <CreateTenancyLogic />
   </SessionWrapper>
  );
}