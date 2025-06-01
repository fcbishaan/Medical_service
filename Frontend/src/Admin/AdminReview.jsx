import { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge} from '@/components/ui/badge';
const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReviews = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/reviews/all', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (res.data.success) {
        setReviews(res.data.data);
      } else {
        toast({
          title: 'Error',
          description: res.data.message || 'Failed to fetch reviews',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to connect to server',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  if (loading) return <div>Loading reviews...</div>;

  const updateReviewStatus = async (reviewId, status) => {
    try {
      const res = await axios.patch(
        `http://localhost:4000/api/admin/reviews/${reviewId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
  
      if (res.data.success) {
        setReviews(reviews.map(review => 
          review._id === reviewId ? { ...review, status } : review
        ));
        toast({
          title: 'Success',
          description: `Review ${status} successfully`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update status',
        variant: 'destructive'
      });
    }
  };
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Doctor Reviews</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Name</TableHead>
            <TableHead>Doctor Name</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
<TableBody>
  {reviews.map((review) => (
    <TableRow key={review._id}>
      <TableCell>
        {review.patient?.name || 'Anonymous Patient'}
      </TableCell>
      <TableCell>
        {review.doctor?.name || 'Unknown Doctor'}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
      </TableCell>
      <TableCell className="max-w-[300px] truncate">
        {review.comment}
      </TableCell>
      <TableCell>
        <Badge variant={review.status === 'approved' ? 'default' : 'destructive'}>
          {review.status}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => updateReviewStatus(review._id, 'approved')}
            >
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateReviewStatus(review._id, 'declined')}
              className="text-red-600"
            >
              Decline
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
      </Table>
    </div>
  );
};

export default AdminReviews;