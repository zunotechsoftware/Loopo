'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

/**
 * This used to be a fully separate page - entirely hardcoded fake data
 * (a duplicate of what the real Listings page already does correctly with
 * a status=PENDING filter and working Approve/Reject actions). Redirect
 * instead of maintaining two implementations of the same view; kept as a
 * route (rather than deleted outright) so the sidebar link and any
 * bookmarks to /listings/pending keep working.
 */
export default function PendingApprovalRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/listings?status=PENDING');
  }, [router]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
      <CircularProgress />
    </Box>
  );
}
