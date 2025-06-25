import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  VStack,
  Input,
  Textarea,
  Checkbox,
  NumberInput,
  NumberInputField,
  RadioGroup,
  Radio,
  Switch,
  Spinner,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';
import { supabase } from '../../../lib/supabaseClient';
import uploadDocument from '../../../lib/uploadDocument';

// Mock definitions for dynamic fields per step
export const CHECKLIST_STEP_DEFINITIONS: Record<number, any> = {
  1: {
    key: 'check_in',
    title: 'Check In',
    fields: [
      { name: 'checkInTime', type: 'datetime', auto: true },
      { name: 'notes', type: 'textarea' },
    ],
  },
  2: {
    key: 'pre_walkthrough',
    title: 'Pre-Walkthrough',
    fields: [
      { name: 'clearAccess', type: 'checkbox', label: 'Clear Access' },
      { name: 'debrisPresent', type: 'checkbox', label: 'Debris Present' },
    ],
  },
  3: {
    key: 'before_photos',
    title: 'Before Photos',
    fields: [
      { name: 'photo1', type: 'file', label: 'Photo 1' },
      { name: 'notes', type: 'textarea' },
    ],
  },
  4: {
    key: 'measurements',
    title: 'Measurements',
    fields: [
      { name: 'length', type: 'number', label: 'Length (ft)' },
      { name: 'width', type: 'number', label: 'Width (ft)' },
      { name: 'notes', type: 'textarea' },
    ],
  },
  5: {
    key: 'install_notes',
    title: 'Installation Notes',
    fields: [{ name: 'notes', type: 'textarea' }],
  },
  6: {
    key: 'after_photos',
    title: 'After Photos',
    fields: [
      { name: 'photo1', type: 'file', label: 'Photo 1' },
      { name: 'notes', type: 'textarea' },
    ],
  },
  7: {
    key: 'expenses',
    title: 'Expenses',
    fields: [
      { name: 'amount', type: 'number', label: 'Amount' },
      { name: 'receipt', type: 'file', label: 'Receipt' },
    ],
  },
  8: {
    key: 'qa_checklist',
    title: 'QA Checklist',
    fields: [
      { name: 'systemOperational', type: 'checkbox', label: 'System Operational' },
      { name: 'notes', type: 'textarea' },
    ],
  },
  9: {
    key: 'customer_signature',
    title: 'Customer Signature',
    fields: [
      { name: 'signatureImage', type: 'signature_pad' },
      { name: 'customerName', type: 'text', label: 'Customer Name' },
    ],
  },
};

const TOTAL_STEPS = Object.keys(CHECKLIST_STEP_DEFINITIONS).length;

type FormData = Record<string, any>;

