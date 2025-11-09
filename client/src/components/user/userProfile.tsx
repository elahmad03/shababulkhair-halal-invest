import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  clearUserError,
} from "@/store/features/user/userSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Camera, Loader2 } from "lucide-react";

const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, loading, error, updateLoading } = useAppSelector(
    (state) => state.user
  );
  const { data: kycData, loading: kycLoading } = useAppSelector(
    (state) => state.kyc
  );

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    occupation: "",
    currency: "",
  });

  useEffect(() => {
    dispatch(fetchUserProfile());
    // dispatch(fetchKYCData());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        occupation: profile.occupation || "",
        currency: profile.currency || "",
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      setEditMode(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await dispatch(uploadProfilePicture(file)).unwrap();
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
  };

  if (loading || kycLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-4xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button
            variant="outline"
            className="ml-4"
            onClick={() => dispatch(clearUserError())}
          >
            Clear Error
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        No profile data available
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="relative group">
            <Avatar className="w-24 h-24 md:w-32 md:h-32">
              <AvatarImage src={profile.profilePicture} />
              <AvatarFallback>
                {profile.firstName?.[0]}
                {profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 bg-primary rounded-full p-2 cursor-pointer group-hover:opacity-100 opacity-90 transition-opacity">
              <Camera className="h-5 w-5 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-2 flex-1">
            <CardTitle className="text-2xl md:text-3xl">
              {profile.firstName} {profile.lastName}
            </CardTitle>
            <p className="text-muted-foreground">{profile.email}</p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-medium">
                Tier: {profile.tier}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  profile.identity?.verified
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                KYC: {profile.identity?.verified ? "Verified" : "Pending"}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) =>
                      handleSelectChange("currency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">Nigerian Naira (NGN)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={updateLoading}>
                  {updateLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <p className="text-sm">{profile.phone || "Not specified"}</p>
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <p className="text-sm">{profile.gender || "Not specified"}</p>
              </div>

              <div className="space-y-2">
                <Label>Occupation</Label>
                <p className="text-sm">
                  {profile.occupation || "Not specified"}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <p className="text-sm">{profile.currency || "Not specified"}</p>
              </div>

              {profile.address && (
                <div className="md:col-span-2 space-y-2">
                  <Label>Address</Label>
                  <div className="text-sm space-y-1">
                    <p>{profile.address.street}</p>
                    <p>
                      {profile.address.city}, {profile.address.state}
                    </p>
                    <p>{profile.address.country}</p>
                  </div>
                </div>
              )}

              {profile.nextOfKin && (
                <div className="md:col-span-2 space-y-2">
                  <Label>Next of Kin</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Name</p>
                      <p>{profile.nextOfKin.name}</p>
                    </div>
                    <div>
                      <p className="font-medium">Relationship</p>
                      <p>{profile.nextOfKin.relationship}</p>
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <p>{profile.nextOfKin.phone}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        {!editMode && (
          <CardFooter className="flex justify-end">
            <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default UserProfile;
