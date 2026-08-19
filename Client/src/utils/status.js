/** Maps a booking/exchange status onto a Badge variant. */
export const statusBadgeVariant = (status) => {
  switch (status) {
    case 'confirmed':
    case 'accepted':
    case 'completed':
      return 'success';
    case 'ongoing':
      return 'default';
    case 'cancelled':
    case 'rejected':
      return 'destructive';
    case 'pending':
      return 'warning';
    default:
      return 'secondary';
  }
};
