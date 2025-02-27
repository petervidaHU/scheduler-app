"use client";

import SessionWrapper from "../../SessionWrapper";
import SignInPageLogic from "./SignInPage";

export default function SignInPage() {
 
  return (
   <SessionWrapper>
    <SignInPageLogic />
   </SessionWrapper>
  );
}