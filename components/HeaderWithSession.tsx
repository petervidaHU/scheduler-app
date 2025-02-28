"use client";

import SessionWrapper from "@/app/SessionWrapper";
import { HeaderSearch } from "./HeaderSearch";


export default function HeaderWithSession() {
 
  return (
   <SessionWrapper>
    <HeaderSearch />
   </SessionWrapper>
  );
}