import { useQuery } from "@tanstack/react-query";
import supabase from "../supabase-client";

const fetchEmployees = async () => {
  const { data, error } = await supabase.from("Employees").select(
    `
      *
    `
  );
  if (error) throw new Error(error.message);
  return data;
};

export const useEmployees = () => {
  return useQuery({
    queryKey: ["Employees"],
    queryFn: () => fetchEmployees(),
    staleTime: 1000 * 60 * 5, // optional: 5 min cache
    enabled: true,
  });
};
