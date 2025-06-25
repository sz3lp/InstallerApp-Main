import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  HStack,
  Box,
} from '@chakra-ui/react';
import { FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export interface AppointmentSummaryHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppointmentSummaryHelpModal: React.FC<AppointmentSummaryHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Appointment Summary Help</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="start" spacing={4}>
            <Text>
              This list shows all jobs and service calls assigned to you. Tap any
              item to view detailed information, including labor info and
              directions.
            </Text>
            <Box>
              <Text fontWeight="bold" mb={2}>
                Status Key
              </Text>
              <VStack align="start" spacing={2}>
                <HStack align="start">
                  <FiCheckCircle color="green" />
                  <Text>
                    Green Check / Highlight: Job/Service Completed (All checklist
                    steps confirmed)
                  </Text>
                </HStack>
                <HStack align="start">
                  <FiAlertTriangle color="red" />
                  <Text>
                    Red Alert / Highlight: Past Due (Scheduled date has passed
                    and checklist is incomplete)
                  </Text>
                </HStack>
                <HStack align="start">
                  <Text>No Highlight: Not Started or Incomplete</Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} colorScheme="blue">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AppointmentSummaryHelpModal;
