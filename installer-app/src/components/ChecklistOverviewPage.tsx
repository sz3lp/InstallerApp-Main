import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spinner,
  Text,
  VStack,
  List,
  ListItem,
  Icon,
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import supabase from '../lib/supabaseClient';

interface ChecklistStep {
  id: string;
  step_number: number;
  description: string;
  status: 'complete' | 'incomplete' | 'not_applicable';
  // TODO: extend fields based on final schema (e.g., assigned_to, due_date)
}

const ChecklistOverviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const type = new URLSearchParams(location.search).get('type') || 'job';

  const [steps, setSteps] = useState<ChecklistStep[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchSteps = async () => {
      setLoading(true);
      const column = type === 'service' ? 'service_call_id' : 'job_id';
      const { data, error } = await supabase
        .from<ChecklistStep>('checklist_steps')
        .select('*')
        .eq(column, id)
        .order('step_number', { ascending: true });
      if (error) {
        setError(error.message);
        setSteps([]);
      } else {
        setSteps(data || []);
        setError(null);
      }
      setLoading(false);
    };
    fetchSteps();
  }, [id, type]);

  const handleBack = () => {
    navigate(`/job-detail/${id}?type=${type}`);
  };

  const handleStepClick = (stepNumber: number) => {
    navigate(`/checklist/${id}/step/${stepNumber}?type=${type}`);
  };

  return (
    <Flex direction="column" minH="100vh" p={4} bg="gray.50">
      <HStack mb={4}>
        <IconButton
          aria-label="Back"
          icon={<ArrowBackIcon />}
          variant="ghost"
          onClick={handleBack}
        />
        <Heading size="md">Checklist for {id}</Heading>
      </HStack>

      {loading && (
        <Flex justify="center" mt={10}>
          <Spinner size="xl" />
        </Flex>
      )}

      {!loading && error && (
        <Text color="red.500">Failed to load checklist: {error}</Text>
      )}

      {!loading && !error && steps.length === 0 && (
        <Text>No checklist found for this assignment.</Text>
      )}

      {!loading && !error && steps.length > 0 && (
        <List spacing={3}>
          {steps.map((step) => (
            <ListItem
              key={step.id}
              as="button"
              onClick={() => handleStepClick(step.step_number)}
            >
              <Box
                p={4}
                borderWidth="1px"
                borderRadius="md"
                _hover={{ bg: 'gray.100' }}
              >
                <HStack justify="space-between">
                  <Text fontWeight="bold">Step {step.step_number}:</Text>
                  <Text flex="1" ml={2} mr={4} textAlign="left">
                    {step.description}
                  </Text>
                  {step.status === 'complete' && (
                    <Icon as={CheckIcon} color="green.500" />
                  )}
                  {step.status === 'incomplete' && (
                    <Icon as={WarningIcon} color="red.500" />
                  )}
                  {step.status === 'not_applicable' && <Text>N/A</Text>}
                </HStack>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Flex>
  );
};

export default ChecklistOverviewPage;
