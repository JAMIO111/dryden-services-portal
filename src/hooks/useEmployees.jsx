import { useQuery } from "@tanstack/react-query";
import supabase from "../supabase-client";

const fetchActiveEmployeePeriods = async () => {
  const { data, error } = await supabase
    .from("EmployeePeriod")
    .select(
      `
      *,
      Employees (
        *
      )
    `
    )
    .is("terminated_at", null);

  if (error) throw new Error(error.message);

  // 🔥 flatten here
  return data.map((row) => ({
    employee_period_id: row.id,
    created_at: row.created_at,
    terminated_at: row.terminated_at,
    job_title: row.job_title,
    contract_type: row.contract_type,
    hourly_rate: row.hourly_rate,
    ...row.Employees, // employee fields at top level
  }));
};

const fetchInactiveEmployees = async () => {
  // 1️⃣ get employee_ids that are currently active
  const { data: activePeriods, error: activeError } = await supabase
    .from("EmployeePeriod")
    .select("employee_id")
    .is("terminated_at", null);

  if (activeError) throw activeError;

  const activeIds = activePeriods.map((p) => p.employee_id);

  // 2️⃣ fetch employees NOT in that list
  const { data, error } = await supabase
    .from("Employees")
    .select("*")
    .not("id", "in", `(${activeIds.join(",")})`);

  if (error) throw error;

  return data;
};

export const useActiveEmployees = () => {
  return useQuery({
    queryKey: ["Employees", "active"],
    queryFn: fetchActiveEmployeePeriods,
    staleTime: 1000 * 60 * 5,
  });
};

export const useInactiveEmployees = () => {
  return useQuery({
    queryKey: ["Employees", "inactive"],
    queryFn: fetchInactiveEmployees,
    staleTime: 1000 * 60 * 5,
  });
};
