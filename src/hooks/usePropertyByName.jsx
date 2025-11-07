import { useQuery } from "@tanstack/react-query";
import supabase from "../supabase-client";

const fetchPropertyByName = async (propertyName) => {
  const { data, error } = await supabase
    .from("Properties")
    .select(
      `
      *,
      KeyCodes(*),
      Packages(*),
      PropertyOwner(
        Owners(avatar, first_name, id, surname, primary_phone, primary_email)
      )
    `
    )
    .eq("name", propertyName)
    .single();

  if (error) throw new Error(error.message);

  // Flatten out the join for convenience:
  const owners = data.PropertyOwner?.map((po) => po.Owners) || [];

  return { ...data, Owners: owners };
};

export const usePropertyByName = (propertyName) => {
  return useQuery({
    queryKey: ["Property", propertyName],
    queryFn: () => fetchPropertyByName(propertyName),
    staleTime: 1000 * 60 * 5, // optional: 5 min cache
    enabled: !!propertyName,
  });
};
