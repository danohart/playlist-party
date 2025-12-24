"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import MainLayout from "@/components/layout/MainLayout/MainLayout";
import CreatePartyForm from "@/components/party/CreatePartyForm/CreatePartyForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner/LoadingSpinner";
import styles from "./page.module.scss";

export default function CreatePartyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/create");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <MainLayout>
        <div className={styles.loading}>
          <LoadingSpinner size='large' />
        </div>
      </MainLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <MainLayout>
      <div className='container' style={{ padding: "50px 20px" }}>
        <div className={styles.header}>
          <h1>Create a Playlist Party 🎉</h1>
          <p>Set up your collaborative playlist in just a few steps</p>
        </div>

        <CreatePartyForm />
      </div>
    </MainLayout>
  );
}
