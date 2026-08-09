export type AuditTeamMemberRole = {
  role_id: number;
  role_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};


async function requestJson<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options?.headers ?? {}),
    },
  });


  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      error?.detail ||
      error?.message ||
      "Audit Team Member Role request failed."
    );
  }


  return (await response.json()) as T;
}


export async function listAuditTeamMemberRoles() {

  return requestJson<AuditTeamMemberRole[]>(
    "/api/backend/audit-team-member-roles",
    {
      method: "GET",
    },
  );

}




