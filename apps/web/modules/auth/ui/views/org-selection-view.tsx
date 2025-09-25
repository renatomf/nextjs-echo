import { OrganizationList } from "@clerk/nextjs"

export const OrgSelecionView = () => {
  return (
    <OrganizationList 
      afterCreateOrganizationUrl="/"
      afterSelectOrganizationUrl="/"
      hidePersonal
      skipInvitationScreen
    />
  );
};
