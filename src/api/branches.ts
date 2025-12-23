import { apiFetch } from "@/lib/api";

export interface Branch {
  id: number;
  name: string;
  description: string;
  is_main: boolean;
  base_xp: number;
}

export function fetchBranches() {
  return apiFetch<Branch[]>("/branches/");
}

export function pullBranch(branchId: number) {
  return apiFetch(`/branches/${branchId}/pull/`, {
    method: "POST",
  });
}
