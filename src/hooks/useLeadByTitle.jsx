import { useQuery } from "@tanstack/react-query";
import supabase from "../supabase-client";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["Lead", leadTitle],
    queryFn: () => fetchLeadsByTitle(leadTitle),
    onSuccess: (data) => {
      queryClient.setQueryData(["Lead", data.id], data);
    },
    staleTime: 1000 * 60 * 5, // optional: 5 min cache
    enabled: !!leadTitle,
  });
};
