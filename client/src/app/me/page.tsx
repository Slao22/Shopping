import accountApiRequest from "@/apiRequest/account";
import Profile from "@/app/me/profile";
import { cookies } from "next/headers";
export default async function MeProfile() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("sessionToken");
  const result = await accountApiRequest.me(sessionToken?.value ?? "");
  return (
    <>
      <div>{result?.payload.data.name}</div>
      <Profile></Profile>
    </>
  );
}
