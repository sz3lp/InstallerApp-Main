import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FiRefreshCw } from "react-icons/fi";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import supabase from "../lib/supabaseClient";

interface Item {
  item_name: string;
  quantity: number;
}

interface JobDetails {
  id: string;
  client_name?: string | null;
  address?: string | null;
  scheduled_date?: string | null;
  time_slot?: string | null;
  installer?: string | null;
  labor_amount?: number | null;
  contract_price?: number | null;
  down_payment?: number | null;
  balance?: number | null;
  payment_method?: string | null;
  notes?: string | null;
}

const currency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const InstallerJobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const type = new URLSearchParams(location.search).get("type");

  const [details, setDetails] = useState<JobDetails | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      let mainQuery;
      if (type === "job") {
        mainQuery = supabase
          .from("jobs")
          .select("*, clients(name, address)")
          .eq("id", id)
          .single();
      } else if (type === "service") {
        mainQuery = supabase
          .from("service_calls")
          .select("*, clients(name, address)")
          .eq("id", id)
          .single();
      } else {
        throw new Error("Invalid job type provided.");
      }

      const { data, error } = await mainQuery;
      if (error) throw error;
      const info: JobDetails = {
        ...(data as any),
        client_name: (data as any).clients?.name ?? null,
        address: (data as any).clients?.address ?? null,
      };
      setDetails(info);

      const itemsTable =
        type === "job" ? "job_quantities_requested" : "service_items_required";
      const itemsColumn = type === "job" ? "job_id" : "service_call_id";
      const { data: itemsData, error: itemsError } = await supabase
        .from(itemsTable)
        .select("item_name, quantity")
        .eq(itemsColumn, id);
      if (itemsError) throw itemsError;
      setItems(itemsData || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, type]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const addressLink = details?.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(details.address)}`
    : undefined;

  const FooterButtons = (
    <HStack
      spacing={4}
      p={4}
      bg="white"
      position="sticky"
      bottom={0}
      boxShadow="md"
    >
      <Button onClick={() => navigate("/jobs")}>Back</Button>
      <Button onClick={() => navigate(`/job-documents/${id}?type=${type}`)}>
        Documents
      </Button>
      <Button onClick={() => navigate(`/checklist/${id}?type=${type}`)}>
        Checklist
      </Button>
    </HStack>
  );

  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <HStack bg="blue.600" p={4} color="white" justifyContent="space-between">
        <Heading size="md">
          {details?.client_name ?? "Job"} #{details?.id ?? id}
        </Heading>
        <IconButton
          aria-label="Refresh"
          icon={<FiRefreshCw />}
          onClick={fetchDetails}
          variant="ghost"
          colorScheme="whiteAlpha"
        />
      </HStack>

      <Box flex="1" p={4}>
        {loading && (
          <Flex justify="center" p={8}>
            <Spinner size="lg" />
          </Flex>
        )}
        {!loading && error && (
          <Text color="red.500" textAlign="center">
            {error}
          </Text>
        )}
        {!loading && !error && details && (
          <VStack align="stretch" spacing={4}>
            <Box>
              <Heading size="sm" mb={2}>
                Client Info
              </Heading>
              <Text>{details.client_name}</Text>
              {details.address ? (
                <Text>
                  <a
                    href={addressLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {details.address}
                  </a>
                </Text>
              ) : (
                <Text>N/A</Text>
              )}
            </Box>
            <Box>
              <Heading size="sm" mb={2}>
                Schedule
              </Heading>
              <Text>{details.scheduled_date || "N/A"}</Text>
              <Text>{details.time_slot || "N/A"}</Text>
            </Box>
            <Box>
              <Heading size="sm" mb={2}>
                Installer
              </Heading>
              <Text>{details.installer || "TBD"}</Text>
            </Box>
            {type === "job" && (
              <Box>
                <Heading size="sm" mb={2}>
                  Financials
                </Heading>
                <Text>Labor: {currency(details.labor_amount)}</Text>
                <Text>Contract: {currency(details.contract_price)}</Text>
                <Text>Down Payment: {currency(details.down_payment)}</Text>
                <Text>Balance: {currency(details.balance)}</Text>
                <Text>Payment Method: {details.payment_method || "N/A"}</Text>
              </Box>
            )}
            <Box>
              <Heading size="sm" mb={2}>
                {type === "job" ? "Job Items" : "Service Items"}
              </Heading>
              {items.length === 0 ? (
                <Text>N/A</Text>
              ) : (
                items.map((it, idx) => (
                  <Text key={idx}>
                    {it.item_name} - {it.quantity}
                  </Text>
                ))
              )}
            </Box>
            <Box>
              <Heading size="sm" mb={2}>
                Notes
              </Heading>
              <Text whiteSpace="pre-wrap">{details.notes || "N/A"}</Text>
            </Box>
          </VStack>
        )}
      </Box>

      {FooterButtons}
    </Flex>
  );
};

export default InstallerJobDetailPage;
