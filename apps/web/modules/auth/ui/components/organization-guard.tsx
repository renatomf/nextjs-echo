"use client";

import { useOrganization } from "@clerk/nextjs";
import { AuthLayout } from "../layouts/auth-layout";
import { OrgSelecionView } from "../views/org-selection-view";


export const OrganizationGuard = ({ children }: { children: React.ReactNode }) => {
  const { organization } = useOrganization();
  
  if (!organization) {
    return (
      <div>
        <AuthLayout>
          <OrgSelecionView />
        </AuthLayout>
      </div>
    )
  }
  
  return (
    <>
    {children}
    </>
  );
}