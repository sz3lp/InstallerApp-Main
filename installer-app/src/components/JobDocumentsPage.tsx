import React, { useEffect, useState } from 'react';
import {
  Flex,
  Heading,
  HStack,
  IconButton,
  List,
  ListItem,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import supabase from '../lib/supabaseClient';

interface JobDocument {
  id: string;
  name: string | null;
  type: string | null;
  url: string | null;
  uploaded_at: string | null;
}

const typeMap: Record<string, string> = {
  before_photo: 'Before Service Photo',
  after_photo: 'After Service Photo',
  job_jacket: 'Job Jacket',
  contract: 'Contract',
  completion_cert: 'Completion Certificate',
  installer_note: 'Installer Note',
  other: 'Other',
};

const JobDocumentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const type = query.get('type') || 'job';

  const [docs, setDocs] = useState<JobDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocs = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from<JobDocument>('job_documents')
        .select('id,name,type,url,uploaded_at')
        .eq(type === 'job' ? 'job_id' : 'service_call_id', id)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error loading documents', error);
        setError('Failed to load documents');
        setDocs([]);
      } else {
        setDocs(data ?? []);
        setError(null);
      }
      setLoading(false);
    };

    loadDocs();
  }, [id, type]);

  const handleBack = () => {
    if (id) {
      navigate(`/job-detail/${id}?type=${type}`);
    } else {
      navigate(-1);
    }
  };

  const handleOpenDocument = async (docUrl: string | null) => {
    if (!docUrl) return;
    try {
      if (docUrl.startsWith('http')) {
        window.open(docUrl, '_blank');
        return;
      }
      const { data, error } = await supabase.storage
        .from('job-documents')
        .createSignedUrl(docUrl, 3600);
      if (error || !data?.signedUrl) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error('Error generating signed URL:', err);
      alert('Could not open document. Please try again.');
    }
  };

  return (
    <Flex direction="column" minH="100vh" p={4} gap={4}>
      <HStack>
        <IconButton
          aria-label="Back"
          icon={<FiArrowLeft />}
          onClick={handleBack}
          variant="ghost"
        />
        <Heading size="md">Documents for {id}</Heading>
      </HStack>
      {loading ? (
        <Flex justify="center" align="center" flex={1}>
          <Spinner />
        </Flex>
      ) : docs.length === 0 ? (
        <Text>No documents found for this assignment.</Text>
      ) : (
        <List spacing={3} width="full">
          {docs.map((doc) => (
            <ListItem
              key={doc.id}
              borderWidth="1px"
              borderRadius="md"
              p={3}
              cursor="pointer"
              _hover={{ bg: 'gray.50' }}
              onClick={() => handleOpenDocument(doc.url)}
            >
              <VStack align="start" spacing={1}>
                <HStack justify="space-between" width="full">
                  <Text fontWeight="bold">{doc.name}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {doc.type ? typeMap[doc.type] || doc.type : ''}
                  </Text>
                </HStack>
                {doc.uploaded_at && (
                  <Text fontSize="xs" color="gray.500">
                    {new Date(doc.uploaded_at).toLocaleString()}
                  </Text>
                )}
              </VStack>
            </ListItem>
          ))}
        </List>
      )}
      {error && (
        <Text color="red.500" fontSize="sm">
          {error}
        </Text>
      )}
    </Flex>
  );
};

export default JobDocumentsPage;

