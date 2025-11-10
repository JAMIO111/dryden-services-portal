import { useQuery } from "@tanstack/react-query";
import supabase from "../supabase-client";

const fetchLeadsByTitle = async (leadTitle) => {
  const { data, error } = await supabase
    .from("Leads")
    .select(
      `
    *,
    Meetings(
      *,
      created_by:Employees!Meetings_created_by_fkey (
        id,
        first_name,
        surname,
        avatar
      )
    ),
    Correspondence(
      *,
      created_by:Employees!Correspondence_created_by_fkey (
        id,
        first_name,
        surname,
        avatar
      )
    )
  `
    )
    .eq("title", leadTitle)
    .single();

  if (error) throw new Error(error.message);

  return data;
};

export const useLeadByTitle = (leadTitle) => {
  return useQuery({
    queryKey: ["Lead", leadTitle],
    queryFn: () => fetchLeadsByTitle(leadTitle),
    staleTime: 1000 * 60 * 5, // optional: 5 min cache
    enabled: !!leadTitle,
  });
};
