import { redirect } from "next/navigation";

export default async function EditDjProfileRedirect() {
  redirect("/dj/settings");
}
