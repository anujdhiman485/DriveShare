import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authAPI } from '@/utils/apiService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Check, MapPin, Pencil, Star } from 'lucide-react';

const getInitials = (fullName = '') =>
  fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'U';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', phone: '', location: '', city: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        const profile = response.data;
        setUser(profile);
        setFormData({
          fullName: profile.fullName || '',
          phone: profile.phone || '',
          location: profile.location || '',
          city: profile.city || ''
        });
      } catch (error) {
        toast.error('Could not load your profile', { description: error.message });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const response = await authAPI.updateProfile(formData);
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('authChange'));
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Could not update your profile', { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner className="size-6" /></div>;
  }

  if (!user) {
    return <div className="mx-auto w-full max-w-6xl px-5 py-14 text-center text-muted-foreground sm:px-8">Profile unavailable.</div>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="mb-8">
        <p className="text-sm font-medium text-muted-foreground">Account</p>
        <h1 className="font-heading mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Your profile</h1>
        <p className="mt-2 text-muted-foreground">Keep your contact details current for smooth handoffs.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Card className="h-fit">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <Avatar className="size-28 border-4 border-muted">
              <AvatarImage src={user.avatar} alt={user.fullName} />
              <AvatarFallback className="text-2xl">{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <h2 className="font-heading mt-5 text-2xl font-semibold">{user.fullName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">@{user.username}</p>
            {user.isVerified && <Badge className="mt-4"><Check data-icon="inline-start" />Verified profile</Badge>}
            <div className="mt-7 grid w-full grid-cols-2 divide-x border-y py-4">
              <div><p className="text-xl font-semibold">{user.rating?.toFixed?.(1) || '0.0'}</p><p className="mt-1 text-xs text-muted-foreground"><Star className="mr-1 inline size-3" />Rating</p></div>
              <div><p className="text-xl font-semibold">{user.totalRatings || 0}</p><p className="mt-1 text-xs text-muted-foreground">Reviews</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Pencil className="size-4" />Personal details</CardTitle>
            <CardDescription>Update the information other members use to reach you.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field><FieldLabel htmlFor="fullName">Full name</FieldLabel><Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required /></Field>
                  <Field><FieldLabel htmlFor="phone">Phone</FieldLabel><Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required /></Field>
                </div>
                <Field><FieldLabel htmlFor="email">Email</FieldLabel><Input id="email" value={user.email} disabled /></Field>
                <Field><FieldLabel htmlFor="username">Username</FieldLabel><Input id="username" value={`@${user.username}`} disabled /></Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field><FieldLabel htmlFor="city">City</FieldLabel><Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Your city" /></Field>
                  <Field><FieldLabel htmlFor="location"><MapPin className="size-3.5" />Location</FieldLabel><Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="Neighborhood or address" /></Field>
                </div>
                <Button type="submit" className="mt-1 w-full sm:w-fit" disabled={saving}>{saving && <Spinner data-icon="inline-start" />}{saving ? 'Saving changes...' : 'Save changes'}</Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;