import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FiInfo, FiRefreshCw, FiCheckCircle } from "react-icons/fi";
import { BsCircle } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

interface AppointmentItem {
  id: string;
  client_name: string;
  code: string;
  scheduled_date: string;
  type: "job" | "service";
  isCompleted: boolean;
}

const InstallerJobListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AppointmentItem[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data: jobs, error: jobsErr } = await supabase
      .from("jobs")
      .select("id, client_name, job_code, scheduled_date")
      .eq("assigned_to", userId);

    const { data: services, error: svcErr } = await supabase
      .from("service_calls")
      .select("id, client_name, service_code, scheduled_date")
      .eq("assigned_to", userId);

    if (jobsErr || svcErr) {
      console.error("Failed to fetch jobs or service calls", jobsErr || svcErr);
      setItems([]);
      setLoading(false);
      return;
    }

    const results: AppointmentItem[] = [];

    for (const job of jobs ?? []) {
      const { count: total } = await supabase
        .from("install_checklist_steps")
        .select("id", { count: "exact", head: true })
        .eq("job_id", job.id);
      const { count: confirmed } = await supabase
        .from("install_checklist_steps")
        .select("id", { count: "exact", head: true })
        .eq("job_id", job.id)
        .eq("is_confirmed", true);
      results.push({
        id: job.id,
        client_name: job.client_name,
        code: job.job_code,
        scheduled_date: job.scheduled_date,
        type: "job",
        isCompleted: !!total && confirmed === total,
      });
    }

    for (const svc of services ?? []) {
      const { count: total } = await supabase
        .from("service_checklist_steps")
        .select("id", { count: "exact", head: true })
        .eq("service_call_id", svc.id);
      const { count: confirmed } = await supabase
        .from("service_checklist_steps")
        .select("id", { count: "exact", head: true })
        .eq("service_call_id", svc.id)
        .eq("is_confirmed", true);
      results.push({
        id: svc.id,
        client_name: svc.client_name,
        code: svc.service_code,
        scheduled_date: svc.scheduled_date,
        type: "service",
        isCompleted: !!total && confirmed === total,
      });
    }

    setItems(results);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInfo = () => {
    console.log("Info tapped");
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleClick = (item: AppointmentItem) => {
    navigate(`/job-detail/${item.id}`, { state: { type: item.type } });
  };

  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <HStack p={4} bg="blue.600" color="white" spacing={2} boxShadow="md">
        <Heading size="md" flex="1">
          Appointment Summary
        </Heading>
        <IconButton
          aria-label="Info"
          icon={<FiInfo />}
          variant="ghost"
          onClick={handleInfo}
        />
        <IconButton
          aria-label="Refresh"
          icon={<FiRefreshCw />}
          variant="ghost"
          onClick={handleRefresh}
        />
      </HStack>

      <Box p={4} flex="1">
        {loading ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner />
          </Flex>
        ) : (
          <VStack spacing={4} align="stretch">
            {items.map((item) => (
              <Box
                key={`${item.type}-${item.id}`}
                p={4}
                bg={item.isCompleted ? "green.50" : "white"}
                borderWidth="1px"
                borderColor={item.isCompleted ? "green.300" : "gray.200"}
                borderRadius="md"
                shadow="sm"
                cursor="pointer"
                onClick={() => handleClick(item)}
                _hover={{ bg: item.isCompleted ? "green.100" : "gray.50" }}
              >
                <HStack justify="space-between">
                  <HStack>
                    {item.isCompleted ? (
                      <FiCheckCircle color="green" />
                    ) : (
                      <BsCircle color="gray" />
                    )}
                    <Text fontWeight="bold">
                      {item.client_name} - {item.code}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(item.scheduled_date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Flex>
  );
};

export default InstallerJobListPage;
