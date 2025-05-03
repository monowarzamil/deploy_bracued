import { signOut } from "@/auth";
import { Button } from "../ui/button";
import { LogOutIcon } from "lucide-react";

export function LogOut() {
  return (
    <form
      action={async () => {
        "use server";
        return await signOut();
      }}
    >
      <Button type="submit" className="w-full" variant={"outline"}>
        <LogOutIcon />
        Logout
      </Button>
    </form>
  );
}