export default function ChecklistStepPage() {
  const { jobId = '', stepNumber = '1' } = useParams<{ jobId: string; stepNumber: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const search = new URLSearchParams(location.search);
  const type = search.get('type') || 'install';
  const stepNum = Number(stepNumber);
  const stepDef = CHECKLIST_STEP_DEFINITIONS[stepNum];

  const [formData, setFormData] = useState<FormData>({});
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // fetch existing data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const table = type === 'service' ? 'service_checklist_steps' : 'install_checklist_steps';
      const idField = type === 'service' ? 'service_call_id' : 'job_id';
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(idField, jobId)
        .eq('step_number', stepNum)
        .single();
      if (!error && data) {
        setFormData(data.submitted_data || {});
        setIsConfirmed(data.is_confirmed);
      } else {
        const initial: Record<string, any> = {};
        stepDef?.fields.forEach((f: any) => {
          if (f.auto && f.type === 'datetime') initial[f.name] = new Date().toISOString();
        });
        setFormData(initial);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [jobId, stepNum, stepDef, type]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    stepDef.fields.forEach((f: any) => {
      if (f.required && !formData[f.name]) {
        errs[f.name] = 'Required';
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    setIsLoading(true);
    const submission: Record<string, any> = { ...formData };
    for (const field of stepDef.fields) {
      if (field.type === 'file' && formData[field.name] instanceof File) {
        const uploaded = await uploadDocument(formData[field.name], jobId, stepDef.key);
        if (uploaded) submission[field.name] = uploaded.url;
      }
    }
    const table = type === 'service' ? 'service_checklist_steps' : 'install_checklist_steps';
    const idField = type === 'service' ? 'service_call_id' : 'job_id';
    const { error } = await supabase.from(table).upsert({
      [idField]: jobId,
      step_number: stepNum,
      step_key: stepDef.key,
      submitted_data: submission,
      is_confirmed: true,
      confirmed_at: new Date().toISOString(),
    }, { onConflict: `${idField},step_number` });
    if (!error) {
      setIsConfirmed(true);
    }
    setIsLoading(false);
    const next = stepNum + 1;
    if (next <= TOTAL_STEPS) navigate(`/checklist/${jobId}/step/${next}?type=${type}`);
    else navigate(`/checklist/${jobId}?type=${type}`);
  };

  const handleNext = () => {
    const next = stepNum + 1;
    if (next <= TOTAL_STEPS) navigate(`/checklist/${jobId}/step/${next}?type=${type}`);
    else navigate(`/checklist/${jobId}?type=${type}`);
  };

  const renderField = (field: any) => {
    const value = formData[field.name] ?? '';
    const common = {
      id: field.name,
      isDisabled: isConfirmed,
    };
    switch (field.type) {
      case 'text':
        return (
          <FormControl key={field.name} isInvalid={!!errors[field.name]}>
            <FormLabel>{field.label || field.name}</FormLabel>
            <Input
              {...common}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
            {errors[field.name] && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );
      case 'number':
        return (
          <FormControl key={field.name} isInvalid={!!errors[field.name]}>
            <FormLabel>{field.label || field.name}</FormLabel>
            <NumberInput
              value={value}
              onChange={(_, num) => handleChange(field.name, num)}
              isDisabled={isConfirmed}
            >
              <NumberInputField />
            </NumberInput>
            {errors[field.name] && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );
      case 'textarea':
        return (
          <FormControl key={field.name} isInvalid={!!errors[field.name]}>
            <FormLabel>{field.label || field.name}</FormLabel>
            <Textarea
              {...common}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
            {errors[field.name] && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );
      case 'checkbox':
        return (
          <FormControl key={field.name} display="flex" alignItems="center">
            <Checkbox
              {...common}
              isChecked={!!value}
              onChange={(e) => handleChange(field.name, e.target.checked)}
            >
              {field.label || field.name}
            </Checkbox>
          </FormControl>
        );
      case 'switch':
        return (
          <FormControl key={field.name} display="flex" alignItems="center">
            <FormLabel htmlFor={field.name} mb="0">
              {field.label || field.name}
            </FormLabel>
            <Switch
              id={field.name}
              isChecked={!!value}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              isDisabled={isConfirmed}
            />
          </FormControl>
        );
      case 'radio':
        return (
          <FormControl key={field.name} isDisabled={isConfirmed}>
            <FormLabel>{field.label || field.name}</FormLabel>
            <RadioGroup
              value={value}
              onChange={(val) => handleChange(field.name, val)}
            >
              <HStack>
                {(field.options || []).map((opt: any) => (
                  <Radio key={opt.value} value={opt.value}>
                    {opt.label}
                  </Radio>
                ))}
              </HStack>
            </RadioGroup>
          </FormControl>
        );
      case 'file':
        return (
          <FormControl key={field.name} isInvalid={!!errors[field.name]}>
            <FormLabel>{field.label || field.name}</FormLabel>
            <Input
              type="file"
              onChange={(e) => handleChange(field.name, e.target.files?.[0] || null)}
              isDisabled={isConfirmed}
            />
            {errors[field.name] && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );
      case 'signature_pad':
        return (
          <FormControl key={field.name}>
            <FormLabel>{field.label || 'Signature'}</FormLabel>
            <Box borderWidth="1px" borderRadius="md" p={4} textAlign="center">
              Signature Pad Placeholder
            </Box>
          </FormControl>
        );
      case 'datetime':
        return (
          <FormControl key={field.name}>
            <FormLabel>{field.label || field.name}</FormLabel>
            <Input
              type="datetime-local"
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              isDisabled={isConfirmed || field.auto}
            />
          </FormControl>
        );
      default:
        return null;
    }
  };

  return (
    <Flex direction="column" minH="100vh">
      <HStack p={4} borderBottomWidth="1px" bg="gray.50" spacing={4}>
        <Button variant="ghost" onClick={() => navigate(`/checklist/${jobId}?type=${type}`)}>
          Back
        </Button>
        <Heading size="md">
          Checklist for {jobId} - Step {stepNum}
        </Heading>
      </HStack>

      {isLoading ? (
        <Flex flex={1} align="center" justify="center" p={4}>
          <Spinner />
        </Flex>
      ) : (
        <VStack spacing={4} p={4} align="stretch" flex={1}>
          {stepDef.fields.map((field: any) => renderField(field))}
        </VStack>
      )}

      <HStack p={4} borderTopWidth="1px" justify="space-between" bg="white" position="sticky" bottom="0">
        <Button onClick={() => navigate(-1)}>Back</Button>
        <Button onClick={handleNext} isDisabled={stepNum >= TOTAL_STEPS}>Next</Button>
        <Button colorScheme="green" onClick={handleConfirm} isDisabled={isConfirmed}>
          Confirm
        </Button>
      </HStack>
    </Flex>
  );
}
