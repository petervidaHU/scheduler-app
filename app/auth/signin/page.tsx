import SessionWrapper from "../../SessionWrapper";
import SignInPageLogic from "./SignInPage";

interface SignInPageProps {
  searchParams: { source?: string };
}
export default async function SignInPage({searchParams}: SignInPageProps) {
  const resolvedSearchParams = await searchParams;
  const source = resolvedSearchParams.source ?? '';
  return (
   <SessionWrapper>
    <SignInPageLogic source={source} />
   </SessionWrapper>
  );
}
