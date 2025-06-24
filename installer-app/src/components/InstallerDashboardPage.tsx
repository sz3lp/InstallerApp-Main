import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Heading, HStack, IconButton, Spacer, Text, VStack } from '@chakra-ui/react';
import { FiMenu, FiRefreshCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const InstallerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        setUserEmail(data.session.user.email || 'N/A');
      }
    };
    fetchUser();
  }, []);

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  return (
    <Flex direction="column" minH="100vh" bg="gray.50">
      <HStack bg="blue.600" p={4} color="white" shadow="md">
        <IconButton
          aria-label="Menu"
          icon={<FiMenu />}
          variant="ghost"
          colorScheme="whiteAlpha"
        />
        <Heading size="md" ml={4}>SentientZone</Heading>
        <Spacer />
        <Text fontSize="sm">{userEmail}</Text>
      </HStack>

      <VStack spacing={8} p={6} align="stretch" flex={1}>
        <Box p={6} bg="white" borderRadius="lg" shadow="sm">
          <Text fontSize="xl" fontWeight="bold" mb={4}>Primary Actions</Text>
          <VStack spacing={4}>
            <Button
              size="lg"
              colorScheme="blue"
              width="full"
              onClick={() => navigate('/jobs')}
            >
              Appointment Summary
            </Button>
            <Button
              size="lg"
              colorScheme="gray"
              width="full"
              onClick={() => console.log('Navigate to Activity Summary')}
            >
              Activity Summary
            </Button>
          </VStack>
        </Box>

        <Box p={6} bg="white" borderRadius="lg" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="xl" fontWeight="bold">Inventory Display</Text>
            <IconButton
              aria-label="Refresh Inventory"
              icon={<FiRefreshCw />}
              size="sm"
              onClick={handleRefresh}
            />
          </Flex>
          <Text fontSize="2xl" fontWeight="bold" color="green.600">
            $0.00
          </Text>
          <Text fontSize="sm" color="gray.500">
            Current on-hand inventory amount (placeholder)
          </Text>
        </Box>
      </VStack>
    </Flex>
  );
};

export default InstallerDashboardPage;
